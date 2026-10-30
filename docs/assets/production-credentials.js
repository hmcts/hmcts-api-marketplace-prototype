import { applications, answers, productionRequests } from './store.js?v=4f1444f871'

// Stands in for ProductionCredentialsController in web-api-marketplace: the same questions,
// checks and messages, with the session and the backend replaced by browser storage.

const JOURNEY = 'production-credentials'
const MAX_LENGTH = 2000

const CALL_VOLUMES = { low: 'Low', medium: 'Medium', high: 'High' }

const STATUS_TEXT = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  MORE_INFORMATION_NEEDED: 'More information needed',
  APPROVED: 'Approved',
  DECLINED: 'Declined'
}

const FIELDS = ['organisation', 'go-live-day', 'go-live-month', 'go-live-year', 'call-volume', 'data-request', 'proposed-outputs']

function page () {
  const path = window.location.pathname.replace(/index\.html$/, '')
  const match = path.match(/account\/production-credentials\/(.*)$/)
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

function formatDate (iso) {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parsed)
}

function apiCount (application) {
  return `${application.apis.length} ${application.apis.length === 1 ? 'API' : 'APIs'}`
}

function goLiveDate (values) {
  const [day, month, year] = ['go-live-day', 'go-live-month', 'go-live-year'].map(name => Number(values[name]))
  if (!values['go-live-day'] || !Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year) || year < 1000) {
    return undefined
  }
  const date = new Date(Date.UTC(year, month - 1, day))
  // Rejects 31 February and the like, which Date would otherwise roll into March.
  return date.getUTCDate() === day && date.getUTCMonth() === month - 1 ? date : undefined
}

function validate (values) {
  const errors = []
  const chosen = applications.find(values.application)
  if (!chosen) {
    errors.push({ name: 'application', text: 'Select the application you need production credentials for' })
  } else if (productionRequests.forApplication(chosen.id)) {
    errors.push({ name: 'application', text: `${chosen.name} already has a production access request` })
  }
  if (!values.organisation) {
    errors.push({ name: 'organisation', text: 'Enter your organisation or team name' })
  }
  const goLive = goLiveDate(values)
  if (!goLive) {
    errors.push({ name: 'go-live-day', text: 'Enter a real go-live date, for example 27 3 2027' })
  } else if (goLive.getTime() <= Date.now()) {
    errors.push({ name: 'go-live-day', text: 'The go-live date must be in the future' })
  }
  if (!CALL_VOLUMES[values['call-volume']]) {
    errors.push({ name: 'call-volume', text: 'Select the expected call volume' })
  }
  if (!values['data-request']) {
    errors.push({ name: 'data-request', text: 'Describe the data request, how you plan to use it and why you need it' })
  } else if (values['data-request'].length > MAX_LENGTH) {
    errors.push({ name: 'data-request', text: `Your description must be ${MAX_LENGTH} characters or fewer` })
  }
  if (!values['proposed-outputs']) {
    errors.push({ name: 'proposed-outputs', text: 'Describe the proposed outputs from this data use' })
  } else if (values['proposed-outputs'].length > MAX_LENGTH) {
    errors.push({ name: 'proposed-outputs', text: `Your description must be ${MAX_LENGTH} characters or fewer` })
  }
  return errors
}

function errorSummaryHtml (errors) {
  const items = errors.map(error => `<li><a href="#${error.name}">${escapeHtml(error.text)}</a></li>`).join('')
  return `
    <div class="govuk-error-summary" data-module="govuk-error-summary" tabindex="-1">
      <div role="alert">
        <h2 class="govuk-error-summary__title">There is a problem</h2>
        <div class="govuk-error-summary__body">
          <ul class="govuk-list govuk-error-summary__list">${items}</ul>
        </div>
      </div>
    </div>`
}

function clearErrors (container) {
  container.querySelectorAll('.govuk-error-summary').forEach(el => el.remove())
  container.querySelectorAll('[data-prototype-error]').forEach(el => el.remove())
  container.querySelectorAll('.govuk-form-group--error').forEach(el => el.classList.remove('govuk-form-group--error'))
  container.querySelectorAll('.govuk-input--error, .govuk-textarea--error').forEach(el => {
    el.classList.remove('govuk-input--error', 'govuk-textarea--error')
  })
  document.title = document.title.replace(/^Error: /, '')
}

// The markup the GOV.UK macros render when given an errorMessage, added after the page has loaded.
function showErrors (form, errors) {
  const column = form.parentElement
  clearErrors(column)
  if (!errors.length) return

  column.querySelector('h1').insertAdjacentHTML('beforebegin', errorSummaryHtml(errors))
  document.title = 'Error: ' + document.title

  errors.forEach(error => {
    const field = error.name === 'application'
      ? form.querySelector('.govuk-radios')
      : error.name === 'go-live-day'
        ? form.querySelector('.govuk-date-input')
        : document.getElementById(error.name)
    if (!field) return
    const group = field.closest('.govuk-form-group')
    group.classList.add('govuk-form-group--error')
    field.insertAdjacentHTML('beforebegin',
      `<p class="govuk-error-message" data-prototype-error><span class="govuk-visually-hidden">Error:</span> ${escapeHtml(error.text)}</p>`)
    if (error.name === 'go-live-day') {
      group.querySelectorAll('.govuk-date-input__input').forEach(input => input.classList.add('govuk-input--error'))
    } else if (field.tagName === 'TEXTAREA') {
      field.classList.add('govuk-textarea--error')
    } else if (field.tagName === 'INPUT') {
      field.classList.add('govuk-input--error')
    }
  })

  column.querySelector('.govuk-error-summary').focus()
}

function radiosHtml (choices, selected) {
  return choices.map((application, index) => {
    const id = index === 0 ? 'application' : `application-${index + 1}`
    return `
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="${id}" name="application" type="radio" value="${application.id}"
          aria-describedby="${id}-item-hint"${application.id === selected ? ' checked' : ''}>
        <label class="govuk-label govuk-radios__label" for="${id}">${escapeHtml(application.name)}</label>
        <div id="${id}-item-hint" class="govuk-hint govuk-radios__hint">${apiCount(application)}</div>
      </div>`
  }).join('')
}

function renderForm () {
  const form = document.getElementById('production-form')
  const none = document.getElementById('no-applications')
  if (!form || !none) return

  // Only applications without a production request are offered: the backend allows one each.
  const choices = applications.all().filter(application => !productionRequests.forApplication(application.id))
  none.hidden = choices.length > 0
  form.hidden = choices.length === 0
  if (!choices.length) return

  const saved = { ...answers.get(JOURNEY), ...(query('application') ? { application: query('application') } : {}) }
  form.querySelector('.govuk-radios').innerHTML = radiosHtml(choices, saved.application)

  FIELDS.forEach(name => {
    if (name === 'call-volume') {
      const radio = form.querySelector(`input[name="call-volume"][value="${saved[name]}"]`)
      if (radio) radio.checked = true
      return
    }
    const field = document.getElementById(name)
    if (field && saved[name]) {
      field.value = saved[name]
      field.dispatchEvent(new Event('input'))
    }
  })

  form.addEventListener('submit', event => {
    event.preventDefault()
    const checked = name => (form.querySelector(`input[name="${name}"]:checked`) || {}).value || ''
    const values = { application: checked('application'), 'call-volume': checked('call-volume') }
    ;['organisation', 'go-live-day', 'go-live-month', 'go-live-year', 'data-request', 'proposed-outputs']
      .forEach(name => { values[name] = (document.getElementById(name).value || '').trim() })

    const errors = validate(values)
    showErrors(form, errors)
    if (errors.length) return

    answers.set(JOURNEY, values)
    window.location.href = 'check-answers/'
  })
}

function summaryRowsHtml (rows, changeHref) {
  return rows.map(row => `
    <div class="govuk-summary-list__row">
      <dt class="govuk-summary-list__key">${escapeHtml(row.key)}</dt>
      <dd class="govuk-summary-list__value">${escapeHtml(row.value)}</dd>
      ${changeHref ? `<dd class="govuk-summary-list__actions"><a class="govuk-link" href="${changeHref}">Change<span class="govuk-visually-hidden"> ${escapeHtml(row.key.toLowerCase())}</span></a></dd>` : ''}
    </div>`).join('')
}

function renderCheckAnswers () {
  const draft = answers.get(JOURNEY)
  const application = applications.find(draft.application)
  if (!application || validate(draft).length) {
    window.location.href = '../'
    return
  }

  const list = document.getElementById('production-answers')
  if (list) {
    list.innerHTML = summaryRowsHtml([
      { key: 'Application', value: application.name },
      { key: 'APIs', value: application.apis.map(api => api.text).join(', ') || 'None' },
      { key: 'Organisation or team name', value: draft.organisation },
      { key: 'Go-live date', value: formatDate(goLiveDate(draft).toISOString()) },
      { key: 'Expected call volume', value: CALL_VOLUMES[draft['call-volume']] },
      { key: 'Data request', value: draft['data-request'] },
      { key: 'Proposed outputs', value: draft['proposed-outputs'] }
    ], '../')
  }

  const form = document.querySelector('form')
  form.addEventListener('submit', event => {
    event.preventDefault()
    const request = productionRequests.create({
      applicationId: application.id,
      applicationName: application.name,
      apis: application.apis.map(api => api.text),
      organisation: draft.organisation,
      goLiveDate: goLiveDate(draft).toISOString().slice(0, 10),
      callVolume: draft['call-volume'],
      dataRequest: draft['data-request'],
      proposedOutputs: draft['proposed-outputs']
    })
    if (!request) {
      // What the real service shows when the backend refuses a second request for an application.
      const column = form.parentElement
      clearErrors(column)
      column.querySelector('h1').insertAdjacentHTML('beforebegin',
        errorSummaryHtml([{ name: 'production-submit', text: `${application.name} already has a production access request.` }]))
      column.querySelector('.govuk-error-summary').focus()
      return
    }
    answers.clear(JOURNEY)
    window.location.href = `../confirmation/?reference=${request.reference}`
  })
}

function requireRequest () {
  const request = productionRequests.find(query('reference'))
  if (!request) window.location.href = '../../'
  return request
}

function renderConfirmation () {
  const request = requireRequest()
  if (!request) return
  document.getElementById('confirmation-reference').textContent = request.reference
  document.getElementById('view-request').setAttribute('href', `../view/?reference=${request.reference}`)
}

function renderView () {
  const request = requireRequest()
  if (!request) return
  document.title = `Production credentials request ${request.reference} - HMCTS API Marketplace - GOV.UK`
  document.getElementById('request-reference').textContent = request.reference
  document.getElementById('request-status').textContent = STATUS_TEXT[request.status] || request.status
  document.getElementById('request-submitted').textContent = formatDate(request.submittedAt)
  document.getElementById('request-answers').innerHTML = summaryRowsHtml([
    { key: 'Application', value: request.applicationName },
    { key: 'Organisation or team name', value: request.organisation },
    { key: 'Go-live date', value: formatDate(request.goLiveDate) },
    { key: 'Expected call volume', value: CALL_VOLUMES[request.callVolume] || request.callVolume },
    { key: 'Data request', value: request.dataRequest },
    { key: 'Proposed outputs', value: request.proposedOutputs }
  ])
}

// My requests on the account page, which the real service renders from the backend.
function renderMyRequests () {
  const empty = document.getElementById('requests-empty')
  if (!empty) return
  const all = productionRequests.all()
  if (!all.length) return

  const rows = all.map(request => `
    <tr class="govuk-table__row">
      <td class="govuk-table__cell"><a class="govuk-link apim-reference" href="production-credentials/view/?reference=${request.reference}">${request.reference}</a></td>
      <td class="govuk-table__cell">Production credentials</td>
      <td class="govuk-table__cell">${formatDate(request.submittedAt)}</td>
      <td class="govuk-table__cell">${STATUS_TEXT[request.status] || request.status}</td>
    </tr>`).join('')

  empty.insertAdjacentHTML('afterend', `
    <table class="govuk-table">
      <caption class="govuk-table__caption govuk-visually-hidden">Requests you have submitted</caption>
      <thead class="govuk-table__head">
        <tr class="govuk-table__row">
          <th scope="col" class="govuk-table__header">Reference</th>
          <th scope="col" class="govuk-table__header">Type</th>
          <th scope="col" class="govuk-table__header">Submitted</th>
          <th scope="col" class="govuk-table__header">Status</th>
        </tr>
      </thead>
      <tbody class="govuk-table__body">${rows}</tbody>
    </table>`)
  empty.remove()
}

// The application page's Going live link preselects that application, as in the real service.
function linkGoingLive () {
  const link = document.getElementById('going-live')
  const id = query('id')
  if (link && id) link.setAttribute('href', `../../production-credentials/?application=${id}`)
}

const current = page()
if (current === '') renderForm()
if (current === 'check-answers') renderCheckAnswers()
if (current === 'confirmation') renderConfirmation()
if (current === 'view') renderView()
renderMyRequests()
linkGoingLive()
