// SEO-07 : pré-rendu ciblé de l'accueil public, exécuté après `vite build`.
//
// - dist/index.html     : coquille + HTML de l'accueil dans #app (texte public
//                         lisible sans JavaScript). L'application monte ensuite
//                         normalement (createApp remplace ce contenu).
// - dist/app-shell.html : coquille SPA d'origine, sans contenu pré-rendu ni
//                         canonical / og:url statiques, servie pour toutes les
//                         autres routes (voir public/.htaccess).
//
// Le build échoue si une vérification ne passe pas.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'vite';

// Identifiants de style scoped calculés comme pour le build de production.
process.env.NODE_ENV = 'production';

const root = fileURLToPath(new URL('..', import.meta.url));
// Dossier de sortie : dist/ par défaut ; --out-dir=<chemin> pour un build de test.
const outArg = process.argv.find((a) => a.startsWith('--out-dir='));
const dist = outArg ? pathToFileURL(`${resolve(outArg.slice(10))}/`) : new URL('../dist/', import.meta.url);
const MOUNT = '<div id="app"></div>';

const fail = (message) => {
  console.error(`prerender-landing: ${message}`);
  process.exit(1);
};

const shell = await readFile(new URL('index.html', dist), 'utf8');
if (shell.split(MOUNT).length !== 2) fail('point de montage #app introuvable ou multiple dans dist/index.html');

const vite = await createServer({
  root,
  mode: 'production',
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
});

let html;
try {
  const { renderLanding } = await vite.ssrLoadModule('/scripts/prerender-entry.js');
  html = await renderLanding();
} finally {
  await vite.close();
}

// Vérifications du contenu pré-rendu.
if (!html.includes('Prenez le contrôle de vos dépenses')) fail('titre principal absent du rendu');
if (/\sstyle="/.test(html)) fail('attribut style en ligne dans le rendu (incompatible avec la CSP style-src \'self\')');
if (/MONEVA(?!_)/.test(html.replace(/FluxMoneva/g, ''))) fail('marque « MONEVA » seule dans le rendu');
if (/<script/i.test(html)) fail('script dans le rendu');

const css = (await Promise.all(
  (await readdir(new URL('assets/', dist))).filter((f) => f.endsWith('.css')).map((f) => readFile(new URL(`assets/${f}`, dist), 'utf8')),
)).join('\n');
const scopes = [...new Set(html.match(/data-v-[0-9a-f]{8}/g) ?? [])];
const unmatched = scopes.filter((s) => !css.includes(`[${s}]`));
if (unmatched.length) fail(`identifiants scoped sans CSS correspondante : ${unmatched.join(', ')}`);

const appShell = shell
  .replace(/\s*<link rel="canonical"[^>]*>/, '')
  .replace(/\s*<meta property="og:url"[^>]*>/, '');
if (/rel="canonical"|og:url/.test(appShell)) fail('canonical / og:url encore présents dans app-shell.html');

await writeFile(new URL('app-shell.html', dist), appShell);
await writeFile(new URL('index.html', dist), shell.replace(MOUNT, `<div id="app">${html}</div>`));

console.log(`prerender-landing: dist/index.html (${html.length} caractères pré-rendus, ${scopes.length} portée(s) scoped vérifiée(s)) et dist/app-shell.html écrits`);
