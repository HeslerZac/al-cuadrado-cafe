import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      <Sidebar />
      <main className="flex-1 lg:pl-72 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
