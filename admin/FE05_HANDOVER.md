# FE-05 — Suspension et réactivation simulées

## Cadre et provenance

Responsable : feriol12. Agent de cette livraison et de la reprise : Codex (aucune intervention Claude Code revendiquée). Date : 22 novembre 2026, Africa/Lagos. GO local de [FE-05](https://trello.com/c/s1V2aBbq), confirmé par les deux instructions du propriétaire. Aucun push, PR, merge ou déploiement.

Worktree : `C:/PROJETS/GestionDepense/gestionnaire-frontend/.worktrees/FE-05`.
Branche : `feature/fm-admin-fe-05-suspension-mocks`.
Base et HEAD initial : `6c580907b9a5d5577970ddb6f06f2e3860ce617a`, branche distante `integration/security-auth-v3`, confirmée par fetch puis lecture distante.
Le SHA final est celui du commit contenant ce rapport ; le reçu local `admin/tests/e2e/__screenshots__/fe05-evidence/commit-receipt.json` et le message de livraison en donnent la valeur exacte après création du commit.

GOV-00 à GOV-05, la carte FE-05 et leurs commentaires ont été lus. [BE-03](https://trello.com/c/QzJYa8FO) et Q1–Q8 ont été lus, ainsi que le contrat local `OWNER-REVIEWS/FluxMoneva_BE03_Contrat_Architecture_V1.md`, SHA-256 `ecc67e6f8ee0cdefae0f4d4cb1e84fda9e352ca794870edd2e0545f62ff4ccb5`. Les décisions A1–A4 ratifiées dans [GOV-05](https://trello.com/c/QSaI6yyt) et le GO FE-05 remplacent les restrictions historiques de démarrage pour cette seule phase mocks. Motif et email exact sont requis pour les deux opérations. La MFA récente (≤300 s) reste une exigence serveur future, jamais un garde frontend.

## Reprise sans perte

À réception du document de reprise : un fichier suivi modifié et sept fichiers nouveaux, aucun commit FE-05 et aucun conflit Git. Les huit fichiers étaient :

1. `admin/src/router/index.js`
2. `admin/src/mocks/status-transitions.js`
3. `admin/src/components/status/StatusTarget.vue`
4. `admin/src/styles/status-transitions.css`
5. `admin/src/views/status/StatusDemoView.vue`
6. `admin/src/views/status/StatusTransitionView.vue`
7. `admin/tests/unit/status-transitions.spec.js`
8. `admin/tests/e2e/status-transitions.e2e.js`

L’inventaire réel fait foi ; le compteur provisoire de lignes dans l’interface n’était pas un diff Git complet (sept fichiers non suivis). Aucun reset, clean, restore, stash, rebase ni remplacement du travail récupéré. Après reprise : ajout du banc de comparaison `admin/tests/isolation/fe05-base-comparison.mjs`, du présent rapport, précision du libellé MFA « au plus 5 minutes » conforme à Q7, formatage des tests, finalisation des validations et du commit local. Diff final : 10 fichiers dans admin/**, dont un fichier préexistant (routeur) et neuf nouveaux.

## Architecture et parcours

Le socle FE-01 fournit AdminButton, BaseCard, InlineAlert, SelectField, TextField et StatusBadge. FE-04 fournit les identités fictives, le formatage des dates, les paramètres de retour de liste, UsersState et ses styles. Aucun de ces fichiers n’est modifié.

Seul fichier partagé modifié : routeur Admin, trois routes additives, 19 lignes ajoutées et aucune supprimée. Toutes les anciennes routes, métadonnées et vues restent intactes :

- `/simulations/statuts` : entrée dédiée FE-05, quatre cibles fictives.
- `/utilisateurs/:id/suspension-simulee` : simulation de suspension.
- `/utilisateurs/:id/reactivation-simulee` : simulation de réactivation.

Entrée volontairement séparée : aucun bouton de mutation ajouté aux fiches FE-04 en lecture seule, aucun changement du menu partagé ni du Dashboard. Ouvrir directement `http://localhost:5174/simulations/statuts` après `npm run dev:admin`. Les écrans FE-05 permettent de choisir une cible et de revenir à la liste ; `q`, `page`, `per_page` sont conservés si fournis dans la route.

Les fixtures FE-05 sont des copies figées et indépendantes : 1001 actif, 1002 suspendu, 1031 statut absent, 1032 nom/email/date/statut absents. Le répertoire FE-04 reste inchangé, sans statut ajouté. Affichage limité à id, nom, email, created_at et statut fictif ; aucun motif historique ni donnée financière.

Le parcours exige un motif non blanc et un email strictement identique (casse et espaces compris), puis une confirmation explicite distincte. Le verrou de soumission est synchrone. Les saisies sont effacées au lancement, à l’annulation, au changement de scénario/cible et à la sortie. Les timers sont invalidés à la navigation et au démontage. Aucun résultat tardif ne modifie la nouvelle cible.

États disponibles : chargement initial, attente prolongée annulable, succès, 401/403/404/409/419/422/429/500/503 et MFA récente requise. Une transition déjà dans le statut demandé retourne aussi 409 en scénario normal. Champs indispensables absents : formulaire indisponible ; aucun statut déduit. Une reprise demande une nouvelle saisie et une nouvelle confirmation. Le scénario sélectionné reste inchangé après reprise ; sélectionner « Succès simulé » permet de sortir d’un scénario d’erreur. Aucun nouvel essai automatique.

## Vérifications et preuves

Environnement : Windows, Node 24.19.0, npm 11.17.0 ; dépendances strictement issues du lock existant, aucun changement package/config/dépendance.

Les journaux, JSON axe et captures fictives restent locaux sous `admin/tests/e2e/__screenshots__/fe05-evidence/` et `admin/tests/e2e/__screenshots__/test-results/` (ignorés par Git).

| Contrôle | Résultat |
|---|---|
| Tests unitaires | 225/225, 8 fichiers ; dont 31 tests FE-05 |
| Build Admin | PASS |
| Build client complet et pré-rendu | PASS |
| Isolation existante | 2/2 : avec/sans Admin identiques, témoin positif détecté |
| Comparaison client/base | 29 fichiers strictement identiques par nom et SHA-256, pré-rendu inclus |
| Chromium complet | 139/139, dont 29 FE-05 ; aucun échec, skip ni flaky |
| Vérification finale du libellé MFA | 2/2 scénarios Chromium ciblés et build Admin rejoués après correction |
| Axe FE-05 | 45 audits dans la campagne complète + 2 ciblés MFA, zéro violation |
| Clavier et focus | PASS : tabulation, Entrée, focus visible, erreurs, confirmation, résultats et annulation |
| Responsive FE-05 | PASS : 390/768/1440 px, reflow 320 px et texte 200 % |
| Frontière des fichiers | Modifications limitées à admin/** ; routeur additif |
| Réseau/persistance/finance | PASS : aucun appel API/externe/fetch/XHR ou mutation HTTP ; cookies, localStorage, sessionStorage, IndexedDB et Cache Storage vides ; allowlist de fixtures et contrôle de contenu |

Reproduction :

```sh
npm ci --no-audit --no-fund
npm run build:admin
npm run build
npm run test:admin
npm run test:admin:e2e -- --reporter=list,json
node admin/tests/isolation/fe05-base-comparison.mjs
```

Pour conserver le JSON navigateur, définir `PLAYWRIGHT_JSON_OUTPUT_NAME` avec un chemin absolu vers le dossier de preuves (Playwright résout un chemin relatif depuis son dossier de configuration). Les JSON de cette campagne ont été recopiés dans le dossier de preuves indiqué. `validation-summary.json` récapitule 139 tests et 45 audits FE-05. `playwright-mfa-final.json` contient les deux vérifications du libellé final. Les captures de formulaire et confirmation aux trois largeurs, succès, attente, MFA et champs absents sont conservées ; les rendus mobile et tablette ont aussi été inspectés visuellement. Aucun téléchargement de nouvelle dépendance ou navigateur n’a été ajouté à cette livraison. Le banc comparatif crée une copie Git temporaire de la base, utilise les dépendances installées et conserve cette copie pour inspection ; son chemin est dans `client-comparison.json`.

Incidents de validation : première passe, quatre défauts dans les nouveaux tests (sélecteur visant aussi le formulaire du shell et assertion trop tôt avant chargement de route) corrigés sans changement des assertions métier. Les 194 tests préexistants passaient. Première commande test:admin : unités PASS, isolation empêchée par EPERM sur jonction Windows dans le sandbox ; relance autorisée hors sandbox : 2/2 PASS. Première tentative Chromium interrompue pendant le démarrage du serveur local dans le sandbox, sans résultats navigateur ; relance hors sandbox conservée séparément. Ces incidents ne sont pas assimilés à des tests réussis.

## Préservation, coordination et réserves

Aucun fichier client, package, lock, configuration commune, environnement, backend, production, email ou session réelle modifié. Le fichier préexistant `public/.htaccess` du dépôt principal conserve son empreinte initiale SHA-256 `ad1d4afa470dd227b516160fa0eb07b7476da820bafcd6877bec736ea0353827`.

Aucun worktree FE-03 ou BE-03 utilisé ou modifié. La liste locale des worktrees ne contient pas FE-03 ; aucune branche distante correspondant à `feature/fm-admin-fe-03*` n’était publiée lors de la vérification. Cela ne prouve pas l’absence de travail local chez Dimas. Le routeur est le seul point partagé à coordonner avant intégration ; aucun conflit présent sur la base vérifiée, aucun Dashboard FE-03 importé.

Les avertissements npm de compatibilité peer de vite-plugin-inspect/vite-dev-rpc/vite-hot-client avec Vite 8 proviennent des dépendances existantes ; aucune mise à jour ni nouvel audit de dépendances revendiqué. Les avertissements NO_COLOR/FORCE_COLOR concernent le lanceur de tests.

Les audits automatiques ne remplacent pas une revue humaine avec lecteur d’écran. Seul Chromium Windows est qualifié ici ; Firefox/WebKit et appareils physiques restent non testés. BE-03 live, autorisations, CSRF, MFA, révocations, audit durable et emails ne sont ni appliqués ni qualifiés par ces mocks.

Revue humaine distincte encore à désigner par le propriétaire. Aucun changement Trello, aucune publication et aucune validation propriétaire finale revendiqués.

## Verdict

**FE05_READY_FOR_INDEPENDENT_REVIEW**, exclusivement pour la phase mocks : fonctionnalités et validations locales satisfaisantes, aucun défaut applicatif bloquant observé. Ce verdict ne vaut ni revue humaine indépendante ni acceptation de l’intégration backend. STOP après rapport et commit local ; toute publication nécessite un nouveau GO.
