// FE-02 — Jeux de donnees et scenarios Strictement FICTIFS.
//
// Regles : valeurs figees en memoire, aucun appel reseau, aucun stockage,
// aucune donnee financiere. Le mot de passe, le secret TOTP et les codes de
// recuperation ci-dessous sont des littéraux de demonstration : ils ne
// donnent acces a aucun systeme reel et ne doivent jamais etre consideres
// comme des secrets. Adresses uniquement sous le domaine reserve example.test.

export const DEMO_ADMIN = Object.freeze({
  email: 'admin@example.test',
  password: 'fictional-demo-password',
})

// Secret volontairement incomplet et invalide pour un veritable TOTP :
// uniquement destine a etre affiche comme exemple visuel.
export const DEMO_TOTP = Object.freeze({
  code: '123456',
  secretLabel: 'DEMO4FAKE4KEY4NOT4REAL',
})

export const DEMO_RECOVERY_CODES = Object.freeze([
  'DEMO-RC-01',
  'DEMO-RC-02',
  'DEMO-RC-03',
  'DEMO-RC-04',
  'DEMO-RC-05',
  'DEMO-RC-06',
  'DEMO-RC-07',
  'DEMO-RC-08',
  'DEMO-RC-09',
  'DEMO-RC-10',
])

// 300 secondes : duree du challenge et fenetre de fraicheur apres MFA complet.
export const CHALLENGE_TTL_MS = 300000
export const FRESHNESS_TTL_MS = 300000
export const MAX_IDENTITY_ATTEMPTS = 5
export const MAX_IP_ATTEMPTS = 20

export const ERROR_CATALOG = Object.freeze({
  401: 'Identifiant, mot de passe ou code MFA invalide (simulation).',
  403: 'Acces interdit pour ce profil (simulation).',
  419: 'Verification expiree : recommencez le parcours (simulation).',
  422: 'Donnees invalides : verifiez les champs saisis (simulation).',
  429: 'Trop de tentatives : reessayez plus tard (simulation).',
  expired: 'Le challenge a expire : recommencez la connexion (simulation).',
  offline: 'Erreur reseau simulee : aucune requete reelle n’a ete envoyee.',
})

export const SCENARIOS = Object.freeze([
  { value: 'nominal', label: 'Nominal' },
  { value: 'enrollment', label: 'Premier enrolement' },
  { value: 'wrong-password', label: '401 — mot de passe refuse' },
  { value: 'forbidden', label: '403 — acces interdit' },
  { value: 'csrf', label: '419 — verification expiree' },
  { value: 'invalid', label: '422 — donnees invalides' },
  { value: 'throttled', label: '429 — trop de tentatives' },
  { value: 'expired', label: 'Challenge expire' },
  { value: 'offline', label: 'Erreur reseau simulee' },
])

export function isScenarioKnown(value) {
  return SCENARIOS.some((scenario) => scenario.value === value)
}

export function demoSecretCodes() {
  return [...DEMO_RECOVERY_CODES]
}
