import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  MessageSquare,
  Building,
  UserCheck,
  ClipboardList,
  FileSpreadsheet,
  QrCode,
  Shield,
  Layers,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview Dashboard' },
    { to: '/admin/students', icon: GraduationCap, label: 'Students & QR Cards' },
    { to: '/admin/academics', icon: Layers, label: 'Academics & Structure' },
    { to: '/admin/teachers', icon: Users, label: 'Teacher Management' },
    { to: '/admin/parents', icon: UserCheck, label: 'Parent Accounts' },
    { to: '/admin/attendance', icon: CalendarCheck, label: 'Daily Attendance' },
    { to: '/admin/exams', icon: Award, label: 'Exams & Scorecards' },
    { to: '/admin/feedback', icon: MessageSquare, label: 'Parent Feedback' },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Teacher Dashboard' },
    { to: '/teacher/students', icon: GraduationCap, label: 'Assigned Students' },
    { to: '/teacher/attendance', icon: CalendarCheck, label: 'Mark Attendance' },
    { to: '/teacher/marks', icon: FileSpreadsheet, label: 'Grade & Enter Marks' },
    { to: '/teacher/exams', icon: ClipboardList, label: 'Tests & Exams' },
    { to: '/teacher/feedback', icon: MessageSquare, label: 'Parent Inquiries' },
  ];

  const parentLinks = [
    { to: '/parent/dashboard', icon: LayoutDashboard, label: 'Parent Dashboard' },
    { to: '/parent/report', icon: Award, label: 'Academic & Grade Report' },
    { to: '/parent/feedback', icon: MessageSquare, label: 'Teacher Feedback' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : parentLinks;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden no-print transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-250 ease-in-out lg:translate-x-0 lg:static lg:z-auto no-print shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              EQ
            </div>
            <div>
              <h2 className="font-bold text-white text-sm tracking-wide">EduTrack QR</h2>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise SIS Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-400 px-2 py-0.5 rounded border border-slate-700">
              {role}
            </span>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
              <QrCode className="w-3.5 h-3.5" />
              <span>Permanent QR Tech</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every student maintains an invariant QR badge throughout all academic years.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
