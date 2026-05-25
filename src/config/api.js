export const API_BASE_URL =
  (
    import.meta.env.VITE_API_URL ||
    "https://quickcliniq-backend.onrender.com"
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
