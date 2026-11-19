# Passation FE-01 → FE-02 — FluxMoneva Admin V1

**Mission livrée :** FE-01, socle Admin Vue 3 autonome, intégré par la PR #23 ; finalisation ciblée du 19/11/2026.
**Statut :** [PR #23](https://github.com/feriol12/gestionnaire-frontend/pull/23) **fusionnée** le 16/11/2026 dans `integration/security-auth-v3`. Corrections de finalisation sur branche locale dédiée, sans publication. La revue du correctif et la validation propriétaire restent requises ; aucun déploiement attesté.

| Rôle | Personne |
|---|---|
| Responsable humain FE-01 | feriol12 |
| Agents de développement | Claude Code (socle historique), Codex (finalisation) |
| Reviewer humain indépendant | Dimas Othentique |
| Titulaire FE-02 | Dimas Othentique (`othentiquedimas-code`), dans son worktree distinct |

## 1. Références Git

- Dépôt : `feriol12/gestionnaire-frontend`
- Branche commune : `origin/integration/security-auth-v3`, vérifiée après fetch le 19/11/2026 à `6d202f21d292f69b98edebf73b773662d043a9ef` (merge PR #23).
- Commit FE-01 publié et fusionné : `930f11c1382edd3146dcb6bab967dff0a9e7644c` ; branche source `feature/fm-admin-fe-01-publication`.
- Branche locale de finalisation : `fix/fm-admin-fe-01-qa`, créée depuis le merge ci-dessus, dans un worktree isolé. Aucun push, PR, merge ou déploiement autorisé pour ce correctif.
- Base historique **avant FE-01**, utilisée pour les comparaisons build et audit : `7171f83f5d830df548a2bed8cfca19774ff2a9ec`.

**Historique uniquement :** `feature/fm-admin-fe-01-shell` et ses commits de développement (`12c115b`, `3fec7e9`, `32d9d1d`, jusqu'à `94fc032`) précèdent la consolidation publiée `930f11c`. Ils ne constituent pas une base d'équipe à récupérer ou à fusionner.

FE-02 est attribuée à Dimas et se poursuit dans **son propre worktree**. Partir de l'intégration fraîchement récupérée, vérifier le SHA, puis intégrer les correctifs FE-01 uniquement après leur publication et leur fusion autorisées. Ne pas basculer ni modifier le checkout de Dimas.

## 2. Lancement local

### Versions de Node

| Usage | Node requis | Origine de la contrainte |
|---|---|---|
| Client et Admin : `dev`, `build`, `preview` (`*:admin` compris) | `^20.19.0 \|\| >=22.12.0` | Vite 8, `@vitejs/plugin-vue` 6 |
| Tests Admin : `test:admin`, `test:admin:e2e` | **`^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0`** | jsdom 31 (le plus strict), Vitest 5 (`^22.12 \|\| ^24 \|\| >=26`), `@axe-core/playwright` (`>=22.12`) |

**Node 20 ne permet pas de lancer les tests Admin.** Le champ `engines` de `package.json` (`^20.19.0 || >=22.12.0`) décrit le client. Il n'a pas été modifié, car il est hors de l'allowlist FE-01. npm se contente d'avertir. **Minimum officiellement compatible pour les tests : Node 22.22.2 sur la branche 22, ou 24.15.0 sur la branche 24** (contraintes `engines` des dépendances verrouillées). Node 24.12.0 est hors de cette plage : une exécution réussie ne constitue pas une compatibilité supportée. Environnement de référence exécuté pour la finalisation : **Node 24.19.0 et npm 11.17.0**. Les autres versions admissibles ne sont pas une matrice de tests exécutée. La CI existante (Node 22, dernière mineure) ne lance pas les tests Admin.

### Commandes

```bash
npm ci
npm run dev:admin              # http://localhost:5174 (serveur de dev Admin)
npm run build:admin            # sortie admin/dist/ (ignorée par Git)
npm run preview:admin          # http://localhost:4174 (build de production)
npm run test:admin             # Vitest (jsdom), puis garde-fou d'isolation du client
npm run test:admin:isolation   # garde-fou d'isolation seul (~5 s, 3 builds client)
npm run test:admin:e2e         # build Admin puis Playwright + axe (local, hors CI)
```

Avant le premier `test:admin:e2e`, lancer `npx playwright install chromium`. Le navigateur est téléchargé dans le cache utilisateur, hors du dépôt. Les captures et les traces sont écrites sous `admin/tests/e2e/__screenshots__/`, ignoré par Git. Les tests ne téléchargent aucune police ni ressource tierce et peuvent tourner hors ligne une fois Chromium installé.

Les commandes du client restent inchangées : `npm run dev`, `npm run build` (avec pré-rendu) et `npm run preview`.

## 3. Arborescence et isolation

```
vite.admin.config.js           build Admin séparé (root admin/, outDir admin/dist, publicDir désactivé)
admin/index.html               entrée HTML (noindex, aucune ressource externe)
admin/src/main.js · App.vue    application Vue indépendante
admin/src/router/              index.js (routes, titre, focus après navigation) · navigation.js (menus)
admin/src/layouts/             AdminShell, AdminSidebar, AdminHeader, MobileNav, NavList
admin/src/components/          composants génériques (voir §5) · icon-registry.js (icônes)
admin/src/views/               Dashboard, States, Components, Placeholder, ReservedAuth, NotFound
admin/src/styles/              tokens.css (variables --fm-*) · base.css
admin/src/mocks/dashboard.js   jeux de données fictifs figés
admin/tests/unit/              Vitest (config dans vite.admin.config.js, clé test)
admin/tests/isolation/         garde-fou d'isolation du build client (node:test)
admin/tests/e2e/               Playwright + axe (playwright.config.js)
```

**Non modifiés :** `src/**`, `public/**` (dont `.htaccess`), `index.html`, `vite.config.js`, `scripts/` (pré-rendu), `netlify.toml`, `.env*`, `.gitignore`, `.github/` (CI), backend.

Seuls `package.json` (six scripts Admin listés au §2, cinq devDependencies ajoutées par FE-01) et `package-lock.json` sont partagés. Aucune dépendance de production n'a été ajoutée. Trois paquets transitifs communs ont reçu une montée de version compatible, sans effet sur le build client (vérifié par un build identique) : `@jridgewell/sourcemap-codec` 1.5.5 → 1.6.0, `picomatch` 4.0.4 → 4.0.7, `tinyglobby` 0.2.16 → 0.2.17.

### Point de vigilance : Tailwind du client

Le CSS du client importe Tailwind 4 sans restriction de sources. Tailwind analyse donc **tous** les fichiers non ignorés du dépôt, y compris `admin/**` et ce document. Tout mot de l'Admin qui ressemble à un utilitaire Tailwind peut ajouter une règle au CSS du client.

Cas rencontré : la déclaration CSS standard de fusion des bordures de tableau, écrite dans un style scoped de l'Admin, a ajouté une règle au bundle client. Elle a été remplacée par `border-spacing: 0`, au rendu identique.

**Garde-fou automatique** : `admin/tests/isolation/client-isolation.test.mjs`, lancé par `npm run test:admin`.

1. Il crée deux copies temporaires du dépôt à partir de l'état actuel du disque (fichiers suivis et fichiers non suivis non ignorés). La première contient les fichiers FE-01 (`admin/**`, `vite.admin.config.js`, ce document), la seconde ne les contient pas.
2. Il construit le client dans chaque copie avec `vite build` et le `vite.config.js` inchangé.
3. Il exige deux sorties identiques, fichier par fichier (SHA-256). En cas d'échec, il liste les fichiers modifiés et les sélecteurs CSS apparus.
4. **Témoin positif** : une classe sentinelle ajoutée sous `admin/` doit modifier le build. Sinon, le harnais ne prouverait rien.

Le checkout n'est jamais modifié. Les copies, placées dans le dossier temporaire du système, partagent `node_modules` par lien (jonction sous Windows). Elles sont supprimées à la fin du test, le lien étant retiré avant toute suppression récursive.

**En cas d'échec** : renommer la classe ou le mot fautif côté Admin (classes préfixées et styles scoped, sans aucun nom utilitaire), puis relancer. La solution de fond est une directive de sources dans le CSS du client. Elle exige un GO séparé sur `src/`.

## 4. Routes

| Chemin | Nom | Contenu FE-01 |
|---|---|---|
| `/` | `dashboard` | tableau de bord de démonstration |
| `/utilisateurs` | `users` | emplacement réservé (module futur) |
| `/audit` | `audit` | emplacement réservé |
| `/notifications` | `notifications` | emplacement réservé |
| `/securite` | `security` | emplacement réservé |
| `/etats` | `states` | galerie des 6 états simulés |
| `/composants` | `components` | catalogue des composants |
| `/connexion` | `auth-login` | **réservé FE-02**, hors shell, sans formulaire |
| `/mfa/enrolement` | `auth-mfa-enrollment` | **réservé FE-02** |
| `/mfa/verification` | `auth-mfa-verify` | **réservé FE-02** |
| `/mfa/recuperation` | `auth-mfa-recovery` | **réservé FE-02** |
| `/reauthentification` | `auth-reauth` | **réservé FE-02** |
| autre | `not-found` | page introuvable (dans le shell) |

- Historique HTML5 (`createWebHistory('/')`), prévu pour une origine Admin distincte. Le futur hébergement devra renvoyer `index.html` pour ces chemins.
- **Aucun garde de navigation**, ni global ni par route. Un seul hook après navigation (`afterEach`, qui ne bloque ni ne redirige rien) met à jour `document.title` et place le focus sur `#admin-page-title`. Les états « accès refusé » et « session expirée » sont **des rendus simulés**, jamais un contrôle d'accès. L'autorité reste le serveur (BE-02).
- Les routes `meta.reservedFor = 'FE-02'` utilisent `ReservedAuthView`. FE-02 remplace leur `component` sans changer `path` ni `name`.

## 5. Contrat de composants (API visuelle)

JavaScript, Composition API `<script setup>`, styles scoped, variables `--fm-*` de `tokens.css`. **Aucune classe utilitaire Tailwind dans l'Admin.**

| Composant | Props principales | Notes |
|---|---|---|
| `AdminButton` | `variant` primary/secondary/danger/ghost · `to` · `icon` · `iconRight` · `disabled` · `loading` · `block` · `type` | `to` → lien interne. `disabled` ou `loading` → aucune navigation ni émission de click, href retiré. `disabled` → hors tabulation ; `loading` seul → focus conservé (`aria-disabled`, `aria-busy`). Bouton natif désactivé par `disabled` |
| `AdminIcon` | `name` · `size` | Lucide SVG, `aria-hidden`. Noms dans `icon-registry.js`. Un nom inconnu provoque un avertissement Vue en développement (validateur) puis une icône de repli |
| `StatusBadge` | `tone` success/warning/danger/info/neutral · `dot` | toujours un libellé texte |
| `DemoTag` | `label` (défaut « Démonstration ») | marque un contenu fictif |
| `BaseCard` | `title` · `description` · `headingLevel` · `tag` · slots `actions`, `footer` | section titrée (`aria-labelledby`) |
| `KpiCard` | `label` · `shortLabel` · `value` (nombre) · `icon` · `tone` · `trend {label, tone, icon?}` · `note` | format fr-FR, libellé court sur mobile. Icône de tendance seulement si `trend.icon` est fourni |
| `TextField` | `v-model` · `label` · `hideLabel` · `type` · `hint` · `error` · `icon` · `autocomplete` | label relié, `aria-describedby`, `aria-invalid` |
| `SelectField` | `v-model` · `label` · `options [{value,label}]` · `hint` | `<select>` natif |
| `CheckboxField` | `v-model` (booléen) · `label` | case native 18px |
| `InlineAlert` | `tone` danger/warning/info · `title` · `dismissible` · slot `actions` · événement `dismiss` | pas de `role="alert"` : l'annonce est gérée par la vue |
| `StatePanel` | `icon` · `title` · `description` · `tone` · `headingLevel` · slot actions | rendu d'état générique |
| `SkeletonBlock` | `width` · `height` · `radius` | décoratif ; le conteneur porte `aria-busy` |
| `AuditActivity` | `events` · `caption` | tableau ≥ 768px, cartes en dessous. La zone du tableau n'est tabulable (`tabindex=0`) que si elle défile réellement (mesure par `ResizeObserver`) |
| `ActivityChart` | `points [{slot,allowed,blocked}]` · `label` | SVG décoratif (`aria-hidden`). L'information passe par la légende (`figcaption`) et le tableau de données |
| `AdminAvatar`, `BrandMark`, `DemoBanner` | — | identité visuelle du shell |

**Focus et navigation**
- Lien d'évitement vers `#admin-main`.
- Après chaque navigation interne, le router (`afterEach`) place le focus sur `#admin-page-title`. C'est le h1 de l'en-tête du shell ou celui de `ReservedAuthView`. La règle vaut aussi entre le shell et les écrans hors shell, dans les deux sens. Au premier chargement, le focus n'est pas déplacé.
- **FE-02 doit donner `id="admin-page-title"` et `tabindex="-1"` au h1 de chaque écran d'authentification.**

**Tiroir mobile** : `<dialog>` modal natif.
- Échap ou bouton Fermer : le focus revient au bouton d'ouverture.
- Lien du menu : la navigation place le focus sur le titre.
- Passage de la fenêtre à 1024px ou plus (par exemple, rotation d'une tablette) : le tiroir se ferme, la page redevient active et le focus va sur le titre.

**Recherche d'en-tête** : simulée. Le message d'état est effacé à chaque changement de page.

**Points de rupture** (largeur de fenêtre) :

| Seuil | Effet |
|---|---|
| < 360px | marque compacte de l'en-tête sans nom de produit |
| < 480px | graphique abaissé à 160px, une graduation sur deux ; carte réservée FE-02 resserrée |
| < 768px | activité d'audit en cartes, libellés KPI courts, étiquette Démonstration des KPI masquée, en-têtes de carte empilés |
| ≥ 768px | activité d'audit en tableau, titre de la section KPI visuellement masqué |
| < 1024px | barre de navigation basse, tiroir, bouton menu ; en-tête sur grille (menu, marque, outils / titre / recherche) |
| ≥ 1024px | sidebar fixe, sans barre basse ni bouton menu ; bandeau démo sur une ligne ; le tiroir éventuellement ouvert se ferme |
| < 1280px | nom et rôle de l'opérateur et séparateur masqués dans l'en-tête (seul l'avatar reste) |
| ≥ 1280px | tableau de bord sur deux colonnes (contenu principal, colonne latérale de 18rem minimum) |

**Pour FE-02 :** les écrans d'authentification ne doivent pas dupliquer le router ni les composants. Ils ajoutent leurs vues sous `admin/src/views/auth/` et peuvent créer leur propre layout « auth » (hors shell) sur le modèle de `ReservedAuthView`. Les champs TOTP doivent réutiliser `TextField` (ajouter les props nécessaires, par exemple `inputmode` ou `maxlength`, sans casser l'existant). Toute nouvelle icône s'ajoute dans `icon-registry.js`.

## 6. Données fictives

`admin/src/mocks/dashboard.js` contient des objets figés (`Object.freeze`).
- Aucune lecture réseau ni stockage.
- Adresses uniquement en `@example.test`.
- Opérateur fictif « Claire Valette » (initiales, sans photo).
- Aucune donnée financière.

Les tests imposent ces règles.

## 7. Typographie et ressources externes

- L'Admin ne charge **aucune** ressource externe : ni Google Fonts, ni préconnexion, ni CDN.
- Police : pile système (`system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`). Le rendu varie légèrement selon le système.
- Plus Jakarta Sans, la police des maquettes, n'est plus chargée. L'auto-héberger exigerait des fichiers de police versionnés dans le dépôt : décision à prendre hors FE-01.
- Les tests vérifient cette absence :
  - `index.html` et les styles sources : aucune URL externe, aucun `@font-face` ni `@import` distant ;
  - `admin/dist` : aucune URL hors espaces de noms XML et lien de documentation d'erreur Vue (jamais chargés) ;
  - en navigateur : aucune requête hors `localhost:4174`.

## 8. Preuves historiques (14/11/2026, Node 24.19, avant finalisation)

Les résultats ci-dessous décrivent le socle historique, pas le nouveau correctif. Les preuves de finalisation doivent être rattachées à son SHA local dans le rapport de QA.

| Contrôle | Résultat |
|---|---|
| Build client de la base `7171f83` et de la branche corrigée, chacun après `npm ci` sur un export propre | PASS, `dist/` **identique** octet pour octet (29 fichiers) |
| Garde-fou d'isolation `test:admin:isolation` | **2/2 PASS** (comparaison + témoin positif) |
| Mutation : trois utilitaires de typographie Tailwind ajoutés dans un fichier Admin (copie temporaire) | garde-fou **en échec** comme attendu ; de nouveau vert après retrait |
| Build Admin `npm run build:admin` | PASS (sortie `admin/dist`) |
| Vitest + Vue Test Utils | **68/68 PASS** (4 fichiers) |
| Playwright + axe-core (Chromium headless 1255) | **52/52 PASS** |
| Diff des chemins client protégés par rapport à `7171f83` | vide |

Couverture Playwright :
- 5 écrans × 360/390/430/768/1024/1280/1440px : h1 unique, bandeau démo, aucun défilement horizontal, navigation adaptée, axe WCAG 2.0/2.1/2.2 A-AA sans violation, capture pleine page.
- Reflow à 320px, 1440px vu à 200 % (720px), texte agrandi à 200 %.
- Clavier et focus :
  - lien d'évitement, sidebar, focus visible, chargement simulé ;
  - focus sur le titre après navigation, y compris au retour d'un emplacement FE-02 et vers celui-ci ;
  - zone du tableau tabulable seulement si elle défile.
- Tiroir mobile :
  - axe, Échap, retour du focus et navigation ;
  - fermeture au passage à 1024px (page de nouveau active, focus sur le titre), et maintien sous 1024px.
- Barre basse : cibles d'au moins 44px.
- Build `admin/dist` sans ressource externe.
- Après chaque test : aucune requête hors `localhost:4174`, aucun `/api`, aucune erreur console, `localStorage`, `sessionStorage` et cookies vides.

### Audit des dépendances — finalisation du 19/11/2026

Audits exécutés après `npm ci` séparés, sur les lockfiles de la base **avant FE-01** (`7171f83`) et du correctif basé sur `6d202f2`. `package.json` et `package-lock.json` restent identiques à la PR #23 fusionnée ; aucune mise à jour ni commande `npm audit fix`.

| Audit npm | Avant FE-01 | FE-01 intégré / correctif |
|---|---|---|
| Complet (`npm audit --json`) | 10 paquets : 1 faible, 1 modéré, 8 élevés | 15 paquets : 1 faible, 6 modérés, 8 élevés |
| Sans dev (`npm audit --omit=dev --json`) | 7 élevés | 7 élevés, mêmes entrées |

Les dix entrées préexistantes sont inchangées : `@babel/core`, `@vue/server-renderer`, `baseline-browser-mapping`, `browserslist`, `follow-redirects`, `nanoid`, `postcss`, `source-map-js`, `vite`, `vue`.

FE-01 ajoute cinq paquets signalés **modérés**, tous marqués dépendances de développement dans le lockfile : `@vue/test-utils` 2.5.1 → `js-beautify` 2.0.3 → `editorconfig` 3.0.2 / `glob` 13.0.7 → `minimatch` 10.2.6. Deux avis directs : [glob, annulation AbortSignal et parcours après expiration](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) et [minimatch, amplification globparts](https://github.com/advisories/GHSA-g3hv-75wg-m249) ; les autres entrées héritent de ces dépendances. Ce sont cinq paquets affectés, pas cinq avis indépendants.

Les audits retournent le code 1 (vulnérabilités présentes), jamais PASS sécurité. Aucun ajout d'alerte par le correctif lui-même. La suppression des dépendances de développement n'élimine pas les sept alertes élevées préexistantes. L'exploitabilité propre à l'application n'est pas démontrée par ces décomptes. Toute remédiation exige une autorisation distincte ; le rapport QA conserve les JSON et la comparaison détaillée.

## 9. Écarts assumés par rapport aux maquettes Stitch

- Palette : texte descriptif de `DESIGN.md` (Royal Blue / Slate), pas les tokens Material 3 du front-matter (décision D1).
- Texte « danger » en `#B91C1C` (et non `#EF4444`, insuffisant en contraste AA). Focus : contour plein 2px + halo, au lieu du seul halo à 25 %.
- Police système au lieu de Plus Jakarta Sans (aucune ressource externe, voir §7).
- Carte d'accueil mobile sur fond blanc (le fond bleuté faisait échouer le contraste des badges).
- Ordre mobile : actions rapides après les informations (ordre DOM = ordre visuel, pour l'accessibilité).
- Avatar à initiales au lieu de la photo hébergée par Google. Aucune police d'icônes ni Tailwind CDN.
- Titre de page visible aussi sur mobile (cible du focus après navigation).
- Graphique conservé sur mobile. Recherche d'en-tête simulée (message d'état, aucune requête).

## 10. Limites et dette connues

- Pas d'intégration CI des tests Admin : le workflow existant ne lance que `npm ci` et `npm run build`. Ajouter `build:admin` et les tests Admin (avec une version de Node compatible, voir §2) demandera un GO séparé.
- Hébergement Admin non défini : l'origine `https://admin.fluxmoneva.com` n'est que documentaire. DNS, TLS, réécritures SPA, CSP et en-têtes restent à qualifier. Le build ne contient ni script ni style inline, ni ressource tierce.
- Isolation Tailwind : détectée automatiquement (§3), mais pas empêchée à la source tant que le CSS du client n'est pas restreint (GO séparé sur `src/`).
- `engines` de `package.json` non aligné sur les tests Admin (§2). Il est hors allowlist et non modifié.
- **Historique uniquement :** le commit de développement `12c115b` ne contenait pas de tests. Cette réserve ne concerne pas le commit consolidé `930f11c` publié dans la PR #23, qui contient les tests.
- Tests e2e limités à Chromium. Pas de lecteur d'écran réel ni de test sur appareil physique.
- L'opérateur fictif est signalé comme tel par le bandeau, les étiquettes et un texte réservé aux lecteurs d'écran. Le nom affiché ne porte pas de mention visible « fictif ».
- Captures pleine page : la barre basse fixe apparaît au milieu de l'image (artefact de capture, pas de rendu).

## 11. TODO FE-02 (sur mocks d'abord)

1. Remplacer les cinq `ReservedAuthView` par les écrans : connexion, enrôlement, vérification TOTP, récupération, réauthentification. Données et réponses **simulées**, explicitement étiquetées.
2. Définir un layout « auth » hors shell. Réutiliser `TextField`, `AdminButton`, `InlineAlert`, `StatePanel` et les tokens. Conserver le h1 `#admin-page-title` (`tabindex="-1"`) sur chaque écran.
3. Couvrir les états chargement, erreur, expiré, verrouillé et succès, dans les tests unitaires et Playwright/axe (même config).
4. Aucun appel `/api/admin/*`, aucun stockage de secret, de code TOTP ou de jeton avant un GO d'intégration distinct. Le cookie de session reste host-only et strict côté serveur (BE-02).
5. Ne pas introduire de garde de navigation présenté comme une sécurité. Si un garde UX est nécessaire plus tard, il doit dépendre d'une réponse serveur, pas d'un état local.
6. Avant toute PR : `npm run test:admin` (garde-fou d'isolation compris) et `npm run test:admin:e2e`, sous un Node compatible (§2).

## 12. Chemins à ne pas modifier sans mandat explicite

`src/**`, `public/**` (dont `.htaccess`), `index.html`, `vite.config.js`, `scripts/**`, `netlify.toml`, `.env*`, `.gitignore`, `.github/**`, le store d'authentification client, toute configuration LWS ou serveur, le backend.
