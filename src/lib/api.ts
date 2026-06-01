import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("inkingi_admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`Making request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    console.log(`Response from: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error("Request failed:", error.config?.url, error.message);
    return Promise.reject(error);
  },
);

export const mapBackendRole = (role?: string) => {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "admin") return "ADMIN";
  if (normalizedRole === "client") return "CLIENT";
  if (normalizedRole === "engineer") return "ENGINEER";
  if (normalizedRole === "supervisor") return "SUPERVISOR";
  if (normalizedRole === "supplier") return "SUPPLIER";

  return "CLIENT";
};

export const apiFormData = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

apiFormData.interceptors.request.use((config) => {
  const token = localStorage.getItem("inkingi_admin_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
