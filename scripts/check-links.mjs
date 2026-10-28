// Every internal link in docs/ must resolve to a file. Relative links are easy to get
// wrong by one level, and a static site gives no runtime error when they are.
import { readdir, readFile, access } from 'node:fs/promises'
import { join, dirname, resolve, relative } from 'node:path'

const out = new URL('../docs/', import.meta.url).pathname

async function pages (dir) {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...await pages(path))
    else if (entry.name.endsWith('.html')) found.push(path)
  }
  return found
}

const broken = []
for (const page of await pages(out)) {
  const html = await readFile(page, 'utf8')
  const links = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1])
  for (const link of links) {
    if (/^(https?:|mailto:|#|data:)/.test(link)) continue
    const [path] = link.split(/[?#]/)
    if (!path) continue
    const target = resolve(dirname(page), path)
    const candidate = path.endsWith('/') || !path.split('/').pop().includes('.')
      ? join(target, 'index.html')
      : target
    try {
      await access(candidate)
    } catch {
      broken.push(`${relative(out, page)} -> ${link}`)
    }
  }
}

if (broken.length) {
  console.error(`${broken.length} broken links:`)
  broken.forEach(b => console.error('  ' + b))
  process.exit(1)
}
console.log('all internal links resolve')
