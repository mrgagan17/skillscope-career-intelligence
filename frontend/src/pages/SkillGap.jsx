import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Activity, Briefcase, Award, CheckCircle, XCircle, ChevronRight, Play, DollarSign } from 'lucide-react';

export default function SkillGap() {
  const { user } = useAuth();
  
  // Input states
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [userSkills, setUserSkills] = useState('');
  const [roles, setRoles] = useState([]);
  
  // Results states
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Pre-fill fields from user profile on initial load
  useEffect(() => {
    if (user) {
      if (user.target_role) setTargetRole(user.target_role);
      if (user.user_skills) setUserSkills(user.user_skills.join(', '));
    }
  }, [user]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/career/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_role: targetRole,
          skills: userSkills
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      setError('Connection to analyzer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="border-b border-slate-900 pb-5">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Skill Gap <span className="text-gradient-primary">Analyzer</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Compare your current skill profiles against real-time market demands and calculate your readiness index.
          </p>
        </div>

        {/* Input Form Panel */}
        <div className="glass-panel p-6">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Desired Career Target Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 glass-input text-sm appearance-none bg-slate-900"
                  >
                    {roles.length > 0 ? (
                      roles.map(r => <option key={r} value={r}>{r}</option>)
                    ) : (
                      <option value="Data Analyst">Data Analyst</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Your Current Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="Python, SQL, Excel, Tableau, Communication"
                  value={userSkills}
                  onChange={(e) => setUserSkills(e.target.value)}
                  className="w-full px-4 py-3 glass-input text-sm"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-500">
                Data generated dynamically by scanning active listings in the local SQLite DB.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 glow-btn-primary flex items-center gap-2 text-sm font-semibold"
              >
                {loading ? 'Analyzing...' : 'Execute Analysis'}
                <Play size={14} className="fill-white" />
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/40 text-rose-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Results Block */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Readiness Index & Salary (1 Col) */}
            <div className="glass-panel p-6 flex flex-col justify-between items-center text-center">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Market Readiness Score
                </h3>
                <p className="text-[10px] text-slate-500">Target: {analysis.target_role}</p>
              </div>

              {/* Radial Progress Gauge */}
              <div className="relative w-40 h-40 flex items-center justify-center my-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="80" cy="80" r="70"
                    stroke={analysis.readiness_score > 75 ? "#10b981" : analysis.readiness_score > 40 ? "#6366f1" : "#f59e0b"}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={2 * Math.PI * 70 * (1 - analysis.readiness_score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{analysis.readiness_score}%</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wide uppercase mt-1">
                    {analysis.readiness_score > 75 ? "Highly Ready" : analysis.readiness_score > 40 ? "Competitive" : "Focus Needed"}
                  </span>
                </div>
              </div>

              {/* Salary benchmarks */}
              <div className="w-full pt-4 border-t border-slate-800 flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Market Average Salary</span>
                  <span className="text-lg font-black text-brand-400 mt-1 block flex items-center gap-0.5">
                    <DollarSign size={16} />
                    {analysis.avg_salary ? analysis.avg_salary.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    Base Benchmark
                  </span>
                </div>
              </div>
            </div>

            {/* In-Demand vs Missing matrix (2 Cols) */}
            <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Award size={16} className="text-brand-500" />
                  Target Skills Alignment Matrix
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Comparison against the top 10 most requested skills in the database for {analysis.target_role}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matched Skills */}
                  <div>
                    <h4 className="text-xs font-extrabold text-teal-400 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                      <CheckCircle size={14} />
                      Matched Skills ({analysis.market_skills.length - analysis.missing_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.market_skills
                        .filter(skill => !analysis.missing_skills.includes(skill))
                        .map(skill => (
                          <span key={skill} className="px-3 py-1 bg-teal-950/20 text-teal-300 border border-teal-900/60 rounded-lg text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      {analysis.market_skills.length === analysis.missing_skills.length && (
                        <span className="text-xs text-slate-500 italic">No skills matched yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                      <XCircle size={14} />
                      Missing Skills ({analysis.missing_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_skills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-rose-950/20 text-rose-300 border border-rose-900/60 rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                      {analysis.missing_skills.length === 0 && (
                        <span className="text-xs text-teal-400 font-bold italic">Perfect Match! You have all demanded skills.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action plan alert */}
              <div className="mt-6 p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping" />
                  <span className="text-slate-400">
                    Ready to build a learning roadmap to target missing skills?
                  </span>
                </div>
                <a href="/advisor" className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-0.5">
                  Launch Advisor
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
