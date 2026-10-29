// Stands in for the backend the real service talks to. Everything lives in this browser:
// nothing is sent anywhere, and clearing site data resets the prototype.

const USER_KEY = 'ampPrototypeUser'
const APPS_KEY = 'ampPrototypeApplications'

// The same fixed user as EntraBypass in web-api-marketplace, so screenshots match.
const DUMMY_USER = {
  oid: '00000000-0000-4000-8000-00000000d0e0',
  email: 'john.doe@example.com',
  name: 'John Doe'
}

function read (key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

function write (key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) { /* private browsing */ }
}

export const user = {
  current () {
    return read(USER_KEY, null)
  },
  signIn () {
    write(USER_KEY, DUMMY_USER)
    return DUMMY_USER
  },
  signOut () {
    try {
      window.localStorage.removeItem(USER_KEY)
    } catch (e) { /* as above */ }
  }
}

export const applications = {
  all () {
    return read(APPS_KEY, [])
  },
  find (id) {
    return this.all().find(application => application.id === id) || null
  },
  create (details) {
    const application = {
      id: crypto.randomUUID(),
      name: details.name,
      description: details.description || '',
      apis: details.apis || [],
      environment: details.environment || 'Sandbox',
      clientId: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }
    write(APPS_KEY, this.all().concat(application))
    return application
  },
  update (id, changes) {
    const updated = this.all().map(a => (a.id === id ? { ...a, ...changes } : a))
    write(APPS_KEY, updated)
    return this.find(id)
  },
  remove (id) {
    write(APPS_KEY, this.all().filter(a => a.id !== id))
  },
  // A client secret is shown once in the real service and never retrievable again.
  newSecret (id) {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    this.update(id, { secretCreatedAt: new Date().toISOString() })
    return secret
  }
}

const REQUESTS_KEY = 'ampPrototypeProductionRequests'
// The backend's reference alphabet: no 0, 1, I or O, so a reference can be read out.
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function newReference () {
  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length])
    .join('')
  return 'PCR-' + suffix
}

// Production credentials requests. The real service stores them in the backend, which allows
// one per application, and nothing ever moves them on from Submitted: review is offline.
export const productionRequests = {
  all () {
    return read(REQUESTS_KEY, [])
  },
  find (reference) {
    return this.all().find(request => request.reference === reference) || null
  },
  forApplication (applicationId) {
    return this.all().find(request => request.applicationId === applicationId) || null
  },
  create (details) {
    if (this.forApplication(details.applicationId)) return null
    const request = {
      ...details,
      reference: newReference(),
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString()
    }
    write(REQUESTS_KEY, this.all().concat(request))
    return request
  }
}

// Multi-step journeys keep their answers here until the final confirmation.
export const answers = {
  get (journey) {
    return read('ampPrototypeAnswers:' + journey, {})
  },
  set (journey, values) {
    write('ampPrototypeAnswers:' + journey, { ...this.get(journey), ...values })
  },
  clear (journey) {
    try {
      window.localStorage.removeItem('ampPrototypeAnswers:' + journey)
    } catch (e) { /* as above */ }
  }
}
