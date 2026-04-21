import axios from "axios";

// ============================================================
// API Instance — base config for all backend requests
// Base URL points to Express backend running on port 5000
// ============================================================
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach JWT token to every outgoing request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[API] Token attached to request:", config.url);
  } else {
    console.log("[API] No token — public request:", config.url);
  }
  return config;
});

// Log response errors globally
API.interceptors.response.use(
  (response) => {
    console.log("[API] Response OK:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error("[API ERROR]", error.config?.url, error.response?.status, error.response?.data?.msg);
    return Promise.reject(error);
  }
);

export default API;
