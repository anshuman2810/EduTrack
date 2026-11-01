import React, { useState, useEffect } from 'react';
import { getAcademicYears, getClasses, getSections, getAttendance, submitBulkAttendance } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle, Save, Filter, Sparkles } from 'lucide-react';

export const AttendanceManager = () => {
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [yRes, cRes] = await Promise.all([getAcademicYears(), getClasses()]);
      setYears(yRes.data);
      setClasses(cRes.data);

      if (yRes.data.length > 0) {
        const curr = yRes.data.find((y) => y.isCurrent) || yRes.data[0];
        setSelectedYear(curr._id);
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
      } else {
        setSelectedSection('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClassChange = (e) => {
    const cid = e.target.value;
    setSelectedClass(cid);
    fetchSections(cid);
  };

  useEffect(() => {
    if (selectedClass && selectedSection && date) {
      fetchAttendanceRecords();
    }
  }, [date, selectedClass, selectedSection, selectedYear]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      setSuccessMsg('');
      const res = await getAttendance({
        date,
        classId: selectedClass,
        sectionId: selectedSection,
        academicYearId: selectedYear,
      });
      setAttendanceData(res.data.students || []);
    } catch (e) {
      console.error('Error fetching attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  const setAllStatus = (newStatus) => {
    setAttendanceData((prev) =>
      prev.map((item) => ({ ...item, status: newStatus }))
    );
  };

  const updateStudentStatus = (studentId, status) => {
    setAttendanceData((prev) =>
      prev.map((item) =>
        item.student._id === studentId ? { ...item, status } : item
      )
    );
  };

  const updateStudentRemarks = (studentId, remarks) => {
    setAttendanceData((prev) =>
      prev.map((item) =>
        item.student._id === studentId ? { ...item, remarks } : item
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      const payload = {
        date,
        classId: selectedClass,
        sectionId: selectedSection,
        academicYearId: selectedYear,
        attendanceList: attendanceData.map((item) => ({
          studentId: item.student._id,
          status: item.status,
          remarks: item.remarks || '',
        })),
      };

      await submitBulkAttendance(payload);
      setSuccessMsg('Attendance records successfully updated and saved!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = attendanceData.filter((a) => a.status === 'Present').length;
  const absentCount = attendanceData.filter((a) => a.status === 'Absent').length;
  const lateCount = attendanceData.filter((a) => a.status === 'Late').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-indigo-600" />
            Daily Attendance Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bulk attendance registers with 1-click marking, status toggles, and remarks.
          </p>
        </div>

        {attendanceData.length > 0 && (
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance Register'}</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Academic Year *
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-900"
            >
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name} {y.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Class *
            </label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Section *
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              {sections.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.roomNumber || 'Room'})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Batch Actions */}
        {attendanceData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Quick Fill:</span>
              <button
                type="button"
                onClick={() => setAllStatus('Present')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => setAllStatus('Absent')}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors"
              >
                Mark All Absent
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-emerald-700">Present: {presentCount}</span>
              <span className="text-rose-700">Absent: {absentCount}</span>
              <span className="text-amber-700">Late: {lateCount}</span>
              <span className="text-slate-500">Total: {attendanceData.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading attendance register...</div>
        ) : attendanceData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-16">Roll No</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Remarks / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceData.map((row) => (
                  <tr key={row.student._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {row.rollNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            row.student.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              row.student.firstName + ' ' + row.student.lastName
                            )}&background=4f46e5&color=fff`
                          }
                          alt={row.student.firstName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-900">
                          {row.student.firstName} {row.student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                      {row.student.studentId}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                        {['Present', 'Absent', 'Late', 'Excused'].map((st) => {
                          const isActive = row.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => updateStudentStatus(row.student._id, st)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                isActive
                                  ? st === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : st === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : st === 'Late'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. sick leave, bus delay)..."
                        value={row.remarks || ''}
                        onChange={(e) => updateStudentRemarks(row.student._id, e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No students found enrolled in this class/section for the selected academic year.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManager;
