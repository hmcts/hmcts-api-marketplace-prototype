import { initAll } from './govuk-frontend.min.js?v=1748134bc1'
// First, so a ?features= link is applied before any page script checks a feature.
import './features.js?v=1748134bc1'
import { user } from './store.js?v=1748134bc1'
import './applications.js?v=1748134bc1'
import './production-credentials.js?v=1748134bc1'
import './admin.js?v=1748134bc1'
import './prototype-settings.js?v=1748134bc1'

initAll()

// The real service renders signed-in and signed-out markup on the server. These pages are
// static, so they ship signed-out and JavaScript corrects them.
// The service navigation is built on the server in the real app, from the session. These
// pages ship the signed-out version, so the signed-in items are added here instead.
function applyNavigation (signedIn) {
  const list = document.querySelector('.govuk-service-navigation__list')
  if (!list) return
  const items = Array.from(list.children)
  const last = items[items.length - 1]
  const link = last && last.querySelector('a')
  if (!link) return

  if (signedIn && signedIn.role === 'admin') {
    // An admin is not a consumer: Admin replaces Your account and Applications.
    link.textContent = 'Admin'
    link.setAttribute('href', link.getAttribute('href').replace(/(sign-in|account)\/?$/, 'admin/'))
    last.classList.toggle('govuk-service-navigation__item--active', /\/admin\//.test(window.location.pathname))
    return
  }

  if (signedIn) {
    link.textContent = 'Your account'
    link.setAttribute('href', link.getAttribute('href').replace(/sign-in\/?$/, 'account/'))
    if (!list.querySelector('[data-nav="applications"]')) {
      const applications = last.cloneNode(true)
      applications.setAttribute('data-nav', 'applications')
      applications.classList.remove('govuk-service-navigation__item--active')
      const anchor = applications.querySelector('a')
      anchor.textContent = 'Applications'
      anchor.setAttribute('href', link.getAttribute('href').replace(/account\/$/, 'account/applications/'))
      list.insertBefore(applications, last)
    }
  }
}

function applySignedInState () {
  const signedIn = user.current()
  applyNavigation(signedIn)
  document.querySelectorAll('[data-when="signed-in"]').forEach(el => { el.hidden = !signedIn })
  document.querySelectorAll('[data-when="signed-out"]').forEach(el => { el.hidden = !!signedIn })
  document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = signedIn ? signedIn.name : '' })
  document.querySelectorAll('[data-user-email]').forEach(el => { el.textContent = signedIn ? signedIn.email : '' })
}

document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')
  if (!action) return
  if (action.dataset.action === 'sign-in') {
    event.preventDefault()
    user.signIn(action.dataset.role)
    window.location.href = action.getAttribute('href') || './'
  }
  if (action.dataset.action === 'sign-out') {
    event.preventDefault()
    user.signOut()
    window.location.href = action.getAttribute('href') || './'
  }
})

applySignedInState()
