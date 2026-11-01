const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const AcademicYear = require('../models/AcademicYear');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/authMiddleware');

// ================= TEACHERS =================
// GET all teachers
router.get('/teachers', protect, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password')
      .populate('assignedClasses.class', 'name code')
      .populate('assignedClasses.section', 'name roomNumber')
      .populate('assignedClasses.subject', 'name code')
      .sort({ name: 1 });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

// CREATE teacher (Admin only)
router.post('/teachers', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, employeeId, qualification, designation, assignedClasses } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const teacher = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password || 'Teacher@123',
      role: 'teacher',
      phone,
      employeeId: employeeId ? employeeId.trim().toUpperCase() : '',
      qualification,
      designation: designation || 'Teacher',
      assignedClasses: assignedClasses || [],
    });

    const savedTeacher = await teacher.save();
    const populated = await User.findById(savedTeacher._id)
      .select('-password')
      .populate('assignedClasses.class')
      .populate('assignedClasses.section')
      .populate('assignedClasses.subject');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error creating teacher', error: error.message });
  }
});

// UPDATE teacher (Admin only)
router.put('/teachers/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { name, email, phone, employeeId, qualification, designation, assignedClasses, password } = req.body;

    if (email && email.toLowerCase().trim() !== teacher.email) {
      const conflict = await User.findOne({ _id: { $ne: teacher._id }, email: email.toLowerCase().trim() });
      if (conflict) {
        return res.status(400).json({ message: 'Another user with this email already exists' });
      }
      teacher.email = email.toLowerCase().trim();
    }

    teacher.name = name || teacher.name;
    teacher.phone = phone !== undefined ? phone : teacher.phone;
    teacher.employeeId = employeeId !== undefined ? employeeId.trim().toUpperCase() : teacher.employeeId;
    teacher.qualification = qualification !== undefined ? qualification : teacher.qualification;
    teacher.designation = designation || teacher.designation;
    if (assignedClasses) teacher.assignedClasses = assignedClasses;
    if (password) teacher.password = password;

    const updated = await teacher.save();
    const populated = await User.findById(updated._id)
      .select('-password')
      .populate('assignedClasses.class')
      .populate('assignedClasses.section')
      .populate('assignedClasses.subject');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating teacher', error: error.message });
  }
});

// DELETE teacher (Admin only)
router.delete('/teachers/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacherId = req.params.id;
    // Unset class teacher in sections
    await Section.updateMany({ classTeacher: teacherId }, { $set: { classTeacher: null } });
    // Remove from assignedTeachers in subjects
    await Subject.updateMany({ assignedTeachers: teacherId }, { $pull: { assignedTeachers: teacherId } });
    await User.findByIdAndDelete(teacherId);

    res.json({ message: 'Teacher removed and unlinked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing teacher', error: error.message });
  }
});

// ================= PARENTS =================
// GET all parents
router.get('/parents', protect, async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' })
      .select('-password')
      .populate('students', 'firstName lastName studentId admissionNumber photo')
      .sort({ name: 1 });

    res.json(parents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parents', error: error.message });
  }
});

// CREATE parent (Admin only)
router.post('/parents', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, relationship, occupation, address, students } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Deduplicate student IDs
    const uniqueStudents = Array.from(new Set(students || []));

    const parent = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password || 'Parent@123',
      role: 'parent',
      phone,
      relationship: relationship || 'Father',
      occupation,
      address,
      students: uniqueStudents,
    });

    const savedParent = await parent.save();

    // Link students to parent
    if (uniqueStudents.length > 0) {
      await Student.updateMany(
        { _id: { $in: uniqueStudents } },
        { $set: { parentUser: savedParent._id } }
      );
    }

    const populated = await User.findById(savedParent._id)
      .select('-password')
      .populate('students', 'firstName lastName studentId admissionNumber photo');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error creating parent', error: error.message });
  }
});

// UPDATE parent (Admin only)
router.put('/parents/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const parent = await User.findById(req.params.id);
    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const { name, email, phone, relationship, occupation, address, students, password } = req.body;

    if (email && email.toLowerCase().trim() !== parent.email) {
      const conflict = await User.findOne({ _id: { $ne: parent._id }, email: email.toLowerCase().trim() });
      if (conflict) {
        return res.status(400).json({ message: 'Another user with this email already exists' });
      }
      parent.email = email.toLowerCase().trim();
    }

    parent.name = name || parent.name;
    parent.phone = phone !== undefined ? phone : parent.phone;
    parent.relationship = relationship || parent.relationship;
    parent.occupation = occupation !== undefined ? occupation : parent.occupation;
    parent.address = address !== undefined ? address : parent.address;
    if (password) parent.password = password;

    if (students) {
      // Deduplicate student IDs
      const uniqueStudents = Array.from(new Set(students));
      // Remove old parentUser links if student was unlinked
      await Student.updateMany(
        { parentUser: parent._id, _id: { $nin: uniqueStudents } },
        { $set: { parentUser: null } }
      );
      // Add new parentUser links
      await Student.updateMany(
        { _id: { $in: uniqueStudents } },
        { $set: { parentUser: parent._id } }
      );
      parent.students = uniqueStudents;
    }

    const updated = await parent.save();
    const populated = await User.findById(updated._id)
      .select('-password')
      .populate('students', 'firstName lastName studentId admissionNumber photo');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating parent', error: error.message });
  }
});

// DELETE parent (Admin only)
router.delete('/parents/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Student.updateMany({ parentUser: req.params.id }, { $set: { parentUser: null } });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Parent removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing parent', error: error.message });
  }
});

// ================= STATS / OVERVIEW =================
router.get('/stats', protect, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalClasses = await Class.countDocuments();
    const totalSections = await Section.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const currentAcademicYear = await AcademicYear.findOne({ isCurrent: true });

    // Calculate attendance percentage
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    const totalTodayMarked = todayAttendance.length;
    const presentToday = todayAttendance.filter((a) => a.status === 'Present').length;
    const todayAttendanceRate = totalTodayMarked > 0 ? Math.round((presentToday / totalTodayMarked) * 100) : 95;

    const totalExams = await Exam.countDocuments();

    // Gender breakdown
    const maleStudents = await Student.countDocuments({ gender: 'Male' });
    const femaleStudents = await Student.countDocuments({ gender: 'Female' });

    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      totalSections,
      totalSubjects,
      currentAcademicYear: currentAcademicYear?.name || '2025-26',
      todayAttendanceRate,
      totalExams,
      genderBreakdown: {
        male: maleStudents,
        female: femaleStudents,
        other: totalStudents - maleStudents - femaleStudents,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
