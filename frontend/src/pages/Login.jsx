import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRScannerModal } from '../components/qr/QRScannerModal';
import {
  School,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  QrCode,
  UserCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'parent') navigate('/parent/dashboard');
      else navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'parent') navigate('/parent/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main card container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 mb-3">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            EduTrack <span className="text-indigo-400">QR</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Student Management & Academic Records Portal
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Public QR Scanner Shortcut */}
          <div className="mt-5 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setShowQRScanner(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-700/60 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-xl border border-slate-600/60 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Student QR / Public Profile Lookup</span>
            </button>
          </div>

          {/* Fast Demo Logins Section */}
          <div className="mt-5 pt-4 border-t border-slate-700/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              1-Click Demo Accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@edutrack.com', 'Admin@123')}
                className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/50 hover:bg-purple-900/50 text-left transition-all group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Admin
                </span>
                <span className="block text-xs font-bold text-white group-hover:text-purple-200 truncate">
                  Principal
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@edutrack.com', 'Teacher@123')}
                className="p-2 rounded-xl bg-blue-950/40 border border-blue-800/50 hover:bg-blue-900/50 text-left transition-all group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Teacher
                </span>
                <span className="block text-xs font-bold text-white group-hover:text-blue-200 truncate">
                  Prof. Rajesh
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('parent@edutrack.com', 'Parent@123')}
                className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 text-left transition-all group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Parent
                </span>
                <span className="block text-xs font-bold text-white group-hover:text-emerald-200 truncate">
                  Vikram Roy
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Permanent Student QR Code Academic Identity System
        </p>
      </div>

      <QRScannerModal isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} />
    </div>
  );
};

export default Login;
