# CS-601 Data Security & Privacy — Mini-Project
## Week 3 Deliverables: Threat Modelling and Privacy Analysis

**Course**: CS-601 Data Security & Privacy (Academic Batch 2026–28, Term July–Dec 2026)  
**Subject OIC**: Manisha J. Nene (`mjnene@diat.ac.in`)  
**Assignment**: *Build It with AI, Break It Ethically, Secure It: Security and Privacy Evaluation of AI-Generated Applications*  
**Application Domain**: Student Information & Academic Records Portal with Dynamic QR Identity (**EduTrack QR**)  
**Milestone**: **Week 3 Submission & Report (Threat Modelling & Privacy Analysis — Version 1)**  
**Theme**: *“What are we protecting, from whom, and why?”*  

---

## Executive Summary

During **Week 1**, Generative AI accelerated the creation of **EduTrack QR (Version 0)**—a full-stack MERN portal featuring dynamic QR code generation, multi-year student progression, and role-based access for Administrators, Teachers, and Parents. In **Week 2**, adhering to the core principle *"Working code ≠ secure code"*, our team conducted an exhaustive manual code review that uncovered **18 distinct security and privacy vulnerabilities** across authentication, authorization, input handling, and database operations.

In **Week 3**, our focus shifts from granular line-by-line code vulnerabilities to **systematic architectural threat modelling and privacy risk assessment**. Rather than viewing vulnerabilities as isolated bugs, threat modelling enables us to ask foundational engineering questions:
* *What sensitive data assets does EduTrack QR custody?*
* *Where are the application's architectural trust boundaries?*
* *Who are the plausible threat actors, and what are their attack vectors?*
* *What privacy violations occur during standard, non-malicious system operations?*

This document delivers the complete Week 3 compliance package as mandated by Section 9 and Section 15 of the CS-601 specification:
1. **System Characterization & Trust Boundaries**
2. **Multi-Level Data Flow Diagrams (DFD Level 0 Context & DFD Level 1 Detailed Decomposition)**
3. **Comprehensive STRIDE Threat Model**
4. **Formal Privacy Impact Assessment (PIA) addressing all 8 prescribed syllabus evaluations**
5. **Data Classification & Asset Inventory Matrix**
6. **Prioritized Threat Register (18 STRIDE-mapped threats linking Week 2 audit observations to planned Week 6 remediations)**

---

## 1. System Characterization & Architectural Scope

EduTrack QR manages confidential educational and biometric records across an academic community. The system encompasses six core subsystem modules:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EDUTRACK QR ARCHITECTURE                               │
│                                                                                        │
│   [ Client Layer ]              [ API Gateway / Express ]         [ Data Tier ]         │
│  ┌────────────────┐            ┌─────────────────────────┐       ┌──────────────────┐  │
│  │ React 18 SPA   │──HTTP(S)──▶│ REST API Middleware     │──────▶│ MongoDB Database │  │
│  │ (Vite Client)  │            │ (JWT Auth, RBAC, Multer)│       │ (Mongoose Models)│  │
│  └────────────────┘            └─────────────────────────┘       └──────────────────┘  │
│         ▲                                   │                             │            │
│         │                                   ▼                             │            │
│  ┌────────────────┐            ┌─────────────────────────┐                │            │
│  │ Public QR View │◀──HTTP(S)──│ Static File Server      │◀───────────────┘            │
│  │ (Mobile/Scan)  │            │ (/uploads/ photos)      │                             │
│  └────────────────┘            └─────────────────────────┘                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Key Actors & Privilege Roles

| Actor / Role | Authentication Requirement | Authorized Operational Scope | Potential Threat Motivation |
| :--- | :--- | :--- | :--- |
| **Anonymous Public Scanner** | Unauthenticated | Verify physical student QR badge; retrieve basic identity card. | Stalking, unauthorized contact collection, PII scraping. |
| **Parent** | Authenticated (JWT) | Access linked children’s profiles, attendance history, term grades; lodge teacher inquiries. | Competitor grade snooping, unauthorized student record access, fee/grade dispute tampering. |
| **Teacher / Faculty** | Authenticated (JWT) | Mark attendance, schedule tests, enter exam scorecards, reply to parent feedback. | Grade inflation/tampering, unauthorized modification of student personal details. |
| **Administrator** | Authenticated (JWT) | Full CRUD over students, faculty, parents, academic years, classes, exams, and settings. | Complete database compromise, institutional credential abuse. |
| **External Network Attacker** | Unauthenticated | Network-adjacent or remote internet adversary probing HTTP endpoints. | Mass credential theft, student data exfiltration, system denial-of-service. |

---

## 2. Trust Boundaries & Attack Surfaces

A critical failure of AI-assisted code generation is the implicit assumption of client trust. Threat modelling forces the explicit definition of **Trust Boundaries (TB)**:

```
[ UNTRUSTED ZONE: Public Internet & External Clients ]
   │
   │  TB-1: Perimeter Boundary (Public Internet ➔ Web Server / Reverse Proxy)
   ▼
[ SEMI-TRUSTED ZONE: Client Web Browser & Session Storage ]
   │
   │  TB-2: Authentication & Transport Boundary (Client Browser ➔ Express REST API)
   ▼
[ APPLICATION EXECUTION ZONE: Node.js Express Runtime ]
   │
   │  TB-3: Internal Authorization Boundary (Route Handlers ➔ Service Logic)
   │  TB-4: Data Tier Boundary (Mongoose ODM ➔ MongoDB Storage Engine)
   │  TB-5: File System Boundary (Multer Uploads ➔ Local Disk Storage)
   ▼
[ SECURE DATA PERSISTENCE ZONE: MongoDB Collections & Server File System ]
```

### 2.1 Description of Trust Boundaries

1. **Trust Boundary 1 (TB-1: Perimeter / Network Boundary):**
   * *Separation:* External untrusted networks (public web, mobile cellular networks scanning QR codes) and the application host server.
   * *Threat Vector:* Unauthenticated traffic probing `/api/qr/verify/:token`, `/api/health`, and `/api/auth/login`. Missing rate limiting allows brute force attacks.
2. **Trust Boundary 2 (TB-2: Client-to-API Transport Boundary):**
   * *Separation:* User agents (browser localStorage, Axios HTTP requests) and server-side Express request parsers.
   * *Threat Vector:* JWT interception, manipulated HTTP headers, crafted JSON bodies, cross-origin request forgery.
3. **Trust Boundary 3 (TB-3: Role Authorization Boundary):**
   * *Separation:* Authenticated user identities (`req.user`) and function execution rights.
   * *Threat Vector:* Horizontal privilege escalation (BOLA/IDOR where Parent A requests Child B), vertical privilege escalation (Parent accessing Teacher grading sheets).
4. **Trust Boundary 4 (TB-4: Database Query Boundary):**
   * *Separation:* Application runtime logic and raw MongoDB database documents.
   * *Threat Vector:* Unsanitized query operators, injection of unescaped regular expressions (`new RegExp(...)`), unindexed query denial-of-service.
5. **Trust Boundary 5 (TB-5: Local File Storage Boundary):**
   * *Separation:* File upload parser (`multer`) and the server host file system (`/backend/uploads/`).
   * *Threat Vector:* Malicious file uploads (bypassing MIME type checks), directory traversal, stored script execution.

---

## 3. Data Flow Diagrams (DFDs)

### 3.1 DFD Level 0: Context Diagram

The Context Diagram illustrates the macro boundary of the EduTrack QR system, its external entities, and high-level data flows:

```
                      ┌──────────────────────────┐
                      │ External QR Badge Scanner│
                      │   (Public Mobile/Web)    │
                      └──────────────────────────┘
                                   │
                           QR Scanned Token
                                   │
                                   ▼ [Public Verification Request]
┌──────────────┐      Credentials / Inquiries      ┌─────────────────────────────────┐
│ Parent User  │──────────────────────────────────▶│                                 │
│              │◀──────────────────────────────────│                                 │
└──────────────┘        Child Records / Grades     │                                 │
                                                   │                                 │
┌──────────────┐       Scores / Attendance Marks   │        EDUTRACK QR SYSTEM       │
│ Teacher User │──────────────────────────────────▶│            (PORTAL)             │
│              │◀──────────────────────────────────│                                 │
└──────────────┘       Student Rosters / Feedback  │                                 │
                                                   │                                 │
┌──────────────┐     Enrollment / Class Config     │                                 │
│ Admin User   │──────────────────────────────────▶│                                 │
│              │◀──────────────────────────────────│                                 │
└──────────────┘      Audit Stats / Master Lists   └─────────────────────────────────┘
                                                           │                  │
                                              Read/Write   │                  │  Write Uploads
                                              Queries      ▼                  ▼
                                                  ┌──────────────┐     ┌──────────────┐
                                                  │   MongoDB    │     │  Local Disk  │
                                                  │ Database     │     │ Storage      │
                                                  │ (student_db) │     │ (/uploads)   │
                                                  └──────────────┘     └──────────────┘
```

---

### 3.2 DFD Level 1: Process Decomposition Diagram

The Level 1 diagram breaks the system into processes, internal data stores, data flows, and trust boundaries:

```
[ UNTRUSTED ACTORS ]             [ EXPRESS APPLICATION PROCESSES ]             [ DATA STORES ]

  User (Any Role)
       │
       │ (1) Email/Password
       ▼
 ┌───────────┐    Validate Hash      ┌──────────────────┐
 │ Process 1 │──────────────────────▶│ Data Store DS-1  │
 │  Auth &   │◀──────────────────────│ Users Collection │
 │  Session  │     Return JWT        └──────────────────┘
 └───────────┘
       │
       │ Bearer Token
       ▼
══════════════════════════════════════════════════════════════════════════════════════════════ [TB-2: Auth Boundary]
       │
       ├─────────────────────────────────┬────────────────────────────────┐
       │ (2) Query Student / History     │ (3) Bulk Register Entry        │ (4) Exam Grading
       ▼                                 ▼                                ▼
 ┌───────────┐                     ┌───────────┐                    ┌───────────┐
 │ Process 2 │                     │ Process 3 │                    │ Process 4 │
 │  Student  │                     │Attendance │                    │Marks Sheet│
 │Management │                     │Management │                    │Management │
 └───────────┘                     └───────────┘                    └───────────┘
       │                                 │                                │
       ▼ Read / Update                   ▼ Upsert / Calculate             ▼ Write Grade
 ┌───────────────────┐             ┌───────────────────┐            ┌───────────────────┐
 │ Data Store DS-2   │             │ Data Store DS-3   │            │ Data Store DS-4   │
 │ Students &        │             │ Attendance Logs   │            │ Examinations &    │
 │ Academic History  │             │ (Daily Records)   │            │ Student Marks     │
 └───────────────────┘             └───────────────────┘            └───────────────────┘
       │                                                                  │
═══════╪══════════════════════════════════════════════════════════════════╪═══════════════════ [TB-1: Public Boundary]
       │                                                                  │
       │ (5) Scan Student Badge: `GET /api/qr/verify/:qrToken`            │
       ▼                                                                  ▼
 ┌───────────┐                                                      ┌───────────┐
 │ Process 5 │───────────────────── Read Comprehensive Record ─────▶│ Process 6 │
 │ Public QR │                                                      │ Feedback  │
 │ Resolution│◀──────────────────── Exposes Aadhaar, Address, Phone ─│ System    │
 └───────────┘                                                      └───────────┘
```

---

## 4. STRIDE Threat Model Analysis

The **STRIDE** methodology (developed by Microsoft) classifies security threats into six distinct categories. Below is the in-depth STRIDE analysis of EduTrack QR, mapping each threat to system components, assets, and the manual review findings identified in Week 2.

```
       S             T              R               I                  D               E
   ┌───────┐    ┌──────────┐   ┌─────────┐   ┌─────────────┐    ┌─────────────┐   ┌───────────┐
   │Spoofing│    │Tampering │   │Repudia- │   │ Information │    │  Denial of  │   │ Elevation │
   │Identity│    │   Data   │   │  tion   │   │ Disclosure  │    │   Service   │   │ Privilege │
   └───────┘    └──────────┘   └─────────┘   └─────────────┘    └─────────────┘   └───────────┘
```

---

### 4.1 Spoofing (S)

*Threat Definition*: An adversary assumes the identity of a legitimate user or component to gain unauthorized access.

| Threat ID | Threat Description | Attack Vector / Scenario | Target Asset | Linked Finding | Risk Level |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **STRIDE-S1** | **Admin JWT Forgery via Static Secret** | Because `process.env.JWT_SECRET` defaults to the hardcoded string `'student_portal_jwt_secret_key_2026'`, an attacker with access to the public repository can forge valid administrative JWTs with arbitrary payload claims. | Authentication Tokens, All System Data | **OBS-16** | **Critical** |
| **STRIDE-S2** | **Credential Stuffing / Brute Force on Faculty Accounts** | Absence of login rate limiting (`express-rate-limit`) permits high-frequency automated dictionary attacks against faculty emails (`teacher@edutrack.com`). | Teacher Credentials, System Access | **OBS-01** | **High** |
| **STRIDE-S3** | **Parent Feedback Impersonation** | In `POST /api/feedback`, the server accepts any `studentId` without checking if the child is linked to the authenticated parent user, enabling one parent to lodge false grievances under another child’s name. | Student Inquiries, Institutional Records | **OBS-09** | **Medium** |
| **STRIDE-S4** | **Initial Default Password Takeover** | Newly provisioned accounts are assigned known default passwords (`Teacher@123`, `Parent@123`) without forced password rotation on first login, allowing account hijacking before the legitimate user claims it. | User Accounts, Portal Sessions | **OBS-04** | **High** |

---

### 4.2 Tampering (T)

*Threat Definition*: Malicious modification of data in transit or data at rest, compromising system integrity.

| Threat ID | Threat Description | Attack Vector / Scenario | Target Asset | Linked Finding | Risk Level |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **STRIDE-T1** | **Mass Assignment in Student Creation** | The `POST /api/students` endpoint instantiates `new Student(req.body)` directly from unvalidated JSON, allowing attackers to overwrite sensitive internal schema fields (e.g., status flags, timestamps). | Student Database Records | **OBS-12** | **Medium** |
| **STRIDE-T2** | **Arbitrary Account Password Modification** | The profile update handler (`PUT /api/auth/profile`) overwrites account passwords without requiring verification of the existing current password, enabling rapid tampering on shared or unattended devices. | User Password Hashes | **OBS-06** | **High** |
| **STRIDE-T3** | **Student Record Alteration via Inadequate Teacher Scoping** | A teacher authorized to update student info (`PUT /api/students/:id`) can modify details of students who are not enrolled in their assigned class or section. | Student Demographics | **OBS-07** | **Medium** |
| **STRIDE-T4** | **Malicious File Upload Payload Injection** | The file upload filter validates only client-supplied MIME headers and extensions (`/jpeg|jpg|png|webp|gif/`) without magic byte validation, allowing HTML/SVG files with embedded scripts to be stored on the server. | Host File System, Web Application | **OBS-13** | **High** |

---

### 4.3 Repudiation (R)

*Threat Definition*: The ability of a user to perform an action without the system maintaining irrefutable audit logging, allowing plausible deniability.

| Threat ID | Threat Description | Attack Vector / Scenario | Target Asset | Linked Finding | Risk Level |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **STRIDE-R1** | **Non-Repudiation Failure in Grade Modifications** | When marks are modified in `POST /api/marks/bulk`, only the latest `enteredBy` field is recorded. There is no historical changelog or audit log capturing prior marks, timestamp of change, or reason for modification. | Gradebook Integrity, Academic Records | **OBS-17** | **Medium** |
| **STRIDE-R2** | **Unlogged Student Academic Record Deletions** | When an administrator deletes a student (`DELETE /api/students/:id`), cascade deletions wipe all attendance and mark records permanently without recording an administrative audit event in an immutable log. | Institutional Audit Trail | **OBS-17** | **Medium** |
| **STRIDE-R3** | **Absence of Authentication Audit Trails** | Failed login attempts, password changes, and token generation events are not recorded in a dedicated security log, preventing forensic investigation after a suspected compromise. | System Security Logs | **OBS-01** | **Low** |

---

### 4.4 Information Disclosure (I)

*Threat Definition*: Exposure of private, sensitive, or personal data to unauthorized entities.

| Threat ID | Threat Description | Attack Vector / Scenario | Target Asset | Linked Finding | Risk Level |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **STRIDE-I1** | **Unauthenticated Public Exposure of Student PII via QR** | Anyone scanning a student’s physical badge accesses `/api/qr/verify/:qrToken`, which dumps the student’s government Aadhaar number, full home address, emergency contacts, parent phone numbers, and full exam report card. | Student PII, Child Safety Data | **OBS-14** | **Critical** |
| **STRIDE-I2** | **Horizontal Cross-Parent Data Leakage (BOLA/IDOR)** | Authenticated parents can supply any valid student MongoDB `_id` to `GET /api/students/:id` and receive confidential personal details, medical blood groups, and addresses of children other than their own. | Student Demographics, Family PII | **OBS-07** | **Critical** |
| **STRIDE-I3** | **Class-Wide Scorecard Exposure to Parents** | The endpoint `GET /api/marks/exam/:examId` lacks `authorize('admin', 'teacher')` guards. Any authenticated parent can query the endpoint to inspect scores, grades, and roll numbers of all peers in their child's class. | Student Exam Performance Records | **OBS-08** | **High** |
| **STRIDE-I4** | **Server Stack Trace & Path Leakage in Error Responses** | When unhandled exceptions occur, the global error middleware dumps full runtime stack traces and internal operating system paths directly to HTTP clients whenever `NODE_ENV` is not set to `production`. | Internal Server Architecture | **OBS-17** | **Medium** |
| **STRIDE-I5** | **Sensitive PII Stored Plaintext at Rest** | Sensitive identifiers (Aadhaar number, phone numbers, home addresses) are stored in plaintext in the MongoDB database without application-level encryption. | Stored Database Documents | **OBS-15** | **High** |

---

### 4.5 Denial of Service (D)

*Threat Definition*: Actions that degrade or completely disrupt system availability for legitimate users.

| Threat ID | Threat Description | Attack Vector / Scenario | Target Asset | Linked Finding | Risk Level |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **STRIDE-D1** | **Regular Expression Denial of Service (ReDoS)** | In `GET /api/students`, the search parameter is directly compiled via `new RegExp(search.trim(), 'i')`. Submitting catastrophic backtracking strings blocks the single-threaded Node.js event loop at 100% CPU. | Server CPU, API Availability | **OBS-11** | **High** |
| **STRIDE-D2** | **Unbounded Bulk Attendance Payload Flooding** | The `POST /api/attendance/bulk` and `POST /api/marks/bulk` endpoints do not enforce maximum payload array limits, allowing attackers to submit millions of entries and trigger memory exhaustion or database timeouts. | Memory, MongoDB Connection Pool | **OBS-17** | **Medium** |
| **STRIDE-D3** | **Unrestricted Query Pagination Limits** | While default pagination limits exist, queries with large limits (`?limit=10000`) without hard maximum caps can exhaust database memory buffers and network bandwidth. | Database Buffer, Bandwidth | **OBS-17** | **Low** |

---

### 4.6 Elevation of Privilege (E)

*Threat Definition*: An unauthorized user gains higher access permissions or capabilities than permitted.

| Threat ID | Threat Description | Attack Vector / Scenario | Target Asset | Linked Finding | Risk Level |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **STRIDE-E1** | **Insecure Session Persistence After Suspension** | `authMiddleware.js` verifies JWT signature and user existence, but never checks whether `req.user.status === 'Active'`. Suspended teachers or revoked accounts retain full API capabilities until token expiry. | Authorization Subsystem | **OBS-10** | **High** |
| **STRIDE-E2** | **Wildcard CORS Configuration** | `app.use(cors())` sets `Access-Control-Allow-Origin: *`, allowing malicious third-party origins to execute cross-origin requests using captured credentials in ambient browser contexts. | Cross-Origin Security Context | **OBS-18** | **Medium** |
| **STRIDE-E3** | **Client-Side Only Logout with Extended 30-Day Token Validity** | When users log out, the token is simply removed from browser storage without server-side revocation. A stolen token remains valid for 30 days, enabling sustained unauthorized access. | User Sessions | **OBS-02, OBS-03** | **Medium** |

---

## 5. Privacy Impact Assessment (PIA)

In compliance with Section 9 (Pages 15–16) and Section 3 (LO4) of the course syllabus, the following section provides a structured Privacy Impact Assessment of EduTrack QR, directly evaluating the **8 core privacy assessment questions**.

```
                           SENSITIVE PERSONAL DATA
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
     [ Collection ]             [ Storage ]               [ Exposure ]
   • Aadhaar Number           • Plaintext Mongo         • Public QR Scan
   • Blood Group              • Unprotected Disk        • Cross-Parent BOLA
   • Emergency Contacts       • No Field Encryption     • Stack Trace Dumps
   • Academic Scorecards      • 30-Day Tokens           • Unrestricted CORS
```

---

### 5.1 The 8 Core Privacy Assessment Questions

#### Question 1: Does personal data reach the AI service?
* **Evaluation**: In the current Version 0 implementation, the runtime application executes locally and **does not transmit student data to external third-party AI APIs** (e.g. OpenAI or Anthropic).
* **AI Development Artifact Risk**: However, during the Week 1 AI-assisted generation phase, development prompts contained structural schemas and synthetic student profile templates. Developers must ensure real student records are never pasted into public generative AI coding chats.

#### Question 2: Is sensitive information included in prompts?
* **Evaluation**: Strict synthetic data practices were maintained during Week 1 development prompts (e.g. `Aarav Roy`, `STU-2024-001`, `99887 76650`). Real student, institutional, or faculty information was never included in AI interactions.

#### Question 3: Is unnecessary data transmitted?
* **Evaluation**: **YES (Severe Privacy Violation)**.
  1. The public QR verification endpoint transmits exhaustive PII (Aadhaar number, residential address, emergency contacts) when only basic identity verification (Name, Class, Photo) is required.
  2. The examination marks endpoint transmits peer scorecard data to parent clients who only require their own child's performance metrics.

#### Question 4: Is the information retained unnecessarily?
* **Evaluation**: **YES**.
  1. No data retention or purging schedule exists in the application. When a student graduates or withdraws, their PII remains indefinitely in the active database.
  2. While multi-year academic progression is a valid functional requirement, historical sensitive contact data (which changes over time) is never archived or redacted.

#### Question 5: Are secrets accidentally included?
* **Evaluation**: **YES**.
  1. A static fallback JWT signing secret (`'student_portal_jwt_secret_key_2026'`) is hardcoded directly into `backend/routes/authRoutes.js` and `backend/middleware/authMiddleware.js`.
  2. The local database connection URI (`mongodb://127.0.0.1:27017/student_portal_db`) is hardcoded into `backend/config/db.js`.

#### Question 6: Are logs capturing personal information?
* **Evaluation**: **PARTIALLY**.
  1. The global error handler in `backend/server.js` logs unhandled exception objects to `console.error`. If database validation errors occur on student insertion, raw student PII (Aadhaar, address, names) is printed directly to terminal logs.
  2. HTTP access logging does not currently scrub query parameters, meaning search terms containing student names or IDs are captured in server stdout.

#### Question 7: Is data encrypted in transit?
* **Evaluation**: **NO (Development Default)**.
  1. The current local development setup operates over unencrypted HTTP (`http://localhost:5000` and `http://localhost:5173`).
  2. In production, transport security will depend on an external reverse proxy (Nginx/Caddy) with TLS/HTTPS. The application does not enforce HTTP Strict Transport Security (HSTS) or secure cookie flags.

#### Question 8: Is data encrypted at rest?
* **Evaluation**: **NO**.
  1. All student demographic data, parent contact numbers, and government Aadhaar numbers are persisted in MongoDB as unencrypted, plaintext JSON BSON documents.
  2. Student photographs uploaded to `/uploads/` are stored as unencrypted, publicly accessible static files on disk.

---

### 5.2 Regulatory & Privacy Framework Compliance

| Regulatory Principle | Relevant Standard | EduTrack QR Status | Gap Description |
| :--- | :--- | :---: | :--- |
| **Data Minimization** | DPDP Act 2023 / GDPR Art. 5(1)(c) | ❌ Non-Compliant | QR verification endpoint returns 100% of student attributes rather than the minimum necessary identity attributes. |
| **Purpose Limitation** | DPDP Act 2023 / GDPR Art. 5(1)(b) | ⚠️ Partial | Emergency contact information collected for medical emergencies is accessible during routine badge scans. |
| **Storage Limitation** | DPDP Act 2023 / GDPR Art. 5(1)(e) | ❌ Non-Compliant | No automated retention, archival, or data-purging schedules are implemented for graduated students. |
| **Integrity & Confidentiality** | NIST SP 800-218 / OWASP API | ❌ Non-Compliant | Sensitive PII is stored unencrypted; authorization checks (BOLA) are omitted on primary student records. |

---

## 6. Data Classification & Asset Inventory

To establish defensive access control policies, all data assets within EduTrack QR are classified into four distinct security tiers:

* **Tier 1: Public** — Low impact; information intended for unauthenticated public display.
* **Tier 2: Internal** — Moderate impact; restricted to authenticated members of the school community.
* **Tier 3: Confidential** — High impact; restricted strictly to authorized faculty, administration, and relevant parents.
* **Tier 4: Restricted / Sensitive PII** — Critical impact; high-risk personal data requiring strict access controls and encryption.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      DATA CLASSIFICATION MATRIX                        │
│                                                                        │
│   [ TIER 4: RESTRICTED PII ]                                           │
│   • Aadhaar Number  • Password Hashes  • Home Address  • JWT Secrets   │
│   ──────────────────────────────────────────────────────────────────   │
│   [ TIER 3: CONFIDENTIAL ]                                             │
│   • Student Marks  • Exam Scores  • Teacher Feedback  • Blood Group    │
│   ──────────────────────────────────────────────────────────────────   │
│   [ TIER 2: INTERNAL ]                                                 │
│   • Attendance Logs  • Faculty Designation  • Section Rosters         │
│   ──────────────────────────────────────────────────────────────────   │
│   [ TIER 1: PUBLIC ]                                                   │
│   • School Name  • Academic Year Labels  • Student Name & Badge Code   │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Data Asset Classification Table

| Data Asset | Fields / Model Entities | Classification Tier | Storage Location | Transmission Protocol | Access Authorization Policy |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Government Identity** | `aadhaarNumber` (`Student`) | **Restricted / PII** | MongoDB (Plaintext) | HTTP (JSON) | Admin Only; Redacted from QR & Parent views |
| **Account Credentials** | `password` (`User`) | **Restricted / PII** | MongoDB (Bcrypt hash) | HTTP (POST only) | System Internal Only; Never returned in API |
| **Cryptographic Secrets** | `JWT_SECRET`, session keys | **Restricted / PII** | `.env` / Code fallback | Internal runtime | Application Server Internal Only |
| **Residential Demographics** | `address.street`, `city`, `pincode` (`Student`, `User`) | **Restricted / PII** | MongoDB (Plaintext) | HTTP (JSON) | Admin & Child's Own Parent Only |
| **Emergency Contacts** | `emergencyContact.phone`, `parentInfo.phone` | **Restricted / PII** | MongoDB (Plaintext) | HTTP (JSON) | Admin, Authorized Class Teacher, Own Parent |
| **Biometric / Health Data** | `bloodGroup`, `photo` | **Confidential** | MongoDB / `/uploads` disk | HTTP (Static image) | Faculty, Verified Medical/Emergency Scanner |
| **Academic Performance** | `marksObtained`, `percentage`, `grade` (`Mark`) | **Confidential** | MongoDB (Plaintext) | HTTP (JSON) | Admin, Assigned Subject Teacher, Own Parent |
| **Faculty Inquiries** | `message`, `reply`, `rating` (`Feedback`) | **Confidential** | MongoDB (Plaintext) | HTTP (JSON) | Submitting Parent, Assigned Teacher, Admin |
| **Daily Attendance** | `date`, `status`, `remarks` (`Attendance`) | **Internal** | MongoDB (Plaintext) | HTTP (JSON) | Class Teacher, Admin, Own Parent |
| **Institutional Structure** | `Class`, `Section`, `Subject`, `AcademicYear` | **Internal** | MongoDB (Plaintext) | HTTP (JSON) | All Authenticated Users (Admin, Teacher, Parent) |
| **Public Identity Badge** | `fullName`, `studentId`, `qrToken`, `className` | **Public** | MongoDB (Plaintext) | HTTP (Public QR API)| Unrestricted Public (QR Verification View) |

---

## 7. Comprehensive Threat Register

The Threat Register compiles all identified security and privacy threats, calculating a **Risk Priority Number (RPN)** based on standard OWASP Risk Rating Methodology:

$$\text{Risk Score} = \text{Likelihood} \times \text{Impact} \quad (\text{Scale } 1\text{--}5)$$

* **Critical Risk (Score 20–25)**: Urgent remediation required before deployment.
* **High Risk (Score 12–19)**: Significant vulnerability requiring planned controls.
* **Medium Risk (Score 6–11)**: Moderate vulnerability addressing defense-in-depth.
* **Low Risk (Score 1–5)**: Informational / hardening recommendation.

| Threat ID | Threat Name | STRIDE Cat. | Affected Asset | Threat Actor | Week 2 Ref | Likelihood (1-5) | Impact (1-5) | Risk Score | Planned Week 6 Remediation Strategy |
| :---: | :--- | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **THR-01** | Public QR PII Data Exfiltration | **I** | Student Aadhaar, Address, Phone | Public Scanner, Stalker | OBS-14 | 5 | 5 | **25 (Critical)** | Data minimization projection on `/verify/:qrToken`; sanitize PII from public responses. |
| **THR-02** | Cross-Parent Student Record Access (BOLA) | **I / T** | Student Records, Medical Data | Authenticated Parent | OBS-07 | 4 | 5 | **20 (Critical)** | Implement ownership validation middleware checking `parentUser.students.includes(id)`. |
| **THR-03** | Admin JWT Forgery via Static Secret | **S / E** | All System Records & Auth | Remote Adversary | OBS-16 | 4 | 5 | **20 (Critical)** | Enforce strict environment variable validation; fail closed if `JWT_SECRET` is absent. |
| **THR-04** | Class-Wide Grade Sheet Snooping | **I** | Peer Exam Marks & Rankings | Authenticated Parent | OBS-08 | 5 | 4 | **20 (Critical)** | Enforce `authorize('admin', 'teacher')` on `GET /api/marks/exam/:examId`. |
| **THR-05** | Credential Stuffing & Password Brute Force | **S** | Faculty & Admin Accounts | Remote Internet Bot | OBS-01 | 5 | 4 | **20 (Critical)** | Integrate `express-rate-limit` (e.g. 5 attempts / 15 mins) on `/api/auth/login`. |
| **THR-06** | Student Search Denial of Service (ReDoS) | **D** | Server Event Loop & Availability | Malicious Web Client | OBS-11 | 4 | 4 | **16 (High)** | Escape regex special characters using regex-escape utility before compiling queries. |
| **THR-07** | Arbitrary Password Modification | **T / E** | User Account Passwords | Opportunistic Attacker | OBS-06 | 4 | 4 | **16 (High)** | Require verification of `currentPassword` using `bcrypt.compare` before password updates. |
| **THR-08** | Insecure File Upload / Script Execution | **T / E** | Server File System & Execution | Authenticated Admin/Teacher| OBS-13 | 3 | 5 | **15 (High)** | Add magic byte inspection (`file-type`), rename uploaded files, restrict upload folder execution. |
| **THR-09** | Default Password Mass Exploitation | **S** | Newly Created Accounts | External Attacker | OBS-04 | 4 | 4 | **16 (High)** | Implement `requirePasswordChange: true` flag and enforce mandatory rotation on initial login. |
| **THR-10** | Suspended Account Active Token Abuse | **E** | Application API Endpoints | Terminated Staff / Parent | OBS-10 | 3 | 4 | **12 (High)** | Add active status check (`user.status === 'Active'`) inside `protect` middleware. |
| **THR-11** | Feedback Grievance Impersonation | **S / T** | Teacher-Parent Communications | Authenticated Parent | OBS-09 | 4 | 3 | **12 (High)** | Validate student relationship: ensure `req.body.studentId` is registered to `req.user._id`. |
| **THR-12** | Excessive JWT Lifetime (30 Days) | **E** | Stolen Session Tokens | Network Intermediary | OBS-02 | 3 | 4 | **12 (High)** | Reduce access token lifetime to 15 minutes; introduce refresh token architecture. |
| **THR-13** | Client-Only Logout Session Retention | **E** | Discarded Client Sessions | Device Shared User | OBS-03 | 4 | 3 | **12 (High)** | Implement server-side token blocklist in database or Redis for active invalidation. |
| **THR-14** | Mass Assignment Attribute Tampering | **T** | Internal Student Model Schema | Malicious Client | OBS-12 | 3 | 3 | **9 (Medium)** | Replace raw `req.body` ingestion with explicit field destructuring or Zod/Joi schema validation. |
| **THR-15** | Stack Trace Reconnaissance Leakage | **I** | Host Server File Paths & Version | Remote Attacker | OBS-17 | 4 | 2 | **8 (Medium)** | Ensure stack traces are suppressed unconditionally in production error handler. |
| **THR-16** | Permissive Wildcard Cross-Origin Policy | **E** | Ambient Browser Credentials | Malicious External Website| OBS-18 | 3 | 3 | **9 (Medium)** | Restrict CORS to explicit allowed frontend origins; integrate `helmet` security headers. |
| **THR-17** | Unbounded Bulk Array Processing | **D** | Server Memory & Database Pool | Malicious Faculty/Parent | OBS-17 | 3 | 3 | **9 (Medium)** | Add schema bounds validation limiting bulk arrays to maximum 100 entries per request. |
| **THR-18** | Lack of Exam Grade Audit Changelog | **R** | Academic Grade Integrity | Rogue Faculty Member | OBS-17 | 2 | 3 | **6 (Medium)** | Create `GradeAuditTrail` collection recording previous mark, new mark, editor ID, and timestamp. |

---

## 8. Alignment with Standards & Secure Lifecycle

This Threat Modelling & Privacy Analysis directly satisfies foundational guidelines established by:

1. **NIST SP 800-218 (Secure Software Development Framework - SSDF)**:
   * *Practice PW.1.1*: Formally identify and prioritize software security requirements based on STRIDE threat modelling.
   * *Practice PW.1.2*: Assess the application's risk and privacy profile before implementing architectural controls.
2. **NIST SP 800-218A (Generative AI Guidance)**:
   * Addresses risks inherent to AI-generated code: unvalidated assumptions regarding trust boundaries, insecure fallback secrets, and lack of horizontal authorization checks.
3. **OWASP API Security Top 10 (2023)**:
   * Systematically identifies broken object-level authorization (API1), broken authentication (API2), broken object property level authorization (API3), and broken function-level authorization (API5).

---

## 9. Conclusion & Week 4 Roadmap

The Week 3 threat modelling and privacy analysis confirms that while **EduTrack QR** functions smoothly as an academic portal, its unhardened AI-generated architecture harbors critical data exposure and access control risks. 

In accordance with the 8-week course methodology, the application code remains intentionally preserved in its **Version 0 state** to facilitate the upcoming milestones:
* **Week 4 (Automated Security Assessment)**: Subjecting the unpatched codebase to static analysis (Semgrep / CodeQL), dependency vulnerability audits (`npm audit`), and dynamic web vulnerability scanning (OWASP ZAP).
* **Week 5 (Controlled Vulnerability Demonstration)**: Executing live, ethical proof-of-concept demonstrations of selected high-risk threats (BOLA on student records, PII leakage on public QR) in an isolated laboratory setting.
* **Week 6 (Manual Remediation)**: Implementing the architectural mitigations outlined in Section 7 of this report to produce **Secure Version 1**.
