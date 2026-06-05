import apiClient from "./apiClient"

export const authApi = {
  login(data) {
    return apiClient.post("/login", data)
  },

  register(data) {
    return apiClient.post("/register", data)
  },

  logout() {
    return apiClient.post("/logout")
  },

  getUser() {
    return apiClient.get("/user")
  },
}