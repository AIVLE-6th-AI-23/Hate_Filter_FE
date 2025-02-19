import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const csrfClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

let csrfToken: string | null = null;
let csrfTokenRequest: Promise<string> | null = null;

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken;

  if (!csrfTokenRequest) {
    csrfTokenRequest = csrfClient
      .get<ApiResponse<string>>("/api/csrf")
      .then((response) => {
        csrfToken = response.data.data;
        return csrfToken;
      })
      .finally(() => {
        csrfTokenRequest = null;
      });
  }

  return csrfTokenRequest;
};

export const clearCsrfToken = () => {
  csrfToken = null;
  csrfTokenRequest = null;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  const requiresCsrf = method && !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);

  if (requiresCsrf) {
    config.headers.set("X-XSRF-TOKEN", await getCsrfToken());
  }

  return config;
});

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
