const API_URL = "http://localhost:4000";
// import.meta.env.VITE_API_URL || 

export async function fetchAPI<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const error: any = new Error(data.error || "API Error");
    error.code = data.code;
    error.statusCode = res.status;
    error.field = data.field;
    throw error;
  }

  return data as T;
}