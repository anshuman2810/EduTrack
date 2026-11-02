# CS-601 Data Security & Privacy — Mini-Project
## 7-Week Comprehensive Cybersecurity Portfolio: Master Presentation Brief & Slide Deck Blueprint

**Course**: CS-601 Data Security & Privacy (Academic Batch 2026–2028, Term July–Dec 2026)  
**Institution**: Defence Institute of Advanced Technology (DIAT), Pune — Department of Computer Science & Engineering  
**Subject OIC**: Prof. Manisha J. Nene (`mjnene@diat.ac.in`)  
**Assignment**: *Build It with AI, Break It Ethically, Secure It: Security and Privacy Evaluation of AI-Generated Applications*  
**Application Domain**: Institutional Student Information & Dynamic QR Identity Badge Portal (**EduTrack QR**)  
**Purpose**: AI-Ready Presentation Content Document for Generating 15–20 Minute Slides & Live Demonstration (Weeks 1 to 7 Complete Lifecycle)  
**Deliverable Word Doc**: [`docs/CS601_Comprehensive_7_Weeks_Presentation_Brief_and_Slide_Deck.docx`](file:///d:/Cybersec/DSP-Mini%20Project/docs/CS601_Comprehensive_7_Weeks_Presentation_Brief_and_Slide_Deck.docx)  
**Remote GitHub Repo**: [https://github.com/anshuman2810/EduTrack.git](https://github.com/anshuman2810/EduTrack.git)  

---

> ### 💡 How to Use This Presentation Blueprint
> This document is structured as an **18-slide presentation blueprint**. You can copy-paste sections or feed the `.docx` / `.md` file directly into generative AI presentation tools (such as **Gamma App**, **Microsoft 365 Copilot**, **ChatGPT Plus**, or **SlidesAI**) to automatically produce a polished PowerPoint deck.  
> Each slide includes:
> 1. **Visual & Layout Suggestion**
> 2. **Core Slide Bullet Points**
> 3. **Data Tables / Code Snippets**
> 4. **Speaker Notes & Talking Points** for your 15–20 minute demo to Prof. Manisha J. Nene.

---

### Slide 1: Title & Academic Context
* **Layout**: Clean Navy & Gold academic theme. DIAT Pune & CSE Department logos.
* **Project Title**: *Build It with AI, Break It Ethically, Secure It: Security and Privacy Evaluation of AI-Generated Applications*
* **Course**: CS-601 Data Security & Privacy | Term July–Dec 2026 | DIAT Pune
* **Subject OIC**: Prof. Manisha J. Nene (`mjnene@diat.ac.in`)
* **Application**: EduTrack QR (MERN Stack with Dynamic Invariant QR Badges)
* **Core Philosophy**: *“AI can accelerate software development, but AI-generated code must be treated as untrusted code until it has been reviewed, tested, and secured.”*
* **Speaker Notes**:  
  *"Good morning Prof. Nene and panel members. Today our team presents the culmination of our seven-week research journey in CS-601. We investigated an urgent modern problem: As developers increasingly rely on Generative AI to write software, what hidden security and privacy risks are introduced? Over seven weeks, we used AI to build a full-stack institutional portal, manually audited it, threat-modeled it under STRIDE, scanned it with automated tools, ethically exploited six vulnerabilities, manually remediated all application flaws, and finally proved our security posture through automated re-testing."*

---

### Slide 2: Executive Summary & The 8-Week Lifecycle
* **Layout**: Directed flowchart of the 8-week cyclical progression aligned with NIST SP 800-218 (SSDF) and OWASP.
* **The Lifecycle**:
  `Build (W1) ➔ Understand (W2) ➔ Threat-Model (W3) ➔ Scan (W4) ➔ Break Ethically (W5) ➔ Fix Manually (W6) ➔ Re-Test (W7) ➔ Defend (W8)`
* **The Three Git Milestones**:
  1. `v0-vulnerable` (`v0.0.0-vulnerable`): Frozen AI-generated baseline (Weeks 1–5).
  2. `v1-manual-remediation` (`v1.0.0-manual-remediation`): Human code hardening (Week 6).
  3. `v2-final-secure` (`v2.0.0-final-secure`): Automated dependency remediation & re-tested release (Week 7).
* **Vulnerability Scope**: 23 total findings (18 application-level + 5 third-party dependency CVEs).
* **Key Metric**: AI Code Security Score (AICSS) surged from **35.0 / 100** (Critical Risk) to **96.0 / 100** (Enterprise Hardened).
* **Speaker Notes**:  
  *"Our project strictly mirrors the NIST Secure Software Development Framework. Rather than treating development and security as isolated silos, we maintained three discrete git branches and release tags. Version 0 was the unpatched AI generation; Version 1 was our human-hardened release fixing all 18 application flaws; and Version 2 is our final audited release resolving supply-chain CVEs with an AICSS score of 96.0/100."*

---

### Slide 3: Week 1 — EduTrack QR System Architecture & Concept
* **Layout**: Architecture diagram showing React Frontend, Express API, MongoDB, and Dynamic Invariant QR Badge scanning.
* **The Problem**: Educational institutions face high administrative overhead managing student IDs across advancing years, classes, and sections. Physical cards become obsolete annually.
* **The Solution**: Single permanent, invariant dynamic QR code assigned upon admission. The physical badge stays constant, while server-side records update dynamically across years.
* **Frontend Stack**: React (Vite) + Tailwind CSS + Lucide Icons + html5-qrcode camera scanner + Canvas retina badges.
* **Backend Stack**: Node.js + Express REST API + MongoDB (Mongoose) + JWT Authentication + Multer file uploads.
* **Multi-Role Portals**: Dedicated Administrator, Teacher, and Parent portals with synthetic institutional records.
* **Speaker Notes**:  
  *"In Week 1, we conceptualized EduTrack QR. Traditional institutional student ID cards become obsolete every time a student moves from 5th to 6th standard or changes sections. EduTrack QR solves this by assigning each student one permanent, invariant QR token. When a guard or teacher scans the physical badge, the server dynamically retrieves their active academic year and allows inspecting multi-year progression. We implemented full CRUD, batch attendance, grade entry, and parent-teacher communication."*

---

### Slide 4: Week 1 — The Master AI Generation Prompt
* **Layout**: Split view: Left shows the master human prompt; Right highlights functional richness vs. missing defensive constraints.
* **Syllabus Mandate**: Section 6 (p. 11) requires an explicit AI development prompt log to avoid treating AI as a black box.
* **The Master Prompt**:

```text
"You are an expert full-stack software engineer. Build a complete, production-ready MERN 
(MongoDB, Express, React, Node.js) web application called 'EduTrack QR' for an educational institution. 
The application manages student records, attendance, examinations, and dynamic identity badges.

Core Functional Requirements:
1. Role-Based Access Control: Support three distinct user roles with JWT authentication: 'admin', 'teacher', and 'parent'.
2. Dynamic Invariant QR Identity: Each student receives one unique, permanent QR token upon admission that never changes. 
   Scanning this QR code dynamically fetches their live status, active class, and multi-year academic progression history.
3. Multi-Year Academic Progression: Implement Academic Years, Classes, Sections, and Subjects. Support promoting/enrolling 
   students into new years without overwriting past historical records using a compound index on (student, academicYear).
4. Daily Class Attendance: Create bulk attendance marking for teachers with 1-click 'Mark All Present' and daily status toggles.
5. Examinations & Grade Sheets: Allow teachers to create exams and enter class marks with automated percentage and letter grade calculation.
6. Parent-Teacher Feedback: Allow parents to submit feedback and ratings to subject teachers, with teacher response capabilities.
7. High-Resolution ID Badge: Create a printable modal rendering the student photo, details, and QR code, formatted for single-page printing and PNG download.
8. Public Verification Route: Create an unauthenticated route (/verify/:qrToken) allowing anyone scanning the QR code to verify student identity.

Backend Stack: Express, Mongoose, bcryptjs, jsonwebtoken, cors, multer, qrcode, uuid.
Frontend Stack: React with Vite, Tailwind CSS, lucide-react, react-router-dom, axios, html5-qrcode.
Provide complete backend server, database schemas, API routes, seed script with synthetic data, and full React components."
```

* **Pedagogical Insight**: The prompt asked for rich features, speed, and convenient public verification without specifying defensive constraints (complete mediation, magic-bytes, DPDP compliance). The AI delivered a functionally brilliant application that was riddled with 23 security vulnerabilities!
* **Speaker Notes**:  
  *"Here is the exact master prompt we engineered in Week 1. Notice how thorough it is functionally—it details schemas, roles, QR logic, and UI. The AI responded brilliantly by generating working code. However, because our prompt asked for functionality and convenient public verification without specifying defensive constraints, the AI took dangerous shortcuts: it hardcoded fallback secrets, returned full un-redacted PII on public QR scans, and trusted client headers. This proved our first hypothesis: Generative AI delivers what you prompt for—functional completeness, not security."*

---

### Slide 5: Week 2 — Manual Code Review: 18 Observations
* **Layout**: 6-box grid displaying the 6 security review areas with observation badges.
* **Theme**: *“Working code ≠ secure code”* (Syllabus Section 8, p. 13).
* **Findings**: 18 distinct security and architectural observations (OBS-01 to OBS-18) cataloged.
* **Authentication Flaws**: Missing login rate limiting (OBS-01), 30-day token lifetime (OBS-02), client-only logout (OBS-03), unverified password changes (OBS-06).
* **Authorization Flaws**: Broken Object Level Authorization (BOLA/IDOR) on student profiles (OBS-07), horizontal scorecard snooping (OBS-08).
* **Input & Upload Flaws**: ReDoS regex search crash (OBS-11), mass assignment (OBS-12), client MIME-type trust on file uploads (OBS-13).
* **Secrets & Privacy Flaws**: Hardcoded JWT fallback secret `'secret'` (OBS-16), MongoDB fallback URI (OBS-15), public QR Aadhaar/address leak (OBS-14).
* **Baseline Score**: AI Code Security Score (AICSS) evaluated at **35.0 / 100** (High Risk).
* **Speaker Notes**:  
  *"In Week 2, we conducted our manual code review. Although the application worked smoothly in the browser, our security review unmasked 18 major vulnerabilities. The AI gave tokens a 30-day lifetime, implemented client-only logout where tokens were never invalidated on the server, and created a classic BOLA vulnerability where any logged-in parent could change the URL ID parameter and view other children's medical and personal records. Our baseline AICSS score was a dismal 35 out of 100."*

---

### Slide 6: Week 3 — STRIDE Threat Modeling & Trust Boundaries
* **Layout**: Level-1 Data Flow Diagram (DFD) showing Trust Boundaries: TB-1 Internet, TB-2 Client-API, TB-3 Role Guard, TB-4 Database, TB-5 Local Disk.
* **Theme**: *“What are we protecting, from whom, and why?”* (Syllabus Section 9, p. 14).
* **Trust Boundaries**: Mapped 5 distinct boundaries (Perimeter, Client/API Gateway, Controller Role Guard, Database Persistence, Media Storage).
* **STRIDE Mapping**:
  * **S (Spoofing)**: Forging JWT bearer tokens using the hardcoded default secret `'secret'` to impersonate institutional administrators.
  * **T (Tampering)**: Modifying peer exam grades or altering attendance records due to missing object ownership validation.
  * **R (Repudiation)**: Inadequate audit logging for grade updates and user deactivations.
  * **I (Information Disclosure)**: QR badge exposure of Aadhaar and residential addresses; error stack traces leaking file paths.
  * **D (Denial of Service)**: Search regex ReDoS (`?search=(`) crashing Node.js; login credential stuffing.
  * **E (Elevation of Privilege)**: Parents querying teacher exam endpoints to inspect class-wide scorecards.
* **Speaker Notes**:  
  *"Week 3 forced us to think like threat actors using Microsoft's STRIDE model. By diagramming our Data Flow Diagrams, we realized that our trust boundaries were porous. The API controller trusted any valid JWT without checking whether the user was authorized to act on that specific student object. We mapped out 18 concrete attack vectors, establishing the exact theoretical blueprint for the exploits we would later execute in Week 5."*

---

### Slide 7: Week 3 — Privacy Impact Assessment & DPDP Act 2023
* **Layout**: Comparative graphic: Full database record vs. Public QR Scan leak vs. Digital Personal Data Protection Act compliance requirements.
* **Regulatory Mandate**: Compliance with India's Digital Personal Data Protection (DPDP) Act 2023 and the principle of Data Minimization.
* **The Critical Privacy Flaw**: The AI implemented the public verification endpoint `GET /api/qr/verify/:token` by querying the database and returning the entire Mongoose student document.
* **Data Leaked**: 12-digit Government Aadhaar number, permanent home residential address, emergency contact phone numbers, and full exam mark transcripts.
* **Physical Threat Vector**: A stranger photographing a student's hanging physical ID badge at a bus stop could scan the QR code and instantly harvest their home address and Aadhaar number.
* **The 8 Syllabus Privacy Questions**: Confirmed that synthetic data was strictly used; identified missing data retention schedules and unencrypted PII at rest in MongoDB.
* **Speaker Notes**:  
  *"Our Privacy Impact Assessment uncovered what Professor Nene emphasizes as the most dangerous type of flaw: a privacy leak that isn't a conventional technical crash. The AI wanted to give a 'rich UI' on public badge scans, so it returned the whole database record. If a child wore this badge on the street, anyone with a smartphone could scan it and obtain their Aadhaar number and exact home address. Under the DPDP Act 2023, this is a catastrophic privacy violation. AI models have zero inherent awareness of data protection statutes."*

---

### Slide 8: Week 4 — Automated Tool Scanning: 23 Total Findings
* **Layout**: Multi-tool breakdown: SAST (Semgrep), SCA (npm audit), Secrets (Gitleaks), DAST (OWASP ZAP), SBOM (CycloneDX).
* **Theme**: *“Let the tools find what humans miss”* (Syllabus Section 10, p. 16).
* **Semgrep (SAST)**: Flagged ReDoS regex compilation, client MIME header trust in uploads, and unverified password modification.
* **Gitleaks (Secrets)**: Flagged hardcoded fallback secret `'secret'` in `authRoutes.js` and `server.js`.
* **OWASP ZAP (DAST)**: Flagged missing anti-clickjacking headers (`X-Frame-Options`), missing `nosniff`, and permissive wildcard CORS.
* **npm audit (SCA)**: Identified 5 third-party dependency CVEs (`body-parser`, `follow-redirects`, `source-map-js`, `uuid`, `esbuild`).
* **Total Inventory**: 23 Findings = 18 Inherent Application Vulnerabilities + 5 Third-Party Supply-Chain CVEs.
* **Speaker Notes**:  
  *"In Week 4, we deployed automated scanners. Automated tools are exceptional at syntax patterns and CVE matching. Semgrep caught the regex flaw; Gitleaks flagged the fallback secret string; ZAP caught the missing clickjacking headers; and npm audit caught 5 CVEs in our node_modules. Combined with our manual findings, our total vulnerability inventory stood at 23. But critically, scanners completely missed our BOLA flaw and our QR privacy leak. This proved that automated scanners cannot understand relational authorization."*

---

### Slide 9: Week 5 — Controlled Ethical Demonstrations (Overview)
* **Layout**: Table listing the 6 demonstrated PoCs with MITRE CWE, OWASP Top 10 category, and exploit objective.
* **Theme**: *“Show how the vulnerability can lead to data exposure”* (Syllabus Section 11, p. 17).
* **Rubric Rigor**: 15 Marks allocated in syllabus. Evaluated on Existence, Reproducibility, Impact, Data Relevance, and Root Cause.
* **Ethical Safety**: Executed strictly against localhost in an isolated lab environment using 100% synthetic student data.
* **PoC Summary Matrix**:

| PoC ID | Vulnerability Demonstrated | MITRE CWE | Exploit Impact Demonstrated |
|:---:|---|:---:|---|
| **PoC-01** | BOLA / IDOR on Student Profile | CWE-639 / A01 | Parent token retrieved full records of unrelated students. |
| **PoC-02** | Public QR Badge Sensitive PII Leak | CWE-200 / DPDP | Unauthenticated scan exposed Aadhaar and home address. |
| **PoC-03** | Hardcoded JWT Secret Token Forgery | CWE-798 / A02 | Offline HMAC token forged granting Administrator root access. |
| **PoC-04** | Class Scorecard Horizontal Snooping | CWE-284 / A01 | Parent token extracted entire class marks and rankings. |
| **PoC-05** | File Upload MIME Type Spoofing | CWE-434 / A04 | PHP executable uploaded disguised as PNG image. |
| **PoC-06** | Search Regex Syntax Crash (ReDoS) | CWE-1333 / A03 | Input `?search=(` crashed Node.js server with HTTP 500. |

* **Speaker Notes**:  
  *"Week 5 was our most intensive practical milestone: 15 marks. We proved that our findings weren't theoretical paper exercises. We built reproducible exploit scripts for six vulnerabilities. We demonstrated cross-tenant data theft, cryptographic administrative takeover, privacy harvesting from QR badges, and denial-of-service server crashes—all captured with concrete HTTP requests and responses."*

---

### Slide 10: Week 5 — Exploit Deep-Dive: PoC-01, PoC-02, PoC-03
* **Layout**: 3-column card comparison displaying attack payload, HTTP request, and captured sensitive response.
* **PoC-01 (BOLA/IDOR)**:
  * *Attack*: Authenticated as Parent User (Parent of Student A). Replaced URL ID parameter with Student B's MongoDB `_id` (`GET /api/students/507f1f77bcf86cd799439011`).
  * *Outcome*: Backend returned `HTTP 200 OK` with complete profile, medical info, and family details of the alien student.
* **PoC-02 (QR PII Leak)**:
  * *Attack*: Unauthenticated HTTP GET to `/api/qr/verify/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` (simulating smartphone camera scan).
  * *Outcome*: Server returned `HTTP 200 OK` exposing Aadhaar number `9876-5432-1098` and residential address.
* **PoC-03 (JWT Forgery)**:
  * *Attack*: Used the fallback string `'secret'` found in AI code to sign an arbitrary HMAC-SHA256 token payload: `{ id: 'admin1', role: 'admin' }`.
  * *Outcome*: Target server accepted the forged token, allowing unauthenticated administrative student creation.
* **Speaker Notes**:  
  *"Let's look at the first three exploits. In PoC-01, Parent A simply swapped the ID in the request and viewed Student B's complete records. In PoC-02, an unauthenticated GET request to the QR verification endpoint returned the student's 12-digit Aadhaar number and home address. In PoC-03, we took the static string 'secret' from the source code, signed our own token offline, and took over the entire portal as an Administrator. Every single one succeeded against Version 0."*

---

### Slide 11: Week 5 — Exploit Deep-Dive: PoC-04, PoC-05, PoC-06
* **Layout**: 3-column card comparison displaying attack payload, HTTP request, and captured sensitive response.
* **PoC-04 (Scorecard Snooping)**:
  * *Attack*: Authenticated parent requested `GET /api/marks/exam/64f1a2b3c4d5e6f7a8b9c0d1`. Route only checked `protect` without role checks.
  * *Outcome*: Parent retrieved the entire class roster, including all peer marks, percentages, and class rankings.
* **PoC-05 (File Upload Spoof)**:
  * *Attack*: Created a PHP shell script (`shell.php`), renamed it to `avatar.png`, and sent multipart/form-data with client header `Content-Type: image/png`.
  * *Outcome*: Middleware trusted client header; stored the executable script directly inside the public `/uploads` directory.
* **PoC-06 (ReDoS & Crash)**:
  * *Attack*: Sent `GET /api/students?search=%28` containing an unescaped opening parenthesis.
  * *Outcome*: `new RegExp("(", "i")` threw an unhandled `SyntaxError: Unterminated group`, crashing the Node.js server (`HTTP 500`).
* **Speaker Notes**:  
  *"In PoC-04, parents accessed the entire class grade sheet because the AI forgot role checks. In PoC-05, we renamed a PHP script to .png and spoofed the Content-Type header; the server happily accepted and saved the executable. In PoC-06, sending a single opening parenthesis in the search box triggered an unhandled RegExp syntax error that crashed the entire backend. These six PoCs proved catastrophic vulnerabilities across every tier of the AI-generated code."*

---

### Slide 12: Week 6 — Human-Led Manual Remediation (Secure Version 1)
* **Layout**: Git branching graphic showing frozen baseline `v0-vulnerable` vs. active human patched branch `v1-manual-remediation`.
* **Theme**: *“Now fix the application. Students manually modify the application.”* (Syllabus Section 12, p. 19).
* **Weightage**: 10 Marks. Explicit mandate: Human security engineering, NOT automated AI rewriting.
* **Scope**: 100% of all 18 application-level vulnerabilities manually refactored across 9 backend files.
* **Git Architecture**: Version 0 frozen intact on branch `v0-vulnerable` (`v0.0.0-vulnerable`); human patches committed to `v1-manual-remediation`.
* **Focus Areas**: Authentication (rate limiting, 8h tokens, revocation), Authorization (BOLA ownership check, RBAC), Input Handling (regex escape, whitelist), Secrets (fail-fast exit), Privacy (Data Minimization DTO).
* **Speaker Notes**:  
  *"Week 6 brought us to the turning point: 'Now fix the application.' Professor Nene's syllabus explicitly required human remediation. Why? Because when you ask AI to fix these flaws, it suggests superficial patches like adding generic authentication or try-catch blocks. As human security engineers, we created branch 'v1-manual-remediation' and systematically refactored all 18 application vulnerabilities across 9 backend source files."*

---

### Slide 13: Week 6 — Key Code Diffs: Before vs. After
* **Layout**: Side-by-side code blocks comparing Vulnerable Version 0 (AI code) vs. Secure Version 1 (Human refactoring).
* **BOLA Fix (`studentRoutes.js:216`)**: Implemented Complete Mediation verifying that `req.user._id` matches `student.parentUser._id`; returns `HTTP 403 Forbidden` on alien IDs.
* **Public QR Privacy DTO (`qrRoutes.js:106`)**: Replaced full Mongoose dump with Sanitized Public Badge DTO; stripped Aadhaar, address, and grades under DPDP Act 2023 compliance.
* **Binary Magic-Byte Inspection (`uploadMiddleware.js:52`)**: Replaced client MIME trust with native Buffer byte inspection (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG); immediately unlinks spoofed files (`HTTP 400`).
* **Sliding Window Rate Limiter (`authRoutes.js:20`)**: Enforces 5 failed attempts per 15 min per IP $\rightarrow$ `HTTP 429 Too Many Requests`.
* **Server-Side Token Revocation (`authMiddleware.js:5` & `authRoutes.js:200`)**: Added token blacklist Set; `POST /logout` revokes bearer tokens immediately.

```javascript
// SECURE VERSION 1: BOLA COMPLETE MEDIATION (studentRoutes.js:216)
if (req.user.role === 'parent') {
  const parentId = req.user._id.toString();
  const studentParentId = student.parentUser ? student.parentUser._id.toString() : null;
  const isLinkedChild = req.user.students && req.user.students.some(s => s.toString() === student._id.toString());
  if (studentParentId !== parentId && !isLinkedChild) {
    return res.status(403).json({ success: false, message: 'Access Denied: You are not authorized.' });
  }
}

// SECURE VERSION 1: BINARY MAGIC-BYTE VALIDATION (uploadMiddleware.js:52)
const buffer = Buffer.alloc(12);
const fd = fs.openSync(filePath, 'r');
fs.readSync(fd, buffer, 0, 12, 0);
fs.closeSync(fd);
const isJpeg = (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff);
const isPng = (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47);
if (!isJpeg && !isPng) {
  fs.unlinkSync(filePath); // Purge spoofed executable immediately
  return res.status(400).json({ message: 'Security Validation Failed: Invalid image magic bytes.' });
}
```

* **Speaker Notes**:  
  *"These code diffs showcase our human engineering fixes. For BOLA, we wrote complete mediation logic checking legal parent-child linkage. For file uploads, instead of trusting the HTTP Content-Type header that any attacker can spoof with curl, we read the raw binary magic bytes directly off the disk buffer. If it doesn't begin with FF D8 FF or PNG bytes, it is immediately deleted from disk. And for the QR badge, we constructed a strict Data Transfer Object (DTO) that leaves Aadhaar numbers completely out of public memory."*

---

### Slide 14: Week 7 — Automated Remediation & Supply-Chain Hardening
* **Layout**: Graphic showing npm audit output before vs. after: Backend dropping from 3 vulnerabilities to exactly 0.
* **Theme**: *“Can tools help secure AI-generated code?”* (Syllabus Section 13, p. 21).
* **Supply-Chain Focus**: Modifying external dependencies in `node_modules` is designated for Week 7 automated package tooling.
* **Branch Strategy**: Created branch `v2-final-secure` branched off `v1-manual-remediation`.
* **Automated Actions**: Executed `npm audit fix` and updated `package.json` manifest for `uuid@^11.1.1`.
* **Major Milestone**: Backend dependencies achieved **ZERO VULNERABILITIES** across all 155 packages (`{'total': 0}`).
* **Frontend CVEs**: `follow-redirects` (High) and `source-map-js` (High) patched; `esbuild` classified as accepted risk devDependency.
* **Speaker Notes**:  
  *"In Week 7, we tackled third-party supply-chain security. AI coding assistants frequently pull in outdated npm libraries. By branching onto 'v2-final-secure' and running automated package remediation ('npm audit fix'), we bumped body-parser, follow-redirects, and source-map-js. We upgraded uuid in our manifest, and achieved exactly ZERO vulnerabilities in our backend dependency tree. Our supply chain was officially secured."*

---

### Slide 15: Week 7 — Empirical Re-Testing: 100% Exploit Neutralization
* **Layout**: Checkmark verification table showing all 6 Week 5 PoCs defeated in Secure Version 2 with exact HTTP status codes.
* **Philosophy**: *“Fixing code is not the same as proving that the vulnerability is fixed. Students must perform re-testing after remediation.”* (Syllabus p. 8 & 22).
* **Automated Test Runner**: Executed `backend/tests/verify_security_controls.js` validating 8 security controls with **100% PASS** rate.

| PoC Ref | Vulnerability Tested | Version 0 Behavior | Version 2 Hardened Behavior | Re-Test Result |
|:---:|---|:---:|:---:|:---:|
| **PoC-01** | BOLA / IDOR on Student Profile | `HTTP 200` (Alien PII leaked) | `HTTP 403 Forbidden` (Blocked) | **PASS (100% Neutralized)** |
| **PoC-02** | Public QR Badge Sensitive PII | `HTTP 200` (Aadhaar exposed) | `HTTP 200` (Sanitized DTO) | **PASS (DPDP Compliant)** |
| **PoC-03** | JWT Fallback Secret Forgery | `HTTP 200` (Admin takeover) | `HTTP 401 Unauthorized` (Rejected) | **PASS (100% Neutralized)** |
| **PoC-04** | Class Scorecard Snooping | `HTTP 200` (Full grade sheet) | `HTTP 403 Forbidden` (RBAC blocked) | **PASS (100% Neutralized)** |
| **PoC-05** | File Upload MIME Type Spoof | `HTTP 200` (PHP saved to disk) | `HTTP 400 Bad Request` (Unlinked) | **PASS (100% Neutralized)** |
| **PoC-06** | Search Regex Syntax Crash | `HTTP 500` (Node process crash) | `HTTP 200 OK` ($< 10$ ms literal search) | **PASS (100% Neutralized)** |

* **Speaker Notes**:  
  *"As Professor Nene repeatedly noted: a developer's word is not proof of security. You must re-test. In Week 7, we re-ran all six Week 5 exploit scripts against Secure Version 2. As you can see on this table, every exploit was neutralized. BOLA returns HTTP 403; public QR scans return sanitized DTOs without Aadhaar; forged tokens are rejected with HTTP 401; spoofed uploads are unlinked with HTTP 400; and the search query executes in 6 milliseconds without crashing. Every single defense was empirically verified."*

---

### Slide 16: Week 7 — Quantitative Metrics Leap & AICSS Recalculation
* **Layout**: Comparison chart: Version 0 vs. Version 2 across all security metrics, with AICSS score jumping from 35.0 to 96.0.
* **Formula**: $AICSS = 100 - (W_c + W_h + W_m + W_p + W_d)$ as mandated by Syllabus Section 27.
* **Version 0 Score**: $100 - (20.0 + 18.0 + 12.0 + 10.0 + 5.0) = \mathbf{35.0 \text{ / } 100}$ (High Risk Baseline).
* **Version 2 Score**: $100 - (0.0 + 0.0 + 0.0 + 0.0 + 4.0) = \mathbf{96.0 \text{ / } 100}$ (Enterprise Hardened).
* **Improvement Delta**: **+61.0 Points Leap**.
* **Finding Status Ledger**: 22 Vulnerabilities Removed, 1 Accepted Risk (dev bundler `esbuild`), 0 Unresolved Issues.
* **Speaker Notes**:  
  *"To satisfy Syllabus Section 27, we re-calculated the AI Code Security Score. Our unhardened Version 0 scored 35 out of 100 due to severe penalties across critical secrets, high-risk BOLA, and privacy leaks. In Secure Version 2, all critical, high, medium, and privacy penalties dropped to zero. We only deducted 4 points for the devDependency bundler esbuild, bringing our final AICSS to 96.0 out of 100. This provides mathematical, quantitative proof of measurable security improvement."*

---

### Slide 17: Critical Evaluation — AI vs. Human Review (RQ6 & Section 26)
* **Layout**: 3-way comparison table contrasting Review A (AI model), Review B (Human engineer), and Review C (Automated security tools).
* **Syllabus Mandate**: Section 26 (*"Compare AI and Human Security Judgement"*) and Research Question 6 (*"Does AI-assisted remediation introduce new vulnerabilities?"*).
* **Review A (AI Review)**: Good at spotting generic syntax issues; completely blind to business logic authorization (BOLA) and statutory privacy mandates (DPDP Act).
* **Review B (Human Review)**: Excelled at domain semantics, complete mediation, parent-child relationships, and regulatory data minimization.
* **Review C (Security Tools)**: Fast pattern matching (Semgrep caught ReDoS, Gitleaks caught strings, npm audit caught CVEs); completely missed logical access controls.
* **Answering RQ6**: When prompted to fix vulnerabilities, AI offered superficial fixes (checking client MIME strings or generic try-catch blocks) that introduced secondary flaws. Human engineering oversight is mandatory.
* **Speaker Notes**:  
  *"This brings us to the core educational takeaway of the CS-601 curriculum. Section 26 asked us to compare AI review, human review, and security tools. Our empirical research revealed that AI-assisted remediation often introduces new security flaws! When we asked AI to fix file uploads, it suggested checking file.mimetype, which still trusts client headers. When we asked it to fix BOLA, it suggested authentication rather than authorization. AI is an extraordinary productivity multiplier, but human security engineering judgement is irreplaceable."*

---

### Slide 18: Summary, Lessons Learned & Live Demo Walkthrough
* **Layout**: Summary card listing Key Takeaways and the 4-step live demonstration sequence for the panel.
* **Takeaway 1**: *Working code ≠ secure code.* Syntactic correctness must never be confused with adversarial resilience.
* **Takeaway 2**: *Automated tools find syntax; humans find semantics.* Complete mediation and privacy require human context.
* **Takeaway 3**: *Re-testing is mandatory.* A patch is only as good as the empirical test that proves it blocks the exploit.
* **Live Demo Script**:
  1. Show live EduTrack QR functionality (Admin, Teacher, Parent, QR Scanner).
  2. Fire PoC-01 (BOLA) against Version 0 (`HTTP 200 OK` cross-tenant data leak).
  3. Switch to Version 2 and show `HTTP 403 Forbidden` complete mediation.
  4. Show scan evidence of 0 backend CVEs and AICSS 96.0/100 scorecard.
* **GitHub Portfolio**: Branches `v0-vulnerable`, `v1-manual-remediation`, and `v2-final-secure` are live at [https://github.com/anshuman2810/EduTrack.git](https://github.com/anshuman2810/EduTrack.git).
* **Speaker Notes**:  
  *"In conclusion, CS-601 has transformed how we view modern software engineering. We learned that compiling code is not correct code, and working code is not secure code. We invite the panel to observe our live demonstration where we will trigger our BOLA exploit live on Version 0, switch to Secure Version 2, and verify immediate complete mediation. Thank you, Prof. Nene, and we welcome your questions."*
