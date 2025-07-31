// App.tsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Designer from "./pages/Designer";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Toaster } from "react-hot-toast";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrderPage";
import ProfilePage from "./pages/ProfilePage";
import ScreenGuard from "./components/ScreenGuard";

export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={
            // <ScreenGuard
            // minWidth={1000}
            // minHeight={720}
            //   // requireFullScreen={true}
            // >
              <Designer />
            // </ScreenGuard>
          } />
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
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="*" element={
          //   <ScreenGuard
          //   minWidth={1000}
          //   minHeight={720}
          //   // requireFullScreen={true}
          // >
            <Designer />
          // </ScreenGuard>
          } />
        </Route>
      </Routes>
    </>
  );
}
