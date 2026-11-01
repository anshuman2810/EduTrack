import React, { useState, useEffect } from 'react';
import { getStudents, updateStudent } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { GraduationCap, Search, QrCode, Edit, ExternalLink, Phone, Mail, Award, Check } from 'lucide-react';

export const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit remark modal
  const [editingStudent, setEditingStudent] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getStudents({ search, limit: 100 });
      setStudents(res.data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (stu) => {
    setEditingStudent(stu);
    setRemarks(stu.currentAcademicRecord?.remarks || '');
    setPhone(stu.phone || '');
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateStudent(editingStudent._id, {
        phone,
        remarks,
        academicYear: editingStudent.currentAcademicRecord?.academicYear?._id,
        class: editingStudent.currentAcademicRecord?.class?._id,
        section: editingStudent.currentAcademicRecord?.section?._id,
        rollNumber: editingStudent.currentAcademicRecord?.rollNumber,
      });
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Assigned Students Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View student profiles, inspect dynamic QR credentials, and update teacher observations & remarks.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student by name, ID or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading students...</div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Class & Sec</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Parent Details</th>
                  <th className="py-3 px-4">Academic Remarks</th>
                  <th className="py-3 px-4 text-center">QR Profile</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
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
                        <span className="font-bold text-slate-900">
                          {s.firstName} {s.lastName}
                        </span>
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
                      <span className="font-medium text-slate-800 block">
                        {s.parentInfo?.fatherName || s.parentUser?.name || 'Parent'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {s.phone || s.parentInfo?.fatherPhone || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 italic text-slate-600 max-w-[200px] truncate">
                      {s.currentAcademicRecord?.remarks || 'No remarks recorded'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={`/verify/${s.qrToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold"
                        title="Open Dynamic QR Profile"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR View</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        title="Update Remarks / Info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">No students found.</div>
        )}
      </div>

      {/* Edit Student Info / Remarks Modal */}
      {editingStudent && (
        <Modal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          title={`Update Record: ${editingStudent.firstName} ${editingStudent.lastName}`}
          subtitle={`Class ${editingStudent.currentAcademicRecord?.class?.name} • Roll: ${editingStudent.currentAcademicRecord?.rollNumber}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Faculty Remarks & Performance Observations
              </label>
              <textarea
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Excellent progress in problem-solving and active participation in lab sessions."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Update Remarks'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherStudents;
