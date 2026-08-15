import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Video, 
  Folder, 
  BarChart2, 
  Settings, 
  Play, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ role = 'admin' }) {
  const isAdmin = role === 'admin';

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/lessons', label: 'Lessons', icon: Video },
    { to: '/admin/resources', label: 'Resources', icon: Folder },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/progress', label: 'My Progress', icon: BarChart2 },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-[#111322] text-gray-300 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-800/50">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">
          <Play className="w-4 h-4 fill-current" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-wide">AI Storysprint</h1>
          <span className="text-[10px] text-gray-400 block tracking-widest uppercase">EDITING</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-semibold">
            {isAdmin ? 'AD' : 'ST'}
          </div>
          <div className="text-xs">
            <p className="text-white font-medium">{isAdmin ? 'Admin' : 'Student'}</p>
            <p className="text-gray-500 text-[10px]">{isAdmin ? 'Super Admin' : 'Active Student'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          title="Logout" 
          className="text-gray-400 hover:text-red-400 transition-colors p-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}