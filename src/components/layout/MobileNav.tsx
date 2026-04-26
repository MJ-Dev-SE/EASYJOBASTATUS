import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileSearch, 
  Bell, 
  Menu, 
  X, 
  Search, 
  UserSearch, 
  Mail, 
  Settings,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const MobileNav: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const moreItems = [
    { to: '/company-research', label: 'Research', icon: Search },
    { to: '/contact-finder', label: 'Finder', icon: UserSearch },
    { to: '/follow-up', label: 'Follow-Up', icon: Mail },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-slate-200 bg-white/95 pb-safe pt-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] backdrop-blur-xl lg:hidden">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
              isActive ? 'text-primary-600' : 'text-slate-400'
            }`
          }
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[10px] font-bold tracking-wide">Dashboard</span>
        </NavLink>

        <NavLink
          to="/applications"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
              isActive ? 'text-primary-600' : 'text-slate-400'
            }`
          }
        >
          <Briefcase className="h-6 w-6" />
          <span className="text-[10px] font-bold tracking-wide">Applied</span>
        </NavLink>

        <NavLink
          to="/ai-fit-analyzer"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
              isActive ? 'text-primary-600' : 'text-slate-400'
            }`
          }
        >
          <FileSearch className="h-6 w-6" />
          <span className="text-[10px] font-bold tracking-wide">AI Fit</span>
        </NavLink>

        <NavLink
          to="/reminders"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
              isActive ? 'text-primary-600' : 'text-slate-400'
            }`
          }
        >
          <Bell className="h-6 w-6" />
          <span className="text-[10px] font-bold tracking-wide">Reminders</span>
        </NavLink>

        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
            showMore ? 'text-primary-600' : 'text-slate-400'
          }`}
        >
          {showMore ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="text-[10px] font-bold tracking-wide">More</span>
        </button>
      </nav>

      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 overflow-hidden rounded-2xl bg-white shadow-2xl lg:hidden"
            >
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {moreItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setShowMore(false)}
                      className={({ isActive }) =>
                        `flex flex-col items-center gap-3 rounded-xl p-4 transition-all ${
                          isActive 
                            ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100' 
                            : 'bg-slate-50 text-slate-600'
                        }`
                      }
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-xs font-bold tracking-tight">{item.label}</span>
                    </NavLink>
                  ))}
                  {isConfirmingLogout ? (
                    <div className="col-span-2 space-y-2 p-2 bg-red-50 rounded-xl border border-red-100 animate-in fade-in zoom-in duration-300">
                       <p className="text-center text-xs font-bold text-red-600">Are you sure you want to sign out?</p>
                       <div className="flex gap-2">
                          <button
                            onClick={() => setIsConfirmingLogout(false)}
                            className="flex-1 py-2 text-xs font-bold bg-white text-slate-600 rounded-lg border border-red-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex-1 py-2 text-xs font-bold bg-red-600 text-white rounded-lg"
                          >
                            Logout
                          </button>
                       </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsConfirmingLogout(true)}
                      className="flex flex-col items-center gap-3 rounded-xl p-4 transition-all bg-red-50 text-red-600 col-span-2 border border-red-100"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-red-100">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold tracking-tight">Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
