import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
  return (
    <div className="md:max-h-screen flex flex-col overflow-auto">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
