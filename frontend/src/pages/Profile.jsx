import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, Mail, Key, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  
  // States
  const [username, setUsername] = useState(user?.username || '');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Data Analyst');
  const [skills, setSkills] = useState(user?.user_skills?.join(', ') || '');
  const [password, setPassword] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    'Data Analyst', 'Data Scientist', 'Business Analyst', 
    'Python Developer', 'AI Engineer', 'Full Stack Developer', 
    'DevOps Engineer', 'Data Engineer'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    if (!username) {
      setError('Username cannot be empty');
      return;
    }

    setSubmitting(true);
    // Convert skills string back to clean array representation
    const skillsList = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const updatePayload = {
      username,
      target_role: targetRole,
      user_skills: skillsList
    };

    if (password) {
      updatePayload.password = password;
    }

    const result = await updateProfile(updatePayload);
    setSubmitting(false);

    if (result.success) {
      setSuccess('Profile updated successfully');
      setPassword(''); // clear password box
    } else {
      setError(result.message || 'Profile update failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="border-b border-slate-900 pb-5">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Profile <span className="text-gradient-primary">Settings</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal credentials, target role settings, and active tech stacks.
          </p>
        </div>

        {success && (
          <div className="p-4 bg-teal-950/40 border border-teal-800/40 text-teal-400 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/40 text-rose-400 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Form */}
        <div className="glass-panel p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 glass-input text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Target Career Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 glass-input text-sm appearance-none bg-slate-900"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 glass-input text-sm opacity-50 cursor-not-allowed bg-slate-950/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Skills (Comma Separated)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Python, SQL, Excel, Git"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass-input text-sm"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Edit your list of skills. This updates your base readiness score calculation.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-900">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Change Password (Leave blank to keep current)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass-input text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 glow-btn-primary flex items-center gap-2 text-sm font-semibold"
              >
                <Save size={16} />
                {submitting ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
