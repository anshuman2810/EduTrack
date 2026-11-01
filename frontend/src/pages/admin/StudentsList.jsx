import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getStudents,
  deleteStudent,
  getAcademicYears,
  getClasses,
  getSections,
} from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { IDCardModal } from '../../components/qr/IDCardModal';
import { StudentFormModal } from './StudentFormModal';
import { EnrollYearModal } from './EnrollYearModal';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  QrCode,
  Edit,
  Trash2,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Printer,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [status, setStatus] = useState('');

  // Dropdown options
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // Modals state
  const [selectedStudentForID, setSelectedStudentForID] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [promotingStudent, setPromotingStudent] = useState(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    fetchStudentsList();
  }, [search, academicYearId, classId, sectionId, status]);

  const loadFilterOptions = async () => {
    try {
      const [yRes, cRes] = await Promise.all([getAcademicYears(), getClasses()]);
      setYears(yRes.data);
      setClasses(cRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClassFilterChange = async (selectedCId) => {
    setClassId(selectedCId);
    setSectionId('');
    if (selectedCId) {
      try {
        const sRes = await getSections(selectedCId);
        setSections(sRes.data);
      } catch (e) {
        console.error(e);
      }
    } else {
      setSections([]);
    }
  };

  const fetchStudentsList = async () => {
    try {
      setLoading(true);
      const res = await getStudents({
        search,
        academicYearId,
        classId,
        sectionId,
        status,
        limit: 100,
      });
      setStudents(res.data.students || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error('Error loading students:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete student "${name}"? This will also remove their academic and attendance records.`
      )
    ) {
      try {
        await deleteStudent(id);
        fetchStudentsList();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting student');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Students Directory & Permanent QR Badges
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student admissions, multi-year academic progression, and generate dynamic QR ID cards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Enroll New Student
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Name, Student ID, Admission No, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Academic Year */}
          <div>
            <select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">All Academic Years</option>
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  Year: {y.name} {y.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <select
              value={classId}
              onChange={(e) => handleClassFilterChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <select
              value={sectionId}
              disabled={!classId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-50"
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>Section {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-bold">{students.length}</strong> of{' '}
            <strong className="text-slate-800 font-bold">{total}</strong> enrolled students
          </span>
          {(search || academicYearId || classId || sectionId || status) && (
            <button
              onClick={() => {
                setSearch('');
                setAcademicYearId('');
                setClassId('');
                setSectionId('');
                setStatus('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading students and academic records...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Class & Sec</th>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Parent / Contact</th>
                  <th className="py-3.5 px-4">Blood Grp</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">QR Card</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            s.photo ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={s.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                          onError={(e) => {
                            e.target.src =
                              'https://ui-avatars.com/api/?name=' +
                              encodeURIComponent(s.firstName + ' ' + s.lastName) +
                              '&background=4f46e5&color=fff';
                          }}
                        />
                        <div>
                          <Link
                            to={`/admin/students/${s._id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 block transition-colors"
                          >
                            {s.firstName} {s.lastName}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Adm: {s.admissionNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {s.studentId}
                    </td>

                    {/* Class & Section */}
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {s.currentAcademicRecord?.class?.name || 'Class 10'} -{' '}
                      {s.currentAcademicRecord?.section?.name || 'A'}
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono font-bold">
                      {s.currentAcademicRecord?.rollNumber || 'N/A'}
                    </td>

                    {/* Parent / Phone */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="truncate max-w-[140px]">
                        <span className="block font-medium text-slate-700 truncate">
                          {s.parentInfo?.fatherName || s.parentUser?.name || 'Parent'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.phone || s.parentInfo?.fatherPhone || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Blood Group */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {s.bloodGroup || 'O+'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} />
                    </td>

                    {/* QR Card Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          setSelectedStudentForID({
                            student: s,
                            academicRecord: s.currentAcademicRecord,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        title="Print / View ID Badge"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Print Badge</span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/students/${s._id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setPromotingStudent(s)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Promote / Enroll into Next Academic Year"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditingStudent(s)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Personal Information"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(s._id, `${s.firstName} ${s.lastName}`)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No students found matching your criteria. Try adjusting filters or enrolling a student.
          </div>
        )}
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

      {/* Create / Edit Student Modal */}
      {(showAddModal || editingStudent) && (
        <StudentFormModal
          isOpen={showAddModal || !!editingStudent}
          onClose={() => {
            setShowAddModal(false);
            setEditingStudent(null);
          }}
          student={editingStudent}
          onSuccess={fetchStudentsList}
        />
      )}

      {/* Promote / Enroll Year Modal */}
      {promotingStudent && (
        <EnrollYearModal
          isOpen={!!promotingStudent}
          onClose={() => setPromotingStudent(null)}
          student={promotingStudent}
          onSuccess={fetchStudentsList}
        />
      )}
    </div>
  );
};

export default StudentsList;
