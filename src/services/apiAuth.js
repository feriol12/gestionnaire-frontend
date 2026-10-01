import apiClient, { ensureCsrfCookie } from "./apiClient"

export const authApi = {
  // AUTH3-01 : cookie XSRF-TOKEN à obtenir avant login / inscription.
  csrfCookie() {
    return ensureCsrfCookie()
  },

  login(data) {
    return apiClient.post("/login", data)
  },

  register(data) {
    return apiClient.post("/register", data)
  },

  logout() {
    return apiClient.post("/logout")
  },

  // AUTH3-03 : récupération de mot de passe (routes publiques, CSRF requise).
  // Comme login / inscription, les pages gèrent elles-mêmes leurs erreurs : un
  // 419 ne doit pas être présenté comme une session expirée (redirection /login).
  forgotPassword(email) {
    return apiClient.post("/forgot-password", { email }, { skipAuthRedirect: true })
  },

  resetPassword(payload) {
    return apiClient.post("/reset-password", payload, { skipAuthRedirect: true })
  },

  // AUTH3-04 : renvoi de l'email de vérification (route publique, CSRF requise,
  // réponse neutre). Erreurs gérées par la page, comme la récupération.
  resendVerification(email) {
    return apiClient.post("/email/verification-notification", { email }, { skipAuthRedirect: true })
  },

  // Vérification de session : un 401 signifie simplement « non connecté »,
  // il ne doit pas déclencher la redirection globale de l'intercepteur.
  getUser() {
    return apiClient.get("/user", { skipAuthRedirect: true })
  },
}
