import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentById, getFeedback } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge, GradeBadge, StatusBadge } from '../../components/common/Badge';
import { IDCardModal } from '../../components/qr/IDCardModal';
import {
  GraduationCap,
  Award,
  Clock,
  BookOpen,
  MessageSquare,
  QrCode,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  User,
  Plus,
} from 'lucide-react';

export const ParentDashboard = () => {
  const { user } = useAuth();
  const linkedStudents = user?.students || [];

  const [selectedStudentId, setSelectedStudentId] = useState(
    linkedStudents[0]?._id || linkedStudents[0] || ''
  );
  const [studentData, setStudentData] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIDModal, setShowIDModal] = useState(false);

  useEffect(() => {
    if (selectedStudentId) {
      loadChildData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadChildData = async (stuId) => {
    try {
      setLoading(true);
      const [stuRes, fbRes] = await Promise.all([
        getStudentById(stuId),
        getFeedback({ studentId: stuId }),
      ]);
      setStudentData(stuRes.data);
      setFeedbackList(fbRes.data || []);
    } catch (e) {
      console.error('Error loading child data:', e);
    } finally {
      setLoading(false);
    }
  };

  const student = studentData?.student;
  const currentRecord = studentData?.currentRecord;
  const attendanceStats = studentData?.attendanceStats || { percentage: 100, present: 0, total: 0 };
  const marks = studentData?.marks || [];

  // Calculate overall percentage
  let totalObtained = 0;
  let totalMax = 0;
  marks.forEach((m) => {
    totalObtained += m.marksObtained;
    totalMax += m.maxMarks;
  });
  const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;
  let overallGrade = 'A';
  if (overallPct >= 90) overallGrade = 'A+';
  else if (overallPct >= 80) overallGrade = 'A';
  else if (overallPct >= 70) overallGrade = 'B+';
  else if (overallPct >= 60) overallGrade = 'B';
  else if (overallPct >= 50) overallGrade = 'C';
  else if (overallPct > 0) overallGrade = 'D';

  return (
    <div className="space-y-6">
      {/* Top Banner with Child Selector if multiple children */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
              Parent Portal
            </span>
            <span className="text-xs text-emerald-200">
              Welcome, {user?.name} ({user?.relationship || 'Parent'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Performance & QR Records
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1">
            Monitor real-time attendance, test marks, report cards, and faculty communications.
          </p>
        </div>

        {/* Child Switcher buttons if multiple */}
        {linkedStudents.length > 1 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-xs text-emerald-200 font-bold px-2">Switch Child:</span>
            {linkedStudents.map((child) => {
              const isSelected = (child._id || child) === selectedStudentId;
              return (
                <button
                  key={child._id || child}
                  type="button"
                  onClick={() => setSelectedStudentId(child._id || child)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {child.firstName || 'Child'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading || !student ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          Loading student academic scorecard...
        </div>
      ) : (
        <>
          {/* Child Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <img
                  src={
                    student.photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      student.firstName + ' ' + student.lastName
                    )}&background=059669&color=fff`
                  }
                  alt={student.firstName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-2xl font-extrabold text-slate-900">
                      {student.firstName} {student.lastName}
                    </h2>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <p className="text-xs font-bold text-indigo-700 mt-0.5">
                    Student ID: {student.studentId} • Admission No: {student.admissionNumber}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Class: <strong>{currentRecord?.class?.name}</strong> • Section:{' '}
                    <strong>{currentRecord?.section?.name}</strong> • Roll No:{' '}
                    <strong className="font-mono">{currentRecord?.rollNumber || 'N/A'}</strong>
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setShowIDModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print ID Card
                </button>

                <a
                  href={`/verify/${student.qrToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  Dynamic QR Profile
                </a>

                <Link
                  to="/parent/report"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <Award className="w-4 h-4" />
                  Full Report Card
                </Link>
              </div>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Attendance Rate"
              value={`${attendanceStats.percentage}%`}
              subtitle={`${attendanceStats.present} present out of ${attendanceStats.total} days`}
              icon={Clock}
              color="emerald"
            />
            <StatCard
              title="Overall Academic Score"
              value={`${overallPct}%`}
              subtitle={`Grade ${overallGrade} across all exams`}
              icon={Award}
              color="indigo"
            />
            <StatCard
              title="Enrolled Subjects"
              value={currentRecord?.subjects?.length || 5}
              subtitle="Active curriculum"
              icon={BookOpen}
              color="purple"
            />
            <StatCard
              title="Teacher Feedback"
              value={feedbackList.length}
              subtitle="Feedback threads active"
              icon={MessageSquare}
              color="amber"
            />
          </div>

          {/* Recent Exam Marks & Subjects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Exam Marks */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-800">Recent Examination Results</h3>
                </div>
                <Link
                  to="/parent/report"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Complete Report Card &rarr;
                </Link>
              </div>

              {marks && marks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3">Examination</th>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3 text-center">Score</th>
                        <th className="py-2.5 px-3 text-center">Grade</th>
                        <th className="py-2.5 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marks.slice(0, 5).map((m) => (
                        <tr key={m._id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-slate-900">{m.exam?.name}</td>
                          <td className="py-3 px-3 font-semibold text-slate-700">{m.subject?.name}</td>
                          <td className="py-3 px-3 text-center font-bold text-indigo-700">
                            {m.marksObtained} / {m.maxMarks} ({m.percentage}%)
                          </td>
                          <td className="py-3 px-3 text-center">
                            <GradeBadge grade={m.grade} />
                          </td>
                          <td className="py-3 px-3 italic text-slate-600 truncate max-w-[150px]">
                            {m.remarks || 'Satisfactory'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No examination marks recorded yet.
                </p>
              )}
            </div>

            {/* Teacher Feedback Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-slate-800">Teacher Communications</h3>
                <Link
                  to="/parent/feedback"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Send Feedback &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {feedbackList.length > 0 ? (
                  feedbackList.slice(0, 3).map((fb) => (
                    <div key={fb._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">To: {fb.teacher?.name}</span>
                        <StatusBadge status={fb.status} />
                      </div>
                      <p className="text-slate-600 italic">"{fb.message}"</p>
                      {fb.reply && (
                        <p className="text-indigo-900 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100 font-medium">
                          <strong>Teacher's Reply:</strong> {fb.reply}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-400">No feedback submitted yet.</p>
                    <Link
                      to="/parent/feedback"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600"
                    >
                      <Plus className="w-3.5 h-3.5" /> Submit First Feedback
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ID Card Modal */}
      {showIDModal && student && (
        <IDCardModal
          isOpen={showIDModal}
          onClose={() => setShowIDModal(false)}
          student={student}
          academicRecord={currentRecord}
        />
      )}
    </div>
  );
};

export default ParentDashboard;
