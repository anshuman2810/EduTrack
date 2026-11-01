const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const StudentAcademicRecord = require('../models/StudentAcademicRecord');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/attendance
// @desc    Get attendance records for a specific date, class, section, academic year
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { date, classId, sectionId, academicYearId } = req.query;

    if (!date || !classId || !sectionId) {
      return res.status(400).json({ message: 'Date, classId, and sectionId are required' });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Fetch existing attendance records for this date
    const attendanceRecords = await Attendance.find({
      class: classId,
      section: sectionId,
      date: { $gte: targetDate, $lt: nextDate },
    }).populate('student', 'firstName lastName studentId photo');

    // Also get all enrolled students in this class and section to see who is marked/unmarked
    const query = { class: classId, section: sectionId };
    if (academicYearId) query.academicYear = academicYearId;
    else query.isCurrentYear = true;

    const enrolledStudents = await StudentAcademicRecord.find(query)
      .populate('student', 'firstName lastName studentId admissionNumber photo rollNumber')
      .sort({ rollNumber: 1 });

    const attendanceMap = {};
    attendanceRecords.forEach((a) => {
      attendanceMap[a.student._id.toString()] = a;
    });

    const studentListWithAttendance = enrolledStudents.map((rec) => {
      const existing = attendanceMap[rec.student._id.toString()];
      return {
        student: rec.student,
        rollNumber: rec.rollNumber,
        status: existing ? existing.status : 'Present', // default suggestion
        remarks: existing ? existing.remarks : '',
        attendanceId: existing ? existing._id : null,
        isMarked: !!existing,
      };
    });

    res.json({
      date: targetDate,
      classId,
      sectionId,
      students: studentListWithAttendance,
      markedCount: attendanceRecords.length,
      totalCount: enrolledStudents.length,
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

// @route   POST /api/attendance/bulk
// @desc    Bulk mark or update attendance for students without creating duplicates
// @access  Private (Teacher or Admin)
router.post('/bulk', protect, async (req, res) => {
  try {
    const { date, classId, sectionId, academicYearId, attendanceList } = req.body;

    if (!date || !classId || !sectionId || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({ message: 'Invalid attendance submission payload' });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Find any existing attendance records for these students on this calendar day
    const studentIds = attendanceList.map((item) => item.studentId || item.student);
    const existingRecords = await Attendance.find({
      student: { $in: studentIds },
      date: { $gte: targetDate, $lt: nextDate },
    });

    const existingMap = {};
    existingRecords.forEach((r) => {
      existingMap[r.student.toString()] = r._id;
    });

    const operations = attendanceList.map((item) => {
      const stuId = item.studentId || item.student;
      const existingId = existingMap[stuId.toString()];

      if (existingId) {
        return {
          updateOne: {
            filter: { _id: existingId },
            update: {
              $set: {
                academicYear: academicYearId,
                class: classId,
                section: sectionId,
                date: targetDate,
                status: item.status || 'Present',
                remarks: item.remarks || '',
                markedBy: req.user._id,
              },
            },
          },
        };
      } else {
        return {
          updateOne: {
            filter: {
              student: stuId,
              date: targetDate,
            },
            update: {
              $set: {
                student: stuId,
                academicYear: academicYearId,
                class: classId,
                section: sectionId,
                date: targetDate,
                status: item.status || 'Present',
                remarks: item.remarks || '',
                markedBy: req.user._id,
              },
            },
            upsert: true,
          },
        };
      }
    });

    await Attendance.bulkWrite(operations);

    res.json({
      success: true,
      message: `Successfully saved attendance for ${attendanceList.length} students without duplicates.`,
    });
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    res.status(500).json({ message: 'Error saving attendance', error: error.message });
  }
});

// @route   GET /api/attendance/student/:studentId
// @desc    Get complete attendance history & analytics for a student
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId } = req.query;

    const filter = { student: studentId };
    if (academicYearId) {
      filter.academicYear = academicYearId;
    }

    const records = await Attendance.find(filter)
      .populate('academicYear', 'name')
      .populate('class', 'name')
      .populate('section', 'name')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const excused = records.filter((r) => r.status === 'Excused').length;
    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

    // Monthly breakdown
    const monthlyMap = {};
    records.forEach((r) => {
      const monthYear = new Date(r.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { month: monthYear, total: 0, present: 0, absent: 0, late: 0 };
      }
      monthlyMap[monthYear].total += 1;
      if (r.status === 'Present') monthlyMap[monthYear].present += 1;
      if (r.status === 'Absent') monthlyMap[monthYear].absent += 1;
      if (r.status === 'Late') monthlyMap[monthYear].late += 1;
    });

    const monthlyTrends = Object.values(monthlyMap);

    res.json({
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        percentage,
      },
      monthlyTrends,
      recentRecords: records.slice(0, 30),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student attendance', error: error.message });
  }
});

module.exports = router;
