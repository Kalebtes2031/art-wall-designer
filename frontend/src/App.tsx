// App.tsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Designer from "./pages/Designer";
import Admin from "./pages/Admin";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Designer />} />
        <Route
          path="admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Admin />
            </PrivateRoute>
          }
        />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />

      </Route>
    </Routes>
  );
}
