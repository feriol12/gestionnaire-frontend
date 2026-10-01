// AUTH3-06 : isolation de l'état client privé entre identités.
//
// Les stores qui contiennent des données privées d'un compte (dépenses,
// budgets...) enregistrent ici leur remise à zéro. Le store d'authentification
// appelle resetPrivateState() à chaque changement d'identité (connexion réussie,
// session terminée ou expirée), au même moment que l'époque d'authentification
// (AUTH3-02) avance.
//
// La « génération » permet aux écritures asynchrones de vérifier qu'elles
// appartiennent toujours à l'identité qui a lancé la requête : une réponse
// arrivée après un changement d'identité est ignorée (ni données, ni erreur,
// ni indicateur de chargement, ni toast).
//
// Ce module n'importe aucun store : pas de dépendance circulaire.

let generation = 0
const resetters = new Set()

export const currentPrivateGeneration = () => generation

export const isStaleGeneration = (capturedGeneration) => capturedGeneration !== generation

// Appelé dans le setup d'un store privé (une fois par instance Pinia).
export const registerPrivateState = (reset) => {
  resetters.add(reset)
}

export const resetPrivateState = () => {
  generation++
  resetters.forEach((reset) => {
    try {
      reset()
    } catch (error) {
      console.error('Private state reset failed:', error)
    }
  })
}
