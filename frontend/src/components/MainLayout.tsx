// components/MainLayout.tsx
import { Link, Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="h-screen">
      <nav style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
        <Link to="/">Designer</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <main className="">
        <Outlet />
      </main>
    </div>
  );
}
