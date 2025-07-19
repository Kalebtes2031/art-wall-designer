// App.tsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Designer from "./pages/Designer";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Designer />} />
        <Route
          path="admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="seller"
          element={
            <PrivateRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>
    </Routes>
  );
}
