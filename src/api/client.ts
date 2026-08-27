const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode = 500, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensures HttpOnly cookies are passed across origins
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      json.message || `Request failed with status ${response.status}`,
      response.status,
      json.errors
    );
  }

  return (json.data ?? json) as T;
}
