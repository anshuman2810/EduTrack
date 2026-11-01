const express = require('express');
const router = express.Router();
const AcademicYear = require('../models/AcademicYear');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/authMiddleware');

// ================= ACADEMIC YEARS =================
// GET all academic years
router.get('/years', protect, async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ startDate: -1 });
    res.json(years);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching academic years', error: error.message });
  }
});

// CREATE academic year (Admin only)
router.post('/years', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, startDate, endDate, isCurrent, description } = req.body;
    const year = new AcademicYear({
      name,
      startDate,
      endDate,
      isCurrent: isCurrent || false,
      description,
    });
    const savedYear = await year.save();
    res.status(201).json(savedYear);
  } catch (error) {
    res.status(400).json({ message: 'Error creating academic year', error: error.message });
  }
});

// UPDATE academic year (Admin only)
router.put('/years/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const year = await AcademicYear.findById(req.params.id);
    if (!year) return res.status(404).json({ message: 'Academic year not found' });

    Object.assign(year, req.body);
    const updated = await year.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating academic year', error: error.message });
  }
});

// DELETE academic year (Admin only)
router.delete('/years/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await AcademicYear.findByIdAndDelete(req.params.id);
    res.json({ message: 'Academic year removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting academic year', error: error.message });
  }
});

// ================= CLASSES =================
// GET all classes
router.get('/classes', protect, async (req, res) => {
  try {
    const classes = await Class.find().sort({ order: 1, name: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

// CREATE class (Admin only)
router.post('/classes', protect, authorize('admin'), async (req, res) => {
  try {
    const newClass = new Class(req.body);
    const saved = await newClass.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error creating class', error: error.message });
  }
});

// UPDATE class (Admin only)
router.put('/classes/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating class', error: error.message });
  }
});

// DELETE class (Admin only)
router.delete('/classes/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    // Also delete associated sections
    await Section.deleteMany({ class: req.params.id });
    res.json({ message: 'Class and associated sections removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class', error: error.message });
  }
});

// ================= SECTIONS =================
// GET sections (can filter by class query parameter)
router.get('/sections', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) {
      filter.class = req.query.classId;
    }
    const sections = await Section.find(filter)
      .populate('class', 'name code')
      .populate('classTeacher', 'name email phone');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections', error: error.message });
  }
});

// CREATE section (Admin only)
router.post('/sections', protect, authorize('admin'), async (req, res) => {
  try {
    const section = new Section(req.body);
    const saved = await section.save();
    const populated = await Section.findById(saved._id)
      .populate('class', 'name code')
      .populate('classTeacher', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error creating section', error: error.message });
  }
});

// UPDATE section (Admin only)
router.put('/sections/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updated = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('class', 'name code')
      .populate('classTeacher', 'name email');
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating section', error: error.message });
  }
});

// DELETE section (Admin only)
router.delete('/sections/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting section', error: error.message });
  }
});

// ================= SUBJECTS =================
// GET all subjects
router.get('/subjects', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) {
      filter.classes = req.query.classId;
    }
    const subjects = await Subject.find(filter)
      .populate('classes', 'name code')
      .populate('assignedTeachers', 'name email designation');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
});

// CREATE subject (Admin only)
router.post('/subjects', protect, authorize('admin'), async (req, res) => {
  try {
    const subject = new Subject(req.body);
    const saved = await subject.save();
    const populated = await Subject.findById(saved._id)
      .populate('classes', 'name code')
      .populate('assignedTeachers', 'name email designation');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error creating subject', error: error.message });
  }
});

// UPDATE subject (Admin only)
router.put('/subjects/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('classes', 'name code')
      .populate('assignedTeachers', 'name email designation');
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating subject', error: error.message });
  }
});

// DELETE subject (Admin only)
router.delete('/subjects/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subject', error: error.message });
  }
});

module.exports = router;
