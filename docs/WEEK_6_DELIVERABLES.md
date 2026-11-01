# CS-601 Data Security & Privacy — Mini-Project
## Week 6 Deliverables: Human-Led Manual Security Remediation Report

**Course**: CS-601 Data Security & Privacy (Academic Batch 2026–28, Term July–Dec 2026)  
**Subject OIC**: Prof. Manisha J. Nene (`mjnene@diat.ac.in`)  
**Institution**: Defence Institute of Advanced Technology (DIAT), Pune — Department of Computer Science & Engineering  
**Assignment**: *Build It with AI, Break It Ethically, Secure It: Security and Privacy Evaluation of AI-Generated Applications*  
**Application Domain**: Institutional Student Information & Dynamic QR Identity Badge Portal (**EduTrack QR**)  
**Milestone**: **Week 6 Submission & Report (Human Manual Remediation — Secure Version 1)**  
**Theme**: *“Now fix the application.”*  
**Weightage**: **10 Marks** (Syllabus Section 24 Assessment Rubric)  
**Git Checkpoints**: Preserved Frozen Baseline (`v0-vulnerable`) $\longrightarrow$ Active Human Patched (`v1-manual-remediation`)  

---

## 1. Executive Summary & Remediation Scope

During Weeks 2, 3, 4, and 5, our team cataloged a total of **23 vulnerabilities** in the AI-generated EduTrack QR system:
* **18 Inherent Application & Architectural Vulnerabilities (`OBS-01` to `OBS-18`)** spanning authentication, authorization, secrets management, input validation, privacy leaks, error handling, and security headers.
* **5 Third-Party Dependency Supply-Chain CVEs (`DEP-01` to `DEP-05`)** residing inside third-party `node_modules` packages.

> **Syllabus Mandate (Section 12, p. 19–21)**:  
> *“Now fix the application. Students manually modify the application. Authentication, Input handling, Authorization, Secrets, Privacy. Deliverables: Secure Version 1, Before/after code, Remediation table, Explanation of each fix, Security-control mapping.”*

### The Division Between Week 6 and Week 7
* **Week 6 (Human Manual Remediation)**: **ALL 18 application and architectural vulnerabilities** have been manually refactored by our team across 9 backend files on branch `v1-manual-remediation`.
* **Week 7 (Automated Remediation & Re-Testing)**: The **5 third-party dependency supply-chain CVEs** (`body-parser`, `follow-redirects`, `source-map-js`, `uuid`, `esbuild`) reside in external packages and are specifically designated by Syllabus Section 13 for automated package updating (`npm audit fix` / manifest upgrades) and verification re-testing.

---

### Table 6.1: Master Remediation Matrix — All 18 Application Vulnerabilities

| Ref # | Vulnerability Remediated | Target Component | Classification | Human Engineering Patch Applied | Status |
|:---:|---|---|---|---|:---:|
| **OBS-01** | **Missing Login Rate Limiting** | `authRoutes.js` | CWE-307 | **In-Memory Sliding Window Rate Limiter**: 5 failed attempts per 15 min $\rightarrow$ `HTTP 429 Too Many Requests`. | **REMEDIATED** |
| **OBS-02** | **Excessive JWT Lifetime (30 Days)** | `authRoutes.js` | CWE-613 | **Reduced Token Lifetime**: Enforced `8h` expiration with strict claims in `generateToken`. | **REMEDIATED** |
| **OBS-03** | **Client-Only Logout / No Revocation** | `authMiddleware.js` & `authRoutes.js` | CWE-613 | **Server-Side Token Revocation Blacklist**: Added `revokedTokens` set and `POST /api/auth/logout`. | **REMEDIATED** |
| **OBS-04** | **Predictable Default Seed Passwords** | `seedData.js` | CWE-521 | **Enforced Password Policy**: Mandated minimum 8 chars, mixed case, numbers, and change notice. | **REMEDIATED** |
| **OBS-05** | **Missing Password Reset Challenge** | `authRoutes.js` | CWE-640 | **Authenticated Reset Challenge**: Requires current password verification before credentials update. | **REMEDIATED** |
| **OBS-06** | **Password Overwrite Without Check** | `authRoutes.js` | CWE-620 | **Mandated Current Password Verification**: Checked via `bcrypt.compare()` and length $\ge 8$. | **REMEDIATED** |
| **OBS-07 (PoC-01)** | **BOLA / IDOR on Student Profile** | `studentRoutes.js` | CWE-639 / A01 | **Object-Level Ownership Check**: Verifies `student.parentUser._id == req.user._id`; returns `403 Forbidden`. | **REMEDIATED** |
| **OBS-08 (PoC-04)** | **Class Scorecard Horizontal Snooping** | `markRoutes.js` | CWE-284 / A01 | **Role Separation (RBAC)**: Added `authorize('teacher', 'admin')` to `/marks/exam/:id`; blocks parent access. | **REMEDIATED** |
| **OBS-09** | **Unvalidated Student in Feedback** | `feedbackRoutes.js` | CWE-284 | **Ownership Check**: Verifies parent is linked to `studentId` before permitting feedback submission. | **REMEDIATED** |
| **OBS-10** | **Suspended User Token Persistence** | `authMiddleware.js` | CWE-284 | **Active Status Check**: Every authenticated request verifies `req.user.status !== 'Suspended'` (`403`). | **REMEDIATED** |
| **OBS-11 (PoC-06)** | **ReDoS & Search Regex Fault** | `studentRoutes.js` | CWE-1333 / A03 | **Regex Sanitization**: `escapeRegex` escapes metacharacters; stops `500` crash and wildcard dump. | **REMEDIATED** |
| **OBS-12** | **Mass Assignment in Student Data** | `studentRoutes.js` | CWE-915 | **Schema Whitelisting**: Replaced raw `new Student(req.body)` with explicit attribute whitelisting. | **REMEDIATED** |
| **OBS-13 (PoC-05)** | **Insecure File Upload MIME Trust** | `uploadMiddleware.js` | CWE-434 / A04 | **Binary Magic-Byte Inspection**: Native Buffer header check for JPEG/PNG/WebP; unlinks spoofed files. | **REMEDIATED** |
| **OBS-14 (PoC-02)** | **Public QR Sensitive PII Exposure** | `qrRoutes.js` | CWE-200 / A01, A04 | **Data Minimization DTO**: Public scan returns only Name, Photo, ID, Class, Status; strips Aadhaar & Address. | **REMEDIATED** |
| **OBS-15** | **Hardcoded MongoDB Fallback URI** | `config/db.js` | CWE-798 | **Strict Environment Configuration**: Enforces `process.env.MONGODB_URI`; fails fast if missing. | **REMEDIATED** |
| **OBS-16 (PoC-03)** | **Hardcoded Default JWT Secret** | `authRoutes.js` & `server.js` | CWE-798 / A02 | **Fail-Fast Enforcement**: Removed fallback strings; startup exit if `.env` key missing; 256-bit CSPRNG key. | **REMEDIATED** |
| **OBS-17** | **Error Stack Trace & Architecture Leak** | `server.js` | CWE-209 | **Sanitized Error Handler**: Intercepts Mongoose `CastError` and returns clean generic client messages. | **REMEDIATED** |
| **OBS-18** | **Wildcard CORS & Missing Headers** | `server.js` | CWE-1021 | **Hardened Headers & CORS**: Added `nosniff`, `DENY`, `HSTS`, XSS protection; origin locked to `localhost:5173`. | **REMEDIATED** |

---

## 2. Supply-Chain Dependencies Reserved for Week 7

The remaining 5 vulnerabilities are third-party npm packages:
1. `body-parser < 1.20.9` (CVE-2024-45590, CVSS 7.5 High)
2. `follow-redirects < 1.16.1` (CVE-2024-28849, CVSS 7.5 High)
3. `source-map-js < 1.2.1` (CVE-2024-53907, CVSS 7.5 High)
4. `uuid < 11.1.1` (CVE-2025-27599, CVSS 5.3 Moderate)
5. `esbuild <= 0.24.2` (CVE-2024-56334, CVSS 5.3 Moderate)

These packages will be upgraded and verified via `npm audit fix` in **Week 7 (Automated Remediation and Re-testing)**.

---

## 3. NIST SP 800-218 (SSDF) Security-Control Concordance

| Security Domain | Vulnerabilities Addressed | NIST SP 800-218 (SSDF) Task | OWASP ASVS v4.0 | Engineering Control Implemented |
|---|---|---|---|---|
| **Authentication** | `OBS-01, 02, 03, 05, 06` | **PW.3.1 / PW.4.1** | V2.1, V2.2, V3.1 | Rate limiter, 8h token expiry, server-side revocation, password challenge. |
| **Authorization** | `OBS-07, 08, 09, 10` | **PW.4.1** | V4.1, V4.2 | Object ownership checks, RBAC on exam routes, parent-child feedback validation. |
| **Secrets Mgmt** | `OBS-15, 16` | **PW.3.1** | V6.2 | Eliminated fallbacks in auth/db, enforced fail-fast startup, generated 256-bit key. |
| **Privacy / Data** | `OBS-14` | **PW.1.1** | V8.3 | Data Minimization DTO; stripped Aadhaar, address, and marks from public scan. |
| **Input Handling** | `OBS-11, 12, 13` | **PW.5.1** | V5.1, V12.1 | Regex sanitization, Mongoose schema whitelisting, binary magic-byte inspection. |
| **Error Handling** | `OBS-17` | **PW.1.2** | V7.1 | Sanitized error responses; prevented CastError Mongoose stack traces. |
| **Architecture** | `OBS-18` | **PW.1.2** | V14.4 | Active nosniff, DENY, HSTS headers; disabled x-powered-by; locked CORS origin. |
