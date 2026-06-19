import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { AreaChartWrapper, BarChartWrapper, ScatterChartWrapper } from '../components/Charts';
import { DollarSign, BarChart2, Briefcase, MapPin, TrendingUp, Filter, RefreshCw } from 'lucide-react';

export default function Salary() {
  const [salaryData, setSalaryData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch role options
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/analytics/roles');
        if (res.ok) {
          const data = await res.json();
          setRoles(data);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, []);

  const fetchSalaryStats = async () => {
    setRefreshing(true);
    try {
      const query = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : '';
      const res = await fetch(`/api/analytics/salaries${query}`);
      if (res.ok) {
        const data = await res.json();
        setSalaryData(data);
      }
    } catch (err) {
      console.error("Error fetching salary analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSalaryStats();
  }, [selectedRole]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <RefreshCw className="text-brand-500 h-8 w-8 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Analyzing salary parameters (histogram binning)...</p>
        </div>
      </Layout>
    );
  }

  // Pre-process bar data for locations
  const barLocData = salaryData?.by_location?.slice(0, 8) || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Salary <span className="text-gradient-primary">Analytics</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Explore distributions, highest paying categories, locations, and experience modifiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Job Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={fetchSalaryStats}
              disabled={refreshing}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Salary Distribution Histogram */}
        <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} className="text-brand-500" />
              Base Salary Midpoint Distribution (Histogram)
            </h3>
            <p className="text-xs text-slate-500">Number of jobs in each salary bracket</p>
          </div>
          {salaryData?.distribution?.length > 0 ? (
            <AreaChartWrapper data={salaryData.distribution} xKey="range" yKey="jobs" name="Listings" color="#a855f7" />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">No records found.</div>
          )}
        </div>

        {/* Two column visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Highest Paying roles */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase size={16} className="text-teal-500" />
              Role Salary Benchmark Rankings
            </h3>
            <div className="space-y-4">
              {salaryData?.by_role?.map((role, idx) => (
                <div key={role.role} className="p-3.5 bg-slate-900/30 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 w-5">#{idx + 1}</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-200">{role.role}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Range: ${role.min_salary.toLocaleString()} - ${role.max_salary.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-400">${role.avg_salary.toLocaleString()}</span>
                    <span className="text-[8px] font-bold text-slate-500 block">Weighted Avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average Salary by Location */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-500" />
                Average Salary by Geographic Location (Top Hubs)
              </h3>
              <p className="text-xs text-slate-500">Average base salaries for top cities</p>
            </div>
            <div className="mt-4">
              {barLocData.length > 0 ? (
                <BarChartWrapper data={barLocData} dataKey="avg_salary" xKey="location" color="#10b981" />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No records.</div>
              )}
            </div>
          </div>
        </div>

        {/* Experience vs Salary and Scatter Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scatter Chart (2 cols) */}
          <div className="lg:col-span-2 border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
              <BarChart2 size={16} className="text-purple-500" />
              Experience Level Salary Scatter Distribution (Random Sample)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Correlation check: base salary midpoint vs listing entries</p>
            {salaryData?.scatter_data?.length > 0 ? (
              <ScatterChartWrapper data={salaryData.scatter_data} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No scatter coordinates.</div>
            )}
          </div>

          {/* Experience metrics (1 col) */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-yellow-500" />
                Experience Multipliers
              </h3>
              <div className="space-y-4">
                {salaryData?.experience?.map((exp) => (
                  <div key={exp.level} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-200">{exp.level}</span>
                      <span className="text-sm font-extrabold text-brand-400">${exp.avg_salary.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      {/* Visual bar sizing */}
                      <div 
                        className="bg-brand-500 h-full rounded-full" 
                        style={{ width: `${(exp.avg_salary / 190000) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1.5">
                      <span>Min: ${exp.min_salary.toLocaleString()}</span>
                      <span>Max: ${exp.max_salary.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal mt-4 italic">
              * Note: base salaries are calculated from base roles, scaled programmatically by experience factors (Entry: 0.8x, Mid: 1.0x, Senior: 1.45x).
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
