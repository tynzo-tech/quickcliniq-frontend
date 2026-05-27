import { Navigate } from "react-router-dom";


export default function AdminProtectedRoute({ children }) {

  const isAdminLoggedIn =
    localStorage.getItem("admin_logged_in");

  if (!isAdminLoggedIn) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return children;
}
