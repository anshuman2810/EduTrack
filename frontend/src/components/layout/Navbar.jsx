import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QRScannerModal } from '../qr/QRScannerModal';
import { QrCode, LogOut, User, Menu, Bell, School, Sparkles } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'parent':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 no-print">
        <div className="flex items-center justify-between">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
                <School className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                    EduTrack <span className="text-indigo-600">QR</span>
                  </span>
                  <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                    Pro
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">
                  Student & Academic Records System
                </p>
              </div>
            </div>
          </div>

          {/* Right: Scan QR button, Profile dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Scan QR Profile Button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan / Open QR</span>
              <span className="sm:hidden text-[11px]">Scan QR</span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                    {user?.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 rounded border mt-0.5 ${getRoleBadge(
                      user?.role
                    )}`}
                  >
                    {user?.role}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadge(
                          user?.role
                        )}`}
                      >
                        {user?.role} Portal
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-indigo-500" />
                      Lookup Student QR
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* QR Scanner / Lookup Modal */}
      <QRScannerModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
};

export default Navbar;
