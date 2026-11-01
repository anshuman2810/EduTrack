const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/exams
// @desc    Get all exams with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { academicYearId, classId, sectionId, subjectId } = req.query;
    const filter = {};

    if (academicYearId) filter.academicYear = academicYearId;
    if (classId) filter.class = classId;
    if (sectionId) {
      filter.$or = [{ section: sectionId }, { section: null }];
    }
    if (subjectId) filter.subject = subjectId;

    const exams = await Exam.find(filter)
      .populate('academicYear', 'name isCurrent')
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('subject', 'name code')
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams', error: error.message });
  }
});

// @route   POST /api/exams
// @desc    Create a new test or examination
// @access  Private (Teacher or Admin)
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const examData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const exam = new Exam(examData);
    const saved = await exam.save();
    const populated = await Exam.findById(saved._id)
      .populate('academicYear', 'name')
      .populate('class', 'name')
      .populate('section', 'name')
      .populate('subject', 'name code');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error creating exam', error: error.message });
  }
});

// @route   GET /api/exams/:id
// @desc    Get single exam details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('academicYear', 'name')
      .populate('class', 'name')
      .populate('section', 'name')
      .populate('subject', 'name code')
      .populate('createdBy', 'name');

    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam', error: error.message });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private (Teacher or Admin)
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('academicYear', 'name')
      .populate('class', 'name')
      .populate('section', 'name')
      .populate('subject', 'name code');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating exam', error: error.message });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam and associated marks
// @access  Private (Teacher or Admin)
router.delete('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    await Mark.deleteMany({ exam: req.params.id });
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam and all associated marks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam', error: error.message });
  }
});

module.exports = router;
