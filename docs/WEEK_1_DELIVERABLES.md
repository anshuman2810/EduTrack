# CS-601 Data Security & Privacy — Mini-Project
## Week 1 Deliverables: AI-Assisted Software Development and Threat Awareness

**Course**: CS-601 Data Security & Privacy (Academic Batch 2026–28, Term July–Dec 2026)  
**Subject OIC**: Manisha J. Nene (`mjnene@diat.ac.in`)  
**Assignment**: *Build It with AI, Break It Ethically, Secure It: Security and Privacy Evaluation of AI-Generated Applications*  
**Application Domain**: Student Information & Academic Records Portal with Dynamic QR Identity (**EduTrack QR**)  
**Milestone**: **Week 1 Submission (Initial Application Version 0 & Threat Awareness)**  
**Theme**: *"What can AI build?" and "Why shouldn't we trust it automatically?"*  

---

## Table of Contents
1. [Deliverable 1: Project Proposal](#1-project-proposal)
2. [Deliverable 2: Requirements Specification](#2-requirements-specification)
   - [2.1 Functional Requirements](#21-functional-requirements)
   - [2.2 Security-Sensitive Components (Required $\ge 6$)](#22-security-sensitive-components-required-ge-6)
3. [Deliverable 3: System Architecture Diagram](#3-system-architecture-diagram)
4. [Deliverable 4: Data Flow Diagram (DFD)](#4-data-flow-diagram-dfd)
   - [4.1 Level-0 Context Diagram](#41-level-0-context-diagram)
   - [4.2 Level-1 Detailed Data Flow Diagram](#42-level-1-detailed-data-flow-diagram)
5. [Deliverable 5: Data Inventory & Classification](#5-data-inventory--classification)
6. [Deliverable 6: Initial Threat Model (Asset–Threat–Vulnerability–Impact)](#6-initial-threat-model)
7. [Deliverable 7: AI Development Prompt Log & Audit Trail](#7-ai-development-prompt-log--audit-trail)
8. [Deliverable 8: AI-Generated Application (Version 0) Verification](#8-ai-generated-application-version-0-verification)
9. [Deliverable 9: 5–10 Minute Demonstration Script](#9-510-minute-demonstration-script)

---

## 1. Project Proposal

### 1.1 Project Title
**EduTrack QR — Institutional Student Information and Academic Progression Portal with Dynamic Invariant QR Identity Badges**

### 1.2 Problem Statement & Motivation
Educational institutions face significant administrative overhead managing student personal details, attendance records, academic report cards, and multi-year progression. Physical student identity cards quickly become obsolete when students advance into higher classes, change sections, or choose new elective subjects. Traditional digital portals either expose students to insecure access models or maintain isolated silos where historical academic records get overwritten when a new academic year begins.

### 1.3 Solution Overview
EduTrack QR is an AI-assisted MERN (MongoDB, Express, React, Node.js) web application engineered around the concept of a **single, permanent, dynamic QR code identity**:
- Each student is assigned one invariant QR code upon admission that remains constant throughout their academic tenure.
- Scanning the physical badge dynamically queries the institutional server, rendering their verified public profile and allowing multi-year academic trajectory inspection via a historical **Academic Year Selector**.
- Three dedicated role-based portals (**Admin**, **Teacher**, **Parent**) allow seamless record updates, bulk attendance tracking, exam grading, and parent-teacher communication.
- In strict adherence to assignment requirements, **all data used is synthetic** (no real institutional or PII records).

---

## 2. Requirements Specification

### 2.1 Functional Requirements

| Ref ID | Category | Functional Requirement Description | Codebase Implementation |
| :--- | :--- | :--- | :--- |
| **FR-01** | User Management | Secure login and session handling for three user roles: Administrator, Teacher, and Parent. | `backend/routes/authRoutes.js`, `frontend/src/pages/Login.jsx` |
| **FR-02** | Student Admission | Full CRUD operations for student records, including personal information, contact info, photo upload, and academic assignment. | `backend/routes/studentRoutes.js`, `StudentFormModal.jsx` |
| **FR-03** | Permanent QR Generation | Automated generation of a unique, unalterable UUID-based QR token (`qrToken`) tied to the student's identity. | `backend/routes/qrRoutes.js`, `QRCodeCard.jsx` |
| **FR-04** | Academic Hierarchy | Management of Academic Years (e.g., 2024–25, 2025–26), Classes, Sections, and Curriculum Subjects. | `backend/routes/academicRoutes.js`, `AcademicsManager.jsx` |
| **FR-05** | Multi-Year Progression | Ability to enroll/promote a student into a new academic year while archiving previous attendance, marks, and remarks under the same QR token. | `backend/routes/studentRoutes.js` (`/enroll-year`), `EnrollYearModal.jsx` |
| **FR-06** | Daily Attendance | Batch attendance recording for classes/sections with quick-fill actions ("Mark All Present", status toggles, remarks). | `backend/routes/attendanceRoutes.js`, `AttendanceManager.jsx` |
| **FR-07** | Examinations & Grading | Creation of tests/exams with max/passing marks; class grade sheet entry with automated calculation of percentages and letter grades ($A+$, $A$, etc.). | `backend/routes/examRoutes.js`, `markRoutes.js`, `ExamsMarksManager.jsx` |
| **FR-08** | Parent-Teacher Feedback | Feedback submission from parents to individual subject teachers with 1–5 star ratings, categorization, and faculty response capabilities. | `backend/routes/feedbackRoutes.js`, `ParentFeedback.jsx`, `FeedbackManager.jsx` |
| **FR-09** | Printable ID Badge | High-resolution printable/downloadable student ID badge that prints strictly on a single sheet of paper or downloads as a 2x retina PNG. | `frontend/src/components/qr/IDCardModal.jsx`, `frontend/src/index.css` |
| **FR-10** | Public QR Verification | Public route (`/verify/:qrToken`) enabling smartphone camera lookup of verified student data without exposing authentication secrets. | `backend/routes/qrRoutes.js`, `PublicStudentProfile.jsx` |

### 2.2 Security-Sensitive Components (Required $\ge 6$)

Per Section 5 of the assignment syllabus, at least six security-sensitive components must be incorporated into the application. EduTrack QR incorporates **nine (9)**:

| # | Security Component | Implementation in EduTrack QR | Security Learning & Evaluation Area |
| :---: | :--- | :--- | :--- |
| **1** | **Login & Authentication** | Email/password authentication using Bcrypt hashing and JSON Web Tokens (JWT). | Credential verification, token longevity, brute-force risk, absence of rate limiting in AI initial code. |
| **2** | **Role-Based Authorization** | Express middleware (`verifyToken`, `requireRole('admin')`, etc.) verifying role on API routes. | Broken Object-Level Authorization (BOLA/IDOR), privilege escalation if role checks are bypassed. |
| **3** | **Database & Data Storage** | MongoDB with Mongoose object modeling and schema validation. | NoSQL injection possibilities, unescaped regex queries, mass assignment vulnerabilities in AI code. |
| **4** | **Search & Input Validation** | Live regex and string searching across students, faculty, and records. | Unsanitized input, potential denial-of-service via ReDoS or unescaped query operators. |
| **5** | **File Upload Handling** | Multer middleware handling student profile photo uploads to disk storage. | Path traversal risk, arbitrary file upload execution, MIME-type verification, untrusted input. |
| **6** | **Password Storage** | One-way hashing using `bcryptjs` with a salt work factor of 10. | Cryptographic security, offline cracking resistance, lack of password complexity policies in AI code. |
| **7** | **Sessions & Tokens** | Bearer JWT token transmitted via `Authorization` headers and verified statelessly. | Token replay attacks, lack of server-side token revocation or blacklisting upon logout. |
| **8** | **API Authorization** | Scoped REST endpoints requiring valid Bearer tokens for sensitive administrative data. | Missing function-level access control, exposure of internal IDs. |
| **9** | **Privacy & QR Resolution** | Dynamic resolution of public QR profiles via invariant tokens. | Information leakage of sensitive student PII (Aadhaar, home address, emergency contacts) over public QR links. |

---

## 3. System Architecture Diagram

```
                                 [ Web Clients ]
    ┌───────────────────────┬──────────────────────┬──────────────────────┐
    │   Admin Browser       │   Teacher Browser    │    Parent Browser    │
    │ (Desktop / Mobile)    │ (Desktop / Mobile)   │  (Desktop / Mobile)  │
    └───────────┬───────────┴──────────┬───────────┴──────────┬───────────┘
                │                      │                      │
                │                      │                      │
                ▼                      ▼                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 React 18 + Vite Single Page Application                │
  │  - Tailwind CSS Responsive UI (Mobile-First Layout)                    │
  │  - React Router v6 Guarded Role Routes (/admin, /teacher, /parent)     │
  │  - AuthContext (JWT State & Local Storage Management)                  │
  │  - Dynamic QR Generator & ID Badge Modal (Single-Page PDF / Canvas PNG)│
  │  - Public QR Profile Resolver (/verify/:qrToken)                       │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ HTTP / REST API (Port 5000)
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                    Node.js & Express REST API Server                   │
  │                                                                        │
  │  [ Middleware Pipeline ]                                               │
  │  ├── CORS Handler                                                      │
  │  ├── Express JSON Body Parser                                          │
  │  ├── Multer File Upload Handler (/uploads)                             │
  │  └── JWT Auth & Role Authorization Middleware (authMiddleware.js)      │
  │                                                                        │
  │  [ API Route Handlers ]                                                │
  │  ├── /api/auth       -> Authentication (Login, Session Verify)        │
  │  ├── /api/students   -> Student CRUD, Multi-Year Promotions            │
  │  ├── /api/qr         -> Public Verification & QR Code Rendering        │
  │  ├── /api/attendance -> Bulk Daily Register & Summaries                │
  │  ├── /api/exams      -> Tests & Exam Configuration                     │
  │  ├── /api/marks      -> Scorecards & Grade Computation                 │
  │  ├── /api/feedback   -> Parent-Teacher Communication                   │
  │  ├── /api/academic   -> Academic Years, Classes, Sections, Subjects    │
  │  └── /api/users      -> Faculty & Parent Accounts                      │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ Mongoose ODM Driver
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           MongoDB Database                             │
  │  Collections:                                                          │
  │  • users                  • students                • attendance       │
  │  • academic_years         • student_academic_records• exams            │
  │  • classes                • sections                • marks            │
  │  • subjects               • feedbacks               • fs.files         │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Flow Diagram (DFD)

### 4.1 Level-0 Context Diagram

```
                 [ Credentials & Profile Requests ]
                 ───────────────────────────────────►
 [ Admin / Teacher /                                   [ EduTrack QR ]
     Parent Users ]  ◄───────────────────────────────────   System
                  [ Dashboard Data, Badges, Reports ]
                                  │
                                  │ [ Scanned QR Token ]
                                  │ (From Smartphone / Public)
                                  ▼
                         [ Public Verifier ]
                                  ▲
                                  │ [ Verified Student Profile & Multi-Year Grades ]
                                  │
```

### 4.2 Level-1 Detailed Data Flow Diagram

```
User Login:
[ User ] ──(1) Email & Password──► [ D1: Auth Process ] ──(2) Validate Hash──► [ Database: users ]
         ◄──(3) JWT Token & Role─── [ D1: Auth Process ] ◄──(2b) Return User───

Student Enrollment & QR Generation:
[ Admin ] ──(4) Student Bio & Photo──► [ D2: Student Manager ] ──(5) Save Record──► [ Database: students ]
          ◄──(7) ID Badge & QR Code──── [ D2: Student Manager ] ◄──(6) Generate QR Token (UUID)

Attendance & Examination Grading:
[ Teacher ] ──(8) Daily Attendance / Scores──► [ D3: Academic Engine ] ──(9) Batch Update──► [ Database: attendance/marks ]
                                               [ D3: Academic Engine ] ──(10) Compute Pct/Grades

Parent Monitoring & Communication:
[ Parent ] ──(11) Child Report Query───────► [ D4: Parent Portal ] ──(12) Read History──► [ Database: students/marks ]
         ◄──(13) Report Card & Attendance─── [ D4: Parent Portal ]
[ Parent ] ──(14) Teacher Feedback──────────► [ D5: Feedback Queue ] ──(15) Store Msg──► [ Database: feedbacks ]
[ Teacher ] ◄──(16) View Inquiries / Reply─── [ D5: Feedback Queue ]

Public Dynamic QR Verification:
[ Camera / Scanner ] ──(17) GET /api/qr/verify/:qrToken──► [ D6: QR Resolver ] ──(18) Query Active + History──► [ Database ]
                     ◄──(19) Rendered Public Profile─────── [ D6: QR Resolver ]
```

---

## 5. Data Inventory & Classification

In accordance with the assignment restriction (*"Students must not use real personal, financial, medical, institutional or confidential data. Use synthetic data"*), all records populated in the application are strictly synthetic.

| Data Asset | Sensitivity | Classification | Storage Location | Retention & Access Controls |
| :--- | :--- | :--- | :--- | :--- |
| **User Passwords** | Critical | Confidential / Authentication Secret | `users` collection | One-way Bcrypt hash ($salt=10$); never stored in plaintext; stripped from API query projections. |
| **JWT Signing Secret** | Critical | System Secret | Backend `.env` configuration | Stored only in server environment; used to cryptographically sign session tokens. |
| **Aadhaar Numbers (Synthetic)** | High | Synthetic Government ID (PII) | `students` collection | Masked/restricted; synthetic 12-digit mock values (e.g., `8921-4432-1190`). |
| **Contact Details (Synthetic)** | Medium | Synthetic PII | `students`, `users` | Parent phone numbers, email addresses, and residential addresses. |
| **Student Academic Records** | Medium | Institutional Educational Record | `student_academic_records`, `marks` | Internal records tracking marks, grades, attendance, and faculty remarks across terms. |
| **QR Code Tokens** | Medium | Public Capability Identifier | `students.qrToken` | High-entropy UUID string; invariant across student tenure; resolves public profile. |
| **Student Photographs** | Low-Medium | Synthetic Media (PII) | `backend/uploads/` | Uploaded headshots rendered on badges and profiles. |
| **Teacher Remarks & Feedback** | Low-Medium | Academic Observation | `feedbacks`, `marks` | Observations between faculty, students, and parents. |

---

## 6. Initial Threat Model
### Preliminary Asset–Threat–Vulnerability–Impact Analysis

Consistent with the Week 1 Security Activity required in Section 7 (Page 12) of the course guidelines:

| Asset | Threat | Vulnerability in AI-Generated Code (Version 0) | Impact | Initial Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **Student PII Records** | Unauthorized Access / Mass Scraping | Broken Object-Level Authorization (BOLA/IDOR); public QR endpoint exposes full bio (Aadhaar, phone, home address) without rate limiting. | Privacy Breach & PII harvesting | High Risk |
| **User Passwords** | Credential Theft & Brute Force | No login rate limiting or account lockout policy; AI generated weak default password policies (`Teacher@123`). | Account Takeover | High Risk |
| **Database (MongoDB)** | Query Injection | Unsanitized user inputs in filter search queries (`$regex` matching without escaping special operators). | Denial of Service / Unauthorized data disclosure | High Risk |
| **REST API** | API Abuse & Broken Access Control | Missing granular ownership checks (e.g. any authenticated parent can query another student's report if student ID is known). | Unauthorized data inspection | Critical Risk |
| **Student Photo Uploads** | Malicious File Upload | Insecure upload handling; Multer accepts arbitrary files without strict MIME validation or SVG sanitization. | Remote code execution or Cross-Site Scripting (XSS) | High Risk |
| **QR Code Identity** | Token Enumeration & Forgery | Invariant QR token enables persistent tracking of student location and status if token is predictable or easily guessed. | Long-term privacy tracking | Medium Risk |
| **Faculty Remarks & Feedback** | Information Disclosure | Plaintext logging and feedback responses accessible without verifying teacher assignment boundaries. | Confidentiality breach of behavioral notes | Medium Risk |

---

## 7. AI Development Prompt Log & Audit Trail

As required in Section 6 (Page 11) of the course guidelines, an audit trail of major AI interactions has been maintained:

### Prompt Log Entry 1: Core System Architecture & Schemas
* **Date**: September 2026
* **Objective**: Generate initial full-stack MERN architecture for student management with permanent QR identity.
* **AI Prompt**:
  > *"Create a complete MERN web application for managing student information and academic records where every student gets one unique, permanent QR code that represents the student throughout their academic life across different classes, sections, and years. Include Admin, Teacher, and Parent roles."*
* **AI Output**: Produced Express server setup, MongoDB Mongoose schemas (`Student`, `User`, `AcademicYear`, `StudentAcademicRecord`, `Attendance`, `Mark`), and React frontend scaffolding.
* **Student Modification**: Refactored the academic linkage to use a dedicated compound unique index on `{ student: 1, academicYear: 1 }` in `StudentAcademicRecord.js` to ensure clean multi-year progression without duplicating students.
* **Security Consequence**: Identified that the initial AI code returned full student records (including internal IDs and parent details) without access control.

### Prompt Log Entry 2: Attendance & Date Normalization
* **Date**: September 2026
* **Objective**: Implement batch class attendance marking.
* **AI Prompt**:
  > *"Implement bulk attendance marking API for teachers with 1-click mark all present and status toggles for students on a daily basis."*
* **AI Output**: Created `POST /api/attendance/bulk` that inserted array entries directly into MongoDB.
* **Student Modification**: Discovered a critical duplication bug where multiple submissions on the same date created duplicate attendance entries. Added a pre-save hook normalizing all attendance dates to UTC midnight (`00:00:00.000Z`) and refactored the bulk endpoint to use atomic `findOneAndUpdate` upsert operations.
* **Security Consequence**: Prevented integrity tampering and duplicate record inflation in academic records.

### Prompt Log Entry 3: Single-Page ID Badge PDF Printing
* **Date**: September 2026
* **Objective**: Generate a printable student ID card badge.
* **AI Prompt**:
  > *"Create a printable student ID card modal with QR code. When printing or saving as PDF, it must strictly fit within a single page without blank overflow pages."*
* **AI Output**: Basic modal component with `window.print()` trigger using CSS `visibility: hidden`.
* **Student Modification**: AI's `visibility: hidden` approach left invisible elements taking up vertical layout space in the browser print engine, causing 2–3 empty pages. Replaced with strict `@media print` rules: `@page { size: portrait; margin: 0; }`, `html, body { height: 100vh; overflow: hidden; }`, `.no-print { display: none !important; }`, and added a fallback HTML5 Canvas 2x retina PNG downloader.
* **Security Consequence**: Ensures physical badge output does not leak extraneous debug data or UI frames on paper prints.

---

## 8. AI-Generated Application (Version 0) Verification

### 8.1 Functional Verification Checklist

- [x] **Local Execution Verified**: Backend runs on `http://localhost:5000`; Frontend runs on `http://localhost:5173`.
- [x] **Database Connectivity**: Connected to local MongoDB instance (`mongodb://127.0.0.1:27017/student_portal_db`).
- [x] **Pre-Seeded Synthetic Data**: Seed script (`npm run seed`) populates 5 students, 3 academic years, classes, sections, subjects, attendance, marks, and feedback.
- [x] **Role-Based Authentication**:
  - Admin login: `admin@edutrack.com` / `Admin@123`
  - Teacher login: `teacher@edutrack.com` / `Teacher@123`
  - Parent login: `parent@edutrack.com` / `Parent@123`
- [x] **Permanent QR Identity**: Demo student Aarav Roy has permanent token `aarav-roy-qr-2024-edutrack`.
- [x] **Multi-Year History Accessible**: The exact same QR token displays both Class 9 (2024–25) and Class 10 (2025–26) records via the Academic Year Selector.
- [x] **Single-Page Badge Print / Download**: Tested in Chrome/Edge print preview (strictly 1 page) and verified PNG image export.

### 8.2 Execution Instructions

```bash
# 1. From root directory, start both Backend & Frontend simultaneously:
node start-dev.js

# 2. Or start in separate terminals:
# Terminal 1 (Backend API):
cd backend && npm run dev

# Terminal 2 (Frontend UI):
cd frontend && npm run dev

# 3. Access in browser:
# Web App: http://localhost:5173
# API Health Check: http://localhost:5000/api/health
# Public Scanned QR Profile: http://localhost:5173/verify/aarav-roy-qr-2024-edutrack
```

---

## 9. 5–10 Minute Demonstration Script

Per Section 7 (Page 13) of the assignment guidelines:

1. **Introduction (1 min)**:
   - Introduce project title (*EduTrack QR*), architecture (MERN stack), and the core concept of the **permanent dynamic QR code**.
2. **AI-Assisted Development Narrative (2 min)**:
   - Discuss how Generative AI accelerated building the complete prototype (Version 0).
   - Highlight the theme: *"Working code $\ne$ Secure code"* and how initial AI code required architectural and data integrity fixes.
3. **Core Workflow Demo (4 min)**:
   - **Admin Portal**: Show student directory, enroll a synthetic student, and open the ID Card Badge modal (demonstrate single-page PDF print preview and PNG download).
   - **Dynamic QR Verification**: Show the public scanned profile (`/verify/:qrToken`) and demonstrate toggling between **2024–25** and **2025–26** records using the exact same QR token.
   - **Teacher Portal**: Demonstrate 1-click batch attendance and instant exam mark entry with automatic percentage and grade computation.
   - **Parent Portal**: Show real-time attendance percentage meter, report card, and the parent-teacher feedback loop.
4. **Threat Awareness & Week 1 Conclusion (2 min)**:
   - Present the **Asset–Threat–Vulnerability–Impact Table**.
   - Conclude with Week 1 key takeaway: *"AI is a development accelerator, not a security authority. Version 0 provides functional completeness with synthetic data, preparing us for detailed security evaluation, threat modeling, and ethical vulnerability demonstration in subsequent weeks."*

---
*End of Week 1 Deliverables Document — CS-601 Data Security & Privacy*
