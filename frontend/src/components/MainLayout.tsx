import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col overflow-auto">
      <Navbar />
      <div className="flex-1 pt-[70px]">
        <Outlet />
      </div>
    </div>
  );
}
