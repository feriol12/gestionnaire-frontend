# FE-03 — Handover : tableau de bord administratif non financier

## 1. Contexte Git

- Base autorisée et utilisée : `6c580907b9a5d5577970ddb6f06f2e3860ce617a` (`origin/integration/security-auth-v3` après fetch).
- Branche locale : `feature/fm-admin-fe-03-dashboard-mocks`.
- Worktree isolé : `C:\Users\HP\AppData\Local\Temp\opencode\fe03-dashboard`.
- Checkout principal et worktrees FE-01/FE-02 préservés, non modifiés.
- Aucun push, aucune PR, aucun merge, aucun déploiement : **travail local uniquement**.

## 2. Fichiers modifiés / ajoutés

Modifiés (2) :
- `admin/src/views/DashboardView.vue` — ajout de la section FE-03 et de la machine à états locale ; sections FE-01 intactes.
- `admin/src/mocks/dashboard.js` — ajout de jeux fictifs figés (aucune donnée financière).

Ajoutés (5) :
- `admin/src/components/dashboard/DashboardMetricPanel.vue`
- `admin/src/components/dashboard/DashboardRegistrationTrend.vue`
- `admin/src/components/dashboard/DashboardSupervisionPanel.vue`
- `admin/tests/unit/dashboard.spec.js`
- `admin/tests/e2e/dashboard.e2e.js`
- `admin/FE03_HANDOVER.md` (ce document)

Aucun fichier interdit modifié : ni `admin/src/router/index.js`, ni `views.spec.js`, ni `admin.e2e.js`, ni `KpiCard.vue`, ni `ActivityChart.vue`, ni tout autre composant partagé, ni le frontend client, ni la configuration.

## 3. Fonctionnalités livrées

Section « Supervision non financière » ajoutée au tableau de bord, en complément des indicateurs FE-01 conservés :

- **Répartition administrative fictive** : 3 catégories avec définition explicite (12 + 27 + 142 811 = 142 850, total cohérent avec le KPI fictif existant).
- **Série d'inscriptions fictives sur sept jours** : tableau accessible, barres décoratives `aria-hidden`.
- **Flux de supervision fictif** : 3 événements non financiers, objets sous `example.test`.
- **Scénarios de démonstration** : `Nominal`, `Chargement`, `Vide`, `Erreur simulée`, sélectionnables au clavier avec `aria-pressed`.
- **États** : chargement (`aria-busy` + squelettes), normal, vide (`StatePanel`), erreur simulée avec bouton « Réessayer (simulation) » et reprise après 600 ms avec annonce `role="status"` et retour du focus sur le statut.
- **Accessibilité** : titres hiérarchiques, libellés explicites, focus visible, contrastes via les tokens `--fm-*`, responsive mobile/tablette/desktop (reflow 320 px prévu).

Toutes les valeurs sont étiquetées « Données fictives — Démonstration » et ne sont jamais présentées comme des statistiques réelles. Aucun état ne simule une autorisation ou une sécurité réelle.

## 4. Données fictives

Nouveaux exports figés dans `admin/src/mocks/dashboard.js` : `dashboardScenarios`, `administrativeBreakdown`, `registrationSeries`, `supervisionEvents`, `dashboardStateMessages`.

Règles vérifiées : `Object.freeze`, aucun mot financier (dépenses, revenus, budgets, soldes, transactions, montants, €, FCFA, XOF…), emails uniquement `@example.test`, définitions explicites des catégories administratives.

## 5. Résultats des validations (exécutées le 22/11/2026, Node v22.23.2)

| Commande | Résultat exact | Statut |
|---|---|---|
| `npm run build` | exit 0 ; pré-rendu `dist/index.html` 35 309 caractères + `app-shell.html` | **PASS** |
| `npm run build:admin` | exit 0 ; `✓ built in 2.53s` | **PASS** |
| `npm run test:admin` | 8 fichiers, **201 tests PASS / 0 FAIL**, exit 0 (après un 1ᵉʳ passage en échec sur des timeouts de workers Vitest) | **PASS** |
| `npm run test:admin:isolation` | **2/2 PASS** (comparaison + témoin positif), exit 0 | **PASS** |
| `npm run test:admin:e2e` | Chromium installé : 1ᵉʳ passage 113 PASS / 4 FAIL (timeouts du hook `beforeEach` à 360 px) ; 2ᵉ passage **116 PASS / 1 FAIL**, le seul échec étant un test **FE-04** hors périmètre (`scénarios modifiables au clavier…`, état de chargement non observé sous 5 s). Aucun test de `dashboard.e2e.js` en échec au 2ᵉ passage. | **PARTIEL** |

Le fichier `admin/tests/e2e/dashboard.e2e.js` est découvert par Playwright (`testMatch: '*.e2e.js'`) ; ses 7 tests passent au second passage. Aucun appel réseau externe, cookie ou stockage durable détecté par les garde-fous E2E.

**Résultats axe-core après le lot de corrections** : 78 analyses prévues ; **aucune violation signalée** dans les deux passages (H-01, H-02 et H-03 corrigées). Quatre analyses du 1ᵉʳ passage n'ont pas été atteintes à cause des timeouts de hook ; le second passage ne comporte aucune violation.

Note : les timeouts de workers Vitest et les timeouts de hook Playwright à 360 px sont des phénomènes d'environnement observés aussi sur la BASE. Aucun code FE-02/FE-04 n'a été modifié.

## 5bis. Corrections du lot 1 (diagnostic comparatif)

- **Isolation** : réécriture de la phrase du handover qui contenait un terme d'utilitaire CSS capté par Tailwind ; la règle CSS active du composant de série restait inchangée. Isolation 2/2 verte.
- **Scénario d'erreur** : libellé du mock harmonisé en « Erreur simulée » (le sélecteur E2E était déjà aligné) ; le message d'erreur affiché conserve le style ASCII historique du fichier, ce que l'assertion unitaire existante vérifie.
- **H-01** : le texte d'aide du scénario actif utilise désormais le token primaire (5,8:1 au lieu de 4,1:1) ; l'état inactif reste inchangé (4,8:1).
- **H-02** : la liste de définitions ne contient plus que `<dt>`/`<dd>` ; la description et le badge sont des frères validés, avec le même rendu visuel.
- **H-03** : sans modifier `StatusBadge.vue` ni les tokens globaux, le panneau FE-03 applique localement un fond opaque à la pastille d'avertissement ; le ton `warning` et son sens sont conservés, contraste 5,0:1.

## 6. Limites et réserves

- E2E/axe exécutés avec Chromium : le seul échec restant est un test FE-04 timing-dépendant, hors périmètre FE-03.
- Aucun appel API réel, aucun secret, aucun stockage durable : vérifié par les tests statiques FE-01/FE-02 et les espions `Storage`/`console` du test FE-03.
- Non-régression client : garde-fou d'isolation 2/2 et build client exit 0. Un premier passage d'isolation avait détecté une règle de fusion des bordures, interprétée comme utilitaire Tailwind ; elle a été remplacée par un simple espacement des bordures, puis l'isolation est verte.
- La simulation reste strictement frontend ; l'autorité de sécurité réelle demeure côté backend (BE-02).

## 7. Reproduction

```
# Node >= 22.22.2 (jsdom 31) ; ici v22.23.2
npm ci
npm run build
npm run build:admin
npm run test:admin          # inclut test:admin:isolation
npm run test:admin:e2e      # requiert Chromium (installé ici via npx playwright install chromium)
npm run dev:admin           # http://localhost:5174
```

Dans l'Admin, ouvrir le tableau de bord (`/`) puis la section « Supervision non financière » et utiliser les boutons de scénario pour observer chargement, vide, erreur et reprise.
