import { applications, answers } from './store.js'

const JOURNEY = 'new-application'

function page () {
  const path = window.location.pathname.replace(/index\.html$/, '')
  const match = path.match(/account\/applications\/(.*)$/)
  return match ? match[1].replace(/\/$/, '') : null
}

function query (name) {
  return new URLSearchParams(window.location.search).get(name)
}

function escapeHtml (value) {
  const div = document.createElement('div')
  div.textContent = value
  return div.innerHTML
}

function renderList () {
  const container = document.getElementById('applications-list')
  const empty = document.getElementById('applications-empty')
  if (!container) return
  const all = applications.all()
  empty.hidden = all.length > 0
  if (!all.length) { container.innerHTML = ''; return }

  const rows = all.map(application => `
    <tr class="govuk-table__row">
      <td class="govuk-table__cell"><a class="govuk-link" href="detail/?id=${application.id}">${escapeHtml(application.name)}</a></td>
      <td class="govuk-table__cell">${application.apis.length} ${application.apis.length === 1 ? 'API' : 'APIs'}</td>
      <td class="govuk-table__cell apim-reference">${application.clientId}</td>
    </tr>`).join('')

  container.innerHTML = `
    <table class="govuk-table" id="applications">
      <caption class="govuk-table__caption govuk-visually-hidden">Your applications</caption>
      <thead class="govuk-table__head">
        <tr class="govuk-table__row">
          <th scope="col" class="govuk-table__header">Application</th>
          <th scope="col" class="govuk-table__header">APIs</th>
          <th scope="col" class="govuk-table__header">Client ID</th>
        </tr>
      </thead>
      <tbody class="govuk-table__body">${rows}</tbody>
    </table>`
}

function captureStep (nextUrl, read) {
  const form = document.querySelector('form')
  if (!form) return
  form.addEventListener('submit', event => {
    event.preventDefault()
    const values = read(form)
    if (!values) return
    answers.set(JOURNEY, values)
    window.location.href = nextUrl
  })
}

function renderCheckAnswers () {
  const saved = answers.get(JOURNEY)
  const list = document.querySelector('.govuk-summary-list')
  if (list) {
    list.innerHTML = `
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">Application name</dt>
        <dd class="govuk-summary-list__value">${escapeHtml(saved.name || '')}</dd>
        <dd class="govuk-summary-list__actions"><a class="govuk-link" href="../details/">Change</a></dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">APIs</dt>
        <dd class="govuk-summary-list__value">${(saved.apis || []).map(api => escapeHtml(api.text)).join('<br>') || 'None'}</dd>
        <dd class="govuk-summary-list__actions"><a class="govuk-link" href="../apis/">Change</a></dd>
      </div>`
  }
  const form = document.querySelector('form')
  if (!form) return
  form.addEventListener('submit', event => {
    event.preventDefault()
    const created = applications.create(saved)
    answers.clear(JOURNEY)
    window.location.href = `../confirmation/?id=${created.id}`
  })
}

function set (id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

function row (key, value, extraClass) {
  return `
    <div class="govuk-summary-list__row">
      <dt class="govuk-summary-list__key">${escapeHtml(key)}</dt>
      <dd class="govuk-summary-list__value${extraClass ? ' ' + extraClass : ''}">${value}</dd>
    </div>`
}

function formatDate (iso) {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed)
}

function renderConfirmation (application, secret) {
  set('created-name', application.name)
  set('client-id', application.clientId)
  set('publisher-id', 'hmcts.api.marketplace')
  set('client-secret', secret)

  const keys = document.getElementById('subscription-keys')
  if (keys) {
    keys.innerHTML = application.apis.map(api =>
      row(api.text, `Subscription key: <span class="apim-credential">${application.clientId.replace(/-/g, '').slice(0, 24)}</span>`)
    ).join('')
  }

  const view = document.getElementById('view-application')
  if (view) view.setAttribute('href', `../../detail/?id=${application.id}`)
}

function renderDetail (application) {
  document.querySelectorAll('[data-application-name]').forEach(el => { el.textContent = application.name })
  document.title = application.name + ' - Manage applications - HMCTS API Marketplace - GOV.UK'

  const details = document.getElementById('application-details')
  if (details) {
    details.innerHTML =
      row('Application name', escapeHtml(application.name)) +
      row('Created', formatDate(application.createdAt))
  }

  const auth = document.getElementById('authorisation-details')
  if (auth) {
    auth.innerHTML =
      row('Client ID', `<span class="apim-credential" id="client-id">${application.clientId}</span>`) +
      row('Client secret', '<span class="govuk-hint">Shown once when created. Regenerate it to get a new one.</span>')
  }

  const apis = document.getElementById('application-apis')
  const empty = document.getElementById('apis-empty')
  if (apis && empty) {
    empty.hidden = application.apis.length > 0
    apis.innerHTML = application.apis.map(api =>
      row(api.text, `<span class="apim-credential">${application.clientId.replace(/-/g, '').slice(0, 24)}</span>`)
    ).join('')
  }

  const remove = document.getElementById('delete-application')
  if (remove) {
    remove.addEventListener('click', event => {
      event.preventDefault()
      applications.remove(application.id)
      window.location.href = '../'
    })
  }
}

function requireApplication (listUrl) {
  const application = applications.find(query('id'))
  if (!application) {
    window.location.href = listUrl
    return null
  }
  return application
}

const current = page()
if (current === '') renderList()
if (current === 'new/details') captureStep('../apis/', form => {
  const name = form.elements.name.value.trim()
  if (!name) return null
  return { name }
})
if (current === 'new/apis') captureStep('../check-answers/', form => ({
  apis: Array.from(form.querySelectorAll('input[name="apis"]:checked')).map(input => ({
    value: input.value,
    text: (form.querySelector('label[for="' + input.id + '"]') || {}).textContent.trim()
  }))
}))
if (current === 'new/check-answers') renderCheckAnswers()
if (current === 'new/confirmation') {
  const application = requireApplication('../../')
  if (application) renderConfirmation(application, applications.newSecret(application.id))
}
if (current === 'detail') {
  const application = requireApplication('../')
  if (application) renderDetail(application)
}
