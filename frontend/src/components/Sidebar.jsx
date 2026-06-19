import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Activity, 
  FileText, 
  Brain, 
  ClipboardList, 
  User,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { name: 'Overview Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Skills Analyzer', path: '/skills', icon: Layers },
    { name: 'Salary Analytics', path: '/salary', icon: DollarSign },
    { name: 'Hiring Trends', path: '/trends', icon: TrendingUp },
    { name: 'Location Intelligence', path: '/locations', icon: MapPin },
    { name: 'Skill Gap Matrix', path: '/gap', icon: Activity },
    { name: 'Resume Scanner', path: '/resume', icon: FileText },
    { name: 'AI Career Advisor', path: '/advisor', icon: Brain },
    { name: 'Reports Center', path: '/reports', icon: ClipboardList },
    { name: 'User Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-16 bottom-0 left-0 w-64 bg-slate-950 border-r border-slate-800/60 z-40
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close toggle */}
        <div className="flex justify-end p-2 lg:hidden">
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1 h-[calc(100vh-5rem)] overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive 
                  ? 'bg-brand-600/10 text-brand-400 border-l-2 border-brand-500 shadow-lg shadow-brand-500/5' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'}
              `}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
