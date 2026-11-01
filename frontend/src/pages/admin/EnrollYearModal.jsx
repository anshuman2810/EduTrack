import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { enrollStudentYear, getAcademicYears, getClasses, getSections } from '../../services/api';
import { Award, ShieldAlert, Check, Calendar, ArrowRight } from 'lucide-react';

export const EnrollYearModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && student) {
      loadData();
    }
  }, [isOpen, student]);

  const loadData = async () => {
    try {
      const [yRes, cRes] = await Promise.all([getAcademicYears(), getClasses()]);
      setYears(yRes.data);
      setClasses(cRes.data);

      if (yRes.data.length > 0) {
        setSelectedYear(yRes.data[0]._id);
      }
      if (cRes.data.length > 0) {
        setSelectedClass(cRes.data[0]._id);
        fetchSections(cRes.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const sRes = await getSections(classId);
      setSections(sRes.data);
      if (sRes.data.length > 0) {
        setSelectedSection(sRes.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    fetchSections(classId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedYear || !selectedClass || !selectedSection) {
      setError('Please select Academic Year, Class, and Section');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await enrollStudentYear(student._id, {
        academicYear: selectedYear,
        class: selectedClass,
        section: selectedSection,
        rollNumber,
        remarks: remarks || `Promoted/Enrolled into new academic term`,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error enrolling student into new year');
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Promote or Enroll Student into New Academic Year"
      subtitle="Creates a new academic year record while preserving all past historical grades & attendance"
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target student highlight */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 mb-5 flex items-center gap-3">
        <img
          src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
          alt={student.firstName}
          className="w-12 h-12 rounded-xl object-cover border border-indigo-300"
          onError={(e) => {
            e.target.src =
              'https://ui-avatars.com/api/?name=' +
              encodeURIComponent(student.firstName + ' ' + student.lastName) +
              '&background=4f46e5&color=fff';
          }}
        />
        <div>
          <h4 className="font-bold text-indigo-950 text-sm">
            {student.firstName} {student.lastName}
          </h4>
          <p className="text-xs text-indigo-700 font-mono">
            Student ID: {student.studentId} • Permanent QR Token Assigned
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            New Academic Year *
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-indigo-900"
          >
            {years.map((y) => (
              <option key={y._id} value={y._id}>
                {y.name} {y.isCurrent ? '★ (Current Year)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Class *
            </label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Section *
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
            >
              {sections.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.roomNumber || 'Room'})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            New Roll Number
          </label>
          <input
            type="text"
            placeholder="e.g. 10A-01"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Promotion / Academic Remarks
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Promoted to standard 10 with distinction in science and mathematics"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
          />
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
          <strong>Note:</strong> The student's permanent QR code will immediately point to this new academic year as current, while parents and staff can seamlessly toggle back to view previous year grades and records using the year selector!
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            {loading ? 'Processing...' : (
              <>
                <span>Enroll into New Year</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EnrollYearModal;
