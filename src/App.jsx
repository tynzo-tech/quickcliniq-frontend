import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import QuickCliniqHome from "./pages/QuickCliniqHome";
import Login from "./pages/login";
import Privacy from "./pages/Privacy";
import VerifyOtp from "./pages/VerifyOtp";

import ShiftManagement from "./slots/pages/ShiftManagement";
import Appointments from "./appointments/pages/Appointments";
import Patients from "./patients/pages/Patients";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<QuickCliniqHome />}
        />

        <Route
          path="/quickcliniq"
          element={<QuickCliniqHome />}
        />


        {/* AUTH */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/privacy"
          element={<Privacy />}
        />

        {/*
        <Route
          path="/verify_otp"
          element={<VerifyOtp />}
        />
        */}

        <Route
          path="/verify_otp"
          element={<Navigate to="/slots" replace />}
        />


        {/* DASHBOARD */}

        <Route
        path="/slots"
        element={
        <ProtectedRoute>

          <ShiftManagement />

        </ProtectedRoute>
        }
        />

        <Route
        path="/appointments"
        element={
          <ProtectedRoute>

            <Appointments />

          </ProtectedRoute>
        }
      />

        <Route
        path="/patients"
        element={
          <ProtectedRoute>

            <Patients />

          </ProtectedRoute>
        }
      />


        {/* REDIRECTS */}

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
