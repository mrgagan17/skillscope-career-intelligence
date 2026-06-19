import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { BarChartWrapper, PieChartWrapper, LineChartWrapper } from '../components/Charts';
import { Layers, HelpCircle, Activity, Sparkles, Filter, RefreshCw } from 'lucide-react';

export default function Skills() {
  const [skillsData, setSkillsData] = useState(null);
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

  const fetchSkillsStats = async () => {
    setRefreshing(true);
    try {
      const query = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : '';
      const res = await fetch(`/api/analytics/skills${query}`);
      if (res.ok) {
        const data = await res.json();
        setSkillsData(data);
      }
    } catch (err) {
      console.error("Error fetching skills analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSkillsStats();
  }, [selectedRole]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <RefreshCw className="text-brand-500 h-8 w-8 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Computing skill associations (Pandas aggregation)...</p>
        </div>
      </Layout>
    );
  }

  // Convert categories count data to display names
  const pieData = skillsData?.categories || [];

  // Trend data labels
  const trendData = skillsData?.trends || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Skills <span className="text-gradient-primary">Demand Analysis</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Deep dive into key skills, growth factors, and emerging technical benchmarks.
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
              onClick={fetchSkillsStats}
              disabled={refreshing}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Top 20 bar chart */}
        <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers size={16} className="text-brand-500" />
            Top 20 Requested Skills & Technologies
          </h3>
          {skillsData?.top_skills?.length > 0 ? (
            <BarChartWrapper data={skillsData.top_skills} dataKey="count" xKey="name" color="#0ea5e9" />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">No skill mappings returned.</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Pie */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
                <HelpCircle size={16} className="text-teal-500" />
                Skill Classification Breakdown
              </h3>
              <p className="text-xs text-slate-500">Proportional representation of skill segments</p>
            </div>
            {pieData.length > 0 ? (
              <PieChartWrapper data={pieData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No classification logs.</div>
            )}
          </div>

          {/* Monthly trend timeline for top 5 skills */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" />
                Top 5 Skills Demand Timelines
              </h3>
              <p className="text-xs text-slate-500">Monthly trend counts across the database</p>
            </div>
            {trendData.length > 0 ? (
              <div className="w-full h-80">
                <LineChartWrapper 
                  data={trendData} 
                  xKey="month" 
                  yKey={Object.keys(trendData[0]).filter(k => k !== 'month')[0]} 
                  name={Object.keys(trendData[0]).filter(k => k !== 'month')[0]} 
                  color="#6366f1" 
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No trend records.</div>
            )}
          </div>
        </div>

        {/* Emerging technologies showcase */}
        <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-500 animate-bounce" />
            Fastest Emerging Technologies (Last 9 Months Growth)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Technology Name</th>
                  <th className="py-3 px-4">Growth Index</th>
                  <th className="py-3 px-4">Active Database Listings</th>
                  <th className="py-3 px-4">Market Outlook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {skillsData?.emerging_tech?.map((tech, idx) => (
                  <tr key={tech.name} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200">{tech.name}</td>
                    <td className="py-3.5 px-4 font-bold text-teal-400">+{tech.growth}%</td>
                    <td className="py-3.5 px-4 text-slate-400">{tech.current_demand.toLocaleString()} listings</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        idx === 0 ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50' : 
                        tech.growth > 150 ? 'bg-teal-950/40 text-teal-400 border border-teal-900/50' : 
                        'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {idx === 0 ? '★ Top Disrupter' : tech.growth > 150 ? 'High Momentum' : 'Rising'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
