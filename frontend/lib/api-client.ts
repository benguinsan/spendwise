// Enhanced API client with better error handling and logging

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Log API configuration on client side
if (typeof window !== "undefined") {
  console.log("🔧 API Configuration:", {
    baseURL: API_BASE_URL,
    environment: process.env.NODE_ENV,
  });
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "NetworkError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add auth token if available and not skipped
  if (!skipAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...headers },
    credentials: "include", // Include cookies
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  // Log request in development
  if (process.env.NODE_ENV === "development") {
    console.log(`🌐 API ${method} ${url}`, body ? { body } : "");
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(`📡 Response ${method} ${url}:`, {
        status: response.status,
        ok: response.ok,
      });
    }

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorData: unknown = null;

      try {
        const responseData = await response.json();
        errorData = responseData;
        errorMessage =
          responseData.message ||
          responseData.error ||
          `HTTP ${response.status}`;
      } catch {
        // Response is not JSON
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401 && typeof window !== "undefined") {
        console.warn("🔒 Unauthorized - clearing auth token");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("access_token");
        // Don't redirect here, let the component handle it
      }

      throw new APIError(response.status, errorMessage, errorData);
    }

    // Handle empty responses (204 No Content, DELETE operations)
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as T;
    }

    // Parse JSON response
    const responseData = await response.json();

    // Handle wrapped response format from NestJS TransformInterceptor
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return responseData.data as T;
    }

    return responseData as T;
  } catch (error) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      const networkError = new NetworkError(
        `Network error: Cannot connect to ${url}. Please check if the backend is running.`,
        error,
      );
      console.error("❌ Network Error:", networkError.message);
      throw networkError;
    }

    // Handle other errors
    const unknownError = new Error(
      `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.error("❌ API Error:", unknownError.message);
    throw unknownError;
  }
}

// Convenience methods
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
    apiCall<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiCall<T>(endpoint, { ...options, method: "POST", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiCall<T>(endpoint, { ...options, method: "PATCH", body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiCall<T>(endpoint, { ...options, method: "PUT", body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
    apiCall<T>(endpoint, { ...options, method: "DELETE" }),
};

export { API_BASE_URL };
