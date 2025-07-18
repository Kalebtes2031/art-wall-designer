// components/MainLayout.tsx
import { Link, Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col">
      <nav className="p-5 border-b border-gray-300">
        <Link to="/">Designer</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

