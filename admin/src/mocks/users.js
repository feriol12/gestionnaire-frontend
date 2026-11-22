// FE-04 : répertoire fictif figé. Aucun statut BE-03 n'est présumé.
const names = [
  'Amina Diallo',
  'Émile Laurent',
  'Nora Martin',
  'Lucas Bernard',
  'Fatou Ndiaye',
  'Hugo Petit',
  'Inès Moreau',
  'Adam Robert',
  'Lina Dubois',
  'Noah Simon',
  'Sara Michel',
  'Louis Leroy',
  'Maya Roux',
  'Jules David',
  'Aya Bertrand',
  'Arthur Morel',
  'Mariam Fall',
  'Gabriel Fournier',
  'Yasmine Girard',
  'Raphaël André',
  'Salma Lefèvre',
  'Léo Mercier',
  'Sofia Dupont',
  'Paul Lambert',
  'Nadia Bonnet',
  'Ethan François',
  'Leïla Martinez',
  'Victor Legrand',
  'Dina Gauthier',
  'Oscar Garnier',
  'Zoé Chevalier',
  null,
]

export const demoUsers = Object.freeze(
  names.map((nom, index) =>
    Object.freeze({
      id: 1001 + index,
      nom,
      email: index === 31 ? null : `compte.demo.${index + 1}@example.test`,
      created_at:
        index === 31 ? null : `2026-10-${String((index % 28) + 1).padStart(2, '0')}T10:00:00.000Z`,
    }),
  ),
)

export class UsersDemoError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

function integer(value, fallback, max) {
  if (value === undefined) return fallback
  if (!/^[0-9]+$/.test(String(value)) || Array.isArray(value))
    throw new UsersDemoError('INVALID_QUERY')
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1 || number > max)
    throw new UsersDemoError('INVALID_QUERY')
  return number
}

export function parseUsersQuery(query = {}) {
  const q = query.q === undefined ? '' : query.q
  if (typeof q !== 'string' || [...q].length > 100) throw new UsersDemoError('INVALID_QUERY')
  return {
    q: q.trim(),
    page: integer(query.page, 1, Number.MAX_SAFE_INTEGER),
    per_page: integer(query.per_page, 15, 50),
  }
}

// Recherche locale littérale, insensible à la casse et aux accents.
// La collation réelle sera qualifiée lors de l'intégration ultérieure.
const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')

export function readUsers(query = {}) {
  const { q, page, per_page } = parseUsersQuery(query)
  const needle = normalize(q)
  const matches = demoUsers.filter((user) =>
    [user.nom, user.email].some((value) => normalize(value).includes(needle)),
  )
  const start = (page - 1) * per_page
  return {
    data: matches.slice(start, start + per_page),
    meta: {
      current_page: page,
      per_page,
      total: matches.length,
      last_page: Math.max(1, Math.ceil(matches.length / per_page)),
    },
  }
}

export function readUser(id) {
  if (!/^[0-9]+$/.test(String(id)) || Array.isArray(id)) throw new UsersDemoError('USER_NOT_FOUND')
  const user = demoUsers.find((item) => item.id === Number(id))
  if (!user) throw new UsersDemoError('USER_NOT_FOUND')
  return { data: user }
}

export function userLabel(user) {
  return user.nom?.trim() || `Utilisateur #${user.id}`
}

export function displayDate(value) {
  if (!value || Number.isNaN(Date.parse(value))) return 'Non renseignée'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(value),
  )
}

export function listContext(query) {
  // Ne transporte que les paramètres publics de consultation, jamais de session.
  try {
    const { q, page, per_page } = parseUsersQuery(query)
    return { ...(q ? { q } : {}), page: String(page), per_page: String(per_page) }
  } catch {
    return {}
  }
}
