import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <Outlet />
      </div>
    </div>
  );
}
