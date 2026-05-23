import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import QuickCliniqHome
from "./pages/QuickCliniqHome";

import Login
from "./pages/Login";

import Privacy
from "./pages/Privacy";

import VerifyOtp
from "./pages/VerifyOtp";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<QuickCliniqHome />}
        />

        <Route
          path="/quickcliniq"
          element={<QuickCliniqHome />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/privacy"
          element={<Privacy />}
        />

        <Route
          path="/verify_otp"
          element={<VerifyOtp />}
        />

        <Route
          path="/home"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
