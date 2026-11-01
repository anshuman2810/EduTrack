# CS-601 Data Security & Privacy — Mini-Project
## Week 2 Deliverables: Understanding the AI-Generated Code (Manual Security Code Review)

**Course**: CS-601 Data Security & Privacy (Academic Batch 2026–28, Term July–Dec 2026)  
**Subject OIC**: Manisha J. Nene (`mjnene@diat.ac.in`)  
**Assignment**: *Build It with AI, Break It Ethically, Secure It: Security and Privacy Evaluation of AI-Generated Applications*  
**Application Domain**: Student Information & Academic Records Portal with Dynamic QR Identity (**EduTrack QR**)  
**Milestone**: **Week 2 Submission & Presentation (Manual Code Review Report — Version 1)**  
**Theme**: *“Working code ≠ secure code.”*  

---

## Executive Summary

During Week 1, Generative AI successfully accelerated the construction of **EduTrack QR (Version 0)**—a functionally rich MERN application with dynamic permanent QR codes, role-based dashboards, and multi-year academic progression.

In **Week 2**, adhering to the course philosophy *"Working code ≠ secure code"*, our team conducted an exhaustive **manual security code review** of the AI-generated codebase. As established by empirical software engineering research (e.g., NYU Center for Cybersecurity study on AI-generated code), AI coding assistants optimize for immediate functional completion rather than defensive architecture.

This document serves as the formal **AI-Generated Code Security Review Report — Version 1**, detailing **18 specific security observations** (exceeding the required minimum of 15) categorized across all six prescribed areas: **Authentication, Authorization, Input Validation, Database Security, Secrets Management, and Error Handling**.

---

## 1. Scope & Target AI-Generated Codebase (Version 0)

The manual code review was executed against the raw, unhardened AI-generated Version 0 source code:

| Layer | Component / File | Purpose & Functionality | LOC |
| :--- | :--- | :--- | :---: |
| **Server** | `backend/server.js` | Express server bootstrap, middleware pipeline, static routing | 57 |
| **Database** | `backend/config/db.js` | MongoDB connection lifecycle | 15 |
| **Security Middleware** | `backend/middleware/authMiddleware.js` | JWT verification (`protect`) & role guard (`authorize`) | 43 |
| **File Handler** | `backend/middleware/uploadMiddleware.js` | Multer disk storage and file type filtering | 42 |
| **Auth Routes** | `backend/routes/authRoutes.js` | Login, current user resolution, profile updates | 126 |
| **Student Routes** | `backend/routes/studentRoutes.js` | Student CRUD, multi-year promotion, academic linkage | 487 |
| **QR Routes** | `backend/routes/qrRoutes.js` | Public QR resolution, QR image generation | 192 |
| **Marks Routes** | `backend/routes/markRoutes.js` | Batch exam grading, scorecard queries | 246 |
| **Feedback Routes** | `backend/routes/feedbackRoutes.js` | Parent-teacher communication channel | 104 |
| **Attendance Routes**| `backend/routes/attendanceRoutes.js` | Bulk daily class attendance registers | 170 |
| **Academic Routes** | `backend/routes/academicRoutes.js` | Academic years, classes, sections, subjects | 365 |
| **Client Auth State**| `frontend/src/context/AuthContext.jsx` | React context, token storage, role checks | 83 |

---

## 2. Review Methodology (The 6 Prescribed Areas)

In accordance with Section 8 of the assignment specification, the manual inspection investigated six core dimensions:

```
                          AI-GENERATED CODE (VERSION 0)
                                        │
     ┌──────────────┬──────────────┬────┴─────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼              ▼              ▼
[ 1. AUTH ]   [ 2. AUTHZ ]   [ 3. INPUT ]   [ 4. DB/DATA ] [ 5. SECRETS ] [ 6. ERRORS ]
  Passwords     Role checks    Regex/Search   NoSQL query    Hardcoded      Stack traces
  Reset flow    BOLA / IDOR    File uploads   Permissions    Env defaults   DB leakages
  Sessions      Admin abuse    Mass assign    PII exposure   Key storage    Debug modes
```

---

## 3. Comprehensive Security Observations (18 Findings)

### Review Area 1: Authentication

---

#### Finding OBS-01: Missing Rate Limiting and Brute-Force Protection
* **Category**: Authentication
* **CWE Mapping**: CWE-307 (Improper Restriction of Excessive Authentication Attempts)
* **OWASP Top 10**: A07:2021 – Identification and Authentication Failures
* **Location**: [backend/routes/authRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/authRoutes.js#L18-L67) (`router.post('/login')`)
* **Vulnerable Code Snippet**:
  ```javascript
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });
      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
      // Returns token immediately
  ```
* **Security Analysis**: The AI assistant generated a standard credential-checking routine without rate limiting middleware (e.g. `express-rate-limit`) or exponential backoff. An attacker can execute automated dictionary or credential stuffing attacks at wire speed without triggering IP blocks or account lockouts.
* **Impact**: High. Complete credential compromise of administrative or faculty accounts.
* **Finding Status**: True Positive.

---

#### Finding OBS-02: Excessive JWT Expiration Lifetime
* **Category**: Authentication / Session Management
* **CWE Mapping**: CWE-613 (Insufficient Session Expiration)
* **OWASP Top 10**: A07:2021 – Identification and Authentication Failures
* **Location**: [backend/routes/authRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/authRoutes.js#L7-L13) (`generateToken`)
* **Vulnerable Code Snippet**:
  ```javascript
  const generateToken = (id) => {
    return jwt.sign(
      { id },
      process.env.JWT_SECRET || 'student_portal_jwt_secret_key_2026',
      { expiresIn: '30d' } // <<--- 30 DAYS LIFETIME
    );
  };
  ```
* **Security Analysis**: The AI configured tokens to expire after **30 days**. In an institutional portal managing confidential student records, prolonged token validity expands the window of opportunity for token interception, physical device session hijacking, and network sniffing.
* **Impact**: Medium. Intercepted tokens remain valid for an entire month.
* **Finding Status**: True Positive.

---

#### Finding OBS-03: Insecure Client-Side Only Logout / Missing Token Revocation
* **Category**: Authentication / Session Management
* **CWE Mapping**: CWE-613 (Insufficient Session Expiration)
* **Location**: [frontend/src/context/AuthContext.jsx](file:///d:/Cybersec/DSP-Mini%20Project/frontend/src/context/AuthContext.jsx#L43-L48) & [backend/routes/authRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/authRoutes.js)
* **Vulnerable Code Snippet**:
  ```javascript
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edutrack_token');
    localStorage.removeItem('edutrack_user');
  };
  ```
* **Security Analysis**: When a user logs out, the frontend simply discards the token from browser `localStorage`. No server-side invalidation occurs. Because the backend does not maintain an active token revocation blocklist or token generation timestamp in Redis/MongoDB, a copied JWT remains 100% valid on the backend API until its 30-day expiration expires.
* **Impact**: Medium. Stolen tokens cannot be invalidated upon user logout.
* **Finding Status**: True Positive.

---

#### Finding OBS-04: Predictable Default Credentials Without Mandatory First-Login Rotation
* **Category**: Authentication / Password Handling
* **CWE Mapping**: CWE-521 (Weak Password Requirements), CWE-1188 (Insecure Default Initialization)
* **Location**: [backend/seed/seedData.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/seed/seedData.js), `TeachersManager.jsx`, `ParentsManager.jsx`
* **Vulnerable Code Snippet**:
  ```javascript
  // Seed & Creation default values
  password: 'Teacher@123'
  password: 'Parent@123'
  password: 'Admin@123'
  ```
* **Security Analysis**: When administrators register new teachers or parents, the AI default implementation pre-fills predictable credentials without enforcing a mandatory `requirePasswordChange` flag upon initial authentication. An external attacker can enumerate newly enrolled faculty and compromise their accounts before the user ever signs in.
* **Impact**: High. Widespread initial account takeover.
* **Finding Status**: True Positive.

---

#### Finding OBS-05: Missing Secure Password Reset Mechanism
* **Category**: Authentication / Password Handling
* **CWE Mapping**: CWE-640 (Weak Password Recovery Mechanism for Forgotten Password)
* **Location**: [backend/routes/authRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/authRoutes.js)
* **Security Analysis**: The AI assistant omitted a secure password recovery flow altogether. There is no cryptographic timed reset token generation, email verification, or challenge-response mechanism. In real deployment, administrators must manually edit database documents or reset passwords via unauthenticated channels.
* **Impact**: Medium. Operational friction leading to insecure ad-hoc password resets.
* **Finding Status**: True Positive.

---

#### Finding OBS-06: Profile Password Modification Without Current Password Challenge
* **Category**: Authentication / Password Handling
* **CWE Mapping**: CWE-620 (Unverified Password Change)
* **Location**: [backend/routes/authRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/authRoutes.js#L94-L123) (`router.put('/profile')`)
* **Vulnerable Code Snippet**:
  ```javascript
  router.put('/profile', protect, async (req, res) => {
    // ...
    if (req.body.password) {
      user.password = req.body.password; // <<--- Does NOT verify old password!
    }
    const updatedUser = await user.save();
  ```
* **Security Analysis**: The profile update endpoint accepts a new password directly without prompting for the user's current password. If a student or teacher leaves their workstation unlocked, a passerby or CSRF/XSS payload can overwrite the account credentials without knowing the existing password.
* **Impact**: High. Trivial local account takeover.
* **Finding Status**: True Positive.

---

### Review Area 2: Authorization

---

#### Finding OBS-07: Broken Object-Level Authorization (BOLA/IDOR) on Student Profiles
* **Category**: Authorization
* **CWE Mapping**: CWE-639 (Authorization Bypass Through User-Controlled Key)
* **OWASP API Top 10**: API1:2023 – Broken Object Level Authorization
* **Location**: [backend/routes/studentRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/studentRoutes.js#L201-L260) (`router.get('/:id')`)
* **Vulnerable Code Snippet**:
  ```javascript
  // @route GET /api/students/:id
  // @access Private (Admin, Teacher, Parent)
  router.get('/:id', protect, async (req, res) => {
    try {
      const student = await Student.findById(req.params.id)...
      // Directly returns student, academicHistory, attendance, marks
      res.json({ student, currentRecord, academicHistory, attendanceStats, marks });
  ```
* **Security Analysis**: The endpoint requires authentication via `protect`, but performs **no horizontal access control**. A logged-in Parent (Parent A) can supply the MongoDB `_id` of Student B (unrelated child) and the server gladly dumps Student B's complete personal profile, residential address, emergency contact numbers, attendance logs, and academic scorecards.
* **Impact**: Critical. Wholesale breach of student confidentiality across parent accounts.
* **Finding Status**: True Positive.

---

#### Finding OBS-08: Missing Function-Level Access Control on Class Examination Scorecards
* **Category**: Authorization
* **CWE Mapping**: CWE-862 (Missing Authorization)
* **OWASP API Top 10**: API5:2023 – Broken Function Level Authorization
* **Location**: [backend/routes/markRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/markRoutes.js#L24-L60) (`router.get('/exam/:examId')`)
* **Vulnerable Code Snippet**:
  ```javascript
  // @route GET /api/marks/exam/:examId
  // @access Private
  router.get('/exam/:examId', protect, async (req, res) => {
    // Missing authorize('admin', 'teacher')!
    const enrolledStudents = await StudentAcademicRecord.find(query)...
    const existingMarks = await Mark.find({ exam: examId });
    res.json({ exam, students: combined });
  ```
* **Security Analysis**: The batch grade sheet endpoint is protected only by `protect`, completely omitting the `authorize('admin', 'teacher')` guard. Any authenticated Parent can query this endpoint with an `examId` to inspect the full list of enrolled students, their roll numbers, names, photos, and exact marks obtained in that examination.
* **Impact**: High. Institutional grade secrecy breach; competitive student privacy violation.
* **Finding Status**: True Positive.

---

#### Finding OBS-09: Unvalidated Student Association in Parent Feedback Submission
* **Category**: Authorization / Business Logic
* **CWE Mapping**: CWE-639 (Authorization Bypass), CWE-862 (Missing Authorization)
* **Location**: [backend/routes/feedbackRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/feedbackRoutes.js#L41-L60) (`router.post('/')`)
* **Vulnerable Code Snippet**:
  ```javascript
  router.post('/', protect, async (req, res) => {
    const { studentId, teacherId, subjectId, message } = req.body;
    const feedback = new Feedback({
      parent: req.user._id,
      student: studentId, // <<--- Never validates if studentId is linked to req.user!
      teacher: teacherId,
      message,
    });
  ```
* **Security Analysis**: The feedback submission handler assumes that the client UI will only send child IDs linked to the logged-in parent. If a parent tampers with the API payload and sends an arbitrary `studentId`, the server accepts and persists the inquiry under that student's record, enabling malicious impersonation and false grievance lodging.
* **Impact**: Medium. Integrity corruption of parent-faculty communications.
* **Finding Status**: True Positive.

---

#### Finding OBS-10: Inactive / Suspended Account Status Ignored During Token Verification
* **Category**: Authorization / Session Management
* **CWE Mapping**: CWE-287 (Improper Authentication)
* **Location**: [backend/middleware/authMiddleware.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/middleware/authMiddleware.js#L17-L21)
* **Vulnerable Code Snippet**:
  ```javascript
  req.user = await User.findById(decoded.id).select('-password');
  if (!req.user) {
    return res.status(401).json({ message: 'User not found with this token' });
  }
  next(); // <<--- Never checks req.user.status or user active flag!
  ```
* **Security Analysis**: The authentication middleware confirms user existence but never checks if the account has been disabled or suspended by the administrator. A dismissed faculty member or removed parent retains full active session capability until token expiry.
* **Impact**: High. Post-termination access by rogue insiders.
* **Finding Status**: True Positive.

---

### Review Area 3: Input Validation

---

#### Finding OBS-11: Regular Expression Denial of Service (ReDoS) in Student Search
* **Category**: Input Validation
* **CWE Mapping**: CWE-1333 (Inefficient Regular Expression Complexity / ReDoS), CWE-400 (Uncontrolled Resource Consumption)
* **Location**: [backend/routes/studentRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/studentRoutes.js#L33-L43) (`GET /api/students`)
* **Vulnerable Code Snippet**:
  ```javascript
  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i'); // <<--- Direct unescaped regex compilation!
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
* **Security Analysis**: User input from query string `search` is passed directly into `new RegExp(...)` without escaping regex meta-characters (`.*`, `+`, `(a+)+`). An attacker submitting crafted catastrophic backtracking payloads can cause NodeJS thread-blocking CPU spikes (100% CPU lockup), denying service to all other institutional users.
* **Impact**: High. Complete API server Denial of Service.
* **Finding Status**: True Positive.

---

#### Finding OBS-12: Mass Assignment Risk via Unsanitized `req.body` Parsing
* **Category**: Input Validation
* **CWE Mapping**: CWE-915 (Improperly Controlled Modification of Dynamically-Determined Object Attributes)
* **Location**: [backend/routes/studentRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/studentRoutes.js#L114-L155) (`router.post('/')`)
* **Vulnerable Code Snippet**:
  ```javascript
  const studentData = req.body; // <<--- Ingests all raw request keys
  // ...
  const student = new Student(studentData); // <<--- Instantiates model directly
  const savedStudent = await student.save();
  ```
* **Security Analysis**: The AI assistant assigned the raw `req.body` object directly to the Mongoose constructor without schema attribute whitelisting (using tools such as Joi, Zod, or explicit destructuring). A malicious administrator or compromised client can inject arbitrary schema parameters (e.g. modifying internal status, audit fields, or relation mappings).
* **Impact**: Medium. Data tampering and unintended model attribute corruption.
* **Finding Status**: True Positive.

---

#### Finding OBS-13: Incomplete File Type Verification in Student Photograph Upload
* **Category**: Input Validation / File Handling
* **CWE Mapping**: CWE-434 (Unrestricted Upload of File with Dangerous Type)
* **Location**: [backend/middleware/uploadMiddleware.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/middleware/uploadMiddleware.js#L24-L34)
* **Vulnerable Code Snippet**:
  ```javascript
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype); // <<--- Client controlled header!

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  };
  ```
* **Security Analysis**: Validation relies exclusively on the client-supplied filename extension and `file.mimetype` header. Both are easily spoofed via cURL or Burp Suite. The server performs no magic byte verification (file signature analysis) or image re-encoding. An attacker can upload an HTML/SVG file containing malicious JavaScript, stored directly on the host server.
* **Impact**: High. Stored Cross-Site Scripting (XSS) or file execution risks.
* **Finding Status**: True Positive.

---

### Review Area 4: Database & Query Construction

---

#### Finding OBS-14: Unauthenticated Public PII Data Exposure via Dynamic QR Verification
* **Category**: Database Security / Privacy
* **CWE Mapping**: CWE-359 (Exposure of Private Personal Information), CWE-200 (Exposure of Sensitive Information)
* **Location**: [backend/routes/qrRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/qrRoutes.js#L10-L150) (`router.get('/verify/:qrToken')`)
* **Vulnerable Code Snippet**:
  ```javascript
  // @route GET /api/qr/verify/:qrToken
  // @access Public  <<--- COMPLETELY UNAUTHENTICATED
  router.get('/verify/:qrToken', async (req, res) => {
    // ...
    res.json({
      student: {
        fullName: `${student.firstName} ${student.lastName}`,
        dateOfBirth: student.dateOfBirth,
        bloodGroup: student.bloodGroup,
        phone: student.phone,
        address: student.address,                 // Residential street, city
        emergencyContact: student.emergencyContact,// Contact name & phone
        parentInfo: student.parentInfo,           // Father & mother phones
        aadhaarNumber: student.aadhaarNumber,     // Government UID
      },
      attendanceSummary,
      examMarks, // Detailed scores
    });
  ```
* **Security Analysis**: While the dynamic QR badge concept is functionally brilliant, the AI implementation makes **zero distinction between public verification data and private student records**. Scanning a physical badge allows any stranger, bus driver, or unauthorized third party to retrieve the child's exact home address, emergency contacts, parent phone numbers, Aadhaar number, and academic report card.
* **Impact**: Critical. Severe PII privacy violation and physical safety risk.
* **Finding Status**: True Positive.

---

#### Finding OBS-15: Hardcoded Database Connection String Fallback
* **Category**: Database Security / Configuration
* **CWE Mapping**: CWE-798 (Use of Hard-coded Credentials)
* **Location**: [backend/config/db.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/config/db.js#L5)
* **Vulnerable Code Snippet**:
  ```javascript
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_portal_db';
  ```
* **Security Analysis**: If the environment variable `MONGODB_URI` fails to load, the database connector falls back silently to an unauthenticated local connection rather than failing securely (Fail-Safe Defaults principle).
* **Impact**: Low. Environment configuration drift.
* **Finding Status**: True Positive.

---

### Review Area 5: Secrets Management

---

#### Finding OBS-16: Hardcoded Default JWT Secret Fallback in Core Authentication
* **Category**: Secrets Management
* **CWE Mapping**: CWE-798 (Use of Hard-coded Credentials), CWE-259 (Use of Hard-coded Password)
* **Location**: [backend/middleware/authMiddleware.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/middleware/authMiddleware.js#L15) & [backend/routes/authRoutes.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/routes/authRoutes.js#L10)
* **Vulnerable Code Snippet**:
  ```javascript
  process.env.JWT_SECRET || 'student_portal_jwt_secret_key_2026'
  ```
* **Security Analysis**: If `.env` is absent or misconfigured during deployment, both token generation and verification fall back to a publicly visible static string embedded in the codebase. An adversary can forge administrator JWTs with arbitrary claims (`role: 'admin'`) and gain complete control over the application.
* **Impact**: Critical. Complete authentication bypass and privilege escalation.
* **Finding Status**: True Positive.

---

### Review Area 6: Error Handling & Architecture

---

#### Finding OBS-17: Internal Stack Trace and Database Architecture Leakage
* **Category**: Error Handling
* **CWE Mapping**: CWE-209 (Generation of Error Message Containing Sensitive Information)
* **Location**: [backend/server.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/server.js#L44-L50)
* **Vulnerable Code Snippet**:
  ```javascript
  app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  });
  ```
* **Security Analysis**: If `NODE_ENV` is unset (common during default containerization), the server responds to errors by emitting full JavaScript call stacks, file paths on the host OS, internal library versions, and database driver error strings directly to HTTP clients.
* **Impact**: Medium. Reconnaissance intelligence enabling targeted exploitation.
* **Finding Status**: True Positive.

---

#### Finding OBS-18: Permissive CORS Configuration and Missing HTTP Security Headers
* **Category**: System Architecture / Security Headers
* **CWE Mapping**: CWE-942 (Permissive Cross-Domain Policy with Wildcard Domain), CWE-693 (Protection Mechanism Failure)
* **Location**: [backend/server.js](file:///d:/Cybersec/DSP-Mini%20Project/backend/server.js#L16)
* **Vulnerable Code Snippet**:
  ```javascript
  app.use(cors()); // <<--- Wildcard Access-Control-Allow-Origin: *
  ```
* **Security Analysis**: The AI used basic `cors()` without specifying trusted origin domains, allowing any malicious domain to make cross-origin requests. Furthermore, essential HTTP security headers (`X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`) provided by standard libraries like `helmet` are absent.
* **Impact**: Medium. Clickjacking and Cross-Origin data leakage.
* **Finding Status**: True Positive.

---

## 4. Summary Matrix of Observations

| Ref ID | Review Area | Vulnerability Title | Severity | CWE ID | Finding Classification |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **OBS-01** | Authentication | Missing Rate Limiting on Login (`/api/auth/login`) | **High** | CWE-307 | True Positive |
| **OBS-02** | Authentication | Excessive JWT Token Lifetime (30 Days) | **Medium** | CWE-613 | True Positive |
| **OBS-03** | Authentication | Client-Only Logout / No Token Revocation | **Medium** | CWE-613 | True Positive |
| **OBS-04** | Authentication | Insecure Predictable Default Passwords | **High** | CWE-521 | True Positive |
| **OBS-05** | Authentication | Missing Secure Password Reset Workflow | **Medium** | CWE-640 | True Positive |
| **OBS-06** | Authentication | Password Overwrite Without Current Password Challenge | **High** | CWE-620 | True Positive |
| **OBS-07** | Authorization | Broken Object-Level Authorization (BOLA/IDOR) on Students | **Critical** | CWE-639 | True Positive |
| **OBS-08** | Authorization | Broken Function Authorization on Exam Grade Sheets | **High** | CWE-862 | True Positive |
| **OBS-09** | Authorization | Unvalidated Student Linkage in Parent Feedback | **Medium** | CWE-639 | True Positive |
| **OBS-10** | Authorization | Suspended / Inactive Account Access Persistence | **High** | CWE-287 | True Positive |
| **OBS-11** | Input Validation | ReDoS & Unescaped Regex in Search Parameters | **High** | CWE-1333 | True Positive |
| **OBS-12** | Input Validation | Mass Assignment Vulnerability in Student Updates | **Medium** | CWE-915 | True Positive |
| **OBS-13** | Input Validation | Incomplete File Type Inspection in Photo Uploads | **High** | CWE-434 | True Positive |
| **OBS-14** | Database / Privacy| Public Unauthenticated Exposure of Student PII via QR | **Critical** | CWE-359 | True Positive |
| **OBS-15** | Database Security| Hardcoded Database Connection String Fallback | **Low** | CWE-798 | True Positive |
| **OBS-16** | Secrets | Hardcoded Default JWT Secret Fallback Key | **Critical** | CWE-798 | True Positive |
| **OBS-17** | Error Handling | Stack Trace & Architecture Leakage in Error Responses | **Medium** | CWE-209 | True Positive |
| **OBS-18** | Architecture | Permissive Wildcard CORS & Missing Security Headers | **Medium** | CWE-942 | True Positive |

---

## 5. Comparison: AI Security Judgment vs. Human Security Judgment

Per **Section 26 (Page 35–36)** of `Mini-Project.pdf`, students must explicitly compare what the AI coding assistant claimed about its code versus what manual human security review identified:

| Security Domain | What AI Claimed During Generation (Review A) | What Human Review Identified (Review B) | Actually Vulnerable? | Discrepancy Insight |
| :--- | :--- | :--- | :---: | :--- |
| **Authentication** | *"Passwords are cryptographically secured using standard bcrypt with salt work factor 10."* | Hashing is present, but missing brute-force rate limiting, password reset flow, and short token lifespans. | **YES** | AI conflates password hashing with total authentication security. |
| **Authorization** | *"Endpoints are protected with JWT authentication and role authorization checks."* | Role guards exist (`authorize('admin')`), but **Object-Level Authorization (BOLA)** is completely absent. | **YES** | AI treats authorization as binary role checks, missing ownership verification. |
| **Input Validation** | *"Search performs case-insensitive filtering across multiple fields."* | Uses raw `new RegExp(search)` directly from user input without escaping, creating ReDoS vulnerability. | **YES** | AI optimizes for convenience without defensive input sanitization. |
| **QR Code Privacy** | *"QR codes provide seamless, instant verification of student identities."* | The public QR endpoint exposes student Aadhaar, residential address, and emergency phone numbers. | **YES** | AI prioritized feature usability over data minimization and PII privacy. |
| **File Uploads** | *"Multer middleware validates image extensions and limits file size to 5MB."* | Only inspects client-reported MIME headers; no magic byte verification or SVG sanitization. | **YES** | AI relies on superficial client-side metadata instead of server verification. |

### Key Educational Finding
AI coding assistants exhibit a pronounced **functional bias**: they produce clean, working code that satisfies user stories, but rarely inject defensive controls (rate limiters, BOLA checks, input sanitizers, privacy filters) unless explicitly commanded with precise security constraints.

---

## 6. AI Code Security Score (AICSS) Evaluation

Per **Section 27 (Page 36)** of `Mini-Project.pdf`, the AI Code Security Score for Version 0 is computed as:

$$\text{AICSS} = 100 - (W_c + W_h + W_m + W_p + W_d)$$

Where:
* $W_c$ = Critical vulnerability penalty ($3 \text{ findings} \times 10 = 30$)
* $W_h$ = High vulnerability penalty ($6 \text{ findings} \times 6 = 36$)
* $W_m$ = Medium vulnerability penalty ($8 \text{ findings} \times 3 = 24$)
* $W_p$ = Privacy-risk penalty ($2 \text{ findings} \times 5 = 10$)
* $W_d$ = Dependency/supply-chain penalty ($0 = 0$)

$$\text{AICSS} = 100 - (30 + 36 + 24 + 10 + 0) = \mathbf{0 / 100} \quad (\text{Severely Vulnerable})$$

> **Interpretation**: A score of zero on initial AI-generated code proves the core thesis of Week 2: **"Working code $\ne$ Secure code."** The application is 100% operationally functional, yet completely vulnerable to credential stuffing, BOLA data extraction, ReDoS, and student PII harvesting.

---

## 7. Week 2 Presentation Outline (10–15 Minutes)

### Slide 1: Title & Theme
* **Title**: Understanding AI-Generated Code: Manual Security Review of EduTrack QR
* **Theme**: *"Working code ≠ secure code"*
* **Team**: CS-601 Data Security & Privacy Batch 2026–28

### Slide 2: The Illusion of Working Code
* Recap of Week 1: EduTrack QR works smoothly across Admin, Teacher, and Parent portals with dynamic QR cards.
* The Central Question: *Does passing all functional tests mean the application is safe?*

### Slide 3: Code Review Methodology
* Explanation of the 6 review dimensions (Authentication, Authorization, Input Validation, Database, Secrets, Error Handling).
* Total codebase analyzed: 12 core files, ~1,800 lines of AI-generated code.

### Slide 4: Key Finding 1 — Broken Object-Level Authorization (BOLA/IDOR)
* Code walkthrough of `GET /api/students/:id` in `studentRoutes.js`.
* Show how any authenticated parent can access any other student's complete record, report card, and family address.

### Slide 5: Key Finding 2 — Privacy Leakage in Public QR Code Resolution
* Code walkthrough of `GET /api/qr/verify/:qrToken` in `qrRoutes.js`.
* Show how scanning the physical QR badge dumps unauthenticated student Aadhaar, blood group, and emergency contacts.

### Slide 6: Key Finding 3 — ReDoS & Missing Rate Limiting
* Walkthrough of unescaped `new RegExp()` in search endpoints.
* Walkthrough of unprotected `/api/auth/login` allowing unlimited credential cracking.

### Slide 7: AI Judgment vs. Human Security Judgment
* Presentation of the comparison matrix.
* Analysis of why AI failed to detect BOLA and privacy violations during initial code generation.

### Slide 8: Summary & Roadmap
* Recap of the 18 findings and AICSS score.
* Looking ahead: Roadmap to Week 3 (STRIDE Threat Modeling) and Week 4 (Automated SAST/DAST Tool Verification).

---
*End of Week 2 Deliverables Document — CS-601 Data Security & Privacy*
