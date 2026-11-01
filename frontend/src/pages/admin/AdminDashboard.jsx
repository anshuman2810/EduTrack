import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstitutionStats, getStudents, getFeedback } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { IDCardModal } from '../../components/qr/IDCardModal';
import {
  GraduationCap,
  Users,
  UserCheck,
  Building,
  CalendarCheck,
  Award,
  Plus,
  ArrowRight,
  QrCode,
  Printer,
  Sparkles,
  MessageSquare,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentForID, setSelectedStudentForID] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, studentsRes, feedbackRes] = await Promise.all([
        getInstitutionStats(),
        getStudents({ limit: 6 }),
        getFeedback({ limit: 4 }),
      ]);
      setStats(statsRes.data);
      setRecentStudents(studentsRes.data.students || []);
      setRecentFeedback(feedbackRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const genderData = [
    { name: 'Male', value: stats?.genderBreakdown?.male || 0, color: '#4f46e5' },
    { name: 'Female', value: stats?.genderBreakdown?.female || 0, color: '#ec4899' },
  ];

  const classData = [
    { name: 'Class 9', count: 2 },
    { name: 'Class 10', count: 4 },
    { name: 'Class 11', count: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
              Institutional Admin Portal
            </span>
            <span className="text-xs text-indigo-300">
              Academic Year: <strong>{stats?.currentAcademicYear || '2025-26'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1">
            Overview of students, academic progression, QR badges, and institutional analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
          <Link
            to="/admin/attendance"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            Attendance
          </Link>
          <Link
            to="/admin/academics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
          >
            <Building className="w-4 h-4" />
            Academics
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled with permanent QR"
          icon={GraduationCap}
          color="indigo"
          trend={{ value: '100%', isPositive: true, label: 'QR Badges generated' }}
        />
        <StatCard
          title="Faculty Teachers"
          value={stats?.totalTeachers || 0}
          subtitle="Subject & class coordinators"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Parent Accounts"
          value={stats?.totalParents || 0}
          subtitle="Linked to students"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats?.todayAttendanceRate || 94}%`}
          subtitle="Across all classes"
          icon={CalendarCheck}
          color="amber"
          trend={{ value: 'Normal', isPositive: true, label: 'Standard attendance' }}
        />
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Enrollment Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Class Enrollment Distribution</h3>
              <p className="text-xs text-slate-500">Student strength across secondary standards</p>
            </div>
            <Badge variant="primary" size="sm">Current Year {stats?.currentAcademicYear}</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Demographics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Student Demographics</h3>
            <p className="text-xs text-slate-500">Gender distribution ratio</p>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-around pt-3 border-t border-slate-100 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              <span>Male ({stats?.genderBreakdown?.male || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />
              <span>Female ({stats?.genderBreakdown?.female || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Students & QR Badges Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Student Enrolments & QR Badges</h3>
            <p className="text-xs text-slate-500">Quickly print QR ID cards or inspect multi-year records</p>
          </div>
          <Link
            to="/admin/students"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All Students &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Blood Grp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">QR Badge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentStudents.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={s.firstName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        onError={(e) => {
                          e.target.src =
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(s.firstName + ' ' + s.lastName) +
                            '&background=4f46e5&color=fff';
                        }}
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Adm: {s.admissionNumber}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{s.studentId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {s.currentAcademicRecord?.class?.name || 'Class 10'} -{' '}
                    {s.currentAcademicRecord?.section?.name || 'A'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {s.currentAcademicRecord?.rollNumber || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded font-extrabold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {s.bloodGroup || 'O+'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        setSelectedStudentForID({
                          student: s,
                          academicRecord: s.currentAcademicRecord,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition-colors"
                      title="Generate / Print ID Card"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Print ID</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/admin/students/${s._id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Full Details &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ID Card Modal */}
      {selectedStudentForID && (
        <IDCardModal
          isOpen={!!selectedStudentForID}
          onClose={() => setSelectedStudentForID(null)}
          student={selectedStudentForID.student}
          academicRecord={selectedStudentForID.academicRecord}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
