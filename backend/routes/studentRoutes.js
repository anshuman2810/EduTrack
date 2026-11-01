const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Student = require('../models/Student');
const StudentAcademicRecord = require('../models/StudentAcademicRecord');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const AcademicYear = require('../models/AcademicYear');
const { upload, verifyImageMagicBytes } = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/students
// @desc    Get all students with filters & pagination
// @access  Private (Admin, Teacher, Parent)
router.get('/', protect, async (req, res) => {
  try {
    const {
      academicYearId,
      classId,
      sectionId,
      search,
      status,
      page = 1,
      limit = 100,
    } = req.query;

    const studentQuery = {};
    if (status) {
      studentQuery.status = status;
    }
    if (search && typeof search === 'string') {
      // SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION - OBS-11 / PoC-06)
      // Escape regex special characters to prevent ReDoS, wildcard injection, and SyntaxError crashes
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const sanitizedSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      studentQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { studentId: searchRegex },
        { admissionNumber: searchRegex },
        { phone: searchRegex },
        { aadhaarNumber: searchRegex },
      ];
    }

    // If filtering by academic year, class, or section, query StudentAcademicRecord
    if (academicYearId || classId || sectionId) {
      const recordQuery = {};
      if (academicYearId) recordQuery.academicYear = academicYearId;
      if (classId) recordQuery.class = classId;
      if (sectionId) recordQuery.section = sectionId;

      const records = await StudentAcademicRecord.find(recordQuery).select('student');
      const matchingStudentIds = records.map((r) => r.student);
      studentQuery._id = { $in: matchingStudentIds };
    }

    const students = await Student.find(studentQuery)
      .populate('parentUser', 'name email phone relationship')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Student.countDocuments(studentQuery);

    // Attach current or specified academic year record to each student
    const studentIds = students.map((s) => s._id);
    let recordQuery = { student: { $in: studentIds } };
    if (academicYearId) {
      recordQuery.academicYear = academicYearId;
    } else {
      recordQuery.isCurrentYear = true;
    }

    const academicRecords = await StudentAcademicRecord.find(recordQuery)
      .populate('academicYear', 'name isCurrent')
      .populate('class', 'name code')
      .populate('section', 'name roomNumber')
      .populate('subjects.subject', 'name code')
      .populate('subjects.teacher', 'name email');

    const recordMap = {};
    academicRecords.forEach((r) => {
      recordMap[r.student.toString()] = r;
    });

    const populatedStudents = students.map((s) => {
      const sObj = s.toObject();
      sObj.currentAcademicRecord = recordMap[s._id.toString()] || null;
      return sObj;
    });

    res.json({
      students: populatedStudents,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// @route   POST /api/students
// @desc    Create new student with personal info, photo, and initial academic record
// @access  Private (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('photo'),
  verifyImageMagicBytes,
  async (req, res) => {
    try {
      const studentData = req.body;

      if (req.file) {
        studentData.photo = `/uploads/${req.file.filename}`;
      }

      if (studentData.studentId) studentData.studentId = studentData.studentId.trim().toUpperCase();
      if (studentData.admissionNumber) studentData.admissionNumber = studentData.admissionNumber.trim().toUpperCase();

      if (typeof studentData.address === 'string') {
        try {
          studentData.address = JSON.parse(studentData.address);
        } catch (e) {}
      }
      if (typeof studentData.emergencyContact === 'string') {
        try {
          studentData.emergencyContact = JSON.parse(studentData.emergencyContact);
        } catch (e) {}
      }
      if (typeof studentData.parentInfo === 'string') {
        try {
          studentData.parentInfo = JSON.parse(studentData.parentInfo);
        } catch (e) {}
      }

      // Check if studentId or admissionNumber already exists
      const existingId = await Student.findOne({
        $or: [
          { studentId: studentData.studentId },
          { admissionNumber: studentData.admissionNumber },
        ],
      });

      if (existingId) {
        return res.status(400).json({
          message: 'A student with this Student ID or Admission Number already exists.',
        });
      }

      // Create Student
      const student = new Student(studentData);
      const savedStudent = await student.save();

      // Create initial StudentAcademicRecord if academic details were provided
      let savedRecord = null;
      if (studentData.academicYear && studentData.class && studentData.section) {
        let subjectsList = [];
        if (studentData.subjects) {
          try {
            const rawSubs =
              typeof studentData.subjects === 'string'
                ? JSON.parse(studentData.subjects)
                : studentData.subjects;
            subjectsList = rawSubs.map((s) => ({
              subject: s.subject || s._id || s,
              teacher: s.teacher || null,
            }));
          } catch (e) {}
        }

        const academicRecord = new StudentAcademicRecord({
          student: savedStudent._id,
          academicYear: studentData.academicYear,
          class: studentData.class,
          section: studentData.section,
          rollNumber: studentData.rollNumber || '',
          subjects: subjectsList,
          isCurrentYear: true,
          status: 'Enrolled',
          remarks: studentData.remarks || 'Initial enrollment',
        });

        savedRecord = await academicRecord.save();
      }

      res.status(201).json({
        student: savedStudent,
        academicRecord: savedRecord,
        message: 'Student created successfully with unique QR code generated',
      });
    } catch (error) {
      console.error('Error creating student:', error);
      res.status(400).json({ message: 'Error creating student', error: error.message });
    }
  }
);

// @route   GET /api/students/:id
// @desc    Get detailed student profile with all academic years history
// @access  Private (Admin, Teacher, Parent)
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      'parentUser',
      'name email phone relationship occupation address'
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION - OBS-07 / PoC-01):
    // Object-Level Access Control (BOLA/IDOR Defense)
    // Enforce that Parent users can only view profiles of their own registered children
    if (req.user.role === 'parent') {
      const parentId = req.user._id.toString();
      const studentParentId = student.parentUser ? student.parentUser._id.toString() : null;
      const isLinkedChild =
        req.user.students &&
        req.user.students.some((s) => s.toString() === student._id.toString());

      if (studentParentId !== parentId && !isLinkedChild) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to view another student\'s records.',
        });
      }
    }

    // Fetch all academic records across all years
    const academicHistory = await StudentAcademicRecord.find({ student: student._id })
      .populate('academicYear', 'name isCurrent startDate endDate')
      .populate('class', 'name code')
      .populate('section', 'name roomNumber')
      .populate('subjects.subject', 'name code')
      .populate('subjects.teacher', 'name email designation')
      .sort({ createdAt: -1 });

    const currentRecord = academicHistory.find((r) => r.isCurrentYear) || academicHistory[0];

    // Attendance stats
    const attendanceRecords = await Attendance.find({ student: student._id });
    const totalAttendance = attendanceRecords.length;
    const presentAttendance = attendanceRecords.filter((a) => a.status === 'Present').length;
    const absentAttendance = attendanceRecords.filter((a) => a.status === 'Absent').length;
    const lateAttendance = attendanceRecords.filter((a) => a.status === 'Late').length;
    const attendancePercentage =
      totalAttendance > 0
        ? Math.round(((presentAttendance + lateAttendance * 0.5) / totalAttendance) * 100)
        : 100;

    // Marks and exams
    const marks = await Mark.find({ student: student._id })
      .populate('exam', 'name date maxMarks examType')
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .sort({ createdAt: -1 });

    res.json({
      student,
      currentRecord,
      academicHistory,
      attendanceStats: {
        total: totalAttendance,
        present: presentAttendance,
        absent: absentAttendance,
        late: lateAttendance,
        percentage: attendancePercentage,
      },
      marks,
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student details', error: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student details
// @access  Private (Admin or Teacher)
router.put(
  '/:id',
  protect,
  authorize('admin', 'teacher'),
  upload.single('photo'),
  verifyImageMagicBytes,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const updateData = req.body;

      if (req.file) {
        updateData.photo = `/uploads/${req.file.filename}`;
      }

      if (updateData.studentId) updateData.studentId = updateData.studentId.trim().toUpperCase();
      if (updateData.admissionNumber) updateData.admissionNumber = updateData.admissionNumber.trim().toUpperCase();

      // Check conflict if studentId or admissionNumber changed
      if (
        (updateData.studentId && updateData.studentId !== student.studentId) ||
        (updateData.admissionNumber && updateData.admissionNumber !== student.admissionNumber)
      ) {
        const conflict = await Student.findOne({
          _id: { $ne: student._id },
          $or: [
            ...(updateData.studentId ? [{ studentId: updateData.studentId }] : []),
            ...(updateData.admissionNumber ? [{ admissionNumber: updateData.admissionNumber }] : []),
          ],
        });
        if (conflict) {
          return res.status(400).json({
            message: 'Another student already exists with this Student ID or Admission Number.',
          });
        }
      }

      if (typeof updateData.address === 'string') {
        try {
          updateData.address = JSON.parse(updateData.address);
        } catch (e) {}
      }
      if (typeof updateData.emergencyContact === 'string') {
        try {
          updateData.emergencyContact = JSON.parse(updateData.emergencyContact);
        } catch (e) {}
      }
      if (typeof updateData.parentInfo === 'string') {
        try {
          updateData.parentInfo = JSON.parse(updateData.parentInfo);
        } catch (e) {}
      }

      // Do NOT overwrite the permanent qrToken
      delete updateData.qrToken;

      Object.assign(student, updateData);
      const updatedStudent = await student.save();

      // If academic details for the current year were also updated
      if (updateData.academicYear && updateData.class && updateData.section) {
        let subjectsList = [];
        if (updateData.subjects) {
          try {
            const rawSubs =
              typeof updateData.subjects === 'string'
                ? JSON.parse(updateData.subjects)
                : updateData.subjects;
            subjectsList = rawSubs.map((s) => ({
              subject: s.subject || s._id || s,
              teacher: s.teacher || null,
            }));
          } catch (e) {}
        }

        await StudentAcademicRecord.findOneAndUpdate(
          { student: student._id, academicYear: updateData.academicYear },
          {
            class: updateData.class,
            section: updateData.section,
            rollNumber: updateData.rollNumber,
            subjects: subjectsList,
            remarks: updateData.remarks,
          },
          { upsert: true, new: true }
        );
      }

      res.json({
        student: updatedStudent,
        message: 'Student updated successfully',
      });
    } catch (error) {
      res.status(400).json({ message: 'Error updating student', error: error.message });
    }
  }
);

// @route   DELETE /api/students/:id
// @desc    Remove student, associated academic records, attendance, marks, and parent links
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await StudentAcademicRecord.deleteMany({ student: student._id });
    await Attendance.deleteMany({ student: student._id });
    await Mark.deleteMany({ student: student._id });
    await Feedback.deleteMany({ student: student._id });
    // Remove reference from parent accounts
    await User.updateMany(
      { role: 'parent', students: student._id },
      { $pull: { students: student._id } }
    );
    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student and all associated records removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing student', error: error.message });
  }
});

// @route   POST /api/students/:id/enroll-year
// @desc    Enroll/Promote student to a new academic year without replacing previous history
// @access  Private (Admin only)
router.post('/:id/enroll-year', protect, authorize('admin'), async (req, res) => {
  try {
    const { academicYear, class: classId, section, rollNumber, subjects, remarks } = req.body;
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Set all previous academic records for this student to isCurrentYear = false
    await StudentAcademicRecord.updateMany(
      { student: studentId },
      { $set: { isCurrentYear: false } }
    );

    let subjectsList = [];
    if (subjects && Array.isArray(subjects)) {
      subjectsList = subjects.map((s) => ({
        subject: s.subject || s._id || s,
        teacher: s.teacher || null,
      }));
    }

    const newRecord = await StudentAcademicRecord.findOneAndUpdate(
      { student: studentId, academicYear },
      {
        class: classId,
        section,
        rollNumber: rollNumber || '',
        subjects: subjectsList,
        isCurrentYear: true,
        status: 'Enrolled',
        remarks: remarks || '',
      },
      { upsert: true, new: true }
    )
      .populate('academicYear')
      .populate('class')
      .populate('section');

    res.status(201).json({
      message: 'Student enrolled into new academic year successfully',
      record: newRecord,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error enrolling student', error: error.message });
  }
});

// @route   GET /api/students/:id/qr
// @desc    Get QR code data URL and printable metadata for a student
// @access  Private
router.get('/:id/qr', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION - OBS-07 / PoC-01):
    // Object-Level Access Control (BOLA/IDOR Defense)
    // Enforce that Parent users can only view profiles of their own registered children
    if (req.user.role === 'parent') {
      const parentId = req.user._id.toString();
      const studentParentId = student.parentUser ? student.parentUser._id.toString() : null;
      const isLinkedChild =
        req.user.students &&
        req.user.students.some((s) => s.toString() === student._id.toString());

      if (studentParentId !== parentId && !isLinkedChild) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to view another student\'s records.',
        });
      }
    }

    const host = req.get('host');
    const origin = req.headers.referer
      ? new URL(req.headers.referer).origin
      : `http://${host}`;

    const profileUrl = `${origin}/verify/${student.qrToken}`;

    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    res.json({
      studentId: student.studentId,
      fullName: `${student.firstName} ${student.lastName}`,
      qrToken: student.qrToken,
      profileUrl,
      qrDataUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating student QR', error: error.message });
  }
});

module.exports = router;
