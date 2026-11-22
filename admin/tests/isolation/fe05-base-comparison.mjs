// Comparaison FE-05 reproductible : build client complet (pré-rendu inclus).
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  symlinkSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const base = '6c580907b9a5d5577970ddb6f06f2e3860ce617a'
const evidence = join(root, 'admin/tests/e2e/__screenshots__/fe05-evidence')
mkdirSync(evidence, { recursive: true })
const scratch = mkdtempSync(join(tmpdir(), 'fm-fe05-base-'))
const checkout = join(scratch, 'base')
mkdirSync(checkout)
execFileSync('git', ['archive', '--format=tar', '--output=' + join(scratch, 'base.tar'), base], {
  cwd: root,
})
execFileSync('tar', ['-xf', join(scratch, 'base.tar'), '-C', checkout])
execFileSync('git', ['init', '-q'], { cwd: checkout })
symlinkSync(join(root, 'node_modules'), join(checkout, 'node_modules'), 'junction')

function build(dir, name) {
  const vite = execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
    cwd: dir,
    encoding: 'utf8',
  })
  const prerender = execFileSync(process.execPath, ['scripts/prerender-landing.mjs'], {
    cwd: dir,
    encoding: 'utf8',
  })
  writeFileSync(join(evidence, name + '.log'), vite + prerender)
}
function manifest(dir, current = dir) {
  return readdirSync(current, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const full = join(current, entry.name)
      return entry.isDirectory()
        ? manifest(dir, full)
        : [
            {
              file: relative(dir, full).replaceAll('\\', '/'),
              sha256: createHash('sha256').update(readFileSync(full)).digest('hex'),
            },
          ]
    })
}
build(checkout, 'base-client')
build(root, 'candidate-client')
const baseline = manifest(join(checkout, 'dist'))
const candidate = manifest(join(root, 'dist'))
assert.deepEqual(
  candidate,
  baseline,
  'Le build client FE-05 doit être identique octet pour octet à la base',
)
const report = {
  base,
  files: candidate.length,
  identical: true,
  baseline,
  candidate,
  scratch,
  node: process.version,
}
writeFileSync(join(evidence, 'client-comparison.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ base, files: candidate.length, identical: true, scratch }))
// Copie temporaire conservée pour inspection locale ; aucun checkout existant modifié.
