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
