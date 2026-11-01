const express = require('express');
const router = express.Router();
const Mark = require('../models/Mark');
const Exam = require('../models/Exam');
const StudentAcademicRecord = require('../models/StudentAcademicRecord');
const { protect, authorize } = require('../middleware/authMiddleware');

// Helper to compute grade
const computeGrade = (obtained, max) => {
  if (!max || max <= 0) return { percentage: 0, grade: 'F', status: 'Fail' };
  const percentage = Math.round((obtained / max) * 100 * 10) / 10;
  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B+';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C';
  else if (percentage >= 35) grade = 'D';

  const status = percentage >= 35 ? 'Pass' : 'Fail';
  return { percentage, grade, status };
};

// @route   GET /api/marks/exam/:examId
// @desc    Get all students with their marks for a specific exam (for batch grading)
// @access  Private
router.get('/exam/:examId', protect, async (req, res) => {
  try {
    const { examId } = req.params;
    const { sectionId } = req.query;

    const exam = await Exam.findById(examId)
      .populate('academicYear')
      .populate('class')
      .populate('section')
      .populate('subject');

    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Find all enrolled students for this exam's class and academic year
    const query = {
      academicYear: exam.academicYear._id,
      class: exam.class._id,
    };
    if (sectionId) {
      query.section = sectionId;
    } else if (exam.section) {
      query.section = exam.section._id;
    }

    const enrolledStudents = await StudentAcademicRecord.find(query)
      .populate('student', 'firstName lastName studentId admissionNumber photo')
      .populate('section', 'name')
      .sort({ rollNumber: 1 });

    // Fetch existing marks for this exam
    const existingMarks = await Mark.find({ exam: examId });
    const markMap = {};
    existingMarks.forEach((m) => {
      markMap[m.student.toString()] = m;
    });

    const studentsWithMarks = enrolledStudents.map((rec) => {
      const markRecord = markMap[rec.student._id.toString()];
      return {
        student: rec.student,
        rollNumber: rec.rollNumber,
        section: rec.section,
        academicRecordId: rec._id,
        marksObtained: markRecord !== undefined ? markRecord.marksObtained : '',
        maxMarks: exam.maxMarks,
        percentage: markRecord ? markRecord.percentage : null,
        grade: markRecord ? markRecord.grade : null,
        remarks: markRecord ? markRecord.remarks : '',
        status: markRecord ? markRecord.status : '',
        markId: markRecord ? markRecord._id : null,
      };
    });

    res.json({
      exam,
      students: studentsWithMarks,
      totalStudents: enrolledStudents.length,
      gradedCount: existingMarks.length,
    });
  } catch (error) {
    console.error('Error fetching exam marks:', error);
    res.status(500).json({ message: 'Error fetching exam marks', error: error.message });
  }
});

// @route   POST /api/marks/bulk
// @desc    Batch save or update marks for an exam
// @access  Private (Teacher or Admin)
router.post('/bulk', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { examId, marksList } = req.body;

    if (!examId || !marksList || !Array.isArray(marksList)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const operations = marksList.map((item) => {
      const obtained = Number(item.marksObtained);
      const max = exam.maxMarks;
      const { percentage, grade, status } = computeGrade(obtained, max);

      return {
        updateOne: {
          filter: {
            exam: examId,
            student: item.studentId || item.student,
          },
          update: {
            $set: {
              exam: examId,
              student: item.studentId || item.student,
              academicYear: exam.academicYear,
              subject: exam.subject,
              marksObtained: obtained,
              maxMarks: max,
              percentage,
              grade,
              status,
              remarks: item.remarks || '',
              enteredBy: req.user._id,
            },
          },
          upsert: true,
        },
      };
    });

    await Mark.bulkWrite(operations);

    res.json({
      success: true,
      message: `Marks successfully recorded for ${marksList.length} students.`,
    });
  } catch (error) {
    console.error('Error bulk updating marks:', error);
    res.status(500).json({ message: 'Error updating marks', error: error.message });
  }
});

// @route   GET /api/marks/student/:studentId
// @desc    Get student's performance report for a specific academic year or all years
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId } = req.query;

    const filter = { student: studentId };
    if (academicYearId) {
      filter.academicYear = academicYearId;
    }

    const marks = await Mark.find(filter)
      .populate('exam', 'name date maxMarks passingMarks examType')
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .sort({ 'exam.date': -1 });

    // Subject-wise performance summary
    const subjectMap = {};
    marks.forEach((m) => {
      if (!m.subject) return;
      const subName = m.subject.name;
      if (!subjectMap[subName]) {
        subjectMap[subName] = {
          subjectName: subName,
          subjectCode: m.subject.code,
          totalObtained: 0,
          totalMax: 0,
          examsCount: 0,
          records: [],
        };
      }
      subjectMap[subName].totalObtained += m.marksObtained;
      subjectMap[subName].totalMax += m.maxMarks;
      subjectMap[subName].examsCount += 1;
      subjectMap[subName].records.push(m);
    });

    const subjectSummaries = Object.values(subjectMap).map((sub) => {
      const avgPct =
        sub.totalMax > 0
          ? Math.round((sub.totalObtained / sub.totalMax) * 100 * 10) / 10
          : 0;
      let grade = 'F';
      if (avgPct >= 90) grade = 'A+';
      else if (avgPct >= 80) grade = 'A';
      else if (avgPct >= 70) grade = 'B+';
      else if (avgPct >= 60) grade = 'B';
      else if (avgPct >= 50) grade = 'C';
      else if (avgPct >= 35) grade = 'D';

      return {
        ...sub,
        percentage: avgPct,
        grade,
      };
    });

    let overallObtained = 0;
    let overallMax = 0;
    marks.forEach((m) => {
      overallObtained += m.marksObtained;
      overallMax += m.maxMarks;
    });

    const overallPct =
      overallMax > 0
        ? Math.round((overallObtained / overallMax) * 100 * 10) / 10
        : 0;

    let overallGrade = 'F';
    if (overallPct >= 90) overallGrade = 'A+';
    else if (overallPct >= 80) overallGrade = 'A';
    else if (overallPct >= 70) overallGrade = 'B+';
    else if (overallPct >= 60) overallGrade = 'B';
    else if (overallPct >= 50) overallGrade = 'C';
    else if (overallPct >= 35) overallGrade = 'D';

    res.json({
      marks,
      subjectSummaries,
      overall: {
        totalObtained: overallObtained,
        totalMax: overallMax,
        percentage: overallPct,
        grade: overallGrade,
        totalExamsTaken: marks.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student marks', error: error.message });
  }
});

module.exports = router;
