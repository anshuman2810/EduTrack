import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudents, getExams, getFeedback } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge, StatusBadge } from '../../components/common/Badge';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  UserCheck,
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const [sRes, eRes, fRes] = await Promise.all([
        getStudents({ limit: 8 }),
        getExams(),
        getFeedback({ limit: 5 }),
      ]);
      setStudents(sRes.data.students || []);
      setExams(eRes.data || []);
      setFeedback(fRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const assignedClasses = user?.assignedClasses || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
              Teacher Faculty Portal
            </span>
            <span className="text-xs text-blue-200">{user?.employeeId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            {user?.designation || 'Head of Mathematics'} • {user?.qualification}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/teacher/attendance"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            Mark Attendance
          </Link>
          <Link
            to="/teacher/marks"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Enter Exam Marks
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Classes"
          value={assignedClasses.length || 2}
          subtitle="Active divisions"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Supervised Students"
          value={students.length || 5}
          subtitle="Permanent QR Profiles"
          icon={GraduationCap}
          color="purple"
        />
        <StatCard
          title="Active Tests & Exams"
          value={exams.length}
          subtitle="Assessments created"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Parent Inquiries"
          value={feedback.length}
          subtitle="Communications received"
          icon={MessageSquare}
          color="amber"
        />
      </div>

      {/* Assigned Classes Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">My Assigned Teaching Roster</h3>
          </div>
          <span className="text-xs text-slate-500">Current Academic Year</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {assignedClasses.map((ac, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {ac.class?.name || 'Class 10'} ({ac.section?.name || 'Sec A'})
                </h4>
                <Badge variant="primary" size="sm">{ac.subject?.code || 'SUB'}</Badge>
              </div>
              <p className="text-xs text-indigo-700 font-semibold">{ac.subject?.name || 'Subject'}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500">Standard secondary</span>
                <Link
                  to="/teacher/attendance"
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Register &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Students & Parent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students quick table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-slate-800">My Students</h3>
            <Link
              to="/teacher/students"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View Full Directory &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {students.slice(0, 5).map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      s.photo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        s.firstName + ' ' + s.lastName
                      )}&background=4f46e5&color=fff`
                    }
                    alt={s.firstName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {s.firstName} {s.lastName}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      ID: {s.studentId} • Roll: {s.currentAcademicRecord?.rollNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/verify/${s.qrToken}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                    title="View Dynamic QR Profile"
                  >
                    <QrCode className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parent Communications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-slate-800">Parent Feedback & Inquiries</h3>
            <Link
              to="/teacher/feedback"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View All Inquiries &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {feedback.length > 0 ? (
              feedback.slice(0, 3).map((fb) => (
                <div key={fb._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{fb.parent?.name}</span>
                    <StatusBadge status={fb.status} />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">"{fb.message}"</p>
                  <p className="text-[10px] text-slate-400">
                    Regarding: {fb.student?.firstName} {fb.student?.lastName}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No pending inquiries.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
