import axios from "axios";
import { toast } from "sonner";

// Create a centralized axios instance pointing to the FastAPI backend
// Falls back to localhost for development if env var is missing
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 30000, // 30 seconds timeout for long AI generation tasks
  headers: {
    "Content-Type": "application/json",
  },
});

// Global response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors (no response received)
    if (!error.response) {
      toast.error("Network error: Please check your connection to the server.");
      return Promise.reject(error);
    }
    
    // Server errors
    if (error.response.status >= 500) {
      toast.error("Server error: Please try again later.");
    }
    
    // We let React Query handle 4xx errors specifically in the UI layer
    return Promise.reject(error);
  }
);
