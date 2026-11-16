// FE-01 — M1 : garde-fou d'isolation du build client.
//
// Le client analyse avec Tailwind 4 tous les fichiers non ignorés du dépôt
// (src/assets/main.css, hors allowlist FE-01), donc aussi admin/**. Un nom de
// classe utilitaire écrit côté Admin peut ainsi modifier le CSS du client sans
// qu'aucun fichier client ne change. Ce test le détecte :
//   1. deux copies temporaires du dépôt (fichiers suivis + non suivis non
//      ignorés, contenu actuel du disque) : avec et sans les fichiers FE-01 ;
//   2. build du client dans chaque copie (vite build, vite.config.js inchangé) ;
//   3. les deux sorties doivent être identiques, fichier par fichier ;
//   4. témoin positif : une classe sentinelle ajoutée sous admin/ DOIT modifier
//      le build — sinon le harnais ne prouverait rien.
// Aucun fichier du checkout n'est modifié ; les copies sont supprimées à la fin.
//
// Lancement : npm run test:admin (après Vitest) ou npm run test:admin:isolation.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, sep } from 'node:path'
import { after, before, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))
const viteBin = join(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js')

// Fichiers propres au module Admin FE-01, retirés de la copie « sans Admin ».
const ADMIN_PATHS = ['admin/', 'vite.admin.config.js', 'HANDOVER_FE01_TO_FE02.md']
const isAdminPath = (file) => ADMIN_PATHS.some((p) => (p.endsWith('/') ? file.startsWith(p) : file === p))

// Classe sentinelle assemblée à l'exécution : écrite en clair, elle serait
// elle-même captée par Tailwind puisque ce fichier se trouve sous admin/.
const SENTINEL_VALUE = '4242em'
const SENTINEL_CLASS = ['tracking', `[0.${SENTINEL_VALUE}]`].join('-')

function repoFiles() {
  const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: repoRoot,
  })
  const files = [...new Set(out.toString('utf8').split('\0').filter(Boolean))]
  // Fichiers suivis mais supprimés du disque : ignorés (le build ne les voit pas).
  return files.filter((file) => existsSync(join(repoRoot, file)))
}

function makeCopy(dir, files) {
  for (const file of files) {
    const target = join(dir, file)
    mkdirSync(dirname(target), { recursive: true })
    copyFileSync(join(repoRoot, file), target)
  }
  // Dépôt Git vide : Tailwind applique alors .gitignore comme dans le checkout.
  execFileSync('git', ['init', '-q'], { cwd: dir })
  // Dépendances partagées par lien (jonction sous Windows), jamais copiées.
  symlinkSync(join(repoRoot, 'node_modules'), join(dir, 'node_modules'), 'junction')
}

function removeCopy(dir) {
  const link = join(dir, 'node_modules')
  // Supprime d'abord le lien seul, puis vérifie qu'il n'existe plus : la
  // suppression récursive ne doit jamais atteindre le node_modules réel.
  try {
    unlinkSync(link)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  assert.throws(() => lstatSync(link), { code: 'ENOENT' })
  rmSync(dir, { recursive: true, force: true })
}

function buildClient(cwd, outDir) {
  // Chargeur de config « native » : vite.config.js est importé tel quel, sans
  // fichier temporaire écrit dans node_modules.
  execFileSync(
    process.execPath,
    [viteBin, 'build', '--configLoader', 'native', '--outDir', outDir, '--emptyOutDir', '--logLevel', 'error'],
    { cwd, stdio: ['ignore', 'pipe', 'pipe'] },
  )
}

function listFiles(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'))
    .sort()
}

function hashTree(dir) {
  return new Map(listFiles(dir).map((file) => [file, createHash('sha256').update(readFileSync(join(dir, file))).digest('hex')]))
}

function diffTrees(a, b) {
  const keys = [...new Set([...a.keys(), ...b.keys()])].sort()
  return keys.filter((key) => a.get(key) !== b.get(key))
}

function cssClassTokens(dir) {
  const css = listFiles(dir)
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(join(dir, file), 'utf8'))
    .join('\n')
  return new Set([...css.matchAll(/\.((?:\\.|[\w-])+)/g)].map((match) => match[1].replace(/\\/g, '')))
}

function leakedTokens(withDir, withoutDir) {
  const reference = cssClassTokens(withoutDir)
  return [...cssClassTokens(withDir)].filter((token) => !reference.has(token)).sort()
}

describe('Isolation du build client (M1)', () => {
  let work
  const dirs = {}
  const trees = {}

  before(() => {
    assert.ok(existsSync(viteBin), `Vite introuvable : ${viteBin} (npm ci requis)`)
    work = mkdtempSync(join(tmpdir(), 'fm-admin-isolation-'))
    dirs.withAdmin = join(work, 'avec-admin')
    dirs.withoutAdmin = join(work, 'sans-admin')
    dirs.outWith = join(work, 'build-avec-admin')
    dirs.outWithout = join(work, 'build-sans-admin')
    dirs.outSentinel = join(work, 'build-sentinelle')

    const files = repoFiles()
    const adminFiles = files.filter(isAdminPath)
    assert.ok(adminFiles.length > 20, 'les fichiers FE-01 doivent être présents dans le checkout')
    makeCopy(dirs.withAdmin, files)
    makeCopy(dirs.withoutAdmin, files.filter((file) => !isAdminPath(file)))

    buildClient(dirs.withoutAdmin, dirs.outWithout)
    buildClient(dirs.withAdmin, dirs.outWith)
    trees.without = hashTree(dirs.outWithout)
    trees.with = hashTree(dirs.outWith)
  })

  after(() => {
    if (!work) return
    for (const dir of [dirs.withAdmin, dirs.withoutAdmin]) if (existsSync(dir)) removeCopy(dir)
    rmSync(work, { recursive: true, force: true })
  })

  test('le module Admin ne modifie aucun fichier du build client', () => {
    assert.ok(trees.without.size > 0, 'le build client de référence est vide')
    const changed = diffTrees(trees.with, trees.without)
    const leaked = leakedTokens(dirs.outWith, dirs.outWithout)
    assert.deepEqual(
      changed,
      [],
      [
        'Le build client diffère selon la présence de admin/ : classe(s) Tailwind captée(s) depuis un fichier Admin.',
        `Fichiers du build client modifiés : ${changed.join(', ')}`,
        `Sélecteurs CSS apparus : ${leaked.join(', ') || '(voir les fichiers)'}`,
        "Correctif : remplacer le nom utilitaire dans l'Admin (style scoped, préfixe admin) ou le découper.",
      ].join('\n'),
    )
  })

  test('témoin positif : une classe sentinelle sous admin/ modifie le build client', () => {
    const sentinel = join(dirs.withAdmin, 'admin', 'src', 'IsolationSentinel.vue')
    writeFileSync(sentinel, `<template><p class="${SENTINEL_CLASS}">sentinelle</p></template>\n`)
    buildClient(dirs.withAdmin, dirs.outSentinel)
    const changed = diffTrees(hashTree(dirs.outSentinel), trees.with)
    assert.ok(changed.length > 0, 'la sentinelle aurait dû modifier le build client : le garde-fou ne voit pas admin/')
    const css = listFiles(dirs.outSentinel)
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(join(dirs.outSentinel, file), 'utf8'))
      .join('\n')
    assert.ok(css.includes(SENTINEL_VALUE), 'la règle sentinelle devrait apparaître dans le CSS client')
  })
})
