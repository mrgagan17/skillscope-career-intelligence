import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardCard({ title, value, icon: Icon, change, trend, subtext }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  
  return (
    <div className="glass-card p-6 flex flex-col justify-between min-h-[140px] animate-fade-in relative overflow-hidden group">
      {/* Background soft glow on hover */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-300" />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        
        {/* Icon wrapper with tailored color tints */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-brand-400 group-hover:text-brand-300 transition-colors">
          {Icon && <Icon size={20} />}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs">
        {change ? (
          <div className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
            isUp ? 'text-teal-400 bg-teal-950/30 border border-teal-900/40' :
            isDown ? 'text-rose-400 bg-rose-950/30 border border-rose-900/40' :
            'text-slate-400 bg-slate-800/30 border border-slate-700/40'
          }`}>
            {isUp && <TrendingUp size={12} />}
            {isDown && <TrendingDown size={12} />}
            <span>{change}</span>
          </div>
        ) : <div />}
        
        {subtext && (
          <span className="text-[10px] font-medium text-slate-500">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
