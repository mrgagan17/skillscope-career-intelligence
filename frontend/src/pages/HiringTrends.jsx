import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { LineChartWrapper, PieChartWrapper } from '../components/Charts';
import { TrendingUp, Activity, PieChart, Layers, Filter, RefreshCw } from 'lucide-react';

export default function HiringTrends() {
  const [trendsData, setTrendsData] = useState(null);
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

  const fetchHiringTrends = async () => {
    setRefreshing(true);
    try {
      const query = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : '';
      const res = await fetch(`/api/analytics/hiring${query}`);
      if (res.ok) {
        const data = await res.json();
        setTrendsData(data);
      }
    } catch (err) {
      console.error("Error fetching hiring trends:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHiringTrends();
  }, [selectedRole]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <RefreshCw className="text-brand-500 h-8 w-8 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Computing historical timeline distributions...</p>
        </div>
      </Layout>
    );
  }

  // MoM growth calculations
  const monthlyData = trendsData?.monthly_trends || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Hiring <span className="text-gradient-primary">Trends</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track hiring growth indexes, monthly volume distributions, and technology adoption rates.
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
              onClick={fetchHiringTrends}
              disabled={refreshing}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Monthly Volume Line Chart */}
        <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-brand-500" />
              Monthly Ingested Job Listings Volume
            </h3>
            <p className="text-xs text-slate-500">Total job postings recorded per calendar month</p>
          </div>
          {monthlyData.length > 0 ? (
            <LineChartWrapper data={monthlyData} xKey="month" yKey="job_count" name="Active Postings" color="#38bdf8" />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">No timeline data available.</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Industry breakdown */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
                <PieChart size={16} className="text-indigo-500" />
                Industry-wise Hiring Market Share
              </h3>
              <p className="text-xs text-slate-500">Distribution of jobs across primary economic sectors</p>
            </div>
            {trendsData?.industry_share ? (
              <PieChartWrapper data={trendsData.industry_share} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No sector logs.</div>
            )}
          </div>

          {/* Technology Adoption counts */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Layers size={16} className="text-teal-500" />
                Skill Categories Adoption Over Time
              </h3>
              <p className="text-xs text-slate-500">Monthly occurrences of general skill categories</p>
            </div>
            {trendsData?.tech_adoption?.length > 0 ? (
              <div className="w-full h-80">
                <LineChartWrapper 
                  data={trendsData.tech_adoption} 
                  xKey="month" 
                  yKey="Languages" 
                  name="Languages" 
                  color="#14b8a6" 
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No adoption logs.</div>
            )}
          </div>
        </div>

        {/* Growth Index table */}
        <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            Hiring Volume Growth Index (Month-over-Month Variance)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Calendar Month</th>
                  <th className="py-3 px-4">Jobs Listed</th>
                  <th className="py-3 px-4">Month-over-Month Variance</th>
                  <th className="py-3 px-4">Status Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {monthlyData.map((row, idx) => (
                  <tr key={row.month} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200">{row.month}</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.job_count.toLocaleString()}</td>
                    <td className={`py-3.5 px-4 font-bold ${
                      row.growth_rate > 0 ? 'text-teal-400' :
                      row.growth_rate < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {row.growth_rate > 0 ? `+${row.growth_rate}` : row.growth_rate}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.growth_rate > 2 ? 'bg-teal-950/40 text-teal-400 border border-teal-900/50' : 
                        row.growth_rate < -2 ? 'bg-rose-950/40 text-rose-400 border border-rose-900/50' : 
                        'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {row.growth_rate > 2 ? 'Expansion' : row.growth_rate < -2 ? 'Correction' : 'Stable'}
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
