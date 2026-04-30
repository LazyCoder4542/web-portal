import axios from "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Public requests — unauthenticated Next.js routes or external public endpoints
export const api = axios.create({
  headers: { "Content-Type": "application/json" },
});

// Authenticated requests — targets Next.js BFF route handlers (same origin).
// Cookies are sent automatically; no manual token attachment needed.
export const privateApi = axios.create({
  headers: { "Content-Type": "application/json" },
});

// Queue for requests that arrive while a token refresh is in flight
type QueueItem = { resolve: () => void; reject: (err: unknown) => void };

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown): void {
  failedQueue.forEach((item) =>
    error ? item.reject(error) : item.resolve()
  );
  failedQueue = [];
}

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => privateApi(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // The Next.js refresh route reads the HTTP-only cookie and rotates tokens
      await api.post("/api/auth/refresh");
      processQueue(null);
      return privateApi(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
