# EduTrack QR - Student Academic Records & Permanent QR Identity System

A full-stack **MERN (MongoDB, Express, React, Node.js)** enterprise portal for managing comprehensive student information and academic records across multiple academic years using a **single, permanent dynamic QR code**.

> **CS-601 Data Security & Privacy Course Delivery:**
> - 📄 **Week 1 Deliverables**: [Markdown Document](docs/WEEK_1_DELIVERABLES.md) \| **[Word .docx File](docs/CS601_Week1_Deliverable_AI_Development_Threat_Awareness.docx)** (Project Proposal, Requirements, Architecture & DFDs, Synthetic Data Inventory, Initial Asset-Threat-Vulnerability-Impact Threat Model, AI Prompt Log, and 5-10 min Demo Outline).
> - 📄 **Week 2 Deliverables**: [Markdown Document](docs/WEEK_2_DELIVERABLES.md) \| **[Word .docx File](docs/CS601_Week2_Deliverable_Security_Review.docx)** (Manual Code Security Review Report, 18 Detailed Security Observations across 6 areas, AI vs. Human Review Analysis, AICSS Score, and Presentation Slides Outline).

---

## 🌟 Key Concept: The Permanent Student QR Badge

In traditional educational portals, student credentials or links break when a student transitions to a new grade, section, or academic year. 

**EduTrack QR solves this:**
- **One Student = One Permanent QR Code**: Each student receives a unique, unalterable QR token upon admission.
- **Dynamic Profile Resolution**: When the QR code is scanned (via phone camera, tablet, or web scanner), the application dynamically queries the server and renders the student's verified profile.
- **Multi-Year History via the Same QR**: The QR code represents the student throughout their entire tenure. As the student gets promoted from **2024-25 (Class 9)** to **2025-26 (Class 10)** and beyond, the public profile presents an **Academic Year Selector** allowing parents, teachers, and verification officers to inspect previous and current report cards using the exact same physical QR badge!
- **Printable PVC / Paper ID Cards**: Instant generator for standard Student ID Badges with school branding, student photo, blood group, barcode, and dynamic QR code.

---

## 👥 Three Dedicated Portals

### 1. 🛡️ Administrator Portal
- **Complete Institutional Control**: Full CRUD management of students, faculty, and parents.
- **Academic Structure Manager**: Create and manage Academic Years (e.g., `2024-25`, `2025-26`, `2026-27`), Classes (`Class 9`, `Class 10`, `Class 11`), Sections (`A`, `B`), and Subjects (`Mathematics`, `Science`, `Computer Science`, etc.).
- **Multi-Year Student Promotions**: Seamlessly promote students to new academic years without erasing historical grades, attendance, or remarks.
- **Faculty & Class Allocations**: Assign subject teachers and class coordinators.
- **Parent-Child Linkage**: Connect parent accounts to one or multiple children.
- **Institution Analytics**: Track enrollment demographics, today's attendance rates, gender distributions, and feedback trends.
- **QR ID Badge Generation & Printing**: 1-click preview and print of Student ID cards.

### 2. 👩‍🏫 Teacher / Faculty Portal
- **Assigned Teaching Roster**: Direct overview of assigned classes, sections, and subjects.
- **Bulk Daily Attendance Register**: Convenient 1-click attendance tools ("Mark All Present", quick toggles for Present / Absent / Late / Excused with optional remarks).
- **Interactive Grade Sheet**: Fast batch exam marks entry with automated calculations for:
  - Percentage scored
  - Letter grade ($A+$, $A$, $B+$, $B$, $C$, $D$, $F$)
  - Pass/Fail status
  - Faculty remarks
- **Student Directory**: Inspect enrolled students, update student remarks, and view their dynamic QR profiles.
- **Parent Inquiries & Feedback**: Review feedback sent by parents regarding their subjects/students and send direct replies.

### 3. 👨‍👩‍👦 Parent Portal
- **Multi-Child Switcher**: Parents with multiple enrolled children can seamlessly toggle between them.
- **Real-Time Attendance Overview**: Live percentage meter with breakdown of total days, presents, absents, and lates.
- **Full Academic Report Card**: Access test marks, midterms, and annual exam scorecards with subject-wise percentages and grades.
- **Historical Academic Records**: Year dropdown to view past academic year achievements using the same portal.
- **Teacher Feedback Channel**: Submit direct feedback, queries, or appreciation to individual teachers, including rating (1-5 stars) and category (Academic, Behavioral, Attendance, Doubts).

### 4. 🔍 Public / Scanned Dynamic QR Profile
- Scanned directly from the student's physical ID card badge (`/verify/:qrToken`).
- Displays institutional verification badge, verified student details, enrolled subjects, faculty, attendance rates, and scorecards.
- Interactive Academic Year selector to view past records on the same QR token.

---

## 🔑 Demo Login Credentials

The database comes pre-seeded with realistic records for instant testing:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@edutrack.com` | `Admin@123` | Dr. Eleanor Vance (Principal & Administrator) |
| **Teacher** | `teacher@edutrack.com` | `Teacher@123` | Prof. Rajesh Sharma (Head of Mathematics) |
| **Parent** | `parent@edutrack.com` | `Parent@123` | Vikramaditya Roy (Father of Aarav & Ananya) |

> **Sample Student QR Tokens for Immediate Lookup:**
> - `aarav-roy-qr-2024-edutrack` (Class 10A • Has 2-Year progression history from Class 9 in 2024-25 to Class 10 in 2025-26)
> - `ananya-roy-qr-2025-edutrack` (Class 9A)
> - `rohan-sharma-qr-2024-edutrack` (Class 10A)

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, `qrcode.react`, `html5-qrcode`, Axios, React Router v6.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, BcryptJS, Multer (Photo uploads), QRCode generator.
- **Architecture**: Decoupled full-stack REST API with Vite reverse-proxy configuration.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

### 1. Installation
Install dependencies for both backend and frontend:
```bash
# In backend directory
cd backend
npm install

# In frontend directory
cd ../frontend
npm install
```

### 2. Seed Realistic Demo Data
Populate academic years, classes, faculty, students, attendance, exams, marks, and feedback:
```bash
cd backend
npm run seed
```

### 3. Run the Application
You can run both servers simultaneously from the root directory:
```bash
# In the root project folder:
node start-dev.js
```
Or start them individually in separate terminals:
```bash
# Terminal 1: Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend Web App (Port 5173)
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 📂 Project Structure

```
DSP-Mini Project/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── models/
│   │   ├── AcademicYear.js        # Academic terms (2024-25, 2025-26, etc.)
│   │   ├── Class.js               # Standards (Class 9, 10, 11)
│   │   ├── Section.js             # Sections (A, B) and Class Teachers
│   │   ├── Subject.js             # Curriculum subjects
│   │   ├── Student.js             # Permanent student record & QR token
│   │   ├── StudentAcademicRecord.js # Year-wise link: student, class, section, roll
│   │   ├── Attendance.js          # Daily attendance tracking
│   │   ├── Exam.js                # Tests and examinations
│   │   ├── Mark.js                # Graded exam marks & percentages
│   │   ├── User.js                # Admin, Teacher, and Parent accounts
│   │   └── Feedback.js            # Parent-Teacher communication
│   ├── routes/
│   │   ├── authRoutes.js          # Login & session check
│   │   ├── studentRoutes.js       # Student CRUD, promotions, QR generation
│   │   ├── qrRoutes.js            # Public QR profile lookup & QR images
│   │   ├── academicRoutes.js      # Years, classes, sections, subjects
│   │   ├── attendanceRoutes.js    # Bulk daily attendance register
│   │   ├── examRoutes.js          # Tests and examinations
│   │   ├── markRoutes.js          # Grade sheet batch entry
│   │   ├── userRoutes.js          # Teachers, parents, institutional stats
│   │   └── feedbackRoutes.js      # Parent-Teacher feedback
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verify & role authorization
│   │   └── uploadMiddleware.js    # Multer student photo upload
│   ├── seed/
│   │   └── seedData.js            # Complete demo data seeder
│   ├── uploads/                   # Stored student photographs
│   ├── server.js                  # Express API server entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Badge, StatCard, Modal
│   │   │   ├── qr/                # QRCodeCard, IDCardModal, QRScannerModal
│   │   │   └── layout/            # Navbar, Sidebar, DashboardLayout
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication & user role state
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login with 1-click demo logins
│   │   │   ├── public/
│   │   │   │   └── PublicStudentProfile.jsx # Scanned dynamic QR profile
│   │   │   ├── admin/             # Dashboard, Students, Academics, Faculty, Attendance, Exams
│   │   │   ├── teacher/           # Dashboard, My Students, Marks Entry, Attendance
│   │   │   └── parent/            # Dashboard, Report Card, Teacher Feedback
│   │   ├── services/
│   │   │   └── api.js             # Axios client & all API calls
│   │   ├── App.jsx                # Routing & role guards
│   │   ├── index.css              # Tailwind directives & print styles
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── start-dev.js                   # Unified process launcher
├── package.json                   # Root package orchestration
└── README.md
```

---

## 🔄 End-to-End Workflow Demonstration

1. **Admin creates a student**: Navigate to **Students & QR Cards** &rarr; Click **Enroll New Student** &rarr; Upload photo & enter personal details &rarr; Assign Academic Year (`2025-26`), Class (`Class 10`), Section (`Section A`), and Roll Number.
2. **Permanent QR Generated**: The student is saved with an invariant UUID QR token (`qrToken`).
3. **Print Student ID Card**: Click **Print Badge** on any student row &rarr; High-resolution badge renders with School Logo, Student Photo, Class, Barcode, and the QR Code &rarr; Ready to print on PVC / Paper.
4. **Scan or Lookup QR**:
   - Use the **Scan / Open QR** button in the navbar or visit `/verify/<qrToken>`.
   - The dynamic profile page loads with official verification badge, enrolled subjects, faculty, attendance %, and scorecard.
5. **Multi-Year Progression**:
   - Click **Promote to New Year** in the student details page.
   - Assign the student to the upcoming academic year (`2026-27`) and Class 11.
   - The same QR code now reflects their new grade while preserving the previous year (`2025-26`) via the **Academic Year dropdown**!
6. **Teacher Grading & Attendance**:
   - Log in as `teacher@edutrack.com`.
   - Open **Mark Attendance** &rarr; Select Class & Section &rarr; 1-click **Mark All Present** &rarr; Save.
   - Open **Grade & Enter Marks** &rarr; Select an exam &rarr; Enter marks obtained &rarr; Percentage and Grade ($A+, A, B$, etc.) update live.
7. **Parent Monitoring & Feedback**:
   - Log in as `parent@edutrack.com`.
   - Instantly view child's attendance and examination scorecards.
   - Submit feedback to the teacher with star rating and category.
   - Teacher receives feedback and replies directly from their portal.
