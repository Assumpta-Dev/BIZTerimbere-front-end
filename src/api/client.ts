import axios from "axios";

const api = axios.create({
  baseURL: "https://bizterimbere-backend.onrender.com/api",
  timeout: 30000,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  // Always set Content-Type for requests with a body
  if (config.method !== "get" && config.method !== "delete") {
    config.headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
