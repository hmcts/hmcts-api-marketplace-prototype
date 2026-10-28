import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import nunjucks from 'nunjucks'
import * as sass from 'sass'

const root = new URL('..', import.meta.url).pathname
const out = join(root, 'docs')
const views = join(root, 'src/views')
const govuk = join(root, 'node_modules/govuk-frontend/dist')

const routes = JSON.parse(await readFile(join(root, 'scripts/routes.json'), 'utf8'))

const env = nunjucks.configure([views, govuk], { autoescape: true, trimBlocks: true })

env.addGlobal('govukRebrand', true)
env.addGlobal('marketplaceSiteUrl', '/')
// "2 October 2026" from a stored ISO timestamp, as the real service formats dates.
env.addFilter('date', value => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed)
})

async function locale (name) {
  if (!name) return {}
  return JSON.parse(await readFile(join(root, `src/locales/en/${name}.json`), 'utf8'))
}

// Pages are served from a subdirectory on GitHub Pages but from the root locally, so every
// root-relative link is rewritten to a relative one at build time. assetPath does the same
// for the stylesheet and script the layout pulls in.
function depth (url) {
  const segments = url.replace(/^\/|\/$/g, '').split('/').filter(Boolean)
  const levels = url.endsWith('.html') ? segments.length - 1 : segments.length
  return levels > 0 ? '../'.repeat(levels) : './'
}

function relativise (html, prefix) {
  return html.replace(/(href|src|action)="\/(?!\/)([^"]*)"/g, (_, attr, path) => `${attr}="${prefix}${path}"`)
}

const globals = await locale('template')
// The real service lists APIs from the catalogue backend. These seed the checkboxes instead.
const apiItems = JSON.parse(await readFile(join(root, 'src/data/apis.json'), 'utf8'))

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })

for (const route of routes) {
  const prefix = depth(route.url)
  const context = { ...globals, ...(await locale(route.locale)), apiItems, basePath: prefix, assetPath: prefix + 'assets', currentUrl: route.url }
  const rendered = relativise(env.render(route.view, context), prefix)
  const target = route.url.endsWith('.html')
    ? join(out, route.url)
    : join(out, route.url, 'index.html')
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, rendered)
}

const css = sass.compile(join(root, 'src/assets/scss/main.scss'), {
  loadPaths: [govuk, join(root, 'node_modules')],
  style: 'compressed',
  quietDeps: true
})
await mkdir(join(out, 'assets'), { recursive: true })
await writeFile(join(out, 'assets/main.css'), css.css)

await cp(join(govuk, 'govuk/assets'), join(out, 'assets'), { recursive: true })
await cp(join(root, 'src/assets/javascripts'), join(out, 'assets'), { recursive: true })
// main.js imports this as a sibling module, so it ships from the package rather than source control.
await cp(join(govuk, 'govuk/govuk-frontend.min.js'), join(out, 'assets/govuk-frontend.min.js'))
await writeFile(join(out, '.nojekyll'), '')

console.log(`built ${routes.length} pages into docs/`)
