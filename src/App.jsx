import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import QuickCliniqHome from "./pages/QuickCliniqHome";
import Login from "./pages/Login";
import Privacy from "./pages/Privacy";
import ChangePassword from "./pages/ChangePassword";
import Appearance from "./pages/Appearance";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import VerifyOtp from "./pages/VerifyOtp";

import ShiftManagement from "./slots/pages/ShiftManagement";
import Appointments from "./appointments/pages/Appointments";
import Patients from "./patients/pages/Patients";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminLogin from "./admin/AdminLogin";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminMetaSettings from "./admin/pages/AdminMetaSettings";


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

        <Route
          path="/change-password"
          element={<ChangePassword />}
        />

        <Route
          path="/verify_otp"
          element={<VerifyOtp />}
        />


        {/* DASHBOARD */}

        <Route
        path="/dashboard"
        element={
          <ProtectedRoute>

            <Dashboard />

          </ProtectedRoute>
        }
      />

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

        <Route
        path="/doctors"
        element={
          <ProtectedRoute>

            <Doctors />

          </ProtectedRoute>
        }
      />

        <Route
        path="/profile"
        element={
          <ProtectedRoute>

            <Profile />

          </ProtectedRoute>
        }
      />

        <Route
        path="/settings/security"
        element={
          <ProtectedRoute>

            <Security />

          </ProtectedRoute>
        }
      />

        <Route
        path="/settings/appearance"
        element={
          <ProtectedRoute>

            <Appearance />

          </ProtectedRoute>
        }
      />

        {/* ADMIN PORTAL */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/meta"
          element={
            <AdminProtectedRoute>
              <AdminMetaSettings />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={<Navigate to="/admin/login" replace />}
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
