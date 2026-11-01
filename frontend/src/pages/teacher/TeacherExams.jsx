import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, createExam, deleteExam, getAcademicYears, getClasses, getSubjects } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Award, Plus, Trash2, Calendar, FileSpreadsheet, Layers, ArrowRight } from 'lucide-react';

export const TeacherExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Exam creation modal
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({
    name: '',
    academicYear: '',
    class: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    maxMarks: 100,
    passingMarks: 35,
    examType: 'Unit Test',
    description: '',
  });

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      setLoading(true);
      const [yRes, cRes, sRes] = await Promise.all([
        getAcademicYears(),
        getClasses(),
        getSubjects(),
      ]);
      setYears(yRes.data);
      setClasses(cRes.data);
      setSubjects(sRes.data);

      if (yRes.data.length > 0) {
        const curr = yRes.data.find((y) => y.isCurrent) || yRes.data[0];
        setSelectedYear(curr._id);
        setExamForm((prev) => ({ ...prev, academicYear: curr._id }));
      }
      if (cRes.data.length > 0) {
        setSelectedClass(cRes.data[0]._id);
        setExamForm((prev) => ({ ...prev, class: cRes.data[0]._id }));
      }
      if (sRes.data.length > 0) {
        setExamForm((prev) => ({ ...prev, subject: sRes.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsList();
  }, [selectedYear, selectedClass]);

  const fetchExamsList = async () => {
    try {
      const res = await getExams({
        academicYearId: selectedYear,
        classId: selectedClass,
      });
      setExams(res.data);
    } catch (e) {
      console.error('Error fetching exams:', e);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await createExam(examForm);
      setShowExamModal(false);
      fetchExamsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating exam');
    }
  };

  const handleDeleteExam = async (id, name) => {
    if (window.confirm(`Delete exam "${name}"? This will delete all student scores for this test.`)) {
      try {
        await deleteExam(id);
        fetchExamsList();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting exam');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-indigo-600" />
            Tests & Examination Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure unit tests, quarterly assessments, and enter marks directly.
          </p>
        </div>

        <button
          onClick={() => setShowExamModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Test / Exam
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700 uppercase tracking-wider">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-900"
          >
            {years.map((y) => (
              <option key={y._id} value={y._id}>
                {y.name} {y.isCurrent ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700 uppercase tracking-wider">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 text-xs ml-auto">
          Found <strong className="text-slate-800">{exams.length}</strong> configured assessments
        </span>
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {exam.examType}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-2">{exam.name}</h4>
                <p className="text-xs font-semibold text-slate-700">{exam.subject?.name}</p>
              </div>
              <button
                onClick={() => handleDeleteExam(exam._id, exam.name)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="Delete Exam"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Maximum Marks:</span>
                <strong className="text-slate-800">{exam.maxMarks}</strong>
              </div>
              <div className="flex justify-between">
                <span>Passing Marks:</span>
                <strong className="text-slate-800">{exam.passingMarks}</strong>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-slate-700">
                  {exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => navigate('/teacher/marks')}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Open Grade Sheet & Enter Marks</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Exam Modal */}
      {showExamModal && (
        <Modal
          isOpen={showExamModal}
          onClose={() => setShowExamModal(false)}
          title="Create New Examination or Test"
          subtitle="Configure maximum marks, passing marks, and subject assignment"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Exam / Test Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Unit Test 2 - Geometry & Trigonometry"
                value={examForm.name}
                onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Year *</label>
                <select
                  required
                  value={examForm.academicYear}
                  onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                >
                  {years.map((y) => (
                    <option key={y._id} value={y._id}>{y.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class *</label>
                <select
                  required
                  value={examForm.class}
                  onChange={(e) => setExamForm({ ...examForm, class: e.target.value })}
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
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  required
                  value={examForm.subject}
                  onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Type</label>
                <select
                  value={examForm.examType}
                  onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Unit Test">Unit Test</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Final Exam">Final Exam</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Practical">Practical Assessment</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Marks *</label>
                <input
                  type="number"
                  required
                  value={examForm.maxMarks}
                  onChange={(e) => setExamForm({ ...examForm, maxMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Passing Marks *</label>
                <input
                  type="number"
                  required
                  value={examForm.passingMarks}
                  onChange={(e) => setExamForm({ ...examForm, passingMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowExamModal(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
              >
                Create Exam
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherExams;
