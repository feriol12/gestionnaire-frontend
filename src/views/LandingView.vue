<!--
  SEO-07 — page d'accueil publique FluxMoneva (design Stitch V4 validé :
  docs/seo-07/SEO-07_Desktop_Valide.png et SEO-07_Mobile_Valide.png).

  Page statique : aucun appel API, aucune donnée de compte. Les montants de
  l'aperçu sont fictifs et signalés comme tels.
  Pré-rendue au build (scripts/prerender-landing.mjs) pour que son texte soit
  présent dans le HTML initial ; elle n'utilise donc que des utilitaires
  Tailwind globaux (pas de style scoped, pas d'attribut style en ligne).
-->
<template>
  <div class="min-h-screen bg-[#f6f8fe] font-sans text-ink antialiased">
    <a
      href="#contenu"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-medium"
    >Aller au contenu</a>

    <!-- En-tête -->
    <header id="haut" class="relative z-30 border-b border-[#e9eef8] bg-white/85 backdrop-blur">
      <nav aria-label="Navigation principale" class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-[72px] md:px-6">
        <RouterLink to="/" class="flex items-center gap-2.5 rounded-lg" aria-label="FluxMoneva — accueil">
          <MonevaMark class="h-9 w-9" />
          <span class="text-[17px] font-bold tracking-[-0.02em] text-ink">FluxMoneva</span>
        </RouterLink>

        <ul class="hidden items-center gap-8 text-sm font-medium text-[#334155] md:flex">
          <li><a href="#fonctionnalites" class="rounded transition-colors hover:text-primary">Fonctionnalités</a></li>
          <li><a href="#comment-ca-marche" class="rounded transition-colors hover:text-primary">Comment ça marche</a></li>
        </ul>

        <div class="hidden items-center gap-6 md:flex">
          <RouterLink to="/login" class="rounded text-sm font-medium text-[#334155] transition-colors hover:text-primary">Se connecter</RouterLink>
          <RouterLink to="/register" class="rounded-xl bg-primary-hover px-5 py-2.5 text-sm font-semibold text-white shadow-low transition-colors hover:bg-[#1e40af]">Créer un compte</RouterLink>
        </div>

        <div class="flex items-center gap-2 md:hidden">
          <RouterLink to="/login" class="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-low">Connexion</RouterLink>
          <button
            type="button"
            class="grid h-11 w-11 place-items-center rounded-xl text-[#334155] transition-colors hover:bg-[#eef2fd]"
            :aria-expanded="menuOpen ? 'true' : 'false'"
            aria-controls="lp-menu-mobile"
            @click="menuOpen = !menuOpen"
          >
            <span class="sr-only">{{ menuOpen ? 'Fermer le menu' : 'Ouvrir le menu' }}</span>
            <X v-if="menuOpen" class="h-6 w-6" aria-hidden="true" />
            <Menu v-else class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div v-if="menuOpen" id="lp-menu-mobile" class="border-t border-[#e9eef8] bg-white px-4 pb-5 pt-2 shadow-medium md:hidden">
        <ul class="flex flex-col text-base font-medium text-ink">
          <li><a href="#fonctionnalites" class="block rounded-lg px-2 py-3 hover:bg-[#eef2fd]" @click="menuOpen = false">Fonctionnalités</a></li>
          <li><a href="#comment-ca-marche" class="block rounded-lg px-2 py-3 hover:bg-[#eef2fd]" @click="menuOpen = false">Comment ça marche</a></li>
          <li><RouterLink to="/login" class="block rounded-lg px-2 py-3 hover:bg-[#eef2fd]">Se connecter</RouterLink></li>
          <li class="pt-2"><RouterLink to="/register" class="block rounded-xl bg-primary-hover px-4 py-3 text-center font-semibold text-white">Créer un compte</RouterLink></li>
        </ul>
      </div>
    </header>

    <main id="contenu" class="flex flex-col">
      <!-- Hero -->
      <section class="relative order-1 overflow-hidden" aria-labelledby="lp-hero-title">
        <div aria-hidden="true" class="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#dfe7ff] opacity-60 blur-3xl"></div>
        <div aria-hidden="true" class="pointer-events-none absolute -right-32 top-10 hidden h-[420px] w-[420px] rounded-full bg-[#e3ecff] opacity-70 blur-3xl md:block"></div>

        <div class="relative mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-6 md:px-6 md:pb-16 md:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
          <div class="text-center lg:text-left">
            <p class="inline-flex items-center gap-2 rounded-full bg-[#e6edff] px-3.5 py-1.5 text-xs font-semibold text-primary">
              <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Gestion de dépenses personnelles en FCFA
            </p>
            <h1 id="lp-hero-title" class="mt-4 text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-ink md:text-[44px] lg:mt-5 lg:text-[46px]">
              Prenez le contrôle de vos dépenses, <span class="lg:text-primary">simplement</span>.
            </h1>
            <p class="mx-auto mt-4 max-w-[36rem] text-base leading-relaxed text-text-muted lg:mx-0 lg:mt-6 lg:text-lg">
              Suivez vos dépenses, organisez vos budgets et visualisez vos finances au même endroit avec FluxMoneva.
            </p>

            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:mt-8 lg:justify-start">
              <RouterLink to="/register" class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-medium transition-colors hover:bg-primary-hover md:bg-primary-hover md:hover:bg-[#1e40af]">
                Créer mon compte
                <ArrowRight class="h-5 w-5" aria-hidden="true" />
              </RouterLink>
              <a href="#fonctionnalites" class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#eef2fd] px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-[#e3eaff] md:bg-white md:shadow-low md:ring-1 md:ring-[#e6ebf5] md:hover:bg-[#f8faff]">
                Découvrir les fonctionnalités
                <ChevronDown class="h-4 w-4 md:hidden" aria-hidden="true" />
              </a>
            </div>

            <ul class="mt-6 hidden flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted md:flex md:justify-center lg:justify-start">
              <li class="inline-flex items-center gap-1.5"><CircleCheck class="h-4 w-4 text-primary" aria-hidden="true" />Conçu pour le FCFA</li>
              <li class="inline-flex items-center gap-1.5"><CircleCheck class="h-4 w-4 text-primary" aria-hidden="true" />Espace privé et sécurisé</li>
              <li class="inline-flex items-center gap-1.5"><CircleCheck class="h-4 w-4 text-primary" aria-hidden="true" />Prise en main immédiate</li>
            </ul>
          </div>

          <!-- Aperçu illustratif (données fictives) -->
          <aside aria-label="Aperçu illustratif du tableau de bord FluxMoneva (données fictives)" class="mx-auto w-full max-w-[28rem] rounded-3xl bg-white p-5 text-left shadow-high ring-1 ring-[#e9eef8] md:p-6 lg:max-w-none">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <span aria-hidden="true" class="hidden h-10 w-10 place-items-center rounded-xl bg-[#e6edff] text-sm font-bold text-primary md:grid">FM</span>
                <span aria-hidden="true" class="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2fd] text-primary md:hidden"><CalendarDays class="h-5 w-5" /></span>
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted-light md:hidden">Budget actuel</p>
                  <p class="text-base font-bold text-ink md:text-lg">Septembre 2026</p>
                  <p class="hidden text-xs text-text-muted-light md:block">Tableau de bord FluxMoneva</p>
                </div>
              </div>
              <div class="flex flex-wrap justify-end gap-2">
                <span class="inline-flex items-center gap-1 rounded-full bg-positive-bg px-2.5 py-1 text-[11px] font-semibold text-[#047857]"><Info class="h-3.5 w-3.5" aria-hidden="true" />Exemple illustratif</span>
                <span class="hidden items-center gap-1 rounded-full bg-[#eef2fd] px-2.5 py-1 text-[11px] font-semibold text-text-muted md:inline-flex"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-positive"></span>Zone FCFA</span>
              </div>
            </div>

            <!-- Budget : version large -->
            <div class="mt-5 hidden rounded-2xl bg-[#f3f6fe] p-5 md:block">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-text-muted">Budget mensuel</span>
                <span class="rounded-md bg-white px-2 py-0.5 font-semibold uppercase tracking-wide text-text-muted-light">Plafond</span>
              </div>
              <div class="mt-3 flex items-end justify-between">
                <p class="tabular-nums"><span class="text-[32px] font-bold leading-none text-ink">250 000</span> <span class="text-sm font-semibold text-text-muted">FCFA</span></p>
                <p class="text-right text-xs text-text-muted-light">Progression<br /><span class="text-lg font-bold text-primary">38,6 %</span></p>
              </div>
              <div aria-hidden="true" class="mt-4 h-2 rounded-full bg-white"><div class="h-2 w-[38.6%] rounded-full bg-primary-hover"></div></div>
              <div class="mt-2 flex justify-between text-[11px] font-medium tabular-nums">
                <span class="text-text-muted">96 500 FCFA dépensés</span>
                <span class="text-[#047857]">153 500 FCFA restants</span>
              </div>
            </div>

            <!-- Budget : version compacte -->
            <div class="mt-4 md:hidden">
              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-2xl bg-[#f3f6fe] p-3">
                  <p class="text-xs text-text-muted-light">Total alloué</p>
                  <p class="mt-1 tabular-nums"><span class="text-lg font-bold text-ink">250 000</span> <span class="text-xs text-text-muted">FCFA</span></p>
                </div>
                <div class="rounded-2xl bg-[#f3f6fe] p-3">
                  <p class="text-xs text-text-muted-light">Dépensé</p>
                  <p class="mt-1 tabular-nums"><span class="text-lg font-bold text-primary">96 500</span> <span class="text-xs text-text-muted">FCFA</span></p>
                </div>
              </div>
              <div class="mt-3 flex justify-between text-xs font-medium tabular-nums">
                <span class="text-text-muted">Progression (38,6 %)</span>
                <span class="text-[#047857]">153 500 FCFA restants</span>
              </div>
              <div aria-hidden="true" class="mt-2 h-2 rounded-full bg-[#eef2fd]"><div class="h-2 w-[38.6%] rounded-full bg-primary"></div></div>
            </div>

            <div class="mt-5">
              <div class="hidden items-center justify-between text-xs md:flex">
                <span class="font-semibold text-ink">Dépenses récentes</span>
                <span class="font-medium text-primary">3 opérations</span>
              </div>
              <ul class="divide-y divide-[#eef2f7] md:mt-2">
                <li class="flex items-center gap-3 py-2.5">
                  <span aria-hidden="true" class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef2fd] text-primary"><ShoppingBag class="h-4 w-4" /></span>
                  <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium text-ink">Courses Carrefour</span><span class="block text-xs text-text-muted-light"><span class="hidden md:inline">Alimentation • </span>18 sept. 2026</span></span>
                  <span class="whitespace-nowrap text-sm font-semibold tabular-nums text-ink">-12 500 FCFA</span>
                </li>
                <li class="flex items-center gap-3 py-2.5">
                  <span aria-hidden="true" class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef2fd] text-text-muted"><Car class="h-4 w-4" /></span>
                  <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium text-ink">Taxi VTC</span><span class="block text-xs text-text-muted-light"><span class="hidden md:inline">Transport • </span>15 sept. 2026</span></span>
                  <span class="whitespace-nowrap text-sm font-semibold tabular-nums text-ink">-4 500 FCFA</span>
                </li>
                <li class="hidden items-center gap-3 py-2.5 md:flex">
                  <span aria-hidden="true" class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef2fd] text-text-muted"><Wifi class="h-4 w-4" /></span>
                  <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium text-ink">Internet Fibre</span><span class="block text-xs text-text-muted-light">Factures • 12 sept. 2026</span></span>
                  <span class="whitespace-nowrap text-sm font-semibold tabular-nums text-ink">-15 000 FCFA</span>
                </li>
              </ul>
            </div>

            <div class="mt-3 hidden items-center justify-between rounded-xl bg-[#f3f6fe] px-3 py-2 text-[11px] md:flex">
              <span class="inline-flex items-center gap-1.5 text-text-muted"><CircleCheck class="h-3.5 w-3.5 text-positive" aria-hidden="true" />Tableau de bord à jour</span>
              <span class="font-medium text-primary">Données de démonstration</span>
            </div>
          </aside>
        </div>
      </section>

      <!-- Avantages -->
      <section class="order-2 md:order-4" aria-labelledby="lp-avantages-title">
        <h2 id="lp-avantages-title" class="sr-only">Les avantages de FluxMoneva</h2>
        <div class="mx-auto max-w-6xl px-4 pb-10 md:px-6 md:py-20">
          <ul class="grid gap-3 md:grid-cols-3 md:gap-10 md:rounded-3xl md:bg-white md:p-10 md:shadow-medium md:ring-1 md:ring-[#eef2f7]">
            <li class="flex gap-4 rounded-2xl bg-[#eef2fd] p-4 md:block md:bg-transparent md:p-0">
              <span aria-hidden="true" class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dfe7ff] text-primary md:bg-[#e6edff]"><Banknote class="h-5 w-5" /></span>
              <div class="md:mt-4">
                <h3 class="text-base font-bold text-ink md:text-lg">Conçu pour le FCFA</h3>
                <p class="mt-1 text-sm leading-relaxed text-text-muted">Développé spécifiquement pour le franc CFA, sans conversions inutiles ni formats inadaptés.</p>
              </div>
            </li>
            <li class="flex gap-4 rounded-2xl bg-[#eef2fd] p-4 md:block md:bg-transparent md:p-0">
              <span aria-hidden="true" class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dcf3ea] text-[#047857] md:bg-[#e6edff] md:text-primary"><Eye class="h-5 w-5" /></span>
              <div class="md:mt-4">
                <h3 class="text-base font-bold text-ink md:text-lg">Clarté et lisibilité</h3>
                <p class="mt-1 text-sm leading-relaxed text-text-muted">Une interface aérée, conçue pour aller à l'essentiel en quelques secondes lors de chaque consultation.</p>
              </div>
            </li>
            <li class="flex gap-4 rounded-2xl bg-[#eef2fd] p-4 md:block md:bg-transparent md:p-0">
              <span aria-hidden="true" class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dfe7ff] text-primary md:bg-[#e6edff]"><CircleCheck class="h-5 w-5" /></span>
              <div class="md:mt-4">
                <h3 class="text-base font-bold text-ink md:text-lg">Zéro complexité inutile</h3>
                <p class="mt-1 text-sm leading-relaxed text-text-muted">Aucun paramétrage laborieux ni jargon financier superflu : l'essentiel est directement accessible.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Fonctionnalités -->
      <section id="fonctionnalites" class="order-3 scroll-mt-4 md:order-2" aria-labelledby="lp-fonctionnalites-title">
        <div class="mx-auto max-w-6xl px-4 pb-12 md:px-6 md:py-24">
          <div class="md:mx-auto md:max-w-2xl md:text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted-light md:text-primary">Fonctionnalités essentielles</p>
            <h2 id="lp-fonctionnalites-title" class="mt-2 text-2xl font-bold tracking-[-0.02em] text-ink md:text-[36px] md:leading-tight">Tout pour piloter vos finances sans superflu</h2>
            <p class="mt-3 text-sm text-text-muted md:text-base">Une solution intuitive pour garder un œil lucide et régulier sur l'ensemble de votre budget mensuel.</p>
          </div>

          <ul class="mt-6 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
            <li class="flex flex-col rounded-2xl bg-white p-5 shadow-low ring-1 ring-[#eef2f7] md:p-7">
              <div class="flex items-start justify-between">
                <span aria-hidden="true" class="grid h-11 w-11 place-items-center rounded-xl bg-[#e6edff] text-primary"><Banknote class="h-5 w-5" /></span>
                <span aria-hidden="true" class="text-sm font-medium text-text-muted-light md:hidden">01</span>
              </div>
              <h3 class="mt-4 text-lg font-bold text-ink md:mt-5 md:text-xl">Suivi des dépenses</h3>
              <p class="mt-2 text-sm leading-relaxed text-text-muted">Enregistrer, consulter et organiser vos dépenses personnelles rapidement, avec une catégorisation simple et limpide adaptée à votre rythme quotidien.</p>
              <div aria-hidden="true" class="mt-auto hidden pt-6 md:block">
                <div class="flex items-center gap-3 rounded-xl bg-[#f3f6fe] p-3">
                  <span class="grid h-8 w-8 place-items-center rounded-full bg-primary text-white"><Plus class="h-4 w-4" /></span>
                  <span class="flex-1 text-xs"><span class="block font-semibold text-ink">Ajout rapide</span><span class="block text-text-muted-light">Montant &amp; catégorie</span></span>
                  <span class="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-primary">Instantané</span>
                </div>
              </div>
            </li>
            <li class="flex flex-col rounded-2xl bg-white p-5 shadow-low ring-1 ring-[#eef2f7] md:p-7">
              <div class="flex items-start justify-between">
                <span aria-hidden="true" class="grid h-11 w-11 place-items-center rounded-xl bg-[#e6edff] text-primary"><SlidersHorizontal class="h-5 w-5" /></span>
                <span aria-hidden="true" class="text-sm font-medium text-text-muted-light md:hidden">02</span>
              </div>
              <h3 class="mt-4 text-lg font-bold text-ink md:mt-5 md:text-xl">Gestion des budgets</h3>
              <p class="mt-2 text-sm leading-relaxed text-text-muted">Définir des budgets mensuels et suivre leur évolution en comparant vos dépenses aux montants alloués.</p>
              <div aria-hidden="true" class="mt-auto hidden pt-6 md:block">
                <div class="rounded-xl bg-[#f3f6fe] p-3 text-[11px]">
                  <div class="flex justify-between"><span class="text-text-muted">Plafond mensuel</span><span class="font-semibold tabular-nums text-ink">250 000 FCFA</span></div>
                  <div class="mt-2 h-1.5 rounded-full bg-white"><div class="h-1.5 w-[38.6%] rounded-full bg-primary-hover"></div></div>
                  <p class="mt-2 font-semibold tabular-nums text-[#047857]">153 500 FCFA restants</p>
                </div>
              </div>
            </li>
            <li class="flex flex-col rounded-2xl bg-white p-5 shadow-low ring-1 ring-[#eef2f7] md:p-7">
              <div class="flex items-start justify-between">
                <span aria-hidden="true" class="grid h-11 w-11 place-items-center rounded-xl bg-[#c9f2df] text-[#047857]"><TrendingUp class="h-5 w-5" /></span>
                <span aria-hidden="true" class="text-sm font-medium text-text-muted-light md:hidden">03</span>
              </div>
              <h3 class="mt-4 text-lg font-bold text-ink md:mt-5 md:text-xl">Statistiques et rapports</h3>
              <p class="mt-2 text-sm leading-relaxed text-text-muted">Visualiser vos finances grâce aux indicateurs et aux rapports disponibles dans l'application, avec des synthèses mensuelles claires et exportables en PDF.</p>
              <div aria-hidden="true" class="mt-auto hidden pt-6 md:block">
                <div class="flex items-center gap-2 rounded-xl bg-[#f3f6fe] p-3 text-xs">
                  <FileText class="h-4 w-4 text-primary" />
                  <span class="flex-1 truncate text-text-muted">Rapport_Septembre.pdf</span>
                  <span class="rounded-full bg-primary-hover px-2.5 py-1 text-[11px] font-semibold text-white">Export PDF</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Comment ça marche -->
      <section id="comment-ca-marche" class="order-4 scroll-mt-4 md:order-3 md:bg-[#eef3fd]" aria-labelledby="lp-etapes-title">
        <div class="mx-auto max-w-6xl px-4 pb-12 md:px-6 md:py-24">
          <div class="text-center md:mx-auto md:max-w-2xl">
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted-light md:text-primary">Simplicité</p>
            <h2 id="lp-etapes-title" class="mt-2 text-2xl font-bold tracking-[-0.02em] text-ink md:text-[36px] md:leading-tight">Comment ça marche ?</h2>
            <p class="mt-3 hidden text-base text-text-muted md:block">Prenez en main vos finances en 3 étapes claires et sans formalités compliquées.</p>
          </div>

          <ol class="mt-6 rounded-2xl bg-white p-5 shadow-low ring-1 ring-[#eef2f7] md:mt-12 md:grid md:grid-cols-3 md:gap-6 md:bg-transparent md:p-0 md:shadow-none md:ring-0">
            <li class="relative flex gap-4 pb-8 md:flex-col md:gap-0 md:rounded-2xl md:bg-white md:p-7 md:shadow-low md:ring-1 md:ring-[#eef2f7]">
              <span aria-hidden="true" class="absolute left-[15px] top-10 h-[calc(100%-2.75rem)] w-px bg-[#dbe4f8] md:hidden"></span>
              <div class="flex items-center justify-between self-start md:w-full md:self-auto">
                <span aria-hidden="true" class="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white md:h-10 md:w-10 md:bg-[#e6edff] md:text-primary">1</span>
                <span class="hidden text-xs font-medium text-text-muted-light md:inline">Étape 1</span>
              </div>
              <div class="md:mt-5 md:flex md:flex-1 md:flex-col">
                <h3 class="text-base font-bold text-ink md:text-lg">Créez votre compte</h3>
                <p class="mt-1 text-sm leading-relaxed text-text-muted md:mt-2">Créez votre compte et confirmez votre adresse email pour accéder à votre espace personnel.</p>
                <p aria-hidden="true" class="mt-auto hidden pt-6 md:block"><span class="flex items-center justify-center gap-2 rounded-xl bg-[#f3f6fe] px-3 py-2.5 text-sm text-text-muted"><Mail class="h-4 w-4 text-primary" />Confirmation par email</span></p>
              </div>
            </li>
            <li class="relative flex gap-4 pb-8 md:flex-col md:gap-0 md:rounded-2xl md:bg-white md:p-7 md:pb-7 md:shadow-low md:ring-1 md:ring-[#eef2f7]">
              <span aria-hidden="true" class="absolute left-[15px] top-10 h-[calc(100%-2.75rem)] w-px bg-[#dbe4f8] md:hidden"></span>
              <div class="flex items-center justify-between self-start md:w-full md:self-auto">
                <span aria-hidden="true" class="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white md:h-10 md:w-10 md:bg-[#e6edff] md:text-primary">2</span>
                <span class="hidden text-xs font-medium text-text-muted-light md:inline">Étape 2</span>
              </div>
              <div class="md:mt-5 md:flex md:flex-1 md:flex-col">
                <h3 class="text-base font-bold text-ink md:text-lg">Enregistrez vos dépenses et définissez vos budgets</h3>
                <p class="mt-1 text-sm leading-relaxed text-text-muted md:mt-2">Saisissez vos montants en FCFA au fur et à mesure et allouez votre enveloppe mensuelle en toute clarté.</p>
                <p aria-hidden="true" class="mt-auto hidden pt-6 md:block"><span class="flex items-center justify-between rounded-xl bg-[#f3f6fe] px-3 py-2.5 text-sm"><span class="text-text-muted">Course du jour</span><span class="font-semibold tabular-nums text-[#dc2626]">-4 500 FCFA</span></span></p>
              </div>
            </li>
            <li class="relative flex gap-4 md:flex-col md:gap-0 md:rounded-2xl md:bg-white md:p-7 md:shadow-low md:ring-1 md:ring-[#eef2f7]">
              <div class="flex items-center justify-between self-start md:w-full md:self-auto">
                <span aria-hidden="true" class="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white md:h-10 md:w-10 md:bg-[#a7f3d0] md:text-[#065f46]">3</span>
                <span class="hidden text-xs font-medium text-text-muted-light md:inline">Étape 3</span>
              </div>
              <div class="md:mt-5 md:flex md:flex-1 md:flex-col">
                <h3 class="text-base font-bold text-ink md:text-lg">Suivez vos budgets et montants restants</h3>
                <p class="mt-1 text-sm leading-relaxed text-text-muted md:mt-2">Consultez l'état de votre budget et le montant restant disponible directement depuis votre tableau de bord.</p>
                <p aria-hidden="true" class="mt-auto hidden pt-6 md:block"><span class="block rounded-xl bg-[#dcf3ea] px-3 py-2.5 text-center text-sm font-semibold text-[#047857]">Montant restant disponible</span></p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- Confidentialité -->
      <section class="order-5 md:bg-[#eef3fd]" aria-labelledby="lp-confidentialite-title">
        <div class="mx-auto max-w-6xl px-4 pb-10 md:px-6 md:pb-20">
          <div class="flex items-start gap-4 rounded-2xl bg-[#eef2fd] p-5 md:items-center md:gap-6 md:rounded-3xl md:bg-white md:p-8 md:shadow-low md:ring-1 md:ring-[#eef2f7]">
            <span aria-hidden="true" class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-primary md:bg-[#e6edff]"><Shield class="h-6 w-6" /></span>
            <div class="flex-1">
              <p class="hidden text-xs font-semibold uppercase tracking-[0.12em] text-primary md:block">Confidentialité &amp; sécurité</p>
              <h2 id="lp-confidentialite-title" class="text-lg font-bold text-ink md:mt-1 md:text-2xl">Vos finances personnelles, votre espace privé.</h2>
              <p class="mt-2 text-sm leading-relaxed text-text-muted">Vos informations financières restent associées à votre compte utilisateur et ne sont accessibles que depuis votre espace personnel authentifié. Vous gardez à tout moment la main sur vos enregistrements.</p>
            </div>
            <span class="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#eef2fd] px-3 py-1.5 text-xs font-semibold text-text-muted md:inline-flex"><Lock class="h-3.5 w-3.5 text-primary" aria-hidden="true" />Espace authentifié</span>
          </div>
        </div>
      </section>

      <!-- Appel à l'action -->
      <section class="order-6" aria-labelledby="lp-cta-title">
        <div class="mx-auto max-w-6xl px-4 pb-12 md:px-6 md:py-24">
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-hover via-primary to-[#1e40af] px-6 py-10 text-center shadow-high md:px-10 md:py-20">
            <div aria-hidden="true" class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
            <span aria-hidden="true" class="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white md:hidden"><TrendingUp class="h-6 w-6" /></span>
            <h2 id="lp-cta-title" class="relative mx-auto max-w-[36rem] text-[28px] font-bold leading-tight tracking-[-0.02em] text-white md:text-[40px]">Une meilleure vision de vos finances commence ici.</h2>
            <p class="relative mx-auto mt-3 max-w-[28rem] text-sm text-[#dbe6ff] md:mt-4 md:text-base">Commencez à suivre vos dépenses et à organiser vos budgets avec FluxMoneva.</p>
            <div class="relative mt-7 flex flex-col items-center gap-4 md:mt-9 md:flex-row md:justify-center">
              <RouterLink to="/register" class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-primary-hover shadow-medium transition-colors hover:bg-[#f1f5ff] md:w-auto">
                Créer mon compte
                <ArrowRight class="h-5 w-5" aria-hidden="true" />
              </RouterLink>
              <RouterLink to="/login" class="rounded-xl text-sm font-medium text-white md:bg-white/10 md:px-7 md:py-3.5 md:text-base md:font-semibold md:transition-colors md:hover:bg-white/20">
                Déjà inscrit ? <span class="underline underline-offset-4 md:no-underline">Se connecter</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Pied de page -->
    <footer class="bg-[#eef3fd]">
      <div class="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div class="flex flex-col gap-8 md:flex-row md:justify-between">
          <div class="max-w-[24rem]">
            <RouterLink to="/" class="inline-flex items-center gap-2.5 rounded-lg" aria-label="FluxMoneva — accueil">
              <MonevaMark class="h-9 w-9" />
              <span class="text-[17px] font-bold tracking-[-0.02em] text-ink">FluxMoneva</span>
            </RouterLink>
            <p class="mt-3 text-sm leading-relaxed text-text-muted">L'application simple et intuitive pour organiser votre budget et suivre vos dépenses en FCFA.</p>
          </div>
          <nav aria-label="Liens du pied de page">
            <ul class="flex flex-wrap gap-x-7 gap-y-3 text-sm text-text-muted">
              <li><a href="#haut" class="hover:text-primary">Accueil</a></li>
              <li><a href="#fonctionnalites" class="hover:text-primary">Fonctionnalités</a></li>
              <li><a href="#comment-ca-marche" class="hover:text-primary">Comment ça marche</a></li>
              <li><RouterLink to="/login" class="hover:text-primary">Connexion</RouterLink></li>
              <li><RouterLink to="/register" class="font-medium text-primary hover:text-primary-hover">Créer un compte</RouterLink></li>
            </ul>
          </nav>
        </div>
        <div class="mt-10 flex flex-col items-center gap-2 border-t border-[#dbe4f8] pt-6 text-xs text-text-muted-light md:flex-row md:justify-between">
          <p>Copyright © 2026 FluxMoneva. Tous droits réservés.</p>
          <p class="font-medium text-text-muted">Zone FCFA</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowRight, Banknote, CalendarDays, Car, ChevronDown, CircleCheck, Eye, FileText,
  Info, Lock, Mail, Menu, Plus, Shield, ShoppingBag, SlidersHorizontal, TrendingUp, Wifi, X,
} from 'lucide-vue-next';
import MonevaMark from '@/components/brand/MonevaMark.vue';

// Menu mobile : fermé par défaut (rendu identique au pré-rendu), Échap le ferme.
const menuOpen = ref(false);

const closeOnEscape = (event) => {
  if (event.key === 'Escape' && menuOpen.value) menuOpen.value = false;
};

onMounted(() => document.addEventListener('keydown', closeOnEscape));
onBeforeUnmount(() => document.removeEventListener('keydown', closeOnEscape));
</script>
