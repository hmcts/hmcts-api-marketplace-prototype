import featureList from './feature-list.js?v=1748134bc1'

// Phase 2 features can be switched on and off, so the prototype can show "feature X but not
// feature Y". The list and each feature's default come from src/data/features.json, written
// into feature-list.js by the build. A choice made here lives in this browser only.
//
// In a link, ?features=a,b switches exactly those on and every other feature off, and
// ?features=default goes back to the defaults. The choice is then kept as you move around.
//
// In a page: an element with data-feature="id" shows only when that feature is on, and one
// with data-feature-off="id" only when it is off (the MVP behaviour it replaces). A whole page
// that belongs to a feature wraps its content in data-feature-page="id". Page scripts check
// features.isOn(id) before doing anything for a feature.

const KEY = 'ampPrototypeFeatures'

function readChoices () {
  try {
    return JSON.parse(window.localStorage.getItem(KEY)) || {}
  } catch (e) {
    return {}
  }
}

function writeChoices (choices) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(choices))
  } catch (e) { /* private browsing: the choice lasts for this page only */ }
}

let choices = readChoices()

export const features = {
  all () {
    return featureList.map(feature => ({ ...feature, on: this.isOn(feature.id) }))
  },
  isOn (id) {
    const feature = featureList.find(f => f.id === id)
    if (!feature) return false
    return id in choices ? choices[id] : !!feature.default
  },
  // Sets every feature at once, from a map of id to true or false.
  set (wanted) {
    choices = Object.fromEntries(featureList.map(f => [f.id, !!wanted[f.id]]))
    writeChoices(choices)
  },
  reset () {
    choices = {}
    try {
      window.localStorage.removeItem(KEY)
    } catch (e) { /* as above */ }
  },
  // The ?features= value that reproduces the current choice, for sharing.
  linkValue () {
    const on = featureList.filter(f => this.isOn(f.id)).map(f => f.id)
    return on.length ? on.join(',') : 'none'
  }
}

function applyLink () {
  const value = new URLSearchParams(window.location.search).get('features')
  if (value === null) return
  if (value === 'default') {
    features.reset()
    return
  }
  const wanted = value.split(',').map(id => id.trim()).filter(Boolean)
  features.set(Object.fromEntries(wanted.map(id => [id, true])))
}

function applyToPage () {
  document.querySelectorAll('[data-feature]').forEach(el => { el.hidden = !features.isOn(el.dataset.feature) })
  document.querySelectorAll('[data-feature-off]').forEach(el => { el.hidden = features.isOn(el.dataset.featureOff) })

  const page = document.querySelector('[data-feature-page]')
  if (page && !features.isOn(page.dataset.featurePage)) {
    const feature = featureList.find(f => f.id === page.dataset.featurePage)
    // The footer link has already been made relative to this page by the build.
    const footerLink = document.querySelector('a[href*="prototype-settings"]')
    const settings = footerLink ? footerLink.getAttribute('href') : '/prototype-settings/'
    page.innerHTML = `
      <h1 class="govuk-heading-xl">This part of the prototype is switched off</h1>
      <p class="govuk-body">${feature ? `‘${feature.name}’ is` : 'This feature is'} not switched on in this browser.</p>
      <p class="govuk-body">You can switch it on in <a class="govuk-link" href="${settings}">Prototype settings</a>.</p>`
    page.dataset.featureBlocked = 'true'
  }
}

applyLink()
applyToPage()
