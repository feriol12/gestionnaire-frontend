# FE-04 — Consultation des utilisateurs avec fixtures locales

## Périmètre et références

- Responsable humain : feriol12. Développement local : Codex.
- Mission : https://trello.com/c/2fh8lvVp ; contrat BE-06 : https://trello.com/c/RY1BlUQy.
- Gouvernance GOV-00 à GOV-05 consultée avant développement. La revue indépendante sera attribuée séparément par le propriétaire.
- Base actuelle : `integration/security-auth-v3`, commit `8236683f9439bb9a339faa564fedc608d88ec39b` (PR FE-02 #25 fusionnée).
- Branche de synchronisation locale : `feature/fm-admin-fe-04-users-mocks-fe02-sync`.
- Références historiques conservées : base initiale `3a4097b4dfde5102da6026c161f69d1b589e98e2`, commit FE-04 initial `edd1f7db272d42c0a3033f7179bdf8b320a5b274` sur `feature/fm-admin-fe-04-users-mocks` (branche et worktree initiaux préservés).
- Autorisation : code, tests et commit local uniquement. Aucune publication autorisée.

## Synchronisation locale FE-02 + FE-04

Le 22 novembre 2026, le commit FE-04 initial a été réappliqué sans commit automatique sur la nouvelle base dans un worktree isolé. Le routeur et le test de vues ont été combinés automatiquement, sans conflit Git. Les cinq routes FE-02 conservent leurs imports, composants, métadonnées et comportements ; la section de tests d'authentification de `tests/unit/views.spec.js` est préservée. Les fichiers dédiés à FE-02, dont ses suites unitaires et navigateur, restent identiques à la nouvelle base.

Un test navigateur historique FE-01 attendait encore le lien de retour de l'ancien placeholder de connexion, absent des écrans FE-02. Ce test est adapté au parcours réel `/etats` → `/connexion` → retour navigateur, avec vérification du focus sur le titre et du retour dans le shell. Aucun test d'authentification propre à FE-02 n'est modifié.

Le diff du routeur relatif à cette base reste limité à la liste et à la fiche utilisateurs. Le diff du test de vues retire uniquement `/utilisateurs` des placeholders. Les builds et suites de validation sont rejoués sur le code combiné ; les preuves finales figurent dans le rapport local de synchronisation. Aucun worktree FE-02 n'est utilisé ou modifié.

## Parcours livrés

`/utilisateurs` conserve le nom de route `users` et remplace son emplacement réservé. La route numérique `/utilisateurs/:id` porte le nom `user-detail`. Les routes d'authentification et MFA FE-02 restent inchangées.

La liste propose recherche nom/email, compteur de résultats, pagination, choix du nombre de résultats et consultation d'une fiche. Le tableau devient une liste de cartes sur mobile. Les critères sont conservés dans l'URL et lors du retour de fiche ; une navigation reporte le focus sur le titre grâce au routeur existant.

La fiche expose uniquement identifiant, nom, email et création en UTC. Les valeurs manquantes sont signalées. Le statut administratif n'est rendu que lorsqu'une chaîne non vide est effectivement fournie ; aucune fixture ne contient ce champ. Aucun état actif ou suspendu n'est déduit. Aucun champ financier ou bouton de mutation n'est ajouté.

## Données et contrat

`src/mocks/users.js` contient 32 comptes inventés, identifiants 1001 à 1032, emails sous `example.test`. Le compte 1032 illustre des nom, email et date absents. Les fixtures sont immuables et ne contiennent que `id`, `nom`, `email`, `created_at`.

La couche locale accepte `q` (100 caractères Unicode au maximum), `page` (entier positif) et `per_page` (1 à 50, défaut 15). Elle renvoie `data` et les éléments de pagination `meta` utilisés par la vue. Les paramètres invalides produisent un état dédié ; une page hors plage est récupérable. La recherche locale est littérale, insensible à la casse et aux accents, avec tri fixe par identifiant.

Le champ `q` suit l'instruction récente FE-04 et le contrôleur BE-06 examiné. La mention `search` de la description historique BE-06 ne constitue pas le contrat retenu. Les futurs endpoints de consultation ne sont pas connectés. La collation, la pagination complète et les erreurs du service réel devront être qualifiées lors d'une mission d'intégration distincte.

## États de démonstration

L'encart « Répertoire fictif · Lecture seule » identifie explicitement les exemples. Son sélecteur permet les états normal, chargement, vide/introuvable, erreur et refus d'accès. Les paramètres locaux `demo=loading`, `demo=empty`, `demo=error`, `demo=forbidden` reproduisent ces états. Ils ne simulent aucune autorisation réelle.

Le chargement normal dure 180 ms. Une navigation ou le démontage de la vue annule la lecture précédente. « Réessayer la simulation » rejoue le scénario sélectionné ; sélectionner les données de démonstration permet de retrouver le cas normal.

## Reproduction des validations

Environnement exécuté : Windows, Node 24.19.0, npm 11.17.0, Chromium Playwright. Aucun paquet ni fichier de configuration partagé n'a été modifié.

```sh
npm ci --no-audit --no-fund
npx playwright install chromium
npm run build
npm run build:admin
npm run test:admin
npm run test:admin:e2e
```

Les tests unitaires ajoutés couvrent le contrat local, la recherche, la pagination, les fiches, les champs optionnels, les erreurs et transitions. Les tests navigateur ajoutés vérifient les parcours clavier et le focus, les vues à 390/768/1440 px, le reflow à 320 px et le texte à 200 %, ainsi que les audits axe WCAG A/AA. Ils interceptent les requêtes et échouent sur un appel API ou une destination externe, une erreur navigateur, un cookie ou une persistance locale.

Les captures sont générées sous `tests/e2e/__screenshots__/captures/fe04-*.png` (ignorées par Git). Avec `--reporter=list,json` et `PLAYWRIGHT_JSON_OUTPUT_NAME` pointant hors du dépôt, le rapport JSON conserve les résultats axe en pièces jointes `axe-fe04`. Les journaux et empreintes des builds sont conservés hors du dépôt dans le dossier de preuves local livré au propriétaire.

## Isolation et limites

Les styles FE-04 utilisent des classes préfixées et les tokens FE-01. Le test d'isolation existant compare le build client avec et sans Admin, avec témoin positif : il détecte une fuite Tailwind mais ne constitue pas une séparation structurelle des sources analysées. Une seconde comparaison confronte le build client complet à celui de la base Git.

Les résultats d'exécution et leurs limites figurent dans le rapport local final. Aucun résultat n'est déduit de la seule présence d'un test. Les audits axe automatiques et parcours clavier ne remplacent pas une revue humaine avec lecteur d'écran. Seul Chromium Windows a été exécuté pour cette mission ; Firefox, WebKit, Safari et appareils physiques ne sont pas qualifiés.

Les réserves de dépendances héritées du socle FE-01 restent hors périmètre : aucune mise à jour et aucun nouvel audit npm ne sont revendiqués par FE-04. La connexion backend, le contrôle d'accès réel et la gestion des sessions restent des travaux distincts. Cette livraison est un prototype local de consultation destiné à la revue indépendante, pas une autorisation de production.
