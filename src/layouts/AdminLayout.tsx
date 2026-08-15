import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { Bell } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="text-sm font-semibold text-gray-700">Admin Portal</div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Outlet Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}