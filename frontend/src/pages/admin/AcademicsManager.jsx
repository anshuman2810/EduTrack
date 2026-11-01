import React, { useState, useEffect } from 'react';
import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getTeachers,
} from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Layers,
  Calendar,
  Building,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Star,
  Users,
} from 'lucide-react';

export const AcademicsManager = () => {
  const [activeTab, setActiveTab] = useState('years'); // 'years' | 'classes' | 'sections' | 'subjects'

  // Data states
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalType, setModalType] = useState(null); // 'year' | 'class' | 'section' | 'subject'
  const [editingItem, setEditingItem] = useState(null);
  const [formState, setFormState] = useState({});

  useEffect(() => {
    loadAllAcademicData();
  }, []);

  const loadAllAcademicData = async () => {
    try {
      setLoading(true);
      const [yRes, cRes, sRes, subRes, tRes] = await Promise.all([
        getAcademicYears(),
        getClasses(),
        getSections(),
        getSubjects(),
        getTeachers(),
      ]);
      setYears(yRes.data);
      setClasses(cRes.data);
      setSections(sRes.data);
      setSubjects(subRes.data);
      setTeachers(tRes.data);
    } catch (e) {
      console.error('Error loading academic data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for create or edit
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'year') {
      setFormState({
        name: item?.name || '',
        startDate: item?.startDate ? item.startDate.split('T')[0] : '2025-06-01',
        endDate: item?.endDate ? item.endDate.split('T')[0] : '2026-04-30',
        isCurrent: item?.isCurrent || false,
        description: item?.description || '',
      });
    } else if (type === 'class') {
      setFormState({
        name: item?.name || '',
        code: item?.code || '',
        order: item?.order || 0,
        description: item?.description || '',
      });
    } else if (type === 'section') {
      setFormState({
        name: item?.name || '',
        class: item?.class?._id || (classes[0]?._id || ''),
        roomNumber: item?.roomNumber || '',
        capacity: item?.capacity || 40,
        classTeacher: item?.classTeacher?._id || '',
      });
    } else if (type === 'subject') {
      setFormState({
        name: item?.name || '',
        code: item?.code || '',
        description: item?.description || '',
        classes: item?.classes?.map((c) => c._id || c) || (classes[0] ? [classes[0]._id] : []),
        assignedTeachers: item?.assignedTeachers?.map((t) => t._id || t) || [],
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    setFormState({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'year') {
        if (editingItem) await updateAcademicYear(editingItem._id, formState);
        else await createAcademicYear(formState);
      } else if (modalType === 'class') {
        if (editingItem) await updateClass(editingItem._id, formState);
        else await createClass(formState);
      } else if (modalType === 'section') {
        if (editingItem) await updateSection(editingItem._id, formState);
        else await createSection(formState);
      } else if (modalType === 'subject') {
        if (editingItem) await updateSubject(editingItem._id, formState);
        else await createSubject(formState);
      }
      closeModal();
      loadAllAcademicData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving item');
    }
  };

  const handleDelete = async (type, id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      try {
        if (type === 'year') await deleteAcademicYear(id);
        else if (type === 'class') await deleteClass(id);
        else if (type === 'section') await deleteSection(id);
        else if (type === 'subject') await deleteSubject(id);
        loadAllAcademicData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting item');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-600" />
            Academic Structure & Curriculum Setup
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure Academic Years, Classes, Sections, and Subjects with teacher allocations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-6 min-w-max pb-1">
          {[
            { id: 'years', label: 'Academic Years', icon: Calendar, count: years.length },
            { id: 'classes', label: 'Classes / Standards', icon: Building, count: classes.length },
            { id: 'sections', label: 'Sections', icon: Layers, count: sections.length },
            { id: 'subjects', label: 'Subjects & Curriculum', icon: BookOpen, count: subjects.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ================= TAB 1: ACADEMIC YEARS ================= */}
      {activeTab === 'years' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Academic Years
            </h3>
            <button
              onClick={() => openModal('year')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Academic Year
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {years.map((y) => (
              <div
                key={y._id}
                className={`bg-white rounded-2xl border p-5 shadow-sm relative ${
                  y.isCurrent ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'
                }`}
              >
                {y.isCurrent && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-current" /> Current Active
                  </span>
                )}
                <h4 className="text-xl font-extrabold text-slate-900">{y.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{y.description || 'Institutional Year'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                  <div>
                    Start Date:{' '}
                    <strong>{y.startDate ? new Date(y.startDate).toLocaleDateString() : 'N/A'}</strong>
                  </div>
                  <div>
                    End Date:{' '}
                    <strong>{y.endDate ? new Date(y.endDate).toLocaleDateString() : 'N/A'}</strong>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openModal('year', y)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {!y.isCurrent && (
                    <button
                      onClick={() => handleDelete('year', y._id, y.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: CLASSES ================= */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Classes & Standards
            </h3>
            <button
              onClick={() => openModal('class')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Class
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-900">{c.name}</h4>
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {c.code || 'CODE'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{c.description || 'Standard division'}</p>

                <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openModal('class', c)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete('class', c._id, c.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SECTIONS ================= */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Class Sections & Class Teachers
            </h3>
            <button
              onClick={() => openModal('section')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.map((sec) => (
              <div
                key={sec._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">
                    {sec.class?.name} - Section {sec.name}
                  </h4>
                  <Badge variant="primary" size="sm">{sec.roomNumber || 'Room N/A'}</Badge>
                </div>

                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                  <div>
                    Class Teacher:{' '}
                    <strong>{sec.classTeacher?.name || 'Unassigned'}</strong>
                  </div>
                  <div>
                    Capacity: <strong>{sec.capacity || 40} Students</strong>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openModal('section', sec)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete('section', sec._id, `Section ${sec.name}`)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: SUBJECTS ================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Subjects & Assigned Faculty
            </h3>
            <button
              onClick={() => openModal('subject')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{sub.name}</h4>
                    <p className="text-xs text-slate-500">{sub.description}</p>
                  </div>
                  <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">Assigned Classes:</span>
                    <div className="flex gap-1.5 flex-wrap mt-0.5">
                      {sub.classes?.map((c) => (
                        <span key={c._id || c} className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {c.name || 'Class'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Faculty Members:</span>
                    <div className="flex gap-1.5 flex-wrap mt-0.5">
                      {sub.assignedTeachers?.map((t) => (
                        <span key={t._id || t} className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {t.name || 'Teacher'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openModal('subject', sub)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete('subject', sub._id, sub.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generic Modal for Year / Class / Section / Subject */}
      {modalType && (
        <Modal
          isOpen={!!modalType}
          onClose={closeModal}
          title={`${editingItem ? 'Edit' : 'Create'} ${
            modalType === 'year'
              ? 'Academic Year'
              : modalType === 'class'
              ? 'Class'
              : modalType === 'section'
              ? 'Section'
              : 'Subject'
          }`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Year Form */}
            {modalType === 'year' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-27"
                    value={formState.name || ''}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formState.startDate || ''}
                      onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={formState.endDate || ''}
                      onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={!!formState.isCurrent}
                    onChange={(e) => setFormState({ ...formState, isCurrent: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="isCurrent" className="font-semibold text-slate-700 cursor-pointer">
                    Set as Current Active Academic Year
                  </label>
                </div>
              </>
            )}

            {/* Class Form */}
            {modalType === 'class' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 11 - Commerce"
                    value={formState.name || ''}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CLS-11C"
                      value={formState.code || ''}
                      onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formState.order || 0}
                      onChange={(e) => setFormState({ ...formState, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Section Form */}
            {modalType === 'section' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Section Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A or B"
                      value={formState.name || ''}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Class *</label>
                    <select
                      required
                      value={formState.class || ''}
                      onChange={(e) => setFormState({ ...formState, class: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    >
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 204"
                      value={formState.roomNumber || ''}
                      onChange={(e) => setFormState({ ...formState, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Class Teacher</label>
                    <select
                      value={formState.classTeacher || ''}
                      onChange={(e) => setFormState({ ...formState, classTeacher: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    >
                      <option value="">None / Unassigned</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Subject Form */}
            {modalType === 'subject' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Biology"
                    value={formState.name || ''}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIO-101"
                    value={formState.code || ''}
                    onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formState.description || ''}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AcademicsManager;
