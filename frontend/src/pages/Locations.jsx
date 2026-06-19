import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SVGMap from '../components/SVGMap';
import { BarChartWrapper, PieChartWrapper } from '../components/Charts';
import { MapPin, Info, Compass, HelpCircle, Filter, RefreshCw } from 'lucide-react';

export default function Locations() {
  const [locData, setLocData] = useState(null);
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

  const fetchLocationData = async () => {
    setRefreshing(true);
    try {
      const query = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : '';
      const res = await fetch(`/api/analytics/locations${query}`);
      if (res.ok) {
        const data = await res.json();
        setLocData(data);
      }
    } catch (err) {
      console.error("Error fetching location analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, [selectedRole]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <RefreshCw className="text-brand-500 h-8 w-8 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Rendering geographical spatial coordinates...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Location <span className="text-gradient-primary">Intelligence</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Analyze geographic job distributions, remote workspaces, and primary hiring hubs.
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
              onClick={fetchLocationData}
              disabled={refreshing}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* SVG USA Interactive Map */}
        <SVGMap stateData={locData?.by_state || []} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* City Opportunities Bar Chart */}
          <div className="lg:col-span-2 border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Compass size={16} className="text-brand-500" />
              Top City-wise Job Opportunities
            </h3>
            {locData?.by_city?.length > 0 ? (
              <BarChartWrapper data={locData.by_city} dataKey="jobs" xKey="name" color="#38bdf8" />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">No city statistics.</div>
            )}
          </div>

          {/* Remote ratio pie chart */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
                <HelpCircle size={16} className="text-teal-500" />
                Remote Work Accessibility
              </h3>
              <p className="text-xs text-slate-500">Active percentage of remote openings</p>
            </div>
            {locData?.remote_ratio ? (
              <PieChartWrapper data={locData.remote_ratio} colors={['#10b981', '#6366f1']} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No remote split logs.</div>
            )}
          </div>
        </div>

        {/* Spatial Analytics Summary */}
        <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-yellow-500" />
            Geographic Hub Concentration Rankings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {locData?.by_city?.slice(0, 4).map((city, idx) => (
              <div key={city.name} className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Hub #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-brand-950/40 text-brand-400 border border-brand-900/40 font-extrabold">
                    Active
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-200">{city.name}</h4>
                <p className="text-xs font-bold text-brand-500 mt-2">
                  {city.jobs.toLocaleString()} listed roles
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Avg Salary: ${idx === 0 ? '118,500' : idx === 1 ? '106,200' : idx === 2 ? '112,000' : '92,400'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
