const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Student = require('../models/Student');
const AcademicYear = require('../models/AcademicYear');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const StudentAcademicRecord = require('../models/StudentAcademicRecord');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
const Feedback = require('../models/Feedback');

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_portal_db';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await AcademicYear.deleteMany({});
    await Class.deleteMany({});
    await Section.deleteMany({});
    await Subject.deleteMany({});
    await StudentAcademicRecord.deleteMany({});
    await Attendance.deleteMany({});
    await Exam.deleteMany({});
    await Mark.deleteMany({});
    await Feedback.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Create Academic Years
    const year2024 = await AcademicYear.create({
      name: '2024-25',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-04-30'),
      isCurrent: false,
      description: 'Academic Year 2024-2025 (Previous Year)',
    });

    const year2025 = await AcademicYear.create({
      name: '2025-26',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-04-30'),
      isCurrent: true,
      description: 'Academic Year 2025-2026 (Current Academic Year)',
    });

    const year2026 = await AcademicYear.create({
      name: '2026-27',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2027-04-30'),
      isCurrent: false,
      description: 'Academic Year 2026-2027 (Upcoming Year)',
    });

    console.log('Created Academic Years: 2024-25, 2025-26, 2026-27');

    // 2. Create Classes
    const class9 = await Class.create({
      name: 'Class 9',
      code: 'CLS-09',
      order: 1,
      description: 'Secondary School Standard 9',
    });

    const class10 = await Class.create({
      name: 'Class 10',
      code: 'CLS-10',
      order: 2,
      description: 'Secondary School Standard 10 (Board Exam Batch)',
    });

    const class11 = await Class.create({
      name: 'Class 11 - Science',
      code: 'CLS-11S',
      order: 3,
      description: 'Higher Secondary Standard 11 Science Stream',
    });

    console.log('Created Classes: Class 9, Class 10, Class 11');

    // 3. Create Users (Admin, Teachers, Parents)
    const adminUser = await User.create({
      name: 'Dr. Eleanor Vance',
      email: 'admin@edutrack.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 43210',
      designation: 'Principal & Chief Administrator',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    const teacherRajesh = await User.create({
      name: 'Prof. Rajesh Sharma',
      email: 'teacher@edutrack.com',
      password: 'Teacher@123',
      role: 'teacher',
      phone: '+91 98111 22334',
      employeeId: 'EMP-TCH-101',
      qualification: 'M.Sc. Mathematics, B.Ed.',
      designation: 'Head of Mathematics & Class 10A Teacher',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    const teacherSarah = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@edutrack.com',
      password: 'Teacher@123',
      role: 'teacher',
      phone: '+91 98222 33445',
      employeeId: 'EMP-TCH-102',
      qualification: 'Ph.D. in Physics, M.Ed.',
      designation: 'Senior Science Faculty',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    });

    const teacherMichael = await User.create({
      name: 'Prof. Michael Chang',
      email: 'michael.chang@edutrack.com',
      password: 'Teacher@123',
      role: 'teacher',
      phone: '+91 98333 44556',
      employeeId: 'EMP-TCH-103',
      qualification: 'M.Tech Computer Science',
      designation: 'Computer Science Department Coordinator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    console.log('Created Users: Admin & 3 Teachers');

    // 4. Create Sections
    const sec10A = await Section.create({
      name: 'Section A',
      class: class10._id,
      roomNumber: 'Room 204',
      classTeacher: teacherRajesh._id,
      capacity: 40,
    });

    const sec10B = await Section.create({
      name: 'Section B',
      class: class10._id,
      roomNumber: 'Room 205',
      classTeacher: teacherSarah._id,
      capacity: 40,
    });

    const sec9A = await Section.create({
      name: 'Section A',
      class: class9._id,
      roomNumber: 'Room 102',
      classTeacher: teacherMichael._id,
      capacity: 40,
    });

    // 5. Create Subjects
    const subMath = await Subject.create({
      name: 'Mathematics',
      code: 'MATH-10',
      classes: [class9._id, class10._id],
      assignedTeachers: [teacherRajesh._id],
      description: 'Algebra, Trigonometry, Geometry & Statistics',
    });

    const subScience = await Subject.create({
      name: 'Science & Physics',
      code: 'SCI-10',
      classes: [class9._id, class10._id],
      assignedTeachers: [teacherSarah._id],
      description: 'Physics, Chemistry & Biology Fundamentals',
    });

    const subEnglish = await Subject.create({
      name: 'English Language & Literature',
      code: 'ENG-10',
      classes: [class9._id, class10._id],
      assignedTeachers: [teacherRajesh._id],
      description: 'English Grammar, Composition and Literary Analysis',
    });

    const subCS = await Subject.create({
      name: 'Computer Science & AI Basics',
      code: 'CS-10',
      classes: [class9._id, class10._id, class11._id],
      assignedTeachers: [teacherMichael._id],
      description: 'Python Programming, Data Structures & Logic',
    });

    const subSocial = await Subject.create({
      name: 'Social Sciences',
      code: 'SOC-10',
      classes: [class9._id, class10._id],
      assignedTeachers: [teacherSarah._id],
      description: 'History, Civics, Geography and Economics',
    });

    // Update teacher assigned classes
    teacherRajesh.assignedClasses = [
      { class: class10._id, section: sec10A._id, subject: subMath._id },
      { class: class9._id, section: sec9A._id, subject: subEnglish._id },
    ];
    await teacherRajesh.save();

    teacherSarah.assignedClasses = [
      { class: class10._id, section: sec10A._id, subject: subScience._id },
      { class: class10._id, section: sec10B._id, subject: subScience._id },
    ];
    await teacherSarah.save();

    teacherMichael.assignedClasses = [
      { class: class10._id, section: sec10A._id, subject: subCS._id },
      { class: class9._id, section: sec9A._id, subject: subCS._id },
    ];
    await teacherMichael.save();

    // 6. Create Parents
    const parentVikram = await User.create({
      name: 'Vikramaditya Roy',
      email: 'parent@edutrack.com',
      password: 'Parent@123',
      role: 'parent',
      phone: '+91 99887 76655',
      relationship: 'Father',
      occupation: 'Senior Solutions Architect',
      address: 'Plot 42, Emerald Heights, Sector 14, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    const parentAnita = await User.create({
      name: 'Anita Sharma',
      email: 'anita.sharma@gmail.com',
      password: 'Parent@123',
      role: 'parent',
      phone: '+91 99123 45678',
      relationship: 'Mother',
      occupation: 'Corporate Lawyer',
      address: 'Flat 302, Palm Meadows, Bangalore',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    });

    console.log('Created Parents: Vikramaditya Roy & Anita Sharma');

    // 7. Create Students
    // Student 1: Aarav Roy (Has multi-year progression from 2024-25 in Class 9 to 2025-26 in Class 10!)
    const qrTokenAarav = 'aarav-roy-qr-2024-edutrack';
    const studentAarav = await Student.create({
      studentId: 'STU-2024-001',
      admissionNumber: 'ADM-10892',
      admissionDate: new Date('2024-04-15'),
      qrToken: qrTokenAarav,
      firstName: 'Aarav',
      lastName: 'Roy',
      dateOfBirth: new Date('2009-08-14'),
      gender: 'Male',
      bloodGroup: 'O+',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300',
      email: 'aarav.roy@student.edutrack.com',
      phone: '+91 99887 76650',
      aadhaarNumber: '7845 9201 3482',
      nationality: 'Indian',
      religion: 'Hindu',
      category: 'General',
      address: {
        street: 'Plot 42, Emerald Heights, Sector 14',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110075',
        country: 'India',
      },
      emergencyContact: {
        name: 'Vikramaditya Roy (Father)',
        relation: 'Father',
        phone: '+91 99887 76655',
      },
      parentInfo: {
        fatherName: 'Vikramaditya Roy',
        fatherPhone: '+91 99887 76655',
        fatherOccupation: 'Senior Solutions Architect',
        fatherEmail: 'parent@edutrack.com',
        motherName: 'Sunita Roy',
        motherPhone: '+91 99887 76656',
        motherOccupation: 'Professor of Economics',
      },
      parentUser: parentVikram._id,
      status: 'Active',
    });

    // Student 2: Ananya Roy (Sister of Aarav, enrolled in Class 9A)
    const qrTokenAnanya = 'ananya-roy-qr-2025-edutrack';
    const studentAnanya = await Student.create({
      studentId: 'STU-2025-002',
      admissionNumber: 'ADM-11420',
      admissionDate: new Date('2025-05-10'),
      qrToken: qrTokenAnanya,
      firstName: 'Ananya',
      lastName: 'Roy',
      dateOfBirth: new Date('2011-03-22'),
      gender: 'Female',
      bloodGroup: 'B+',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
      email: 'ananya.roy@student.edutrack.com',
      phone: '+91 99887 76652',
      aadhaarNumber: '8912 3456 7890',
      nationality: 'Indian',
      address: {
        street: 'Plot 42, Emerald Heights, Sector 14',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110075',
        country: 'India',
      },
      emergencyContact: {
        name: 'Vikramaditya Roy',
        relation: 'Father',
        phone: '+91 99887 76655',
      },
      parentInfo: {
        fatherName: 'Vikramaditya Roy',
        fatherPhone: '+91 99887 76655',
        motherName: 'Sunita Roy',
        motherPhone: '+91 99887 76656',
      },
      parentUser: parentVikram._id,
      status: 'Active',
    });

    // Update parent's linked children array
    parentVikram.students = [studentAarav._id, studentAnanya._id];
    await parentVikram.save();

    // Student 3: Rohan Sharma
    const qrTokenRohan = 'rohan-sharma-qr-2024-edutrack';
    const studentRohan = await Student.create({
      studentId: 'STU-2024-003',
      admissionNumber: 'ADM-10905',
      admissionDate: new Date('2024-04-16'),
      qrToken: qrTokenRohan,
      firstName: 'Rohan',
      lastName: 'Sharma',
      dateOfBirth: new Date('2009-11-05'),
      gender: 'Male',
      bloodGroup: 'A+',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
      email: 'rohan.sharma@student.edutrack.com',
      phone: '+91 98777 66554',
      aadhaarNumber: '6543 2109 8765',
      nationality: 'Indian',
      address: {
        street: 'Flat 302, Palm Meadows',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560066',
        country: 'India',
      },
      emergencyContact: {
        name: 'Anita Sharma',
        relation: 'Mother',
        phone: '+91 99123 45678',
      },
      parentInfo: {
        motherName: 'Anita Sharma',
        motherPhone: '+91 99123 45678',
        motherOccupation: 'Corporate Lawyer',
        motherEmail: 'anita.sharma@gmail.com',
      },
      parentUser: parentAnita._id,
      status: 'Active',
    });

    parentAnita.students = [studentRohan._id];
    await parentAnita.save();

    // Student 4: Meera Patel
    const qrTokenMeera = 'meera-patel-qr-2024-edutrack';
    const studentMeera = await Student.create({
      studentId: 'STU-2024-004',
      admissionNumber: 'ADM-10912',
      admissionDate: new Date('2024-04-18'),
      qrToken: qrTokenMeera,
      firstName: 'Meera',
      lastName: 'Patel',
      dateOfBirth: new Date('2009-06-19'),
      gender: 'Female',
      bloodGroup: 'AB+',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      email: 'meera.patel@student.edutrack.com',
      phone: '+91 97654 32109',
      aadhaarNumber: '4321 0987 6543',
      address: {
        street: '12 Sunshine Enclave',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      },
      emergencyContact: {
        name: 'Ketan Patel',
        relation: 'Father',
        phone: '+91 98200 11223',
      },
      parentInfo: {
        fatherName: 'Ketan Patel',
        fatherPhone: '+91 98200 11223',
        motherName: 'Bhavna Patel',
      },
      status: 'Active',
    });

    // Student 5: David Miller
    const qrTokenDavid = 'david-miller-qr-2025-edutrack';
    const studentDavid = await Student.create({
      studentId: 'STU-2025-005',
      admissionNumber: 'ADM-11530',
      admissionDate: new Date('2025-06-05'),
      qrToken: qrTokenDavid,
      firstName: 'David',
      lastName: 'Miller',
      dateOfBirth: new Date('2009-12-10'),
      gender: 'Male',
      bloodGroup: 'O-',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300',
      email: 'david.miller@student.edutrack.com',
      phone: '+91 99001 22334',
      aadhaarNumber: '3210 9876 5432',
      address: {
        street: '88 Heritage Hills',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
        country: 'India',
      },
      emergencyContact: {
        name: 'Robert Miller',
        relation: 'Father',
        phone: '+91 98900 33445',
      },
      parentInfo: {
        fatherName: 'Robert Miller',
        motherName: 'Clara Miller',
      },
      status: 'Active',
    });

    console.log('Created 5 detailed Students with permanent unique QR tokens');

    // 8. Create Multi-Year StudentAcademicRecord entries
    const class10Subjects = [
      { subject: subMath._id, teacher: teacherRajesh._id },
      { subject: subScience._id, teacher: teacherSarah._id },
      { subject: subEnglish._id, teacher: teacherRajesh._id },
      { subject: subCS._id, teacher: teacherMichael._id },
      { subject: subSocial._id, teacher: teacherSarah._id },
    ];

    const class9Subjects = [
      { subject: subMath._id, teacher: teacherRajesh._id },
      { subject: subScience._id, teacher: teacherSarah._id },
      { subject: subEnglish._id, teacher: teacherRajesh._id },
      { subject: subCS._id, teacher: teacherMichael._id },
    ];

    // Aarav: 2024-25 in Class 9A (Past Year)
    await StudentAcademicRecord.create({
      student: studentAarav._id,
      academicYear: year2024._id,
      class: class9._id,
      section: sec9A._id,
      rollNumber: '09A-01',
      subjects: class9Subjects,
      isCurrentYear: false,
      status: 'Promoted',
      remarks: 'Promoted to Class 10 with distinction in Science and Math.',
    });

    // Aarav: 2025-26 in Class 10A (Current Year!)
    await StudentAcademicRecord.create({
      student: studentAarav._id,
      academicYear: year2025._id,
      class: class10._id,
      section: sec10A._id,
      rollNumber: '10A-01',
      subjects: class10Subjects,
      isCurrentYear: true,
      status: 'Enrolled',
      remarks: 'Excellent discipline and active participant in Computer Club.',
    });

    // Ananya: 2025-26 in Class 9A (Current Year)
    await StudentAcademicRecord.create({
      student: studentAnanya._id,
      academicYear: year2025._id,
      class: class9._id,
      section: sec9A._id,
      rollNumber: '09A-04',
      subjects: class9Subjects,
      isCurrentYear: true,
      status: 'Enrolled',
      remarks: 'Consistently shows high enthusiasm in literature and coding.',
    });

    // Rohan: 2024-25 in Class 9A (Past Year)
    await StudentAcademicRecord.create({
      student: studentRohan._id,
      academicYear: year2024._id,
      class: class9._id,
      section: sec9A._id,
      rollNumber: '09A-02',
      subjects: class9Subjects,
      isCurrentYear: false,
      status: 'Promoted',
      remarks: 'Promoted to Class 10.',
    });

    // Rohan: 2025-26 in Class 10A (Current Year)
    await StudentAcademicRecord.create({
      student: studentRohan._id,
      academicYear: year2025._id,
      class: class10._id,
      section: sec10A._id,
      rollNumber: '10A-02',
      subjects: class10Subjects,
      isCurrentYear: true,
      status: 'Enrolled',
      remarks: 'Good grasp in Mathematics and analytical subjects.',
    });

    // Meera: 2025-26 in Class 10A (Current Year)
    await StudentAcademicRecord.create({
      student: studentMeera._id,
      academicYear: year2025._id,
      class: class10._id,
      section: sec10A._id,
      rollNumber: '10A-03',
      subjects: class10Subjects,
      isCurrentYear: true,
      status: 'Enrolled',
      remarks: 'Class monitor and student council representative.',
    });

    // David: 2025-26 in Class 10B (Current Year)
    await StudentAcademicRecord.create({
      student: studentDavid._id,
      academicYear: year2025._id,
      class: class10._id,
      section: sec10B._id,
      rollNumber: '10B-01',
      subjects: class10Subjects,
      isCurrentYear: true,
      status: 'Enrolled',
      remarks: 'Strong interest in physical sciences and athletics.',
    });

    console.log('Created multi-year Student Academic Records');

    // 9. Generate Realistic Daily Attendance for Class 10A students (Aarav, Rohan, Meera)
    const attendanceStudents = [studentAarav, studentRohan, studentMeera];
    const today = new Date();
    const attendanceDocs = [];

    // Create 30 days of attendance
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Skip Sundays
      if (d.getDay() === 0) continue;

      d.setUTCHours(0, 0, 0, 0);

      attendanceStudents.forEach((stu, idx) => {
        // High attendance with occasional absent or late
        let status = 'Present';
        let remarks = '';

        if (i === 4 && idx === 0) {
          status = 'Absent';
          remarks = 'Sick leave - verified by parent';
        } else if (i === 12 && idx === 0) {
          status = 'Late';
          remarks = 'Bus delay';
        } else if (i === 2 && idx === 1) {
          status = 'Absent';
          remarks = 'Family emergency';
        } else if (i === 18 && idx === 2) {
          status = 'Late';
        }

        attendanceDocs.push({
          student: stu._id,
          academicYear: year2025._id,
          class: class10._id,
          section: sec10A._id,
          date: d,
          status,
          remarks,
          markedBy: teacherRajesh._id,
        });
      });
    }

    await Attendance.insertMany(attendanceDocs);
    console.log(`Created ${attendanceDocs.length} attendance records across past 30 days.`);

    // 10. Create Tests and Examinations
    // Current Year 2025-26 Exams
    const examUnit1Math = await Exam.create({
      name: 'Unit Test 1 - Algebra & Trigonometry',
      academicYear: year2025._id,
      class: class10._id,
      section: sec10A._id,
      subject: subMath._id,
      date: new Date('2025-08-10'),
      maxMarks: 50,
      passingMarks: 18,
      examType: 'Unit Test',
      description: 'First quarterly unit test on Linear equations and Basic trigonometry.',
      createdBy: teacherRajesh._id,
    });

    const examMidtermScience = await Exam.create({
      name: 'Mid-Term Examination - Physics & Chemistry',
      academicYear: year2025._id,
      class: class10._id,
      section: sec10A._id,
      subject: subScience._id,
      date: new Date('2025-10-15'),
      maxMarks: 100,
      passingMarks: 35,
      examType: 'Mid-Term',
      description: 'Comprehensive mid-term evaluation including lab practicals.',
      createdBy: teacherSarah._id,
    });

    const examCSQuiz = await Exam.create({
      name: 'Python Programming Practical Assessment',
      academicYear: year2025._id,
      class: class10._id,
      section: sec10A._id,
      subject: subCS._id,
      date: new Date('2025-11-20'),
      maxMarks: 50,
      passingMarks: 20,
      examType: 'Practical',
      description: 'Live coding assessment on functions and loops.',
      createdBy: teacherMichael._id,
    });

    const examEnglish = await Exam.create({
      name: 'Mid-Term Examination - English Literature',
      academicYear: year2025._id,
      class: class10._id,
      section: sec10A._id,
      subject: subEnglish._id,
      date: new Date('2025-10-18'),
      maxMarks: 100,
      passingMarks: 35,
      examType: 'Mid-Term',
      createdBy: teacherRajesh._id,
    });

    // Past Year 2024-25 Exam (For Class 9 Aarav)
    const exam2024FinalMath = await Exam.create({
      name: 'Annual Final Examination 2024-25',
      academicYear: year2024._id,
      class: class9._id,
      subject: subMath._id,
      date: new Date('2025-03-20'),
      maxMarks: 100,
      passingMarks: 35,
      examType: 'Final Exam',
      description: 'Final board-pattern annual exam for Class 9.',
      createdBy: teacherRajesh._id,
    });

    // 11. Create Marks for Students
    const marksData = [
      // 2025-26 Aarav Roy (Class 10A)
      {
        exam: examUnit1Math._id,
        student: studentAarav._id,
        academicYear: year2025._id,
        subject: subMath._id,
        marksObtained: 48,
        maxMarks: 50,
        remarks: 'Outstanding performance, top score in class.',
        enteredBy: teacherRajesh._id,
      },
      {
        exam: examMidtermScience._id,
        student: studentAarav._id,
        academicYear: year2025._id,
        subject: subScience._id,
        marksObtained: 94,
        maxMarks: 100,
        remarks: 'Exceptional answers in Electricity and Optics.',
        enteredBy: teacherSarah._id,
      },
      {
        exam: examCSQuiz._id,
        student: studentAarav._id,
        academicYear: year2025._id,
        subject: subCS._id,
        marksObtained: 50,
        maxMarks: 50,
        remarks: 'Perfect score in algorithm implementation.',
        enteredBy: teacherMichael._id,
      },
      {
        exam: examEnglish._id,
        student: studentAarav._id,
        academicYear: year2025._id,
        subject: subEnglish._id,
        marksObtained: 88,
        maxMarks: 100,
        remarks: 'Very thoughtful essay and expressive writing.',
        enteredBy: teacherRajesh._id,
      },

      // Past Year 2024-25 Aarav Roy (Class 9)
      {
        exam: exam2024FinalMath._id,
        student: studentAarav._id,
        academicYear: year2024._id,
        subject: subMath._id,
        marksObtained: 92,
        maxMarks: 100,
        remarks: 'Promoted with highest honors in standard 9.',
        enteredBy: teacherRajesh._id,
      },

      // Rohan Sharma (Class 10A)
      {
        exam: examUnit1Math._id,
        student: studentRohan._id,
        academicYear: year2025._id,
        subject: subMath._id,
        marksObtained: 42,
        maxMarks: 50,
        remarks: 'Good understanding of algebraic formulas.',
        enteredBy: teacherRajesh._id,
      },
      {
        exam: examMidtermScience._id,
        student: studentRohan._id,
        academicYear: year2025._id,
        subject: subScience._id,
        marksObtained: 78,
        maxMarks: 100,
        remarks: 'Steady progress. Needs minor revision in chemical equations.',
        enteredBy: teacherSarah._id,
      },

      // Meera Patel (Class 10A)
      {
        exam: examUnit1Math._id,
        student: studentMeera._id,
        academicYear: year2025._id,
        subject: subMath._id,
        marksObtained: 46,
        maxMarks: 50,
        remarks: 'Precise and neat geometrical constructions.',
        enteredBy: teacherRajesh._id,
      },
      {
        exam: examMidtermScience._id,
        student: studentMeera._id,
        academicYear: year2025._id,
        subject: subScience._id,
        marksObtained: 89,
        maxMarks: 100,
        remarks: 'Well-structured diagrams and theoretical concepts.',
        enteredBy: teacherSarah._id,
      },
    ];

    for (const m of marksData) {
      const markDoc = new Mark(m);
      await markDoc.save();
    }
    console.log(`Created ${marksData.length} exam marks with computed percentages and grades.`);

    // 12. Create Parent Feedback
    await Feedback.create({
      parent: parentVikram._id,
      student: studentAarav._id,
      teacher: teacherRajesh._id,
      subject: subMath._id,
      academicYear: year2025._id,
      category: 'Academic',
      rating: 5,
      message:
        'Thank you Prof. Rajesh for guiding Aarav in advanced mathematics. He is really enjoying the problem sets.',
      reply:
        'Aarav is an exceptional student with sharp analytical skills. He always participates actively in class.',
      repliedAt: new Date(),
      status: 'Replied',
    });

    await Feedback.create({
      parent: parentVikram._id,
      student: studentAnanya._id,
      teacher: teacherMichael._id,
      subject: subCS._id,
      academicYear: year2025._id,
      category: 'Academic',
      rating: 5,
      message:
        'Ananya was inquiring if there is an upcoming inter-school hackathon or robotics club session she can join.',
      reply:
        'Yes, registration for the Junior Hackathon opens next week! We will share details on the student portal.',
      repliedAt: new Date(),
      status: 'Replied',
    });

    await Feedback.create({
      parent: parentAnita._id,
      student: studentRohan._id,
      teacher: teacherSarah._id,
      subject: subScience._id,
      academicYear: year2025._id,
      category: 'Academic',
      rating: 4,
      message:
        'Could you recommend some extra reference questions for the physics practicals for Rohan?',
      status: 'Pending',
    });

    console.log('Created realistic parent-teacher feedback threads.');

    console.log('\n=============================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('=============================================');
    console.log('DEMO ACCOUNTS:');
    console.log('1. ADMIN:   admin@edutrack.com   / Admin@123');
    console.log('2. TEACHER: teacher@edutrack.com / Teacher@123 (Prof. Rajesh Sharma)');
    console.log('3. PARENT:  parent@edutrack.com  / Parent@123  (Vikramaditya Roy - Father of Aarav & Ananya)');
    console.log(`DEMO STUDENT QR CODE TOKEN: ${qrTokenAarav}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
