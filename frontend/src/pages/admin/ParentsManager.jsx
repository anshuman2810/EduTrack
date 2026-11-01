import React, { useState, useEffect } from 'react';
import { getParents, createParent, updateParent, deleteParent, getStudents } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { UserCheck, Plus, Edit, Trash2, Mail, Phone, GraduationCap, ShieldAlert } from 'lucide-react';

export const ParentsManager = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    relationship: 'Father',
    occupation: '',
    address: '',
    students: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([getParents(), getStudents({ limit: 200 })]);
      setParents(pRes.data);
      setStudents(sRes.data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (parent = null) => {
    setEditingParent(parent);
    if (parent) {
      setForm({
        name: parent.name,
        email: parent.email,
        password: '',
        phone: parent.phone || '',
        relationship: parent.relationship || 'Father',
        occupation: parent.occupation || '',
        address: parent.address || '',
        students: parent.students?.map((s) => s._id || s) || [],
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: 'Parent@123',
        phone: '',
        relationship: 'Father',
        occupation: '',
        address: '',
        students: [],
      });
    }
    setError('');
    setModalOpen(true);
  };

  const handleStudentToggle = (studentId) => {
    setForm((prev) => {
      const exists = prev.students.includes(studentId);
      if (exists) {
        return { ...prev, students: prev.students.filter((id) => id !== studentId) };
      } else {
        return { ...prev, students: [...prev.students, studentId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingParent) {
        await updateParent(editingParent._id, form);
      } else {
        await createParent(form);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving parent account.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove parent account "${name}"?`)) {
      try {
        await deleteParent(id);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting parent');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            Parent Accounts & Child Connections
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage parent user accounts and associate them with one or multiple children.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Parent Account
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading parent records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Parent Name</th>
                  <th className="py-3 px-4">Relationship & Occupation</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Connected Students</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=059669&color=fff`
                          }
                          alt={p.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">
                        {p.relationship || 'Guardian'}
                      </span>
                      <span className="text-[10px] text-slate-500">{p.occupation || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono">{p.phone || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.students && p.students.length > 0 ? (
                          p.students.map((stu) => (
                            <span
                              key={stu._id}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                            >
                              <GraduationCap className="w-3 h-3 text-emerald-600" />
                              {stu.firstName} {stu.lastName} ({stu.studentId})
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">No linked students</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
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
          title={editingParent ? 'Edit Parent Account' : 'Register New Parent Account'}
          subtitle="Link parent account to one or multiple student profiles"
          maxWidth="max-w-xl"
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Full Name *</label>
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
                  {editingParent ? 'Change Password (Optional)' : 'Default Password *'}
                </label>
                <input
                  type="password"
                  placeholder={editingParent ? 'Leave blank to keep' : 'Parent@123'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                <select
                  value={form.relationship}
                  onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Select Connected Children */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
                Connect Child Students (Select all that apply)
              </label>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                {students.map((stu) => {
                  const isChecked = form.students.includes(stu._id);
                  return (
                    <label
                      key={stu._id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-indigo-50 border border-indigo-200 font-bold text-indigo-900' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleStudentToggle(stu._id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        {stu.firstName} {stu.lastName} ({stu.studentId} • Adm: {stu.admissionNumber})
                      </span>
                    </label>
                  );
                })}
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
                Save Parent Account
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ParentsManager;
