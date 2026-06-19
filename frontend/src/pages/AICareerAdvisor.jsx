import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Brain, Sparkles, RefreshCw, Layers, Calendar, Compass, AlertCircle } from 'lucide-react';

export default function AICareerAdvisor() {
  const { token, user } = useAuth();
  
  // States
  const [advisorData, setAdvisorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchRecommendations = async (refresh = false) => {
    if (refresh) setGenerating(true);
    else setLoading(true);
    setError('');

    try {
      const url = `/api/career/recommendations${refresh ? '?refresh=true' : ''}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setAdvisorData(data);
      } else {
        setError(data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError('Connection to career advisor failed');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <RefreshCw className="text-brand-500 h-8 w-8 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Formulating AI Career Roadmap (Gemini Client)...</p>
        </div>
      </Layout>
    );
  }

  const recs = advisorData?.recommendations || {};
  const roadmap = advisorData?.roadmap_data || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              AI Career <span className="text-gradient-primary">Advisor</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Personalized career guidance, project roadmaps, and technical priorities powered by Google Gemini.
            </p>
          </div>

          <button
            onClick={() => fetchRecommendations(true)}
            disabled={generating}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
            {generating ? 'Regenerating...' : 'Regenerate Advisor Profile'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/40 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {advisorData ? (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Assessment */}
            <div className="glass-panel p-6 relative overflow-hidden group">
              {/* background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-all" />
              
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain size={16} className="text-brand-400 animate-pulse" />
                Executive Assessment Summary
              </h3>
              <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                {recs.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Month-by-month Timeline Roadmap (2 Cols) */}
              <div className="lg:col-span-2 border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-500" />
                  3-Month Structured Learning & Projects Roadmap
                </h3>

                <div className="relative border-l-2 border-slate-800 pl-6 ml-3 space-y-8">
                  {roadmap.map((step, idx) => (
                    <div key={idx} className="relative group">
                      {/* Circle Dot marker */}
                      <span className="absolute -left-[35px] top-0.5 flex items-center justify-center h-6 w-6 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-brand-400 group-hover:border-brand-500 transition-colors">
                        M{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {step.split(':')[0] || `Month ${idx + 1}`}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                          {step.split(':', 2)[1] || step}
                        </p>
                      </div>
                    </div>
                  ))}
                  {roadmap.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No structured roadmap compiled.</p>
                  )}
                </div>
              </div>

              {/* Technical Priorities & Strategy (1 Col) */}
              <div className="space-y-6">
                {/* Tech Priorities */}
                <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers size={16} className="text-teal-500" />
                    Skill Targets to Prioritize
                  </h3>
                  <div className="space-y-3">
                    {recs.learning_priorities?.map((prio, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Priority #{idx+1}</span>
                        <p className="text-slate-300 font-medium leading-relaxed">{prio}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Search advice */}
                <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Compass size={16} className="text-yellow-500" />
                    Job Tailoring Strategy
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-400 list-disc pl-4">
                    {recs.job_strategy?.map((strat, idx) => (
                      <li key={idx} className="leading-relaxed">{strat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Failed to initialize advisor recommendations.</p>
        )}
      </div>
    </Layout>
  );
}
