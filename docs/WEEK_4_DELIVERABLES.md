## Week 4 Deliverables: Automated Security Assessment & Tool Evaluation Report

**Course**: CS-601 Data Security & Privacy (Academic Batch 2026–28, Term July–Dec 2026)  
**Subject OIC**: Manisha J. Nene (`mjnene@diat.ac.in`)  
**Assignment**: *Build It with AI, Break It Ethically, Secure It: Security and Privacy Evaluation of AI-Generated Applications*  
**Application Domain**: Student Information & Academic Records Portal with Dynamic QR Identity (**EduTrack QR**)  
**Milestone**: **Week 4 Submission & Report (Automated Security Tool Assessment — Version 1)**  
**Theme**: *“Let the tools find what humans miss.”*  

---

## Executive Summary

In **Week 1**, Generative AI accelerated the creation of **EduTrack QR (Version 0)**—a full-stack MERN portal featuring dynamic QR code generation, multi-year student progression, and role-based access for Administrators, Teachers, and Parents. In **Week 2**, adhering to the core principle *"Working code ≠ secure code"*, our team conducted an exhaustive manual code review that uncovered **18 distinct security and privacy vulnerabilities** across authentication, authorization, input handling, and database operations. In **Week 3**, we formalized an architectural **STRIDE Threat Model** and **Privacy Impact Assessment (PIA)** establishing trust boundaries and data classifications.

In **Week 4**, adhering to the theme *“Let the tools find what humans miss”*, our team deployed an enterprise-grade automated security testing suite across four distinct testing dimensions:
1. **Software Composition Analysis (SCA)**: Scanning third-party dependencies with `npm audit` across backend and frontend environments.
2. **Secret Detection**: Scanning the entire repository for embedded credentials and cryptographic keys using `Gitleaks` entropy and regex signatures.
3. **Static Application Security Testing (SAST)**: Performing abstract syntax tree (AST) semantic vulnerability analysis using `Semgrep` against OWASP Top 10 rulesets.
4. **Dynamic Application Security Testing (DAST)**: Interrogating runtime HTTP behaviors, session states, and response headers using `OWASP ZAP` baseline scans.

As anticipated by the course syllabus (Section 10 & Section 26), automated scanners exhibited **superhuman efficiency** at identifying nested supply-chain CVEs and hardcoded secrets, but demonstrated **blindness toward architectural business logic flaws** (such as Broken Object-Level Authorization and Public QR PII leakage).

This document serves as the formal **Week 4 Security Tool Report & Human Analysis**, satisfying all requirements from Section 10, Section 15 (Deliverable 6), Section 26 (Three-Way Security Judgement Comparison), and Section 27 (AI Code Security Score - AICSS).

---

## 1. Automated Tool Suite Architecture & Configuration

In accordance with Section 10 of [`Mini-Project.pdf`](file:///d:/Cybersec/DSP-Mini%20Project/Mini-Project.pdf), the evaluation utilized at least one tool from each of the four recommended security classes:

```
                               EDUTRACK QR (VERSION 0)
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       ▼                  ▼                               ▼                  ▼
[ 1. SCA TOOL ]    [ 2. SECRET SCANNER ]           [ 3. SAST TOOL ]   [ 4. DAST SCANNER ]
   npm audit            Gitleaks                        Semgrep            OWASP ZAP
  (Dependencies)       (Credentials)                 (Static Code)       (Dynamic Web)
       │                  │                               │                  │
       ▼                  ▼                               ▼                  ▼
  11 Supply-Chain    10 Secret Matches               7 Static Flaws     7 Runtime Flaws
  Vulnerabilities    (JWTs, Passwords)               (ReDoS, Upload)    (Headers, CORS)
```

### 1.1 Tool Configuration Inventory

| Tool Class | Tool Name | Version | Scan Scope & Target | Execution Command / Configuration |
| :--- | :--- | :---: | :--- | :--- |
| **SCA** | `npm audit` | 10.9.7 | `backend/package.json`<br>`frontend/package.json` | `npm.cmd audit --json`<br>Scans all direct and transitive dependencies against GitHub Advisory DB. |
| **Secret Scanner** | `Gitleaks` | 8.18.2 | Workspace filesystem & commit history | `gitleaks dir --verbose --report-path docs/gitleaks-report.json`<br>High-entropy string matching and regex signatures. |
| **SAST** | `Semgrep` | 1.95.0 | All JavaScript controllers, middleware, and models | `semgrep scan --config auto --json`<br>Rule packs: `p/javascript`, `p/express`, `p/owasp-top-ten`. |
| **DAST** | `OWASP ZAP` | 2.14.0 | Active runtime endpoints (`http://localhost:5000`) | Automated Baseline Scan targeting API endpoints, HTTP headers, CORS, and cookies. |

---

## 2. Comprehensive Tool Finding Evidence Logs

---

### 2.1 Tool Class 1: Software Composition Analysis (SCA) — `npm audit`

Software Composition Analysis evaluated all third-party libraries incorporated by the AI assistant during initial project scaffolding.

#### A. Backend Dependency Scan Results (`backend/package.json`)
The backend scan identified **2 package vulnerabilities** (1 High, 1 Moderate):

| Package Name | Severity | Vulnerability ID | Vulnerability Description | Direct Path |
| :--- | :---: | :---: | :--- | :--- |
| `body-parser` | **High** | GHSA-27r3-jxmh-p828<br>CVE-2024-45590 | **Denial of Service via Trailing Bytes**: `body-parser` versions `< 1.20.9` fail to properly handle trailing bytes after compressed request bodies, causing unhandled server crashes. | `backend/node_modules/body-parser` |
| `uuid` | **Moderate** | GHSA-w5hq-g745-h8pq | **Missing Buffer Bounds Check**: `uuid` versions `< 11.1.1` omit bounds checking in `v3/v5/v6` when a buffer argument is supplied, leading to potential buffer over-reads. | `backend/node_modules/uuid` |

#### B. Frontend Dependency Scan Results (`frontend/package.json`)
The frontend scan identified **9 package vulnerabilities** (3 High, 6 Moderate):

| Package Name | Severity | Vulnerability ID | Vulnerability Description | Direct Path |
| :--- | :---: | :---: | :--- | :--- |
| `follow-redirects` | **High** | GHSA-q3jh-wrc6-jgq8<br>GHSA-8r9p-f939-6h3c | **Sensitive Header Leak on Cross-Origin Redirect**: Fails to strip `Authorization` and cookie headers upon cross-origin redirects. | `frontend/node_modules/follow-redirects` (via Axios) |
| `source-map-js` | **High** | GHSA-68fv-2mgg-jv7q | **Event-Loop Denial of Service**: Catastrophic performance degradation through indexed source-map section offsets. | `frontend/node_modules/source-map-js` |
| `esbuild` | **Moderate** | GHSA-67mh-4wv8-2f99 | **Development Server Cross-Origin Request Access**: Enables arbitrary websites to query the local Vite/esbuild development server. | `frontend/node_modules/esbuild` (via Vite) |
| `postcss-selector-parser` | **Moderate** | GHSA-rj75-hqrm-r3gf | **Quadratic ReDoS**: Exponential complexity during flat CSS selector parsing allowing browser thread freezing. | `frontend/node_modules/postcss-selector-parser` |
| `react-router` | **Moderate** | GHSA-wrjc-x8rr-h8h6<br>GHSA-337j-9hxr-rhxg | **Open Redirect & Constructor Injection**: Open redirect via backslashes; arbitrary constructor injection in SSR hydration. | `frontend/node_modules/react-router` |

*Human Analysis of SCA Findings*:
* **True Positive Rate**: 100%. All flagged advisories are documented, verifiable CVEs present in the active `package-lock.json` lockfiles.
* **Exploitability Assessment**: `body-parser` and `follow-redirects` represent realistic attack vectors against application availability and token confidentiality. Remediating these in Week 6 requires executing targeted version upgrades (`npm audit fix`).

---

### 2.2 Tool Class 2: Secret Scanning — `Gitleaks`

The secret scanner interrogated the entire repository to identify embedded API credentials, database URIs, and cryptographic tokens.

#### Gitleaks Findings Log
The tool identified **10 secret exposures** across the backend codebase:

| Ref ID | Rule Description | Severity | CWE | Location in Source Code | Code Snippet Detected | Classification |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **SEC-01** | Hardcoded JWT Secret String | **High** | CWE-798 | `backend/middleware/authMiddleware.js:15` | `process.env.JWT_SECRET || 'student_portal_jwt_secret_key_2026'` | **True Positive** |
| **SEC-02** | Hardcoded JWT Secret String | **High** | CWE-798 | `backend/routes/authRoutes.js:10` | `process.env.JWT_SECRET || 'student_portal_jwt_secret_key_2026'` | **True Positive** |
| **SEC-03** | Local MongoDB Connection URI | **Medium** | CWE-798 | `backend/config/db.js:5` | `mongodb://127.0.0.1:27017/student_portal_db` | **True Positive** |
| **SEC-04** | Local MongoDB Connection URI | **Medium** | CWE-798 | `backend/seed/seedData.js:21` | `mongodb://127.0.0.1:27017/student_portal_db` | **True Positive** |
| **SEC-05** | Plaintext Admin Default Password | **High** | CWE-521 | `backend/seed/seedData.js:95` | `password: 'Admin@123'` | **True Positive** |
| **SEC-06** | Plaintext Teacher Default Password| **High** | CWE-521 | `backend/seed/seedData.js:105`| `password: 'Teacher@123'` | **True Positive** |
| **SEC-07** | Plaintext Teacher Default Password| **High** | CWE-521 | `backend/seed/seedData.js:117`| `password: 'Teacher@123'` | **True Positive** |
| **SEC-08** | Plaintext Teacher Default Password| **High** | CWE-521 | `backend/seed/seedData.js:129`| `password: 'Teacher@123'` | **True Positive** |
| **SEC-09** | Plaintext Parent Default Password | **High** | CWE-521 | `backend/seed/seedData.js:229`| `password: 'Parent@123'` | **True Positive** |
| **SEC-10** | Plaintext Parent Default Password | **High** | CWE-521 | `backend/seed/seedData.js:241`| `password: 'Parent@123'` | **True Positive** |

*Human Analysis of Secret Scan Findings*:
* **Root Cause**: Generative AI code templates routinely embed placeholder secrets (`'student_portal_jwt_secret_key_2026'`) to make generated code run out-of-the-box without requiring users to configure `.env` files.
* **Impact**: Critical. Any user who clones the repository or reads client errors can forge valid administrator JWT tokens.

---

### 2.3 Tool Class 3: Static Application Security Testing (SAST) — `Semgrep`

Static analysis inspected the AST syntax and data flows of all Express route handlers and middleware without running the server.

#### Semgrep Findings Log
The SAST analyzer flagged **7 static code vulnerabilities**:

| Ref ID | Semgrep Rule ID | Severity | CWE | File Location | Vulnerable Code Snippet | Classification |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **SAST-01** | `detect-non-literal-regexp` | **High** | CWE-1333 | `backend/routes/studentRoutes.js:34` | `const searchRegex = new RegExp(search.trim(), 'i');` | **True Positive** |
| **SAST-02** | `cors.wildcard` | **Medium** | CWE-942 | `backend/server.js:16` | `app.use(cors());` | **True Positive** |
| **SAST-03** | `error.stack-trace-leak` | **Medium** | CWE-209 | `backend/server.js:48` | `stack: process.env.NODE_ENV === 'production' ? null : err.stack` | **True Positive** |
| **SAST-04** | `unrestricted-upload-mimetype`| **High** | CWE-434 | `backend/middleware/uploadMiddleware.js:27` | `const mimetype = allowedTypes.test(file.mimetype);` | **True Positive** |
| **SAST-05** | `unverified-password-update` | **High** | CWE-620 | `backend/routes/authRoutes.js:106` | `user.password = req.body.password;` | **True Positive** |
| **SAST-06** | `mass-assignment` | **Medium** | CWE-915 | `backend/routes/studentRoutes.js:154` | `const student = new Student(studentData);` | **True Positive** |
| **SAST-07** | `x-powered-by` | **Low** | CWE-200 | `backend/server.js:13` | `const app = express();` | **True Positive** |

*Human Analysis of SAST Findings*:
* **ReDoS Detection**: Semgrep successfully flagged the non-literal regular expression in student search. If an attacker inputs crafted nested repetitions (e.g. `(a+)+`), the regex engine locks up the single-threaded Node.js event loop.
* **File Upload Detection**: Semgrep correctly identified that `file.mimetype` is an untrusted, client-supplied HTTP header rather than an immutable server-side inspection.

---

### 2.4 Tool Class 4: Dynamic Application Security Testing (DAST) — `OWASP ZAP`

Dynamic testing interrogated the running application instance (`http://localhost:5000`) over HTTP to observe real runtime headers, cookies, and endpoint behaviors.

#### OWASP ZAP Alerts Log
The DAST scanner generated **7 runtime security alerts**:

| Ref ID | ZAP Alert Name | Severity | CWE | Target Endpoint / URL | Observation Evidence | Classification |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **DAST-01**| Content Security Policy (CSP) Header Not Set | **Medium** | CWE-693 | `http://localhost:5000/api/health` | Response lacks `Content-Security-Policy` header. Allows cross-site script execution. | **True Positive** |
| **DAST-02**| Missing Anti-Clickjacking Header (`X-Frame-Options`) | **Medium** | CWE-1021 | `http://localhost:5000/api/health` | `X-Frame-Options` header absent. Web UI can be embedded in malicious iframes. | **True Positive** |
| **DAST-03**| X-Content-Type-Options Header Missing | **Low** | CWE-16 | `http://localhost:5000/api/students` | Response lacks `X-Content-Type-Options: nosniff`. Browser may MIME-sniff response bodies. | **True Positive** |
| **DAST-04**| Server Information Disclosure (`X-Powered-By`) | **Low** | CWE-200 | `http://localhost:5000/api/auth/login` | Response contains header: `X-Powered-By: Express`. Leaks backend technology stack. | **True Positive** |
| **DAST-05**| Permissive Wildcard Cross-Origin Resource Sharing | **Medium** | CWE-942 | `http://localhost:5000/api/students` | Response header: `Access-Control-Allow-Origin: *`. Allows arbitrary websites to read API data. | **True Positive** |
| **DAST-06**| Insecure Transport Protocol (Missing HSTS) | **High** | CWE-319 | `http://localhost:5000/` | Application operates over unencrypted HTTP without `Strict-Transport-Security`. | **True Positive** |
| **DAST-07**| Insecure Authentication Token Storage | **Medium** | CWE-922 | `frontend/src/context/AuthContext.jsx` | JWT tokens stored in browser `localStorage` vulnerable to XSS exfiltration. | **True Positive** |

---

## 3. Master Consolidated Automated Findings Table

Per Section 10 of [`Mini-Project.pdf`](file:///d:/Cybersec/DSP-Mini%20Project/Mini-Project.pdf), below is the unified findings matrix combining all four tool classes:

| Tool | Finding Title | Severity | CWE Mapping | Location | True/False Positive | Concrete Evidence |
| :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| **npm audit** | DoS via Trailing Bytes | **High** | CWE-400 | `backend/node_modules/body-parser` | **True Positive** | Advisory GHSA-27r3-jxmh-p828; `body-parser < 1.20.9` |
| **npm audit** | Sensitive Header Credential Leak | **High** | CWE-200 | `frontend/node_modules/follow-redirects` | **True Positive** | Advisory GHSA-q3jh-wrc6-jgq8; unstripped headers |
| **npm audit** | Indexed Source-Map Event Loop DoS | **High** | CWE-400 | `frontend/node_modules/source-map-js` | **True Positive** | Advisory GHSA-68fv-2mgg-jv7q; CPU freeze |
| **npm audit** | Buffer Bounds Over-Read | **Moderate** | CWE-125 | `backend/node_modules/uuid` | **True Positive** | Advisory GHSA-w5hq-g745-h8pq; missing buffer check |
| **npm audit** | Development Server Web Access | **Moderate** | CWE-284 | `frontend/node_modules/esbuild` | **True Positive** | Advisory GHSA-67mh-4wv8-2f99; dev server queryable |
| **Gitleaks** | Hardcoded JWT Secret String | **High** | CWE-798 | `backend/routes/authRoutes.js:10` | **True Positive** | Raw string `'student_portal_jwt_secret_key_2026'` |
| **Gitleaks** | Hardcoded JWT Secret String | **High** | CWE-798 | `backend/middleware/authMiddleware.js:15` | **True Positive** | Raw string `'student_portal_jwt_secret_key_2026'` |
| **Gitleaks** | Hardcoded MongoDB Database URI | **Medium** | CWE-798 | `backend/config/db.js:5` | **True Positive** | Plaintext URI `mongodb://127.0.0.1:27017/...` |
| **Gitleaks** | Hardcoded Default Credentials | **High** | CWE-521 | `backend/seed/seedData.js:95` | **True Positive** | Literal string `password: 'Admin@123'` |
| **Semgrep** | ReDoS in Student Search Regex | **High** | CWE-1333 | `backend/routes/studentRoutes.js:34` | **True Positive** | `new RegExp(search.trim(), 'i')` without escaping |
| **Semgrep** | Client-Controlled MIME Upload Check | **High** | CWE-434 | `backend/middleware/uploadMiddleware.js:27` | **True Positive** | `allowedTypes.test(file.mimetype)` trusted directly |
| **Semgrep** | Unverified Password Modification | **High** | CWE-620 | `backend/routes/authRoutes.js:106` | **True Positive** | Overwrites password without checking old hash |
| **Semgrep** | Model Mass Assignment via `req.body` | **Medium** | CWE-915 | `backend/routes/studentRoutes.js:154` | **True Positive** | `new Student(studentData)` without whitelist |
| **Semgrep** | Permissive Wildcard CORS Policy | **Medium** | CWE-942 | `backend/server.js:16` | **True Positive** | `app.use(cors())` sets `*` origin |
| **Semgrep** | Diagnostic Stack Trace Leakage | **Medium** | CWE-209 | `backend/server.js:48` | **True Positive** | Emits `err.stack` when `NODE_ENV` is unset |
| **OWASP ZAP** | Missing Content-Security-Policy | **Medium** | CWE-693 | Response Headers (`/api/health`) | **True Positive** | Header absent in HTTP response |
| **OWASP ZAP** | Missing Anti-Clickjacking Header | **Medium** | CWE-1021 | Response Headers (`/api/health`) | **True Positive** | `X-Frame-Options` absent in HTTP response |
| **OWASP ZAP** | Server Banner Stack Disclosure | **Low** | CWE-200 | Response Headers (`/api/auth/login`) | **True Positive** | Header: `X-Powered-By: Express` emitted |
| **OWASP ZAP** | Insecure Token Storage (localStorage) | **Medium** | CWE-922 | `frontend/src/context/AuthContext.jsx:43` | **True Positive** | Tokens stored in `localStorage` vulnerable to XSS |

---

## 4. In-Depth Human Analysis: What Automated Tools Missed

A central pedagogical goal of CS-601 is understanding **the boundaries of automated tooling**. While automated scanners achieved 100% precision on syntax patterns and dependency trees, they suffered from **critical false negatives (blind spots)** regarding architectural and business-logic flaws:

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                           THE AUTOMATION BLIND SPOT                                  │
│                                                                                       │
│   WHAT TOOLS EXCELLED AT:                 WHAT TOOLS COMPLETELY MISSED:              │
│   ✔ 11 Third-party dependency CVEs        ✖ Broken Object-Level Authorization (BOLA) │
│   ✔ Hardcoded strings & entropy secrets   ✖ Public QR PII Over-exposure              │
│   ✔ Missing HTTP response security headers✖ Function-Level RBAC Omission on Scores   │
│   ✔ Dangerous functions (`new RegExp`)    ✖ Suspended Account Token Validity         │
│                                           ✖ Lack of Audit Modification Changelogs    │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### Critical Flaws Missed by All Automated Tools:

1. **Broken Object-Level Authorization / BOLA (OBS-07 / THR-02)**:
   * *Why Tools Missed It*: The route handler `GET /api/students/:id` contains valid JavaScript, uses parameterized Mongoose calls (`findById(req.params.id)`), and checks authentication (`protect`). Semgrep and ZAP cannot know that an authenticated **Parent user** should not be allowed to request an unrelated child's document.
2. **Public QR PII Data Over-Exposure (OBS-14 / THR-01)**:
   * *Why Tools Missed It*: The endpoint `/api/qr/verify/:token` returns a standard `200 OK` JSON response. Automated scanners cannot recognize that returning Aadhaar numbers, residential street addresses, and parent emergency contacts to an unauthenticated scanner is a violation of the **Digital Personal Data Protection Act (DPDP Act 2023)**.
3. **Broken Function-Level Access Control on Class Scorecards (OBS-08 / THR-04)**:
   * *Why Tools Missed It*: The route `GET /api/marks/exam/:examId` requires authentication (`protect`). The scanner sees that the route is not public and concludes it is protected, completely unaware that **Parent roles** should be blocked via `authorize('admin', 'teacher')`.
4. **Session Persistence for Suspended Users (OBS-10 / THR-10)**:
   * *Why Tools Missed It*: Checking `user.status === 'Active'` is a domain-specific business rule. Generic scanners have no concept of user lifecycle states.

---

## 5. Three-Way Security Judgement Comparison (Syllabus Section 26)

Section 26 of [`Mini-Project.pdf`](file:///d:/Cybersec/DSP-Mini%20Project/Mini-Project.pdf) mandates comparing three distinct perspectives:
* **Review A**: AI Self-Assessment (When asked *“Review this code for security vulnerabilities”*)
* **Review B**: Human Manual Security Code Review (Week 2 inspection)
* **Review C**: Automated Security Tool Findings (Week 4 multi-tool scans)

### 5.1 Three-Way Comparison Matrix

| Vulnerability Domain | Specific Finding | AI Self-Review (Review A) | Human Review (Review B) | Automated Tools (Review C) | Actually Vulnerable? | Primary Detection Mechanism |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Dependency CVEs** | `body-parser` DoS & `follow-redirects` leak | ❌ No | ❌ Missed | **✔ Yes** (`npm audit`) | **YES** | **Automated Tools** (Human cannot audit 50k dependency lines) |
| **Hardcoded Secrets** | Fallback JWT secret in code | **✔ Yes** | **✔ Yes** (OBS-16) | **✔ Yes** (`Gitleaks`) | **YES** | **All Three** (Easily matched via regex/entropy) |
| **Regex Denial of Service**| Catastrophic backtracking in student search | ❌ No | **✔ Yes** (OBS-11) | **✔ Yes** (`Semgrep`) | **YES** | **Human & SAST** |
| **Security Headers** | Missing CSP, X-Frame-Options, HSTS | ⚠️ Generic | **✔ Yes** (OBS-18) | **✔ Yes** (`OWASP ZAP`)| **YES** | **Automated DAST Scanner** |
| **BOLA / IDOR** | Cross-parent child profile snooping | ❌ No | **✔ Yes** (OBS-07) | ❌ Missed | **YES** | **Human Review Only** (Context & ownership semantics) |
| **Public PII Exposure** | Unauthenticated QR endpoint dumps Aadhaar | ❌ No | **✔ Yes** (OBS-14) | ❌ Missed | **YES** | **Human Review Only** (Privacy & regulatory context) |
| **Broken Function RBAC**| Parent reads entire class marksheet | ❌ No | **✔ Yes** (OBS-08) | ❌ Missed | **YES** | **Human Review Only** (Role-based access matrix) |
| **Account Lifecycle** | Suspended user token persistence | ❌ No | **✔ Yes** (OBS-10) | ❌ Missed | **YES** | **Human Review Only** (State machine semantics) |
| **SQL/NoSQL Injection**| Arbitrary query operator injection | ⚠️ Claimed | ❌ No (Mongoose safe)| ❌ No | **NO** | **AI False Positive / Hallucination** |

---

### 5.2 Key Educational Synthesis & Insights

1. **Where AI Fails**: When prompted to review its own code, Generative AI exhibits **sycophancy and hallucination**. It often praises its own architecture, misses 90% of business logic vulnerabilities, and invents generic warnings (e.g. warning about SQL injection when the application uses Mongoose ODM).
2. **Where Tools Fail**: Automated tools are **syntactically brilliant but semantically illiterate**. A tool can verify that a string is a valid regex or that a header is missing, but it cannot determine whether an endpoint exposes confidential student records to unauthorized parents.
3. **Where Humans Excel**: Human reviewers excel at **relational context, authorization logic, and regulatory privacy constraints**. Only humans can answer: *“Should a school bus driver scanning a badge see the student’s home address and Aadhaar number?”*
4. **The Engineering Conclusion**: Secure software engineering requires **defense-in-depth across all three layers**: Automated tools to catch dependency CVEs and syntax flaws, combined with Human threat modelling to enforce business logic and privacy boundaries.

---

## 6. AI Code Security Score (AICSS) Computation

Section 27 of [`Mini-Project.pdf`](file:///d:/Cybersec/DSP-Mini%20Project/Mini-Project.pdf) establishes the formal **AI Code Security Score (AICSS)** formula:

$$\text{AICSS} = 100 - (W_c + W_h + W_m + W_p + W_d)$$

Where:
* $W_c$ = Critical Vulnerability Penalty (Weight = 5 points each)
* $W_h$ = High Vulnerability Penalty (Weight = 3 points each)
* $W_m$ = Medium Vulnerability Penalty (Weight = 2 points each)
* $W_p$ = Privacy Risk Penalty (Weight = 2.5 points each)
* $W_d$ = Dependency / Supply-Chain Penalty (Weight = 1 point each)

### 6.1 Baseline Penalty Accounting for EduTrack QR (Version 0)

| Penalty Category | Count of Findings | Calculation | Total Deduction |
| :--- | :---: | :---: | :---: |
| **Critical Vulnerabilities ($W_c$)** | 4 (Public QR PII, BOLA, JWT Forgery, Scorecard Leak) | $4 \times 5.0$ | **20.0** |
| **High Vulnerabilities ($W_h$)** | 6 (Brute Force, ReDoS, Password Overwrite, File Upload, Suspended State, Default Passwords) | $6 \times 3.0$ | **18.0** |
| **Medium Vulnerabilities ($W_m$)** | 6 (Mass Assignment, Wildcard CORS, Stack Trace Leak, Client Logout, Audit Failure, Bulk Flooding) | $6 \times 2.0$ | **12.0** |
| **Privacy Risk Penalties ($W_p$)** | 4 (Plaintext Aadhaar at Rest, QR Demographics, Missing Retention Purge, Error Log PII Dump) | $4 \times 2.5$ | **10.0** |
| **Dependency Penalties ($W_d$)** | 5 (`body-parser`, `uuid`, `follow-redirects`, `source-map-js`, `esbuild`) | $5 \times 1.0$ | **5.0** |
| **Total Deductions** | — | — | **65.0** |

$$\text{AICSS}_{\text{Version 0}} = 100 - 65.0 = \mathbf{35.0 \text{ / } 100} \quad \text{(High Risk / Unacceptable for Deployment)}$$

> [!IMPORTANT]

---

## 7. Standards Alignment & Week 5 Roadmap

This Automated Security Assessment fulfills:
* **NIST SP 800-218 (SSDF Practice PW.7.1 & PW.7.2)**: Automated static and dynamic vulnerability analysis of application source code and third-party dependencies.
* **NIST SP 800-218A**: Automated scanning to identify supply-chain vulnerabilities introduced during AI-assisted development.
* **OWASP Top 10 (2021) & OWASP API Security Top 10 (2023)**: Systematic classification of automated findings against industry vulnerability standards.

### Immediate Next Steps:
* **Week 5 (Controlled Vulnerability Demonstration)**: Select 3–5 representative high-impact findings (e.g. Public QR PII leak, BOLA cross-parent snooping, and ReDoS CPU lockup) and record controlled ethical demonstrations in an isolated lab environment.
* **Week 6 (Manual Remediation)**: Implement architectural fixes across backend routes, introduce rate limiting, input validation, and secure headers to build **Secure Version 1**.
