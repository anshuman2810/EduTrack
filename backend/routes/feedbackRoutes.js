const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/feedback
// @desc    Get feedback based on role (Admin sees all, Teacher sees their assigned, Parent sees their submitted)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    } else if (req.user.role === 'parent') {
      filter.parent = req.user._id;
    }

    if (req.query.studentId) filter.student = req.query.studentId;
    if (req.query.teacherId) filter.teacher = req.query.teacherId;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;

    const feedbacks = await Feedback.find(filter)
      .populate('parent', 'name email phone relationship')
      .populate('student', 'firstName lastName studentId photo')
      .populate('teacher', 'name email designation')
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// @route   POST /api/feedback
// @desc    Submit feedback (Parent or Admin)
// @access  Private (Parent, Admin)
router.post('/', protect, async (req, res) => {
  try {
    const { studentId, teacherId, subjectId, academicYearId, category, rating, message } = req.body;

    // SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION - OBS-09):
    // Object-Level Authorization: Parents can only submit feedback for their registered children
    if (req.user.role === 'parent') {
      const isLinkedChild =
        req.user.students &&
        req.user.students.some((s) => s.toString() === (studentId || '').toString());

      if (!isLinkedChild) {
        return res.status(403).json({
          message: 'Access Denied: You are only authorized to submit feedback for your own registered children.',
        });
      }
    }

    const feedback = new Feedback({
      parent: req.user.role === 'parent' ? req.user._id : req.body.parentId || req.user._id,
      student: studentId,
      teacher: teacherId,
      subject: subjectId || null,
      academicYear: academicYearId || null,
      category: category || 'General',
      rating: rating || 5,
      message,
    });

    const saved = await feedback.save();
    const populated = await Feedback.findById(saved._id)
      .populate('parent', 'name email relationship')
      .populate('student', 'firstName lastName studentId')
      .populate('teacher', 'name email')
      .populate('subject', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error submitting feedback', error: error.message });
  }
});

// @route   PUT /api/feedback/:id/reply
// @desc    Reply to a feedback message
// @access  Private (Teacher or Admin)
router.put('/:id/reply', protect, async (req, res) => {
  try {
    const { reply } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Ensure teacher can only reply to their own feedback unless admin
    if (req.user.role === 'teacher' && feedback.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reply to this feedback' });
    }

    feedback.reply = reply;
    feedback.repliedAt = new Date();
    feedback.status = 'Replied';

    const updated = await feedback.save();
    const populated = await Feedback.findById(updated._id)
      .populate('parent', 'name email')
      .populate('student', 'firstName lastName studentId')
      .populate('teacher', 'name email')
      .populate('subject', 'name');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error replying to feedback', error: error.message });
  }
});

module.exports = router;
