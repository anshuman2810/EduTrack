import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentById } from '../../services/api';
import { Badge, GradeBadge, StatusBadge } from '../../components/common/Badge';
import { IDCardModal } from '../../components/qr/IDCardModal';
import { EnrollYearModal } from './EnrollYearModal';
import { StudentFormModal } from './StudentFormModal';
import { QRCodeSVG } from 'qrcode.react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Award,
  BookOpen,
  User,
  Phone,
  Mail,
  MapPin,
  Printer,
  Edit,
  TrendingUp,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  FileText,
} from 'lucide-react';

export const StudentDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'personal' | 'attendance' | 'marks' | 'qr'
  const [showIDCardModal, setShowIDCardModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await getStudentById(id);
      setData(res.data);
    } catch (e) {
      console.error('Error fetching student details:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading comprehensive student record...</p>
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-600">Student record not found.</p>
        <Link to="/admin/students" className="text-xs text-indigo-600 font-bold mt-2 inline-block">
          &larr; Back to Students List
        </Link>
      </div>
    );
  }

  const { student, currentRecord, academicHistory, attendanceStats, marks } = data;
  const profileUrl = `${window.location.origin}/verify/${student.qrToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/students"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {student.firstName} {student.lastName}
              </h1>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-xs text-slate-500">
              Student ID: <span className="font-mono font-bold text-indigo-700">{student.studentId}</span> • Admission No: <span className="font-mono">{student.admissionNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Promote to New Year
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Info
          </button>

          <button
            onClick={() => setShowIDCardModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print ID Card Badge
          </button>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="relative">
            <img
              src={
                student.photo ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
              }
              alt={student.firstName}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-md"
              onError={(e) => {
                e.target.src =
                  'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(student.firstName + ' ' + student.lastName) +
                  '&background=4f46e5&color=fff';
              }}
            />
            <span className="absolute bottom-0 right-0 px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-600 text-white rounded-md uppercase">
              {student.bloodGroup || 'O+'}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs w-full text-center md:text-left">
            <div>
              <span className="text-slate-400 block font-medium">Current Enrolment</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {currentRecord?.class?.name || 'Class 10'} ({currentRecord?.section?.name || 'A'})
              </span>
              <span className="text-[10px] text-indigo-600 block font-semibold">
                Year: {currentRecord?.academicYear?.name || '2025-26'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Roll Number</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm">
                {currentRecord?.rollNumber || 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block">Class Register</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Attendance Rate</span>
              <span className="font-extrabold text-emerald-600 text-sm">
                {attendanceStats.percentage}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {attendanceStats.present} Present / {attendanceStats.total} Days
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Permanent QR Code</span>
              <div className="flex items-center gap-1.5 justify-center md:justify-start mt-0.5">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Open Public Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button
                onClick={handleCopyLink}
                className="text-[10px] text-slate-500 hover:text-slate-700 flex items-center gap-1 mt-0.5"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-1">
          {[
            { id: 'academic', label: 'Academic Trajectory', icon: GraduationCap },
            { id: 'personal', label: 'Personal & Family', icon: User },
            { id: 'marks', label: 'Exams & Performance', icon: Award },
            { id: 'attendance', label: 'Attendance Records', icon: Clock },
            { id: 'qr', label: 'Permanent QR Badge', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab 1: Academic History Across Years */}
      {activeTab === 'academic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Multi-Year Progression ({academicHistory?.length} Records)
              </h3>
              <p className="text-xs text-slate-500">
                Complete academic trajectory. Previous years remain accessible via the same QR code.
              </p>
            </div>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Enroll Next Year
            </button>
          </div>

          <div className="space-y-4">
            {academicHistory?.map((rec, idx) => (
              <div
                key={rec._id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                  rec.isCurrentYear ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900">
                        Academic Year {rec.academicYear?.name}
                      </h4>
                      {rec.isCurrentYear ? (
                        <Badge variant="purple" size="sm">★ Active Current Year</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Archived Historical</Badge>
                      )}
                      <StatusBadge status={rec.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Class: <strong>{rec.class?.name}</strong> • Section:{' '}
                      <strong>{rec.section?.name}</strong> • Roll No:{' '}
                      <strong className="font-mono">{rec.rollNumber || 'N/A'}</strong>
                    </p>
                  </div>
                </div>

                {rec.remarks && (
                  <p className="mt-3 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-600 italic">
                    "{rec.remarks}"
                  </p>
                )}

                {/* Subjects enrolled that year */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Enrolled Subjects & Teachers
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {rec.subjects?.map((subItem, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-800 truncate mr-2">
                          {subItem.subject?.name}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          {subItem.teacher?.name || 'Assigned Faculty'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Personal Details */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity & Basic Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Identity & Demographics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Student ID</span>
                <span className="font-mono font-bold text-indigo-700">{student.studentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Admission Number</span>
                <span className="font-mono font-bold text-slate-800">{student.admissionNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-700">
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Gender</span>
                <span className="font-semibold text-slate-700">{student.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="font-semibold text-slate-700">{student.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Aadhaar Number</span>
                <span className="font-mono font-semibold text-slate-700">
                  {student.aadhaarNumber || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Nationality</span>
                <span className="font-semibold text-slate-700">{student.nationality}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Category</span>
                <span className="font-semibold text-slate-700">{student.category || 'General'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 block font-medium">Residential Address</span>
              <p className="font-medium text-slate-700 mt-0.5">
                {student.address?.street
                  ? `${student.address.street}, ${student.address.city}, ${student.address.state} - ${student.address.postalCode}`
                  : 'New Delhi, India'}
              </p>
            </div>
          </div>

          {/* Parent & Emergency Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Parent & Emergency Contacts
            </h3>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Father / Guardian
                </span>
                <p className="font-bold text-slate-800">
                  {student.parentInfo?.fatherName || student.parentUser?.name || 'Not provided'}
                </p>
                <p className="text-slate-600">
                  Phone: {student.parentInfo?.fatherPhone || student.parentUser?.phone || student.phone || 'N/A'}
                </p>
                {student.parentInfo?.fatherOccupation && (
                  <p className="text-slate-500">Occupation: {student.parentInfo.fatherOccupation}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Mother Details
                </span>
                <p className="font-bold text-slate-800">
                  {student.parentInfo?.motherName || 'Not provided'}
                </p>
                <p className="text-slate-600">
                  Phone: {student.parentInfo?.motherPhone || 'N/A'}
                </p>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">
                  Emergency Contact
                </span>
                <p className="font-bold text-amber-950">
                  {student.emergencyContact?.name || student.parentInfo?.fatherName || 'Parent'}
                </p>
                <p className="text-amber-800">
                  Relation: {student.emergencyContact?.relation || 'Father'} • Phone:{' '}
                  {student.emergencyContact?.phone || student.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Marks & Performance */}
      {activeTab === 'marks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Recorded Examination Scores ({marks?.length || 0})
            </h3>
            <Badge variant="primary" size="sm">Graded Assessments</Badge>
          </div>

          {marks && marks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Exam Name</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Academic Year</th>
                    <th className="py-3 px-4 text-center">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Max Marks</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marks.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{m.exam?.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{m.subject?.name}</td>
                      <td className="py-3 px-4">{m.academicYear?.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{m.marksObtained}</td>
                      <td className="py-3 px-4 text-center text-slate-500">{m.maxMarks}</td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-700">{m.percentage}%</td>
                      <td className="py-3 px-4 text-center"><GradeBadge grade={m.grade} /></td>
                      <td className="py-3 px-4 italic text-slate-600">{m.remarks || 'Satisfactory'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No examination records found for this student.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Attendance Analytics</h3>
              <p className="text-xs text-slate-500">Summary across registered sessions</p>
            </div>
            <span className="text-2xl font-extrabold text-emerald-600">
              {attendanceStats.percentage}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block">Total Sessions</span>
              <span className="text-xl font-extrabold text-slate-800">{attendanceStats.total}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-700 uppercase block">Present</span>
              <span className="text-xl font-extrabold text-emerald-800">{attendanceStats.present}</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-amber-700 uppercase block">Late</span>
              <span className="text-xl font-extrabold text-amber-800">{attendanceStats.late}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
              <span className="text-xs font-bold text-rose-700 uppercase block">Absent</span>
              <span className="text-xl font-extrabold text-rose-800">{attendanceStats.absent}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Permanent QR Badge */}
      {activeTab === 'qr' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Permanent Student QR Identity
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Scanning this code dynamically opens this student's profile throughout their academic life.
          </p>

          <div className="p-4 bg-white rounded-2xl border-2 border-indigo-200 shadow-md">
            <QRCodeSVG
              value={profileUrl}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#1e1b4b"
            />
          </div>

          <div className="mt-4 text-xs font-mono font-bold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg">
            {student.qrToken}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowIDCardModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Full ID Card Badge
            </button>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Public Page
            </a>
          </div>
        </div>
      )}

      {/* Modals */}
      <IDCardModal
        isOpen={showIDCardModal}
        onClose={() => setShowIDCardModal(false)}
        student={student}
        academicRecord={currentRecord}
      />

      {showEnrollModal && (
        <EnrollYearModal
          isOpen={showEnrollModal}
          onClose={() => setShowEnrollModal(false)}
          student={student}
          onSuccess={fetchStudent}
        />
      )}

      {showEditModal && (
        <StudentFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          student={student}
          onSuccess={fetchStudent}
        />
      )}
    </div>
  );
};

export default StudentDetails;
