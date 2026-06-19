import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import { BarChartWrapper, PieChartWrapper } from '../components/Charts';
import { 
  Database, 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Briefcase, 
  Filter, 
  RefreshCw,
  Search,
  Users
} from 'lucide-react';

export default function Dashboard() {
  const { user, token } = useAuth();
  
  // States
  const [overview, setOverview] = useState(null);
  const [skillsData, setSkillsData] = useState([]);
  const [locationData, setLocationData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch roles list
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

  // Fetch Dashboard Stats (incorporates selectedRole filter)
  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const query = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : '';
      
      const [overviewRes, skillsRes, locRes] = await Promise.all([
        fetch(`/api/analytics/overview${query}`),
        fetch(`/api/analytics/skills${query}`),
        fetch(`/api/analytics/locations${query}`)
      ]);

      if (overviewRes.ok && skillsRes.ok && locRes.ok) {
        const overviewVal = await overviewRes.json();
        const skillsVal = await skillsRes.json();
        const locVal = await locRes.json();
        
        setOverview(overviewVal);
        setSkillsData(skillsVal.top_skills ? skillsVal.top_skills.slice(0, 8) : []);
        setLocationData(locVal);
      }
    } catch (err) {
      console.error("Error fetching analytics metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedRole]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <RefreshCw className="text-brand-500 h-8 w-8 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Analyzing job market dataset (50,000+ records)...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Dashboard Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              SkillScope AI <span className="text-gradient-primary">Workspace</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Explore dynamic hiring distributions, salaries, and key technology requirements.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Career Profiles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
              title="Refresh Analytics Cache"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Dashboard KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard
            title="Jobs Analysed"
            value={overview?.total_jobs?.toLocaleString() || "0"}
            icon={Database}
            change="Live Feed"
            subtext="Cleaned ETL entries"
          />
          <DashboardCard
            title="Skills Catalogued"
            value={overview?.total_skills?.toLocaleString() || "0"}
            icon={Cpu}
            change="+100% cover"
            trend="up"
            subtext="Keywords catalogued"
          />
          <DashboardCard
            title="Average Salary"
            value={overview?.avg_salary ? `$${(overview.avg_salary / 1000).toFixed(1)}k` : "$0.0k"}
            icon={DollarSign}
            change="Base Market"
            subtext="Weighted midpoint"
          />
          <DashboardCard
            title="Top Demand Skill"
            value={overview?.top_skill || "N/A"}
            icon={Award}
            change="Highest Freq"
            trend="up"
            subtext="Highest listing match"
          />
          <DashboardCard
            title="Fastest Growing"
            value={overview?.fastest_growing_role || "N/A"}
            icon={TrendingUp}
            change="Growth Index"
            trend="up"
            subtext="Highest demand rate"
          />
        </div>

        {/* Dashboards Charts visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 8 skills bar chart */}
          <div className="lg:col-span-2 border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
              Top requested technology skills for {selectedRole || "all profiles"}
            </h3>
            {skillsData.length > 0 ? (
              <BarChartWrapper data={skillsData} dataKey="count" xKey="name" color="#0ea5e9" />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                No skill metrics available.
              </div>
            )}
          </div>

          {/* Remote vs Onsite Pie chart */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
                Work environment distribution
              </h3>
              <p className="text-xs text-slate-500">Ratio of Remote vs Onsite/Hybrid jobs</p>
            </div>
            {locationData?.remote_ratio ? (
              <PieChartWrapper data={locationData.remote_ratio} colors={['#10b981', '#6366f1']} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                No remote data loaded.
              </div>
            )}
          </div>
        </div>

        {/* Custom Data Analyst portfolio showcase */}
        <div className="border border-slate-800/80 bg-slate-900/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
            Quick Platform Navigation Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <h4 className="font-semibold text-brand-400 mb-1">Analyze Skills</h4>
              <p className="text-slate-400 leading-relaxed">
                Head to the <b>Skills Analyzer</b> in the sidebar to view top 20 requested skills, growth, emerging tech, and trends.
              </p>
            </div>
            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <h4 className="font-semibold text-brand-400 mb-1">Analyze Salaries</h4>
              <p className="text-slate-400 leading-relaxed">
                Click <b>Salary Analytics</b> to evaluate histograms, average salaries by roles, and experience vs salary trends.
              </p>
            </div>
            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <h4 className="font-semibold text-brand-400 mb-1">Verify Readiness</h4>
              <p className="text-slate-400 leading-relaxed">
                Test your alignment using the <b>Skill Gap Matrix</b> or upload your resume PDF to the <b>Resume Scanner</b>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
