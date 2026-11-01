import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { createStudent, updateStudent, getAcademicYears, getClasses, getSections } from '../../services/api';
import { Upload, User, ShieldAlert, Check } from 'lucide-react';

export const StudentFormModal = ({ isOpen, onClose, student = null, onSuccess }) => {
  const isEdit = !!student;

  const [formData, setFormData] = useState({
    studentId: '',
    admissionNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    email: '',
    phone: '',
    aadhaarNumber: '',
    nationality: 'Indian',
    category: 'General',
    address: { street: '', city: 'New Delhi', state: 'Delhi', postalCode: '', country: 'India' },
    emergencyContact: { name: '', relation: 'Father', phone: '' },
    parentInfo: { fatherName: '', fatherPhone: '', motherName: '', motherPhone: '' },
    // Academic fields for initial enrollment
    academicYear: '',
    class: '',
    section: '',
    rollNumber: '',
    remarks: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (student) {
        setFormData({
          studentId: student.studentId || '',
          admissionNumber: student.admissionNumber || '',
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
          gender: student.gender || 'Male',
          bloodGroup: student.bloodGroup || 'O+',
          email: student.email || '',
          phone: student.phone || '',
          aadhaarNumber: student.aadhaarNumber || '',
          nationality: student.nationality || 'Indian',
          category: student.category || 'General',
          address: {
            street: student.address?.street || '',
            city: student.address?.city || '',
            state: student.address?.state || '',
            postalCode: student.address?.postalCode || '',
            country: student.address?.country || 'India',
          },
          emergencyContact: {
            name: student.emergencyContact?.name || '',
            relation: student.emergencyContact?.relation || '',
            phone: student.emergencyContact?.phone || '',
          },
          parentInfo: {
            fatherName: student.parentInfo?.fatherName || '',
            fatherPhone: student.parentInfo?.fatherPhone || '',
            motherName: student.parentInfo?.motherName || '',
            motherPhone: student.parentInfo?.motherPhone || '',
          },
          academicYear: student.currentAcademicRecord?.academicYear?._id || '',
          class: student.currentAcademicRecord?.class?._id || '',
          section: student.currentAcademicRecord?.section?._id || '',
          rollNumber: student.currentAcademicRecord?.rollNumber || '',
          remarks: student.currentAcademicRecord?.remarks || '',
        });
        setPhotoPreview(student.photo || '');
      } else {
        // Reset for new student
        const randNum = Math.floor(100 + Math.random() * 900);
        setFormData({
          studentId: `STU-2026-${randNum}`,
          admissionNumber: `ADM-${12000 + randNum}`,
          firstName: '',
          lastName: '',
          dateOfBirth: '2010-05-15',
          gender: 'Male',
          bloodGroup: 'O+',
          email: '',
          phone: '',
          aadhaarNumber: '',
          nationality: 'Indian',
          category: 'General',
          address: { street: '', city: 'New Delhi', state: 'Delhi', postalCode: '', country: 'India' },
          emergencyContact: { name: '', relation: 'Father', phone: '' },
          parentInfo: { fatherName: '', fatherPhone: '', motherName: '', motherPhone: '' },
          academicYear: '',
          class: '',
          section: '',
          rollNumber: '',
          remarks: 'New student admission',
        });
        setPhotoFile(null);
        setPhotoPreview('');
      }
    }
  }, [isOpen, student]);

  const loadDropdowns = async () => {
    try {
      const [yRes, cRes] = await Promise.all([getAcademicYears(), getClasses()]);
      setYears(yRes.data);
      setClasses(cRes.data);
      if (yRes.data.length > 0 && !formData.academicYear) {
        const curr = yRes.data.find((y) => y.isCurrent) || yRes.data[0];
        setFormData((prev) => ({ ...prev, academicYear: curr._id }));
      }
      if (cRes.data.length > 0 && !formData.class) {
        setFormData((prev) => ({ ...prev, class: cRes.data[0]._id }));
        fetchSectionsForClass(cRes.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSectionsForClass = async (classId) => {
    try {
      const sRes = await getSections(classId);
      setSections(sRes.data);
      if (sRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, section: sRes.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFormData((prev) => ({ ...prev, class: classId }));
    fetchSectionsForClass(classId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formPayload = new FormData();
      if (photoFile) {
        formPayload.append('photo', photoFile);
      }

      // Append top level fields
      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === 'object' && formData[key] !== null) {
          formPayload.append(key, JSON.stringify(formData[key]));
        } else {
          formPayload.append(key, formData[key]);
        }
      });

      if (isEdit) {
        await updateStudent(student._id, formPayload);
      } else {
        await createStudent(formPayload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving student:', err);
      setError(err.response?.data?.message || 'Error saving student record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Student Details' : 'Enroll New Student & Generate QR Code'}
      subtitle="Complete profile and academic year class assignment"
      maxWidth="max-w-3xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo and Identifiers Row */}
        <div className="flex flex-col sm:flex-row gap-5 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="relative">
            <img
              src={
                photoPreview ||
                'https://ui-avatars.com/api/?name=New+Student&background=4f46e5&color=fff'
              }
              alt="Preview"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm"
            />
            <label className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer shadow">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admission Number *
              </label>
              <input
                type="text"
                required
                value={formData.admissionNumber}
                onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Basic Personal Details */}
        <div>
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Aadhaar Number</label>
              <input
                type="text"
                placeholder="12 digit Aadhaar"
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City & State</label>
              <input
                type="text"
                placeholder="e.g. New Delhi, Delhi"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Parent & Emergency Contacts */}
        <div>
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
            Parent & Emergency Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Father's Name</label>
              <input
                type="text"
                value={formData.parentInfo.fatherName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentInfo: { ...formData.parentInfo, fatherName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Father's Phone</label>
              <input
                type="text"
                value={formData.parentInfo.fatherPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentInfo: { ...formData.parentInfo, fatherPhone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mother's Name</label>
              <input
                type="text"
                value={formData.parentInfo.motherName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentInfo: { ...formData.parentInfo, motherName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
              <input
                type="text"
                value={formData.emergencyContact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Academic Enrollment Assignment */}
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">
            Academic Year & Class Assignment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year *</label>
              <select
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-indigo-900"
              >
                {years.map((y) => (
                  <option key={y._id} value={y._id}>
                    {y.name} {y.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class *</label>
              <select
                required
                value={formData.class}
                onChange={handleClassChange}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section *</label>
              <select
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
              >
                {sections.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.roomNumber || 'Room'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                placeholder="e.g. 10A-06"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
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
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEdit ? 'Update Student' : 'Save & Generate QR'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentFormModal;
