// FE-01 — Jeux de données FICTIFS du tableau de bord de démonstration.
//
// Règles : valeurs figées en mémoire, aucune lecture réseau ou stockage,
// aucune donnée financière, adresses uniquement sous le domaine réservé
// « example.test » (RFC 2606). Toute ressemblance avec un compte réel est exclue.

export const demoOperator = Object.freeze({
  name: 'Claire Valette',
  initials: 'CV',
  role: 'Super Administrateur unique',
})

export const kpis = Object.freeze([
  {
    id: 'total',
    label: 'Total des utilisateurs',
    shortLabel: 'Total',
    value: 142850,
    icon: 'users',
    tone: 'info',
    trend: { label: '+8,4 % ce mois', tone: 'success', icon: 'trend' },
    note: 'fictif',
  },
  {
    id: 'active',
    label: 'Comptes actifs',
    shortLabel: 'Actifs',
    value: 138412,
    icon: 'active',
    tone: 'success',
    trend: { label: '96,9 % du parc', tone: 'success' },
    note: 'Statut normal',
  },
  {
    id: 'suspended',
    label: 'Comptes suspendus',
    shortLabel: 'Suspendus',
    value: 214,
    icon: 'suspended',
    tone: 'warning',
    trend: { label: 'À examiner', tone: 'warning' },
    note: 'Signalements CGU',
  },
  {
    id: 'new',
    label: 'Nouveaux inscrits',
    shortLabel: 'Nouveaux',
    value: 1420,
    icon: 'new',
    tone: 'info',
    trend: { label: '7 derniers jours', tone: 'info' },
    note: 'flux simulé',
  },
])

export const auditEvents = Object.freeze([
  {
    id: 'evt-demo-001',
    day: "Aujourd'hui",
    time: '14:32',
    kind: 'password',
    label: 'Réinitialisation mot de passe demandée',
    subject: 'alexandre.d@example.test',
    operator: 'adm.demo',
    status: { label: 'Envoyé', tone: 'success' },
  },
  {
    id: 'evt-demo-002',
    day: "Aujourd'hui",
    time: '13:15',
    kind: 'suspension',
    label: 'Compte suspendu pour signalement',
    subject: 'user_88329@example.test',
    operator: 'adm.demo',
    status: { label: 'Suspendu', tone: 'warning' },
  },
  {
    id: 'evt-demo-003',
    day: "Aujourd'hui",
    time: '11:48',
    kind: 'email',
    label: 'Validation adresse e-mail',
    subject: 'sarah.m@example.test',
    operator: 'système (démo)',
    status: { label: 'Validé', tone: 'success' },
  },
  {
    id: 'evt-demo-004',
    day: 'Hier',
    time: '16:20',
    kind: 'update',
    label: 'Modification statut de compte',
    subject: 'nicolas.v@example.test',
    operator: 'adm.demo',
    status: { label: 'Mis à jour', tone: 'info' },
  },
])

// Volume d'accès simulé, par tranche de deux heures (valeurs arbitraires).
export const accessActivity = Object.freeze([
  { slot: '00:00', allowed: 46, blocked: 4 },
  { slot: '02:00', allowed: 34, blocked: 0 },
  { slot: '04:00', allowed: 22, blocked: 0 },
  { slot: '06:00', allowed: 16, blocked: 0 },
  { slot: '08:00', allowed: 38, blocked: 4 },
  { slot: '10:00', allowed: 64, blocked: 0 },
  { slot: '12:00', allowed: 74, blocked: 7 },
  { slot: '14:00', allowed: 66, blocked: 0 },
  { slot: '16:00', allowed: 58, blocked: 0 },
  { slot: '18:00', allowed: 70, blocked: 6 },
  { slot: '20:00', allowed: 52, blocked: 0 },
  { slot: '22:00', allowed: 36, blocked: 0 },
])

export const adminInfo = Object.freeze([
  { label: 'Version', value: 'Prototype Admin V1' },
  { label: 'Rôle', value: 'Super Administrateur unique' },
  { label: "Mode d'accès", value: 'Console Web (MFA TOTP simulée)' },
  { label: 'Données', value: 'Démonstration statique' },
])

export const demoNotificationsCount = 3

// FE-03 — Jeux de donnees FICTIFS supplementaires pour le tableau de bord
// non financier. Regles identiques : figures, memoire, aucune requete, aucun
// stockage, adresses uniquement sous example.test. Les definitions sont
// explicites pour eviter toute presentation de valeurs simulees comme reelles.
export const dashboardScenarios = Object.freeze([
  { value: 'nominal', label: 'Nominal', hint: 'Evenements fictifs complets' },
  { value: 'loading', label: 'Chargement', hint: 'Squelettes simules' },
  { value: 'empty', label: 'Vide', hint: 'Aucun evenement de supervision' },
  { value: 'error', label: 'Erreur simulée', hint: 'Aucun appel reel' },
])

// Total 142850 = 12 + 27 + 142811, coheremment avec le KPI "Total des utilisateurs".
export const administrativeBreakdown = Object.freeze([
  {
    id: 'supervisors',
    label: 'Comptes de supervision',
    value: 12,
    definition: 'Comptes fictifs dedies a la supervision ; libelle purement illustratif.',
    tone: 'info',
  },
  {
    id: 'review',
    label: 'Comptes en verification',
    value: 27,
    definition: 'Comptes fictifs en attente d’une revue administrative simulee.',
    tone: 'warning',
  },
  {
    id: 'standard',
    label: 'Comptes standards',
    value: 142811,
    definition: 'Comptes fictifs sans privilege de supervision.',
    tone: 'success',
  },
])

// Inscriptions fictives sur sept jours, sans rapport avec une activite reelle.
export const registrationSeries = Object.freeze([
  { day: 'Lun', value: 18 },
  { day: 'Mar', value: 24 },
  { day: 'Mer', value: 15 },
  { day: 'Jeu', value: 31 },
  { day: 'Ven', value: 27 },
  { day: 'Sam', value: 11 },
  { day: 'Dim', value: 9 },
])

export const supervisionEvents = Object.freeze([
  {
    id: 'sup-demo-01',
    time: '09:12',
    label: 'Nouvelle demande de verification de compte',
    subject: 'camille.d@example.test',
    tone: 'info',
  },
  {
    id: 'sup-demo-02',
    time: '10:45',
    label: 'Controle de routine des acces administrative',
    subject: 'systeme (demonstration)',
    tone: 'success',
  },
  {
    id: 'sup-demo-03',
    time: '13:20',
    label: 'Signalement fictif de statut a examiner',
    subject: 'user_44102@example.test',
    tone: 'warning',
  },
])

export const dashboardStateMessages = Object.freeze({
  loading: 'Chargement simule des evenements de supervision…',
  empty: 'Aucun evenement de supervision dans ce jeu fictif.',
  error: 'Erreur simulee : aucune requete n’a ete envoyee.',
  recovered: 'Reprise simulee : evenements fictifs recharges.',
})
