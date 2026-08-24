import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const userEmail = useAuthStore.getState().userEmail;
  if (userEmail) {
    config.headers["x-user-email"] = userEmail;
  }
  return config;
});

