export function adminHeaders(extra = {}) {
  const token = localStorage.getItem("admin_token");
  return {
    ...(token ? { "X-Admin-Token": token } : {}),
    ...extra
  };
}
