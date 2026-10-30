import { features } from './features.js?v=4f1444f871'

function escapeHtml (value) {
  const div = document.createElement('div')
  div.textContent = value
  return div.innerHTML
}

function render () {
  const form = document.getElementById('features-form')
  if (!form) return
  const all = features.all()
  document.getElementById('features-none').hidden = all.length > 0
  form.hidden = all.length === 0
  document.getElementById('features-share').hidden = all.length === 0
  if (!all.length) return

  document.getElementById('features-list').innerHTML = all.map((feature, index) => {
    const id = index === 0 ? 'features' : `features-${index + 1}`
    return `
      <div class="govuk-checkboxes__item">
        <input class="govuk-checkboxes__input" id="${id}" name="features" type="checkbox" value="${feature.id}"
          aria-describedby="${id}-item-hint"${feature.on ? ' checked' : ''}>
        <label class="govuk-label govuk-checkboxes__label" for="${id}">${escapeHtml(feature.name)}</label>
        <div id="${id}-item-hint" class="govuk-hint govuk-checkboxes__hint">
          ${escapeHtml(feature.description)}${feature.default ? ' On by default.' : ''}
        </div>
      </div>`
  }).join('')

  // Save by navigating to ?features=…, which features.js applies and remembers on load.
  form.addEventListener('submit', event => {
    event.preventDefault()
    const on = Array.from(form.querySelectorAll('input[name="features"]:checked')).map(input => input.value)
    window.location.search = '?features=' + (on.length ? on.join(',') : 'none') + '&saved=1'
  })

  const share = new URL(window.location.href.replace(/prototype-settings\/.*$/, ''))
  share.search = '?features=' + features.linkValue()
  const link = document.getElementById('features-link')
  link.href = share.toString()
  link.textContent = share.toString()

  if (new URLSearchParams(window.location.search).get('saved')) {
    form.insertAdjacentHTML('beforebegin', `
      <div class="govuk-notification-banner govuk-notification-banner--success" role="alert" data-module="govuk-notification-banner">
        <div class="govuk-notification-banner__header">
          <h2 class="govuk-notification-banner__title">Success</h2>
        </div>
        <div class="govuk-notification-banner__content">
          <p class="govuk-notification-banner__heading">Your settings have been saved</p>
        </div>
      </div>`)
  }
}

render()
