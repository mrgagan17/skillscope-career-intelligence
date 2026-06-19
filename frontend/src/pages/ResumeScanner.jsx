import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Sparkles, AlertCircle, CheckCircle, ListChecks, History, ArrowRight } from 'lucide-react';

export default function ResumeScanner() {
  const { token, user } = useAuth();
  
  // States
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Load history
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/resume/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load upload logs:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setScanResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/resume/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setScanResult(data);
        fetchHistory(); // refresh log lists
      } else {
        setError(data.message || 'Scanning process failed');
      }
    } catch (err) {
      setError('Failed to connect to scanner service');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="border-b border-slate-900 pb-5">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Resume Skills <span className="text-gradient-primary">Scanner</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload your resume PDF/TXT. Our parser matches text against job listings to evaluate readiness and highlight structural upgrades.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/40 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Uploader Panel (1 Col) */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Upload size={16} className="text-brand-500" />
                Upload Resume
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Drag and drop card */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[180px]
                    ${dragActive ? 'border-brand-500 bg-brand-950/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950/25'}
                  `}
                >
                  <FileText className={`h-10 w-10 mb-3 ${file ? 'text-brand-400 animate-bounce' : 'text-slate-600'}`} />
                  {file ? (
                    <div>
                      <p className="text-xs font-bold text-slate-200 truncate max-w-[200px] mx-auto">{file.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Drag & drop your resume or click to browse</p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports PDF, TXT (Max 16MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-0 h-0"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer" />
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full py-3 glow-btn-primary flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Processing Resume...' : 'Analyze Resume'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal mt-6">
              <b>Note:</b> Your resume is parsed in memory. Extracted skills are compared against top indicators matching your profile target role: <b>{user?.target_role || "Data Analyst"}</b>.
            </p>
          </div>

          {/* Results Panel (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {scanResult ? (
              <div className="glass-panel p-6 space-y-6 animate-fade-in">
                {/* Score section */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                      Analysis Results for: {scanResult.filename}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Target: {scanResult.target_role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-400">{scanResult.match_score}%</span>
                    <span className="text-[8px] font-bold text-slate-500 block">Market Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Extracted skills */}
                  <div>
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle size={14} />
                      Extracted Skills ({scanResult.extracted_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.extracted_skills.map(skill => (
                        <span key={skill} className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs">
                          {skill}
                        </span>
                      ))}
                      {scanResult.extracted_skills.length === 0 && (
                        <span className="text-xs text-slate-500 italic">No matching keywords parsed.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing skills */}
                  <div>
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Market Skill Gaps ({scanResult.missing_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.missing_skills.map(skill => (
                        <span key={skill} className="px-2.5 py-0.5 bg-rose-950/20 text-rose-300 border border-rose-900/60 rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                      {scanResult.missing_skills.length === 0 && (
                        <span className="text-xs text-teal-400 font-bold italic">Perfect Match! No gaps found.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Recruiter Critique */}
                <div className="pt-4 border-t border-slate-900 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      AI Recruiter Assessment
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/30 p-3 border border-slate-800/80 rounded-xl">
                      {scanResult.review.critique}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-xl">
                      <h5 className="font-bold text-slate-300 mb-2">Formatting & Structure Upgrade</h5>
                      <ul className="space-y-1.5 text-slate-400 list-disc pl-4">
                        {scanResult.review.formatting_tips?.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-xl">
                      <h5 className="font-bold text-slate-300 mb-2">Content Action Bullet upgrades</h5>
                      <ul className="space-y-1.5 text-slate-400 list-disc pl-4">
                        {scanResult.review.actionable_upgrades?.map((up, idx) => (
                          <li key={idx}>{up}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 text-center text-slate-500 h-64 flex flex-col items-center justify-center">
                <ListChecks className="h-10 w-10 text-slate-700 mb-2" />
                <p className="text-xs">No active scan loaded. Upload a file on the left to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Scan History logs */}
        <div className="border border-slate-800 bg-slate-950/20 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <History size={16} className="text-indigo-500" />
            Previous Upload Scans Log
          </h3>
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Filename</th>
                    <th className="py-2.5 px-4">Target Role</th>
                    <th className="py-2.5 px-4">Skills Extracted</th>
                    <th className="py-2.5 px-4">Readiness Match</th>
                    <th className="py-2.5 px-4">Uploaded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-300">{h.filename}</td>
                      <td className="py-3 px-4 text-slate-400">{user?.target_role || "Data Analyst"}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">
                        {h.extracted_skills.join(', ') || 'None'}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-400">{h.match_score}%</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(h.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center italic py-4">No previous resume uploads found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
