import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, Menu, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 z-30 px-4 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="text-white h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SKILLSCOPE
            </span>
            <span className="text-[10px] font-bold tracking-wider text-brand-400 block -mt-1 pl-0.5">
              AI PLATFORM
            </span>
          </div>
        </Link>
      </div>

      {/* Right Profiles and Session details */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-200">{user.username}</span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Briefcase size={8} className="text-brand-400" />
              {user.target_role || "Data Analyst"}
            </span>
          </div>
          
          <div className="h-8 w-[1px] bg-slate-800 hidden md:block"></div>

          {/* Profile / Logout options */}
          <div className="flex items-center gap-1">
            <Link 
              to="/profile" 
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-all"
              title="Profile Settings"
            >
              <User size={18} />
            </Link>
            <button
              onClick={logout}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all"
              title="Logout Session"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
