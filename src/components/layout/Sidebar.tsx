import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileSearch,
  Search,
  UserSearch,
  Mail,
  Bell,
  Settings,
  LogOut,
  Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Sidebar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [isConfirmingLogout, setIsConfirmingLogout] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Applications', icon: Briefcase },
    { to: '/ai-fit-analyzer', label: 'AI Fit Analyzer', icon: FileSearch },
    { to: '/company-research', label: 'Company Research', icon: Search },
    { to: '/contact-finder', label: 'Contact Finder', icon: UserSearch },
    { to: '/follow-up', label: 'Follow-Up Assistant', icon: Mail },
    { to: '/reminders', label: 'Reminders', icon: Bell },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white shadow-sm lg:flex lg:flex-col">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lg">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 font-serif">EasyJobStatus</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-50 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 opacity-80" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        {isConfirmingLogout ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
             <p className="text-xs font-bold text-slate-500 px-2">Ready to sign out?</p>
             <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setIsConfirmingLogout(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs bg-red-600 hover:bg-red-700"
                  onClick={handleLogout}
                >
                  Yes, Sign Out
                </Button>
             </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => setIsConfirmingLogout(true)}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        )}
      </div>
    </aside>
  );
};
