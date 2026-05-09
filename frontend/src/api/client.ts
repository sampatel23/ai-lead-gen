import axios from "axios";

// Create a centralized axios instance pointing to the FastAPI backend
export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add global response interceptor for toast errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We handle the actual toast in the UI layer (React Query mutation onError), 
    // but this is a good place for global auth/401 handling later.
    return Promise.reject(error);
  }
);
