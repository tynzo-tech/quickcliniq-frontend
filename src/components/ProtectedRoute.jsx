import { Navigate }
from "react-router-dom";


export default function ProtectedRoute({

  children

}) {

  const isLoggedIn =

    localStorage.getItem(
      "is_logged_in"
    );

  let clinic = null;

  try {

    clinic = JSON.parse(
      localStorage.getItem(
        "clinic"
      )
    );

  } catch {

    clinic = null;
  }

  if (
    !isLoggedIn
    || !clinic?.id
  ) {

    localStorage.removeItem(
      "is_logged_in"
    );

    return (

      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}
