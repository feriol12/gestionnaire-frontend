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

  // Vérification de session : un 401 signifie simplement « non connecté »,
  // il ne doit pas déclencher la redirection globale de l'intercepteur.
  getUser() {
    return apiClient.get("/user", { skipAuthRedirect: true })
  },
}
