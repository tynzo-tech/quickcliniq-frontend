const fallbackApiUrl =
  import.meta.env.PROD
    ? "https://api.quickcliniq.com"
    : "http://127.0.0.1:8000";


export const API_BASE_URL =
  (
    import.meta.env.VITE_API_URL ||
    fallbackApiUrl
  ).replace(
    /\/+$/,
    ""
  );


export function apiUrl(
  path
) {

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}
