
import { useState } from 'react';
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
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  role?: 'admin' | 'student';
}

interface NavigationLink {
  to: string;
  label: string;
  icon: React.ElementType;
}

export default function Sidebar({ role = 'admin' }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = role === 'admin';

  const adminLinks: NavigationLink[] = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/users',
      label: 'Users',
      icon: Users,
    },
    {
      to: '/admin/courses',
      label: 'Courses',
      icon: BookOpen,
    },
    {
      to: '/admin/lessons',
      label: 'Lessons',
      icon: Video,
    },
    {
      to: '/admin/resources',
      label: 'Resources',
      icon: Folder,
    },
    {
      to: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart2,
    },
    {
      to: '/admin/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const studentLinks: NavigationLink[] = [
    {
      to: '/student/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/student/courses',
      label: 'My Courses',
      icon: BookOpen,
    },
    {
      to: '/student/progress',
      label: 'My Progress',
      icon: BarChart2,
    },
    {
      to: '/student/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    window.location.href = '/login';
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* =========================================================
          MOBILE TOP BAR
      ========================================================= */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[#111322] border-b border-gray-800/60">
        <div className="h-full px-4 flex items-center justify-between">
          
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileOpen}
            className="
              w-10 h-10
              flex items-center justify-center
              rounded-lg
              text-gray-300
              hover:text-white
              hover:bg-gray-800
              active:bg-gray-700
              transition-colors
            "
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
              <Play className="w-4 h-4 fill-current" />
            </div>

            <div>
              <h1 className="font-bold text-white text-sm tracking-wide">
                AI STORYSPRINT

              </h1>

              <span className="text-[9px] text-gray-400 block tracking-widest uppercase">
                Editing
              </span>
            </div>
          </div>

          {/* Mobile User Indicator */}
          <div className="
            w-9 h-9
            rounded-full
            bg-gray-700
            flex items-center justify-center
            text-xs
            text-white
            font-semibold
          ">
            {isAdmin ? 'AD' : 'ST'}
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}
      <div
        onClick={closeMobileMenu}
        className={`
          lg:hidden
          fixed inset-0
          z-40
          bg-black/60
          backdrop-blur-[2px]
          transition-opacity duration-300
          ${
            isMobileOpen
              ? 'opacity-100 visible'
              : 'opacity-0 invisible pointer-events-none'
          }
        `}
        aria-hidden="true"
      />

      {/* =========================================================
          MOBILE SIDEBAR / DRAWER
      ========================================================= */}
      <aside
        className={`
          lg:hidden
          fixed
          top-0
          left-0
          bottom-0
          z-50
          w-72
          max-w-[85vw]
          bg-[#111322]
          text-gray-300
          flex flex-col
          shadow-2xl
          transform
          transition-transform
          duration-300
          ease-in-out
          ${
            isMobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        {/* Mobile Drawer Header */}
        <div className="
          h-20
          px-5
          flex
          items-center
          justify-between
          border-b
          border-gray-800/50
        ">
          <div className="flex items-center gap-3">
            <div className="
              w-9 h-9
              bg-brand
              rounded-lg
              flex items-center
              justify-center
              text-white
              font-bold
            ">
              <Play className="w-4 h-4 fill-current" />
            </div>

            <div>
              <h1 className="font-bold text-white text-sm tracking-wide">
                AI STORYSPRINT
Editing
              </h1>

              <span className="
                text-[10px]
                text-gray-400
                block
                tracking-widest
                uppercase
              ">
                ACADEMY
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
            className="
              w-9 h-9
              flex items-center justify-center
              rounded-lg
              text-gray-400
              hover:text-white
              hover:bg-gray-800
              transition-colors
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-lg
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? 'bg-brand text-white shadow-lg shadow-brand/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                    }
                  `
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile User Footer */}
        <div className="
          p-4
          border-t
          border-gray-800/50
        ">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              <div className="
                w-9 h-9
                rounded-full
                bg-gray-700
                flex items-center
                justify-center
                text-xs
                text-white
                font-semibold
              ">
                {isAdmin ? 'AD' : 'ST'}
              </div>

              <div className="text-xs">
                <p className="text-white font-medium">
                  {isAdmin ? 'Admin' : 'Student'}
                </p>

                <p className="text-gray-500 text-[10px]">
                  {isAdmin ? 'Super Admin' : 'Active Student'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="
                w-9 h-9
                flex items-center justify-center
                rounded-lg
                text-gray-400
                hover:text-red-400
                hover:bg-red-400/10
                transition-colors
              "
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}
      <aside className="
        hidden
        lg:flex
        w-64
        bg-[#111322]
        text-gray-300
        flex-col
        h-screen
        sticky
        top-0
        shrink-0
      ">
        {/* Desktop Brand Header */}
        <div className="
          p-6
          flex
          items-center
          gap-3
          border-b
          border-gray-800/50
        ">
          <div className="
            w-8 h-8
            bg-brand
            rounded-lg
            flex
            items-center
            justify-center
            text-white
            font-bold
          ">
            <Play className="w-4 h-4 fill-current" />
          </div>

          <div>
            <h1 className="
              font-bold
              text-white
              text-sm
              tracking-wide
            ">
              AI STORYSPRINT

            </h1>

            <span className="
              text-[10px]
              text-gray-400
              block
              tracking-widest
              uppercase
            ">
              Editing
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="
          flex-1
          px-3
          py-4
          space-y-1
          overflow-y-auto
        ">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-lg
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? 'bg-brand text-white shadow-lg shadow-brand/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }
                  `
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop User Footer */}
        <div className="
          p-4
          border-t
          border-gray-800/50
          flex
          items-center
          justify-between
        ">
          <div className="flex items-center gap-3">
            <div className="
              w-8 h-8
              rounded-full
              bg-gray-700
              flex
              items-center
              justify-center
              text-xs
              text-white
              font-semibold
            ">
              {isAdmin ? 'AD' : 'ST'}
            </div>

            <div className="text-xs">
              <p className="text-white font-medium">
                {isAdmin ? 'Admin' : 'Student'}
              </p>

              <p className="text-gray-500 text-[10px]">
                {isAdmin ? 'Super Admin' : 'Active Student'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="
              w-8 h-8
              flex items-center justify-center
              rounded-lg
              text-gray-400
              hover:text-red-400
              hover:bg-red-400/10
              transition-colors
            "
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}