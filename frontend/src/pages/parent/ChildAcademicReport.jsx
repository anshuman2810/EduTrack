import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentById } from '../../services/api';
import { GradeBadge, StatusBadge, Badge } from '../../components/common/Badge';
import { IDCardModal } from '../../components/qr/IDCardModal';
import {
  Award,
  Calendar,
  Clock,
  BookOpen,
  Printer,
  ChevronDown,
  GraduationCap,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

export const ChildAcademicReport = () => {
  const { user } = useAuth();
  const linkedStudents = user?.students || [];

  const [selectedStudentId, setSelectedStudentId] = useState(
    linkedStudents[0]?._id || linkedStudents[0] || ''
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [showIDModal, setShowIDModal] = useState(false);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadStudentData = async (stuId) => {
    try {
      setLoading(true);
      const res = await getStudentById(stuId);
      setData(res.data);
      if (res.data.academicHistory && res.data.academicHistory.length > 0) {
        const curr = res.data.academicHistory.find((r) => r.isCurrentYear) || res.data.academicHistory[0];
        setSelectedYearId(curr.academicYear?._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const student = data?.student;
  const academicHistory = data?.academicHistory || [];
  const selectedRecord =
    academicHistory.find((r) => r.academicYear?._id === selectedYearId) ||
    data?.currentRecord;

  // Filter marks for selected academic year
  const marks = (data?.marks || []).filter(
    (m) => m.academicYear?._id === selectedYearId || !selectedYearId
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-indigo-600" />
            Comprehensive Child Academic Report Card
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Subject-wise scorecards, examination history, grades, and teacher observations across years.
          </p>
        </div>

        {linkedStudents.length > 1 && (
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 pl-2">Child:</span>
            {linkedStudents.map((child) => (
              <button
                key={child._id || child}
                type="button"
                onClick={() => setSelectedStudentId(child._id || child)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  (child._id || child) === selectedStudentId
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {child.firstName || 'Child'}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading || !student ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading report card...</div>
      ) : (
        <>
          {/* Header Card with Academic Year Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  student.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    student.firstName + ' ' + student.lastName
                  )}&background=4f46e5&color=fff`
                }
                alt={student.firstName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Student ID: {student.studentId} • Admission No: {student.admissionNumber}
                </p>
                <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                  Class: {selectedRecord?.class?.name} - {selectedRecord?.section?.name} (Roll: {selectedRecord?.rollNumber || 'N/A'})
                </p>
              </div>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Viewing Academic Year
                </span>
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {academicHistory.map((rec) => (
                    <option key={rec.academicYear?._id} value={rec.academicYear?._id}>
                      {rec.academicYear?.name} {rec.isCurrentYear ? '(Current Year)' : '(Archived History)'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowIDModal(true)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                title="Print ID Card"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Score & Percentage
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">{overallPct}%</span>
                <span className="text-xs text-slate-500">
                  ({totalObtained} / {totalMax} Marks)
                </span>
              </div>
              <div className="mt-3">
                <GradeBadge grade={overallGrade} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Academic Standing
              </span>
              <span className="text-xl font-extrabold text-indigo-700 block mt-1">
                {overallPct >= 80 ? 'Distinction' : overallPct >= 60 ? 'First Division' : 'Passing Grade'}
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Evaluated based on {marks.length} tests and term exams.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Teacher's Observation
              </span>
              <p className="text-xs text-slate-700 italic mt-2">
                "{selectedRecord?.remarks || 'Consistently disciplined, active in classroom discussions and analytical tasks.'}"
              </p>
            </div>
          </div>

          {/* Detailed Scorecard Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                Examination & Assessment Scorecard ({selectedRecord?.academicYear?.name})
              </h3>
              <Badge variant="primary" size="sm">Official Grade Sheet</Badge>
            </div>

            {marks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600">
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
                    {marks.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{m.exam?.name}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{m.subject?.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {m.exam?.date ? new Date(m.exam.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                          {m.marksObtained}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                          {m.maxMarks}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                          {m.percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <GradeBadge grade={m.grade} />
                        </td>
                        <td className="py-3.5 px-4 italic text-slate-600">
                          {m.remarks || 'Good performance'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No examination records recorded yet for {selectedRecord?.academicYear?.name}.
              </div>
            )}
          </div>
        </>
      )}

      {showIDModal && student && (
        <IDCardModal
          isOpen={showIDModal}
          onClose={() => setShowIDModal(false)}
          student={student}
          academicRecord={selectedRecord}
        />
      )}
    </div>
  );
};

export default ChildAcademicReport;
