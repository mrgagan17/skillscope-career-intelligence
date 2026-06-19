import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { FileDown, ClipboardList, Briefcase, DollarSign, Activity, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Reports() {
  const { token, user } = useAuth();
  
  // States
  const [downloading, setDownloading] = useState(false);
  const [reportStats, setReportStats] = useState(null);
  const [salarySummary, setSalarySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quick metrics for review summaries
  useEffect(() => {
    const fetchReportPreviews = async () => {
      try {
        const query = user?.target_role ? `?role=${encodeURIComponent(user.target_role)}` : '';
        const [gapRes, salRes] = await Promise.all([
          fetch(`/api/career/gap-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              target_role: user?.target_role || 'Data Analyst',
              skills: user?.user_skills || []
            })
          }),
          fetch(`/api/analytics/salaries${query}`)
        ]);

        if (gapRes.ok && salRes.ok) {
          const gapData = await gapRes.json();
          const salData = await salRes.json();
          setReportStats(gapData);
          setSalarySummary(salData.by_role || []);
        }
      } catch (err) {
        console.error("Failed to load report metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchReportPreviews();
    }
  }, [user]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/reports/download', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to build PDF report on server');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Setup download anchor
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SkillScope_${user?.target_role?.replace(' ', '_') || 'Career'}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <RefreshCw className="text-brand-500 h-8 w-8 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Assembling report previews (joining datasets)...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="border-b border-slate-900 pb-5">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Reports <span className="text-gradient-primary">Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Export comprehensive career intelligence dossiers, salary summaries, and detailed skill gaps to PDF.
          </p>
        </div>

        {/* PDF Download Card */}
        <div className="glass-panel p-6 border-brand-500/20 bg-gradient-to-br from-slate-900 via-slate-900/60 to-brand-950/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-all" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-brand-950/40 text-brand-400 border border-brand-900/50 font-extrabold tracking-wide uppercase">
                Enterprise Export
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <ClipboardList className="text-brand-500 h-5 w-5" />
                Comprehensive Career Intelligence & Market Alignment Report
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Includes your profile readiness scores, detailed skill gap matrix, average target salaries, AI Advisor 3-month roadmap, and custom resume upgrade critique in a publication-quality PDF.
              </p>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 disabled:opacity-50"
            >
              <FileDown size={18} />
              {downloading ? 'Building PDF Document...' : 'Download PDF Dossier'}
            </button>
          </div>
        </div>

        {/* Preview Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Gap Dossier Preview */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} className="text-teal-500" />
              Skill Gap Dossier Preview
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block">Target Career</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block flex items-center gap-1">
                    <Briefcase size={12} className="text-brand-400" />
                    {reportStats?.target_role}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block">Readiness Score</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-teal-400" />
                    {reportStats?.readiness_score}%
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Key Skills to Acquire</h4>
                <div className="flex flex-wrap gap-1.5">
                  {reportStats?.missing_skills?.map(skill => (
                    <span key={skill} className="px-2.5 py-0.5 bg-rose-950/20 text-rose-300 border border-rose-900/40 rounded-lg text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                  {reportStats?.missing_skills?.length === 0 && (
                    <span className="text-xs text-teal-400 italic font-bold">Perfect match!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Salary benchmarks table */}
          <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-indigo-500" />
              Market Salary Benchmarks Preview
            </h3>
            
            <div className="overflow-x-auto max-h-[160px] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3 text-right">Avg Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {salarySummary.slice(0, 4).map((row) => (
                    <tr key={row.role} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-300">{row.role}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-brand-400">
                        ${row.avg_salary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
