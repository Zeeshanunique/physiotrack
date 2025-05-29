import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, MessageSquare, Calendar, UserCircle } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Exercises', href: '/exercises', icon: Dumbbell },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Planner', href: '/planner', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  return (
    <div className="flex flex-col w-64 bg-white h-full border-r border-neutral-200">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-2xl font-bold text-primary-600">PhysioTrack</span>
        </div>
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-neutral-200 p-4">
        <div className="flex items-center">
          <div className="text-xs text-neutral-500">
            <p>© 2025 PhysioTrack</p>
            <p>Version 0.1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;