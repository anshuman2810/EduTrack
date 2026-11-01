import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyQRCode } from '../../services/api';
import { Badge, GradeBadge, StatusBadge } from '../../components/common/Badge';
import { IDCardModal } from '../../components/qr/IDCardModal';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Calendar,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Printer,
  ChevronDown,
  Sparkles,
  School,
  ArrowLeft,
  Share2,
  ExternalLink,
} from 'lucide-react';

export const PublicStudentProfile = () => {
  const { qrToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [showIDCardModal, setShowIDCardModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchProfile(qrToken, selectedYearId);
  }, [qrToken, selectedYearId]);

  const fetchProfile = async (token, yearId) => {
    try {
      setLoading(true);
      setError('');
      const res = await verifyQRCode(token, yearId);
      setData(res.data);
      if (!yearId && res.data.selectedAcademicRecord?.academicYear?._id) {
        setSelectedYearId(res.data.selectedAcademicRecord.academicYear._id);
      }
    } catch (err) {
      console.error('Error verifying QR:', err);
      setError(
        err.response?.data?.message || 'Invalid or expired student QR code. Record not found.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Verifying Institutional Student Record...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Verification Failed</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Portal Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { student, availableAcademicYears, selectedAcademicRecord, attendanceSummary, examMarks, performance } = data;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      {/* Top Institutional Verification Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-20 shadow-md no-print">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white block">
                Delhi Public Academy
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block">
                Official Student Verification Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Record Verified</span>
            </div>

            <button
              onClick={handleShare}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => setShowIDCardModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print ID Card</span>
              <span className="sm:hidden">Badge</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 mt-4 sm:mt-6 space-y-5 sm:space-y-6">
        {/* Verification Banner with Responsive Wrap */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-slate-900">
                  Dynamic Student Academic Record
                </h1>
                <Badge variant="success" size="sm">Verified Active</Badge>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                Permanent QR: <span className="font-mono text-indigo-700 font-bold">{student.qrToken}</span>
              </p>
            </div>
          </div>

          {/* Academic Year Selector Dropdown */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-between sm:justify-start">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              Year:
            </label>
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-3 pr-8 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                {availableAcademicYears?.map((yr) => (
                  <option key={yr.academicYearId} value={yr.academicYearId}>
                    {yr.academicYearName} {yr.isCurrent ? '★ (Current)' : '(Archived)'}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-600 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Student Primary Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-5 sm:gap-6 items-center md:items-start text-center md:text-left">
            {/* Student Photo */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative">
                <img
                  src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={student.fullName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-slate-100 shadow-md"
                  onError={(e) => {
                    e.target.src =
                      'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(student.fullName) +
                      '&background=4f46e5&color=fff';
                  }}
                />
                <span className="absolute bottom-1 right-1 px-2 py-0.5 text-[10px] font-extrabold bg-indigo-600 text-white rounded-lg uppercase shadow">
                  {student.bloodGroup || 'O+'}
                </span>
              </div>
              <button
                onClick={() => setShowIDCardModal(true)}
                className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Printer className="w-3 h-3" /> View ID Card
              </button>
            </div>

            {/* Basic details */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {student.fullName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap justify-center sm:justify-start">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      ID: {student.studentId}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      Adm: {student.admissionNumber}
                    </span>
                    <Badge variant="purple" size="sm">
                      {selectedAcademicRecord?.class?.name || 'Class 10'} • {selectedAcademicRecord?.section?.name || 'Section A'}
                    </Badge>
                  </div>
                </div>

                {/* Roll Number Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center self-center sm:self-start min-w-[90px]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Roll No</span>
                  <span className="text-base sm:text-lg font-extrabold text-indigo-900">
                    {selectedAcademicRecord?.rollNumber || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-left">
                <div>
                  <span className="text-slate-400 block font-medium">Date of Birth</span>
                  <span className="font-semibold text-slate-700">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gender</span>
                  <span className="font-semibold text-slate-700">{student.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Blood Group</span>
                  <span className="font-semibold text-slate-700">{student.bloodGroup || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Aadhaar / Nat ID</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {student.aadhaarNumber ? `•••• •••• ${student.aadhaarNumber.slice(-4)}` : 'Verified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact Phone</span>
                  <span className="font-semibold text-slate-700">{student.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Father / Guardian</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {student.parentInfo?.fatherName || student.emergencyContact?.name || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-medium">Address</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {student.address?.street
                      ? `${student.address.street}, ${student.address.city}, ${student.address.state}`
                      : 'New Delhi, India'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Year Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Selected Year Record Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4" />
              Academic Year Enrollment
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">
              {selectedAcademicRecord?.academicYear?.name || 'Academic Year'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Class: <span className="font-bold text-slate-700">{selectedAcademicRecord?.class?.name}</span> •{' '}
              Section: <span className="font-bold text-slate-700">{selectedAcademicRecord?.section?.name}</span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status={selectedAcademicRecord?.status || 'Enrolled'} />
              {selectedAcademicRecord?.isCurrentYear && (
                <Badge variant="purple" size="sm">Active Current Year</Badge>
              )}
            </div>
            {selectedAcademicRecord?.remarks && (
              <p className="text-xs bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-3 text-slate-600 italic">
                "{selectedAcademicRecord.remarks}"
              </p>
            )}
          </div>

          {/* Attendance Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Clock className="w-4 h-4" /> Attendance Record
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                {attendanceSummary.percentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
              <div
                className={`h-2.5 rounded-full ${
                  attendanceSummary.percentage >= 85
                    ? 'bg-emerald-500'
                    : attendanceSummary.percentage >= 75
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(attendanceSummary.percentage, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-50 rounded-lg p-1.5">
                <span className="text-[10px] text-emerald-700 block font-bold">Present</span>
                <span className="font-extrabold text-emerald-900">{attendanceSummary.present}</span>
              </div>
              <div className="bg-amber-50 rounded-lg p-1.5">
                <span className="text-[10px] text-amber-700 block font-bold">Late</span>
                <span className="font-extrabold text-amber-900">{attendanceSummary.late}</span>
              </div>
              <div className="bg-rose-50 rounded-lg p-1.5">
                <span className="text-[10px] text-rose-700 block font-bold">Absent</span>
                <span className="font-extrabold text-rose-900">{attendanceSummary.absent}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Total Recorded Days: {attendanceSummary.total}
            </p>
          </div>

          {/* Academic Performance Score Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                <Award className="w-4 h-4" /> Overall Score
              </span>
              <GradeBadge grade={performance.overallGrade} />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {performance.overallPercentage}%
              </span>
              <span className="text-xs text-slate-500">
                ({performance.totalMarksObtained} / {performance.totalMaxMarks} Marks)
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Evaluated across {performance.totalExams} tests & board exams.
            </p>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Academic Standing:</span>
              <span className="text-indigo-600 font-bold">
                {performance.overallPercentage >= 80 ? 'Distinction' : 'First Class'}
              </span>
            </div>
          </div>
        </div>

        {/* Subjects & Faculty */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold">
              Enrolled Subjects & Faculty ({selectedAcademicRecord?.academicYear?.name})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectedAcademicRecord?.subjects?.map((subItem, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {subItem.subject?.name || 'Subject'}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                    {subItem.subject?.code}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teacher: <strong className="text-slate-700">{subItem.teacher?.name || 'Faculty Member'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Examination Scores & Performance Report (Mobile responsive scroll) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-800">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold">
                Examination Results & Marks ({selectedAcademicRecord?.academicYear?.name})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Permanent Verified Record
            </span>
          </div>

          {examMarks && examMarks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[620px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Examination</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Exam Date</th>
                    <th className="py-3 px-4 text-center">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Max Marks</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examMarks.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {m.exam?.name || 'Examination'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {m.subject?.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {m.exam?.date ? new Date(m.exam.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 text-sm">
                        {m.marksObtained}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                        {m.maxMarks}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                        {m.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <GradeBadge grade={m.grade} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 italic">
                        {m.remarks || 'Satisfactory performance'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No examination marks recorded yet for {selectedAcademicRecord?.academicYear?.name}.
            </div>
          )}
        </div>

        {/* Footer verification notice */}
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 sm:p-6 text-center text-xs space-y-2 border border-slate-800">
          <p className="font-bold text-white tracking-wide">
            OFFICIAL SECURE DIGITAL CREDENTIAL VERIFICATION
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto text-[11px] sm:text-xs">
            This digital record is tied to student identity <span className="text-indigo-400 font-mono font-bold">{student.studentId}</span>. The QR code remains invariant throughout the student's tenure at the institution.
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Powered by EduTrack QR Academic Records System
          </p>
        </div>
      </div>

      {/* ID Card Modal */}
      <IDCardModal
        isOpen={showIDCardModal}
        onClose={() => setShowIDCardModal(false)}
        student={student}
        academicRecord={selectedAcademicRecord}
      />
    </div>
  );
};

export default PublicStudentProfile;
