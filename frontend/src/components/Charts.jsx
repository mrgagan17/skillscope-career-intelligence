import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts';

// Custom Tooltip Styling for consistent dark theme appearance
const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. BAR CHART WRAPPER (Top Skills, Cities, Roles)
export const BarChartWrapper = ({ data, dataKey, xKey, color = '#0ea5e9' }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. LINE CHART WRAPPER (Monthly Hiring Timelines)
export const LineChartWrapper = ({ data, xKey, yKey, name = 'Jobs', color = '#10b981' }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            name={name}
            stroke={color} 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 1 }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. AREA CHART WRAPPER (Salary Distributions, Growth Bins)
export const AreaChartWrapper = ({ data, xKey, yKey, name = 'Count', color = '#6366f1' }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey={yKey} 
            name={name}
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorArea)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. PIE CHART WRAPPER (Skill breakdown, Remote ratios)
export const PieChartWrapper = ({ data, colors = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#14b8a6'] }) => {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-400 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 5. SCATTER PLOT WRAPPER (Experience vs Salaries)
export const ScatterChartWrapper = ({ data, xKey = 'id', yKey = 'salary', name = 'Job Listing' }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey={xKey} 
            name="Sample ID" 
            stroke="#94a3b8" 
            fontSize={10} 
            tick={false}
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            type="number" 
            dataKey={yKey} 
            name="Salary" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} 
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const info = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-xs font-bold text-brand-400">{info.title}</p>
                    <p className="text-sm font-extrabold text-white mt-1">Salary: ${info.salary.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">Exp Level: {info.experience}</p>
                    <p className="text-xs text-slate-400">Sector: {info.industry}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name={name} data={data} fill="#a855f7" opacity={0.65} line={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
