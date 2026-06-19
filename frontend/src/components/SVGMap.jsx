import React, { useState } from 'react';
import { MapPin, Info } from 'lucide-react';

export default function SVGMap({ stateData = [] }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Map state abbreviation to coordinates and names for interactive SVG markers
  const regions = [
    { code: 'CA', name: 'California (West Hub)', x: 60, y: 180, size: 28 },
    { code: 'TX', name: 'Texas (South Hub)', x: 380, y: 310, size: 26 },
    { code: 'WA', name: 'Washington (Pacific Hub)', x: 70, y: 40, size: 20 },
    { code: 'NY', name: 'New York (East Hub)', x: 740, y: 110, size: 22 },
    { code: 'MA', name: 'Massachusetts (New England)', x: 780, y: 90, size: 18 },
    { code: 'IL', name: 'Illinois (Midwest Hub)', x: 520, y: 160, size: 20 },
    { code: 'CO', name: 'Colorado (Mountain Hub)', x: 260, y: 180, size: 19 },
    { code: 'GA', name: 'Georgia (Southeast Hub)', x: 630, y: 260, size: 18 },
    { code: 'PA', name: 'Pennsylvania', x: 700, y: 130, size: 18 },
    { code: 'FL', name: 'Florida', x: 680, y: 340, size: 20 },
  ];

  // Helper to find job count from API stateData
  const getJobCount = (code) => {
    const found = stateData.find(item => item.state === code);
    return found ? found.jobs : 0;
  };

  const totalMarketJobs = stateData.reduce((acc, curr) => acc + curr.jobs, 0);

  return (
    <div className="relative w-full border border-slate-800 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin size={16} className="text-brand-500" />
            Geographical Market Density
          </h4>
          <p className="text-xs text-slate-500">Interactive distribution of tech hubs across the USA</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400">Total Analyzed: </span>
          <span className="text-xs font-extrabold text-brand-400">
            {totalMarketJobs ? totalMarketJobs.toLocaleString() : "50,000+"}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative aspect-[800/400] w-full bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 850 420" className="w-full h-full text-slate-800">
          {/* Stylized background lines / grid to look advanced */}
          <path d="M 50 100 Q 250 50 450 120 T 800 100" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="5 5" />
          <path d="M 50 250 Q 250 200 450 270 T 800 250" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="5 5" />
          <path d="M 50 380 Q 250 350 450 390 T 800 370" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="5 5" />

          {/* Connectors (Network Mesh Style) */}
          <line x1="60" y1="180" x2="380" y2="310" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="70" y1="40" x2="60" y2="180" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="60" y1="180" x2="260" y2="180" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="260" y1="180" x2="380" y2="310" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="380" y1="310" x2="520" y2="160" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="520" y1="160" x2="740" y2="110" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="740" y1="110" x2="780" y2="90" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="520" y1="160" x2="630" y2="260" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="630" y1="260" x2="680" y2="340" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          <line x1="740" y1="110" x2="700" y2="130" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />

          {/* Hub Circles */}
          {regions.map((reg) => {
            const count = getJobCount(reg.code);
            const intensity = count > 0 ? Math.min(0.2 + (count / 15000) * 0.8, 1) : 0.25;
            const isHovered = hoveredRegion?.code === reg.code;

            return (
              <g 
                key={reg.code}
                onMouseEnter={() => setHoveredRegion({ ...reg, count })}
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer group"
              >
                {/* Glow ring */}
                <circle 
                  cx={reg.x} 
                  cy={reg.y} 
                  r={reg.size + (isHovered ? 12 : 6)} 
                  fill={`rgba(14, 165, 233, ${isHovered ? 0.25 : 0.08 * intensity})`}
                  className="transition-all duration-300"
                />
                {/* Core point */}
                <circle 
                  cx={reg.x} 
                  cy={reg.y} 
                  r={reg.size / 2} 
                  fill={isHovered ? '#0ea5e9' : '#0284c7'}
                  opacity={intensity}
                  className="transition-all duration-300"
                />
                {/* Inner dot */}
                <circle 
                  cx={reg.x} 
                  cy={reg.y} 
                  r={3} 
                  fill="#ffffff" 
                />
                {/* State Label abbreviation */}
                <text 
                  x={reg.x} 
                  y={reg.y + (reg.size + 10)} 
                  textAnchor="middle" 
                  fill="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold"
                  className="group-hover:fill-brand-400 transition-colors"
                >
                  {reg.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover info card */}
        {hoveredRegion && (
          <div className="absolute bg-slate-950/95 border border-brand-500/30 p-3 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none" style={{ left: `${Math.min(hoveredRegion.x / 8.5 + 4, 75)}%`, top: `${Math.min(hoveredRegion.y / 4.2 - 2, 70)}%` }}>
            <p className="text-xs font-bold text-white">{hoveredRegion.name}</p>
            <div className="mt-1 flex items-center justify-between gap-4">
              <span className="text-[10px] text-slate-500 font-semibold">Active Jobs:</span>
              <span className="text-sm font-extrabold text-brand-400">{hoveredRegion.count.toLocaleString()}</span>
            </div>
            <p className="text-[8px] text-slate-600 mt-1 italic">Density: {((hoveredRegion.count / 50000) * 100).toFixed(1)}% of USA sample</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 bg-slate-900/30 border border-slate-800/50 p-3 rounded-xl">
        <Info size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-slate-400 leading-normal">
          <b>How to read this:</b> The map illustrates tech hub nodes scaling visually based on database volume density. Hovering over a regional core reveals exact volumes matched against our 50,000+ job dataset.
        </p>
      </div>
    </div>
  );
}
