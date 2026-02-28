# ProfitPulse — Master Test Case Document
**Project:** BornSmart ProfitPulse
**Total Test Cases:** 154
**Tooling:** Playwright (E2E / UI / API), Jest (Unit / Integration / API)

---

## MODULE 1: AUTHENTICATION & SESSION (15 test cases)

| TC ID | Module | Type | Priority | Precondition | Steps | Test Data | Expected Result | Tool |
|---|---|---|---|---|---|---|---|---|
| TC-AUTH-001 | Auth | API | P0 | DB seeded | POST /api/v1/auth/login | email: admin@profitpulse.com, pass: Admin@123 | 200, success: true, token, user role "admin" | Jest |
| TC-AUTH-002 | Auth | API | P0 | DB seeded | POST /api/v1/auth/login | email: admin@profitpulse.com, pass: WrongPass | 401, success: false | Jest |
| TC-AUTH-003 | Auth | API | P0 | DB seeded | POST /api/v1/auth/login | email: nobody@x.com, pass: test | 401 | Jest |
| TC-AUTH-004 | Auth | API | P1 | None | POST /api/v1/auth/login | { password: "Admin@123" } | 400, validation error | Jest |
| TC-AUTH-005 | Auth | API | P1 | None | POST /api/v1/auth/login | { email: "admin@..." } | 400, validation error | Jest |
| TC-AUTH-006 | Auth | API | P0 | DB seeded | POST /api/v1/auth/login | Finance creds | 200, role: "finance" | Jest |
| TC-AUTH-007 | Auth | API | P0 | DB seeded | POST /api/v1/auth/login | DM creds | 200, role: "delivery_manager" | Jest |
| TC-AUTH-008 | Auth | API | P0 | DB seeded | POST /api/v1/auth/login | DH creds | 200, role: "department_head" | Jest |
| TC-AUTH-009 | Auth | API | P0 | DB seeded | POST /api/v1/auth/login | HR creds | 200, role: "hr" | Jest |
| TC-AUTH-010 | Auth | API | P0 | None | GET /api/v1/employees | No Auth header | 401 | Jest |
| TC-AUTH-011 | Auth | API | P0 | None | GET /api/v1/employees | Bearer invalid123 | 401 | Jest |
| TC-AUTH-012 | Auth | UI | P0 | None | Navigate to /login | None | Email + Password fields + Sign In button visible | Playwright |
| TC-AUTH-013 | Auth | E2E | P0 | None | Fill form → click Sign In | Admin creds | URL changes to /dashboard/executive | Playwright |
| TC-AUTH-014 | Auth | E2E | P0 | Logged in | Login → Logout → try /dashboard | Admin | Redirected to /login | Playwright |
| TC-AUTH-015 | Auth | UI | P0 | Not logged in | Navigate to /dashboard/executive | None | Redirected to /login | Playwright |

## MODULE 2: RBAC / AUTHORIZATION (20 test cases)

| TC ID | Module | Type | Priority | Precondition | Steps | Test Data | Expected Result | Tool |
|---|---|---|---|---|---|---|---|---|
| TC-RBAC-001 | RBAC | API | P0 | Admin Logged in | GET /api/v1/users | Admin JWT | 200, user list | Jest |
| TC-RBAC-002 | RBAC | API | P0 | Finance Logged in | GET /api/v1/users | Finance JWT | 403 Forbidden | Jest |
| TC-RBAC-003 | RBAC | API | P0 | HR Logged in | GET /api/v1/users | HR JWT | 403 | Jest |
| TC-RBAC-004 | RBAC | API | P0 | DM Logged in | GET /api/v1/users | DM JWT | 403 | Jest |
| TC-RBAC-005 | RBAC | API | P0 | DH Logged in | GET /api/v1/users | DH JWT | 403 | Jest |
| TC-RBAC-006 | RBAC | API | P1 | Finance Logged in | GET /api/v1/dashboard/executive | Finance JWT | 200 | Jest |
| TC-RBAC-007 | RBAC | API | P1 | HR Logged in | GET /api/v1/dashboard/executive | HR JWT | 403 | Jest |
| TC-RBAC-008 | RBAC | API | P1 | DM Logged in | GET /api/v1/dashboard/executive | DM JWT | 403 | Jest |
| TC-RBAC-009 | RBAC | API | P1 | DH Logged in | GET /api/v1/dashboard/employee | DH JWT | 200, only Engineering employees | Jest |
| TC-RBAC-010 | RBAC | API | P1 | DM Logged in | GET /api/v1/dashboard/project | DM JWT | 200, only assigned projects | Jest |
| TC-RBAC-011 | RBAC | API | P1 | HR Logged in | POST /api/v1/uploads/employees | HR JWT + file | 200 | Jest |
| TC-RBAC-012 | RBAC | API | P1 | HR Logged in | POST /api/v1/uploads/revenue | HR JWT + file | 403 | Jest |
| TC-RBAC-013 | RBAC | API | P1 | Finance Logged in | POST /api/v1/uploads/revenue | Finance JWT + file | 200 | Jest |
| TC-RBAC-014 | RBAC | API | P1 | DM Logged in | POST /api/v1/uploads/timesheets | DM JWT + file | 200 | Jest |
| TC-RBAC-015 | RBAC | API | P1 | DM Logged in | POST /api/v1/uploads/employees | DM JWT + file | 403 | Jest |
| TC-RBAC-016 | RBAC | UI | P1 | Admin Login | Check Sidebar | Admin | All menu items visible | Playwright |
| TC-RBAC-017 | RBAC | UI | P1 | Finance Login | Check Sidebar | Finance | "Administration" section hidden | Playwright |
| TC-RBAC-018 | RBAC | UI | P1 | HR Login | Check Sidebar | HR | Empl Dash, Empls, Upload visible. | Playwright |
| TC-RBAC-019 | RBAC | UI | P1 | DM Login | Check Sidebar | DM | Project Dashboard, Projects visible | Playwright |
| TC-RBAC-020 | RBAC | API | P0 | Admin Logged in | PUT /api/v1/config | Admin JWT + body | 200, updated | Jest |

## MODULE 3: EXECUTIVE DASHBOARD (12 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-EXEC-001 | Dash | API | P0 | total_revenue > 0, total_cost > 0 | Jest |
| TC-EXEC-002 | Dash | API | P1 | Revenue = sum of all project revenues | Jest |
| TC-EXEC-003 | Dash | API | P1 | Top 5 sorted by margin DESC | Jest |
| TC-EXEC-004 | Dash | API | P1 | Bottom 5 sorted by margin ASC | Jest |
| TC-EXEC-005 | Dash | API | P1 | Utilization range 0–100 | Jest |
| TC-EXEC-006 | Dash | API | P2 | Different month = different data | Jest |
| TC-EXEC-007 | Dash | UI | P0 | 4 KPI cards visible with data (Revenue, Cost, Margin%, Utilization%) | Playwright |
| TC-EXEC-008 | Dash | UI | P0 | No "₹0" or "0.00%" in KPIs | Playwright |
| TC-EXEC-009 | Dash | UI | P1 | Trend chart renders (SVG/canvas visible) | Playwright |
| TC-EXEC-010 | Dash | UI | P1 | Real project names in top list ("ANAROCK", etc.) | Playwright |
| TC-EXEC-011 | Dash | UI | P1 | Indian currency format (₹ with lakhs/crores) | Playwright |
| TC-EXEC-012 | Dash | UI | P2 | Month picker changes data on cards | Playwright |

## MODULE 4: EMPLOYEE DASHBOARD (10 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-EMP-D-001 | Dash | API | P0 | Returns 40 employees with profitability fields | Jest |
| TC-EMP-D-002 | Dash | API | P1 | Fields: id, name, department, billable_percent, revenue, cost, profit, margin | Jest |
| TC-EMP-D-003 | Dash | API | P1 | Dept Head scoped to Engineering department | Jest |
| TC-EMP-D-004 | Dash | API | P1 | Billable % in 0–100 range | Jest |
| TC-EMP-D-005 | Dash | API | P1 | Non-billable: 0 revenue, negative profit | Jest |
| TC-EMP-D-006 | Dash | UI | P0 | Table renders with employee rows | Playwright |
| TC-EMP-D-007 | Dash | UI | P1 | Columns: Employee, Dept, Billable%, Revenue, Cost, Profit, Margin% | Playwright |
| TC-EMP-D-008 | Dash | UI | P1 | Negative profit employees highlighted in red | Playwright |
| TC-EMP-D-009 | Dash | UI | P2 | Table filters upon typing name in search | Playwright |
| TC-EMP-D-010 | Dash | UI | P2 | Next page shows more employees | Playwright |

## MODULE 5: PROJECT DASHBOARD (10 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-PRJ-D-001 | Dash | API | P0 | Returns array of 20 projects | Jest |
| TC-PRJ-D-002 | Dash | API | P1 | Types in [tm, fixed_cost, infrastructure, amc] | Jest |
| TC-PRJ-D-003 | Dash | API | P1 | DM scoped to assigned projects | Jest |
| TC-PRJ-D-004 | Dash | API | P1 | Margin % = ((rev-cost)/rev)*100 | Jest |
| TC-PRJ-D-005 | Dash | API | P1 | Hoabl (completed) PRJ016 included | Jest |
| TC-PRJ-D-006 | Dash | UI | P0 | Table with 20 project rows | Playwright |
| TC-PRJ-D-007 | Dash | UI | P1 | Type badges colored per project type | Playwright |
| TC-PRJ-D-008 | Dash | UI | P1 | Real client names shown instead of IDs | Playwright |
| TC-PRJ-D-009 | Dash | UI | P2 | Filter by Fixed Cost shows 6 projects | Playwright |
| TC-PRJ-D-010 | Dash | UI | P2 | Margin column is sortable | Playwright |

## MODULE 6: DEPARTMENT & CLIENT DASHBOARD (8 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-DEPT-001 | Dash | API | P0 | 8 departments with aggregated data | Jest |
| TC-DEPT-002 | Dash | API | P1 | Dept Head scoped to own department | Jest |
| TC-DEPT-003 | Dash | UI | P0 | Table (8 rows) + chart render | Playwright |
| TC-DEPT-004 | Dash | UI | P1 | Valid utilization % per department | Playwright |
| TC-CLIENT-001 | Dash | API | P0 | 19 clients returned in array | Jest |
| TC-CLIENT-002 | Dash | API | P1 | Client revenue = sum of project revenues | Jest |
| TC-CLIENT-003 | Dash | UI | P0 | Client table renders 19 rows | Playwright |
| TC-CLIENT-004 | Dash | UI | P1 | Industry column shown (Telecom, Healthcare, etc.) | Playwright |

## MODULE 7: EMPLOYEE CRUD & DETAIL (10 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-EMP-001 | Empl | API | P0 | 200, paginated array of 40 employees | Jest |
| TC-EMP-002 | Empl | API | P1 | Filtered results when searching by name | Jest |
| TC-EMP-003 | Empl | API | P0 | Full record + department name by ID | Jest |
| TC-EMP-004 | Empl | API | P0 | Fields: cost_per_hour, revenue, cost, profit, projects | Jest |
| TC-EMP-005 | Empl | API | P1 | Monthly breakdown of hours + utilization | Jest |
| TC-EMP-006 | Empl | API | P1 | Cost/hr = (CTC+180000)/12/160 | Jest |
| TC-EMP-007 | Empl | UI | P0 | Table renders with 40 employees | Playwright |
| TC-EMP-008 | Empl | UI | P0 | Navigate to /employees/:id upon clicking View Details | Playwright |
| TC-EMP-009 | Empl | UI | P1 | Cost/hr, revenue, profit visible in detail | Playwright |
| TC-EMP-010 | Empl | UI | P1 | Project breakdown table shows hours per project | Playwright |

## MODULE 8: PROJECT CRUD & DETAIL (12 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-PRJ-001 | Proj | API | P0 | 20 projects paginated | Jest |
| TC-PRJ-002 | Proj | API | P1 | Filter projects by status | Jest |
| TC-PRJ-003 | Proj | API | P0 | Full project + client info by ID | Jest |
| TC-PRJ-004 | Proj | API | P0 | Revenue, cost, margin, employee breakdown | Jest |
| TC-PRJ-005 | Proj | API | P1 | burn rate (budget_consumed_%, remaining, status) | Jest |
| TC-PRJ-006 | Proj | API | P1 | Rejects burn rate for non-fixed project | Jest |
| TC-PRJ-007 | Proj | API | P0 | POST /api/v1/projects → 201 created | Jest |
| TC-PRJ-008 | Proj | UI | P0 | 20 rows with type badges in list | Playwright |
| TC-PRJ-009 | Proj | UI | P0 | Detail page loads with profitability data | Playwright |
| TC-PRJ-010 | Proj | UI | P1 | .xlsx > 5KB download on Export | Playwright |
| TC-PRJ-011 | Proj | UI | P1 | Submit form → project created in table | Playwright |
| TC-PRJ-012 | Proj | UI | P1 | % consumed gauge for Nirmal Flow Cell | Playwright |

## MODULE 9: UPLOAD CENTER (15 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-UPL-001 | Upl | API | P0 | 200, rows imported from Excel | Jest |
| TC-UPL-002 | Upl | API | P0 | 200, timesheet rows imported | Jest |
| TC-UPL-003 | Upl | API | P0 | 200, revenue rows imported | Jest |
| TC-UPL-004 | Upl | API | P1 | Row-level error details on missing columns | Jest |
| TC-UPL-005 | Upl | API | P1 | 400 error on non-Excel file | Jest |
| TC-UPL-006 | Upl | API | P1 | 400 error on empty file | Jest |
| TC-UPL-007 | Upl | API | P1 | Upsert behavior (no duplicates) on re-upload | Jest |
| TC-UPL-008 | Upl | API | P0 | Paginated upload history logs | Jest |
| TC-UPL-009 | Upl | API | P1 | Valid .xlsx template > 1KB | Jest |
| TC-UPL-010 | Upl | UI | P0 | Employee, Timesheet, Revenue cards visible | Playwright |
| TC-UPL-011 | Upl | UI | P0 | Template file downloads (valid Excel) | Playwright |
| TC-UPL-012 | Upl | UI | P0 | Success message on valid file upload | Playwright |
| TC-UPL-013 | Upl | UI | P1 | Success/error count displayed inline | Playwright |
| TC-UPL-014 | Upl | UI | P1 | Recent upload entries in history table | Playwright |
| TC-UPL-015 | Upl | UI | P2 | Table preview of first 5 rows after select | Playwright |

## MODULE 10: USER MANAGEMENT (8 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-USER-001 | User | API | P0 | 200, list of all users | Jest |
| TC-USER-002 | User | API | P0 | 201, user successfully created | Jest |
| TC-USER-003 | User | API | P0 | 200, user data updated | Jest |
| TC-USER-004 | User | API | P1 | 200, is_active set to false | Jest |
| TC-USER-005 | User | UI | P0 | All users shown with roles in table | Playwright |
| TC-USER-006 | User | UI | P1 | New user appears in table after submit | Playwright |
| TC-USER-007 | User | UI | P1 | Data updated after modal save | Playwright |
| TC-USER-008 | User | UI | P1 | Status changes to inactive on Deactivate | Playwright |

## MODULE 11: SYSTEM CONFIG (6 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-CFG-001 | Cfg | API | P0 | Returns overhead=180000, hrs=160 | Jest |
| TC-CFG-002 | Cfg | API | P0 | Updated value persists in DB | Jest |
| TC-CFG-003 | Cfg | API | P1 | 403 Forbidden for non-admins | Jest |
| TC-CFG-004 | Cfg | UI | P0 | Financial values visible in section | Playwright |
| TC-CFG-005 | Cfg | UI | P1 | RBAC matrix table rendered correctly | Playwright |
| TC-CFG-006 | Cfg | UI | P1 | Employee and project counts shown | Playwright |

## MODULE 12: AUDIT LOG (4 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-AUDIT-001 | Audit | API | P0 | Paginated audit log entries | Jest |
| TC-AUDIT-002 | Audit | API | P1 | Entry with action "LOGIN" present | Jest |
| TC-AUDIT-003 | Audit | UI | P0 | Table with Timestamp, User, Action columns | Playwright |
| TC-AUDIT-004 | Audit | UI | P1 | Log filtering by action type works | Playwright |

## MODULE 13: REPORTS (6 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-RPT-001 | Rpt | API | P0 | Employee profitability .xlsx > 5KB | Jest |
| TC-RPT-002 | Rpt | API | P0 | Project profitability .xlsx > 5KB | Jest |
| TC-RPT-003 | Rpt | API | P1 | Department profitability download | Jest |
| TC-RPT-004 | Rpt | API | P1 | Utilization report download | Jest |
| TC-RPT-005 | Rpt | UI | P0 | File saved to disk on download click | Playwright |
| TC-RPT-006 | Rpt | UI | P1 | Downloaded file size > 5KB | Playwright |

## MODULE 14: CALCULATIONS (10 test cases)

| TC ID | Module | Type | Priority | Formula | Expected | Tool |
|---|---|---|---|---|---|---|
| TC-CALC-001 | Calc | Unit | P0 | (CTC+overhead)/12/stdHours | (1.2M+180K)/12/160 = 718.75 | Jest |
| TC-CALC-002 | Calc | Unit | P0 | ((rev-cost)/rev)*100 | Correct % percentage | Jest |
| TC-CALC-003 | Calc | Unit | P0 | (billable/(billable+nonBill))*100 | Correct % | Jest |
| TC-CALC-004 | Calc | Unit | P1 | rev=0 | 0, not NaN/Infinity | Jest |
| TC-CALC-005 | Calc | Unit | P1 | hours=0 | 0 cost | Jest |
| TC-CALC-006 | Calc | Integ | P0 | overhead 180K→200K | cost_per_hour increases | Both |
| TC-CALC-007 | Calc | Integ | P1 | Rate × hours = revenue | Matches API value | Jest |
| TC-CALC-008 | Calc | Integ | P1 | actual/contract*100 | Correct Burn Rate % | Jest |
| TC-CALC-009 | Calc | DB | P1 | Re-upload same month | Upsert behavior | Jest |
| TC-CALC-010 | Calc | DB | P1 | Delete user → check DB | Row with deletedAt set | Jest |

## MODULE 15: ERROR HANDLING (8 test cases)

| TC ID | Module | Type | Priority | Expected Result | Tool |
|---|---|---|---|---|---|
| TC-ERR-001 | Err | API | P1 | 400 or 404 on invalid UUID in URL | Jest |
| TC-ERR-002 | Err | API | P1 | SQL injection attempt blocked | Jest |
| TC-ERR-003 | Err | API | P1 | Empty array on large page number | Jest |
| TC-ERR-004 | Err | UI | P1 | Branded 404 page shown | Playwright |
| TC-ERR-005 | Err | UI | P1 | Branded 403 page on unauthorized | Playwright |
| TC-ERR-006 | Err | API | P2 | 400 on empty request body | Jest |
| TC-ERR-007 | Err | API | P2 | Size error on >10MB upload | Jest |
| TC-ERR-008 | Err | UI | P2 | Toast "Connection failed" on network error | Playwright |

---
**Total: 154 Test Cases**
