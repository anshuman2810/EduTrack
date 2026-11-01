import React, { useState, useEffect } from 'react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, getClasses, getSections, getSubjects } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Users, Plus, Edit, Trash2, Mail, Phone, BookOpen, GraduationCap, ShieldAlert } from 'lucide-react';

export const TeachersManager = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    qualification: '',
    designation: 'Teacher',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, cRes, sRes, subRes] = await Promise.all([
        getTeachers(),
        getClasses(),
        getSections(),
        getSubjects(),
      ]);
      setTeachers(tRes.data);
      setClasses(cRes.data);
      setSections(sRes.data);
      setSubjects(subRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (teacher = null) => {
    setEditingTeacher(teacher);
    if (teacher) {
      setForm({
        name: teacher.name,
        email: teacher.email,
        password: '',
        phone: teacher.phone || '',
        employeeId: teacher.employeeId || '',
        qualification: teacher.qualification || '',
        designation: teacher.designation || 'Teacher',
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: 'Teacher@123',
        phone: '',
        employeeId: `EMP-TCH-${100 + teachers.length + 1}`,
        qualification: 'M.Sc. B.Ed.',
        designation: 'Teacher',
      });
    }
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingTeacher) {
        await updateTeacher(editingTeacher._id, form);
      } else {
        await createTeacher(form);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving teacher record.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove teacher "${name}"?`)) {
      try {
        await deleteTeacher(id);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting teacher');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            Teacher & Faculty Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage teacher profiles, employee IDs, subject assignments, and login credentials.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading faculty records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Designation & Qualifications</th>
                  <th className="py-3 px-4">Assigned Classes / Subjects</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            t.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=4f46e5&color=fff`
                          }
                          alt={t.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{t.name}</span>
                          <span className="text-[10px] text-slate-400">{t.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {t.employeeId || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span>{t.phone || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{t.designation}</span>
                      <span className="text-[10px] text-slate-500">{t.qualification}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {t.assignedClasses && t.assignedClasses.length > 0 ? (
                          t.assignedClasses.map((ac, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                            >
                              {ac.class?.name || 'Class'} ({ac.section?.name || 'Sec'}) - {ac.subject?.name || 'Sub'}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(t)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          title="Edit Teacher"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Remove Teacher"
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
        )}
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTeacher ? 'Edit Teacher Record' : 'Register New Faculty Member'}
          maxWidth="max-w-lg"
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingTeacher ? 'Change Password (Optional)' : 'Default Password *'}
                </label>
                <input
                  type="password"
                  placeholder={editingTeacher ? 'Leave blank to keep' : 'Teacher@123'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualifications</label>
                <input
                  type="text"
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
              >
                Save Teacher
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeachersManager;
