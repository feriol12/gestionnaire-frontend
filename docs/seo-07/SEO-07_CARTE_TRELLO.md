# SEO-07 — Landing page publique FluxMoneva (design validé)

**Projet :** FluxMoneva — frontend Vue 3/Vite (Tailwind CSS v4, Pinia, Vue Router)
**Statut :** DESIGN_APPROVED / READY_FOR_IMPLEMENTATION
**Références visuelles :** `SEO-07_Desktop_Valide.png` et `SEO-07_Mobile_Valide.png` dans ce dossier.
**Repo :** `feriol12/gestionnaire-frontend`
**Base de référence :** `integration/security-auth-v3` (vérifier le SHA réel et l'état du worktree avant intervention)
**Branche de travail proposée :** `feature/seo-07-public-landing`

## Objectif
Remplacer la redirection de la racine `/` par une landing page publique présentant les fonctions réelles de FluxMoneva, dans les deux déclinaisons validées, sans modifier l'application métier privée.

## Périmètre positif
- Accueil public `/`, fidèle aux deux captures Stitch validées, responsive, en français.
- Sections : header/nav, hero, aperçu fictif du dashboard en FCFA, fonctionnalités dépenses/budgets/statistiques, « Comment ça marche ? », avantages sobres, confidentialité factuelle, CTA final, footer.
- Navigation et CTA : `/register`, `/login`, ancres de page ; bouton mobile menu correctement utilisable et accessible.
- Les liens et CTA doivent fonctionner ; aucun lien vers des pages inexistantes.
- La SPA existante reste opérationnelle : `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `dashboard`, `expenses`, `budgets`, `account/security`.
- Les routes métier restent protégées. Après connexion réussie, rediriger vers `/dashboard`, et non `/`.
- Un visiteur non connecté peut consulter `/`, même en cas d'indisponibilité de l'API : le guard ne doit pas bloquer le chargement public sur un appel à `/api/user`.
- Améliorer le SEO de la page `/` : titre, description, canonical, OG, robots et sitemap cohérents ; documenter la solution permettant à Google de voir du texte public dans le HTML initial (pré-rendu ciblé si techniquement adapté, sans refonte SSR globale ni régression SPA).
- Les routes privées et à jeton doivent être `noindex`, même en cas de navigation directe ; ne jamais exposer de donnée de compte ou données métiers dans le HTML statique.
- Préserver le fichier de validation Google `google60343ae65c508803.html` sur LWS lors du déploiement, sans le supprimer, déplacer ou réécrire.
- Assurer que le `.htaccess` SPA est inclus durablement dans le build Vite (il avait été créé manuellement dans `dist/` lors du premier déploiement ; `dist/` est ignoré par Git).

## Contraintes marketing et design
- Orthographe et marque **FluxMoneva** partout, jamais « MONEVA » seul.
- Reprendre le logo authentique déjà existant dans le dépôt, pas une nouvelle icône dessinée.
- Palette, typographies, proportions et hiérarchies de la V4 Stitch conservées.
- Les chiffres du faux dashboard sont illustratifs ; aucune vraie donnée utilisateur.
- Pas de faux témoignages, de faux prix, d'affirmations juridiques ou de garanties de sécurité absolues.
- Éviter la promesse de « temps réel », d'alertes de budgets non implémentées, de compte activé instantanément.
- L'inscription exige confirmation email, ce que la page doit refléter.
- Harmoniser les contenus Desktop et Mobile sans chercher à rendre leurs structures identiques pixel par pixel.
- Pas de nouvelles fonctionnalités métiers, aucun appel sensible ou authentifié depuis la landing page.

## Hors périmètre
- Modification Laravel / Sanctum / MySQL / infrastructure SMTP / Cron.
- Déploiement LWS, DNS, Search Console ou suppression Netlify.
- Refactoring global du routeur, du style des pages Auth, Dashboard ou budgets.
- Animation lourde et dépendances introduites sans justification.

## Points de code à inspecter avant intervention
- `src/router/index.js` : `/` est aujourd'hui une route parent `requiresAuth` redirigeant vers dashboard ; guard + logique `afterEach` de metadata.
- `src/views/HomeView.vue` : ancienne page de démonstration « MonApp », à remplacer/adapter.
- `src/views/auth/LoginVue.vue` : redirection actuelle réussie vers `/` à corriger vers `/dashboard`.
- `src/App.vue`, `src/stores/useAuthStore.js`, `src/composables/useInactivityTimer` : vérifier impacts du nouveau public root.
- `index.html`, `public/robots.txt`, `vite.config.js` et `public/.htaccess` (si ajouté).
- Dépendances réelles : Vue 3, Vite 8, Tailwind CSS 4, Vue Router 5, Pinia 3.

## Critères d'acceptation / contrôle ciblé
1. `npm run build` réussit (et les éventuels tests disponibles sont exécutés si pertinents).
2. `/` affiche la landing sur desktop et mobile, en mode connecté ou invité, sans blocage API.
3. `/login` et `/register` fonctionnent et sont visuellement inchangés.
4. Login d'un compte vérifié => `/dashboard`, et pages privées protégées pour les invités.
5. Les routes de vérification/réinitialisation par email fonctionnent comme avant ; aucune signature ou URL de jeton visible en sitemap.
6. Le contenu textuel SEO est exploitable par Google ; vérifier dans le HTML livré, et pas seulement les métadonnées ; expliquer tout compromis lié à la SPA.
7. `robots.txt`, canonical et `sitemap.xml` ne contredisent pas les protections `noindex`.
8. `dist/.htaccess` existe après un build propre grâce aux sources versionnées ; refresh direct `/login` et `/dashboard` ne donne pas 404.
9. Fichier de validation Google préservé sur le serveur ; pas de suppression préalable du webroot à la livraison.
10. Aucune donnée réelle, aucun secret, pas d'appel /api inutile sur accueil public.

## Méthode de livraison
- Implementer : analyse du baseline / diff minimal / composants / build / capture de test, **sans merge ni déploiement**.
- Reviewer indépendant : conformité V4 + guard + SEO + sécurité + régression + diff.
- Tester indépendant : navigations invitée/connectée, responsive, build, deep links, absence fuite de données.
- PO : validation manuelle avant merge, puis déploiement LWS séparé, smoke léger et inspection Google Search Console.

## Format du rapport Implementer
`BRANCH`, `BASE_SHA`, `HEAD_SHA`, `FILES_CHANGED`, `DESIGN_FIDELITY`, `ROUTING_GUARDS`, `SEO_HTML`, `BUILD`, `TESTS`, `OPEN_RISKS`, `NEXT_SYNC`.
Si test ou outil indisponible, marquer explicitement `NOT_RUN` / `BLOCKED`, jamais PASS par hypothèse.
