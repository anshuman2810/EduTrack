const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Student = require('../models/Student');
const StudentAcademicRecord = require('../models/StudentAcademicRecord');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const AcademicYear = require('../models/AcademicYear');

// @route   GET /api/qr/verify/:qrToken
// @desc    Public endpoint to verify QR token & load dynamic student profile
// @access  Public
router.get('/verify/:qrToken', async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { academicYearId } = req.query;

    const student = await Student.findOne({ qrToken }).populate('parentUser', 'name email phone');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student found with this QR code. The record may have expired or is invalid.',
      });
    }

    // Find all academic records for this student across all years (history)
    const allRecords = await StudentAcademicRecord.find({ student: student._id })
      .populate('academicYear', 'name isCurrent startDate endDate')
      .populate('class', 'name code')
      .populate('section', 'name roomNumber')
      .populate('subjects.subject', 'name code')
      .populate('subjects.teacher', 'name email designation')
      .sort({ createdAt: -1 });

    // Determine which academic record to view
    let selectedRecord = null;
    if (academicYearId) {
      selectedRecord = allRecords.find(
        (r) => r.academicYear && r.academicYear._id.toString() === academicYearId
      );
    }

    // Default to the current record or the most recent record
    if (!selectedRecord) {
      selectedRecord = allRecords.find((r) => r.isCurrentYear) || allRecords[0];
    }

    // Get attendance stats for selected academic record/year
    let attendanceSummary = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      percentage: 100,
    };

    let examMarks = [];

    if (selectedRecord && selectedRecord.academicYear) {
      const attendanceRecords = await Attendance.find({
        student: student._id,
        academicYear: selectedRecord.academicYear._id,
      });

      const total = attendanceRecords.length;
      const present = attendanceRecords.filter((a) => a.status === 'Present').length;
      const absent = attendanceRecords.filter((a) => a.status === 'Absent').length;
      const late = attendanceRecords.filter((a) => a.status === 'Late').length;
      const excused = attendanceRecords.filter((a) => a.status === 'Excused').length;
      const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

      attendanceSummary = { total, present, absent, late, excused, percentage };

      // Get exam marks for selected academic year
      examMarks = await Mark.find({
        student: student._id,
        academicYear: selectedRecord.academicYear._id,
      })
        .populate('exam', 'name date maxMarks examType')
        .populate('subject', 'name code')
        .sort({ 'exam.date': -1 });
    }

    // Overall academic score calculation
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    examMarks.forEach((m) => {
      totalMarksObtained += m.marksObtained;
      totalMaxMarks += m.maxMarks;
    });
    const overallPercentage =
      totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100 * 10) / 10 : 0;

    let overallGrade = 'N/A';
    if (totalMaxMarks > 0) {
      if (overallPercentage >= 90) overallGrade = 'A+';
      else if (overallPercentage >= 80) overallGrade = 'A';
      else if (overallPercentage >= 70) overallGrade = 'B+';
      else if (overallPercentage >= 60) overallGrade = 'B';
      else if (overallPercentage >= 50) overallGrade = 'C';
      else if (overallPercentage >= 35) overallGrade = 'D';
      else overallGrade = 'F';
    }

    res.json({
      success: true,
      verifiedAt: new Date(),
      student: {
        _id: student._id,
        studentId: student.studentId,
        admissionNumber: student.admissionNumber,
        admissionDate: student.admissionDate,
        qrToken: student.qrToken,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: `${student.firstName} ${student.lastName}`,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        bloodGroup: student.bloodGroup,
        photo: student.photo,
        email: student.email,
        phone: student.phone,
        address: student.address,
        emergencyContact: student.emergencyContact,
        parentInfo: student.parentInfo,
        status: student.status,
        aadhaarNumber: student.aadhaarNumber,
        nationality: student.nationality,
      },
      availableAcademicYears: allRecords.map((r) => ({
        academicYearId: r.academicYear?._id,
        academicYearName: r.academicYear?.name,
        className: r.class?.name,
        sectionName: r.section?.name,
        isCurrent: r.isCurrentYear,
      })),
      selectedAcademicRecord: selectedRecord,
      attendanceSummary,
      examMarks,
      performance: {
        totalMarksObtained,
        totalMaxMarks,
        overallPercentage,
        overallGrade,
        totalExams: examMarks.length,
      },
    });
  } catch (error) {
    console.error('QR verify error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying QR code', error: error.message });
  }
});

// @route   GET /api/qr/image/:qrToken
// @desc    Generate data URL or PNG image of QR code for student
// @access  Public
router.get('/image/:qrToken', async (req, res) => {
  try {
    const { qrToken } = req.params;
    const protocol = req.protocol;
    const host = req.get('host');
    // If running in development Vite, fallback to frontend origin or host
    const origin = req.headers.referer
      ? new URL(req.headers.referer).origin
      : `${protocol}://${host}`;

    // Target URL when scanned: points to the public profile route
    const profileUrl = `${origin}/verify/${qrToken}`;

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
      qrToken,
      profileUrl,
      qrDataUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code', error: error.message });
  }
});

module.exports = router;
