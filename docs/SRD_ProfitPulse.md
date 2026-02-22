# System Requirements Document (SRD): ProfitPulse
**Project:** ProfitPulse — Profitability Intelligence System
**Document Version:** 1.0
**Target Audience:** Development Team, QA, Stakeholders

---

## Section 1: Finalized Functional Requirements

1. **User Management and RBAC**
   - The system shall provide secure authentication and authorize users based on 5 predefined roles: Admin, Finance, Delivery Manager, Department Head, HR.
   - **[BA ASSUMPTION]** The system will support Single Sign-On (SSO) as a future phase but will launch with Email/Password and JWT-based session management. 
   - **[BA ASSUMPTION]** An Admin user shall explicitly map employees to their roles in the system UI.

2. **Data Ingestion via Excel Uploads**
   - The system shall allow authorized users (Admin, HR, Finance) to upload standard Excel files.
   - The system shall support at least 4 master/transactional uploads:
     1. Annual Employee Salary Data (Employee Master) - Uploaded yearly or ad-hoc.
     2. Monthly Timesheets - Uploaded monthly.
     3. Monthly Revenue/Sales Data - Uploaded monthly.
     4. **[BA ASSUMPTION]** Project Master - A new required upload to manage project configurations (Type, Vertical, Budget, Billing Rate).
     5. **[BA ASSUMPTION]** Vendor / Expenses Data - A new upload to capture actual infrastructure/vendor costs.

3. **Core Processing & Computations**
   - The system shall compute "Employee Cost Per Hour" dynamically based on the uploaded CTC, overheads, and standard working hours.
   - **[BA ASSUMPTION]** Overhead per year is configurable at the system level and defaults to ₹1,80,000. It can be updated by the Admin, impacting only calculations from the modification date onward.
   - The system shall compute Profitability across 4 specific dimensions: Employee-wise, Project-wise, Department-wise, and Client-wise.
   - The system shall automatically aggregate gross margin and utilization metrics month-over-month (MoM) and Year-To-Date (YTD).

4. **Dynamic Dashboards**
   - The system shall render an **Executive Dashboard** comprising Total Revenue, Total Cost, Gross Margin %, Utilization %, and Top 5 / Bottom 5 projects.
   - The system shall render an **Employee Dashboard** detailing personal Billable %, Revenue Contribution, Cost, Profit, and Profitability Rank.
   - The system shall render a **Project Dashboard** showing Revenue vs Cost, Margin %, Budget vs Actual, and Burn Rate.
   - The system shall render a **Department Dashboard** aggregating Revenue, Cost, Utilization, Profit %, and MoM trends.
   - **[BA ASSUMPTION]** Dashboards will feature global filters for Fiscal Year, Month, and Quarter.

---

## Section 2: Gap Analysis Table

| # | Gap Identified | Resolution / Assumption | Impact |
| --- | --- | --- | --- |
| 1 | Where does the billing rate come from for T&M projects? | **[BA ASSUMPTION]** Added a new input: "Project Master Upload". It will contain the default Billing Rate for T&M projects. | Requires one additional data schema and upload UI mapping. |
| 2 | How is infra vendor cost captured? | **[BA ASSUMPTION]** Added a new input: "Monthly Expenses / Vendor Cost Upload" allowing Finance to record external infra costs against a Project ID. | Ensures precise margin calculation for Infra projects. |
| 3 | What happens when same-month data is re-uploaded? | **[BA ASSUMPTION]** The system will perform an **Upsert**. Existing records for the exact Month/Project/Employee combination will be overwritten to allow for data corrections. | Prevents double counting while allowing flexible data corrections. |
| 4 | How do we handle mid-month joiners? | **[BA ASSUMPTION]** The Employee Cost and expected Standard Working Hours are pro-rated based on `(Working Days Available / Total Month Working Days)`. | Prevents artificial utilization drops and skewed costs for new hires. |
| 5 | What about employees with 0 billable hours? | **[BA ASSUMPTION]** Their total calculated cost is treated as 100% non-billable. It rolls up into the Department's total cost, heavily pulling down department profitability. | Department heads get accurate visibility into bench strength costs. |
| 6 | How is non-billable cost allocated? | **[BA ASSUMPTION]** Non-billable cost is absorbed at the Department Level and Company Level as OPEX. It is *not* distributed across active client projects unless the person explicitly logged hours to that project. | Client project profitability remains pure; bench cost hits the department P&L. |
| 7 | What if an employee works on multiple projects? | **[BA ASSUMPTION]** Cost is distributed proportionally. Cost applied to Project A = `(Hours logged on Proj A * Employee Cost Per Hour)`. | Dynamic, granular accuracy in project costing. |
| 8 | What if a Fixed Cost project goes over budget? | **[BA ASSUMPTION]** Actual costs simply exceed the Fixed Contract Value. Profit becomes negative, Margin % becomes negative. Highlighted in RED in dashboards. | Provides immediate visibility into loss-making fixed bid projects. |
| 9 | How is "utilization %" calculated exactly? | **[BA ASSUMPTION]** Utilization % = `(Billable Hours / Total Expected Standard Hours) * 100`. Standard is 160 by default (pro-rated for partial months/leaves if recorded). | Standardization of efficiency tracking. |
| 10 | Is there a Project Master upload or are projects auto-created? | **[BA ASSUMPTION]** To ensure data integrity, a Project Master must be uploaded. Revenue/Timesheet uploads referring to a non-existent Project ID will be rejected. | Enforces strict referential integrity. |
| 11 | What about employee exits/terminations mid-year? | **[BA ASSUMPTION]** Employee Master gets an "Exit Date" column. Costs and standard hours for the exit month are pro-rated. No costs are attributed post-exit. | Eliminates ghost-costing in subsequent months. |
| 12 | What date range logic applies to dashboards? | **[BA ASSUMPTION]** The system operates on a Financial Fiscal Year (Apr 1 - Mar 31). Default dashboard view is current Fiscal YTD. | Aligns reporting with standard Indian/Global finance practices. |
| 13 | How do we handle currency? | **[BA ASSUMPTION]** All inputs and displays are strictly in Indian Rupees (INR / ₹) without multi-currency support for V1. | Drastically reduces calculation complexity and exchange rate tracking. |
| 14 | Audit trail requirements? | **[BA ASSUMPTION]** Every file upload, manual config change, and user role update is logged in an `Audit_Logs` table (Who, What, When). | Meets minimum security compliance standards. |
| 15 | Data retention policy? | **[BA ASSUMPTION]** Soft-delete is used for all records. Data is retained in the active DB for 7 years. | Ensures historical YoY comparisons function indefinitely. |

---

## Section 3: Business Rules

### 1. Cost Calculations
- **Employee Cost Per Hour** = `([Annual CTC] + [Annual Overhead]) / 12 / [Standard Working Hours]`
  - *Edge Case (Null/Zero CTC):* If Annual CTC is 0, user cost is only the overhead portion.
  - *Edge Case (Standard Hours = 0):* Cannot divide by zero. System will throw a validation error during upload if standard hours configure to zero.
  - *Edge Case (Mid-Month Joiner):* Standard Working Hours = `160 * (Days Active / Total Month Days)`.

### 2. Profitability Formulas
- **T&M Project Profit** = `Sum(Billed Hours × Billing Rate)` - `Sum(Logged Hours × Cost Per Hour)`
- **Fixed Cost Profit** = `[Fixed Contract Value]` - `Sum(Logged Project Hours × Cost Per Hour)`
  - *Edge Case:* If total logged cost > contract value, Profit is negative.
- **Infrastructure Profit** = `[Infra Invoice Amount]` - `([Actual Vendor Cost] + Sum(Logged Hours × Cost Per Hour))`
- **AMC Profit** = `[AMC Contract Value]` - `Sum(Support Hours × Cost Per Hour)`

### 3. Metric Calculations
- **Gross Margin %** = `([Revenue - Total Cost] / Revenue) * 100`
  - *Edge Case (Zero Revenue):* If Revenue is 0 and Cost > 0, system displays Margin as `-100%`. If both are 0, margin is `0%`.
- **Utilization %** = `(Total Billable Hours / Total Expected Standard Working Hours) * 100`
  - *Edge Case (Over-utilization):* If an employee logs 200 billable hours in a 160-hour month, utilization is 125%. System caps visual charts at 100% but shows actual value in tables.
- **Burn Rate (Fixed Cost Only)** = `(Total Cost Incurred to Date / Fixed Contract Value) * 100`
  - *Actionable metric:* If Burn Rate > 100%, project is loss-making.

---

## Section 4: Data Validation Rules

### 1. Employee Master (Yearly/Ad-hoc Upload)
| Field | Requirement | Validation |
| --- | --- | --- |
| Employee ID | Required | String, Unique, No duplicates in the sheet. |
| Department | Required | String, Must match a predefined system enum list. |
| Designation | Required | String. |
| Annual CTC | Required | Numeric, >= 0. |
| Billable Flag | Required | Boolean (TRUE/FALSE or Y/N). |
| Joining Date | Required | Valid Date format (YYYY-MM-DD). Cannot be in the future. |

### 2. Monthly Timesheet (Monthly Upload)
| Field | Requirement | Validation |
| --- | --- | --- |
| Employee ID | Required | String, cross-referenced (must exist in Employee Master). |
| Project ID | Required | String, cross-referenced (must exist in Project Master). |
| Billable Hours | Required | Numeric, >= 0. Warning if > 250/month. |
| Non-Billable | Required | Numeric, >= 0. |
| Month | Required | String in `YYYY-MM` format. |

### 3. Revenue / Billing Data (Monthly Upload)
| Field | Requirement | Validation |
| --- | --- | --- |
| Project ID | Required | String, cross-referenced (must exist in Project Master). Duplicates in the same month are aggregated. |
| Client Name | Required | String. |
| Invoice Amount | Required | Numeric, >= 0. |
| Invoice Date | Required | Valid Date format (YYYY-MM-DD). Month must map to upload target month. |
| Project Type | Required | Enum (T&M, Fixed Cost, Infrastructure, AMC). |
| Vertical | Optional | String enum (Municipal, Enterprise, AI, etc.). |

---

## Section 5: Non-Functional Requirements

1. **Performance Configuration**
   - The application dashboard landing pages must load in `< 2.0 seconds` for the 95th percentile of requests.
   - Bulk Excel uplods (e.g., parsing, validating, and inserting 1000 timesheet rows) must process within `< 30 seconds`.
2. **Security & Authentication**
   - Access is restricted via JWT tokens with a 4-hour expiration.
   - User passwords must be hashed utilizing bcrypt (Salt rounds >= 10).
   - Strict RBAC enforced at the API routing level (Node.js/Express middlewares).
   - Rate Limiting applied to upload and login endpoints (e.g., max 10 requests / min / IP).
3. **Scalability**
   - System must comfortably support database scaling for 200+ concurrent users, 500+ tracked employees, and 100+ active projects without architectural overhaul.
4. **Auditability & Logging**
   - Every POST/PUT/DELETE payload must be logged in the database (`audit_trails` table) capturing timestamp, User ID, and action performed.
5. **Browser & Platform Compatibility**
   - Fully optimized for desktop environments on Google Chrome, Mozilla Firefox, and Microsoft Edge (last 2 versions). Mobile responsiveness is secondary but gracefully degrades.

---

## Section 6: User Stories

### Admin
1. **As an Admin**, I want to create user accounts and assign roles so that team members can access the system.
2. **As an Admin**, I want to define the global default Standard Working Hours and Overhead Costs so that cost calculations are accurate.
3. **As an Admin**, I want to deactivate user access so that exiting employees immediately lose access to ProfitPulse.
4. **As an Admin**, I want to view the system audit trail so that I can track who modified data and when.
5. **As an Admin**, I want to upload a Project Master file so that the system recognizes valid projects during timesheet uploads.

### Finance
6. **As a Finance user**, I want to upload the Monthly Revenue Excel file so that billed invoice data is ingested into the system.
7. **As a Finance user**, I want to upload external vendor/infrastructure costs so that infra project margins are calculated properly.
8. **As a Finance user**, I want to view the Executive Dashboard so I can analyze Company-level gross margins and recognize YTD trends.
9. **As a Finance user**, I want to identify the top 5 and bottom 5 projects by margin so that I can advise management on contract renewals.
10. **As a Finance user**, I want to export any dashboard view to CSV so that I can perform offline reconciliation.

### Delivery Manager
11. **As a Delivery Manager**, I want to view the Project Dashboard for my assigned projects so that I can monitor my direct P&L.
12. **As a Delivery Manager**, I want to upload/approve team timesheets so that hours are correctly allocated to my projects.
13. **As a Delivery Manager**, I want to track the Burn Rate on Fixed Cost projects so that I prevent cost overruns.
14. **As a Delivery Manager**, I want to view the profitability margin percentage of each project so I know which accounts are highly lucrative.
15. **As a Delivery Manager**, I want to see the specific cost contributions of my team members on my projects so I can optimize team structures.

### Department Head
16. **As a Department Head**, I want to view the Department Dashboard so I can see my business unit's overall revenue vs cost.
17. **As a Department Head**, I want to view the Utilization % of my entire department so I can manage bench strength effectively.
18. **As a Department Head**, I want to see Month-over-Month (MoM) gross margin comparisons so I can trace business unit growth.
19. **As a Department Head**, I want to identify employees with 0 billable hours so that I can allocate them to training or internal R&D.
20. **As a Department Head**, I want to drill down into the Employee Dashboard for any individual in my department to evaluate their profitability footprint.

### HR
21. **As an HR user**, I want to upload the Annual Employee Master file so that Employee IDs, Departments, and CTCs are registered in the system.
22. **As an HR user**, I want to update an employee's profile to mark their Exit Date so that costs stop accumulating post-departure.
23. **As an HR user**, I want to review company-wide Employee Utilization Reports to assist in upcoming hiring capacity planning.
24. **As an HR user**, I want to view individual Employee Dashboards so I can discuss performance and profitability rankings during appraisals.
25. **As an HR user**, I want the system to reject Employee Master files with duplicate IDs so that database integrity is maintained.

---

## Section 7: Acceptance Criteria (Top 12 User Stories)

| # | Story | Acceptance Criteria |
| --- | --- | --- |
| 1 | Admin: Define standard hours/overhead | **Given** the Admin is on the settings page, **When** they update "Default Overhead" to ₹2,00,000 and click Save, **Then** all future employee cost-per-hour calculations use the new value, **And** historical calculations remain unaffected. |
| 2 | Finance: Upload Revenue Data | **Given** Finance selects a correctly formatted Revenue Excel file, **When** they click Upload, **Then** the system validates Project IDs within < 30s, maps the invoice amounts, and displays a "Success" count. |
| 3 | Finance: Revenue File Validation | **Given** an uploaded file contains a Project ID not in the Project Master, **When** the upload runs, **Then** the process fails entirely, and the UI highlights the specific row/Project ID causing the mismatch. |
| 4 | Exec Dashboard: Top/Bottom Projects | **Given** the Finance user opens the Executive Dashboard, **When** data is rendered, **Then** there are two distinct tables displaying exactly 5 projects with highest Margin % and 5 with lowest/negative Margin %. |
| 5 | Del. Manager: Fixed Cost Burn Rate | **Given** a Fixed Cost project with ₹10,00,000 budget, **When** internal team hour costs reach ₹11,00,000, **Then** the Burn Rate metric displays "110%", highlighted in red. |
| 6 | HR: Upload Employee Master | **Given** an HR user uploads a CSV/Excel with CTC data, **When** processed, **Then** the system calculates `(CTC + Overhead) / 12 / 160` and stores the resultant `Cost_Per_Hour`. |
| 7 | Dept Head: Utilization Tracking | **Given** an employee has logged 120 billable hours out of 160 standard hours, **When** the Dept Head views the dept utilization list, **Then** the employee's utilization renders as exactly "75%". |
| 8 | Dept Head: Non-Billable Bench | **Given** an employee logs 0 billable and 160 non-billable hours, **When** the Department Dashboard renders, **Then** the employee’s entire cost is deducted from the Department's total profit. |
| 9 | Multi-Project Allocation | **Given** Employee A splits hours 50/50 between Project X and Y, **When** the Profitability is calculated, **Then** 50% of Employee A's monthly cost is subtracted from Project X, and 50% from Project Y. |
| 10 | Upsert Timesheets | **Given** a Timesheet for Jan 2026 is uploaded twice, **When** the second file is processed, **Then** the system overwrites the Jan 2026 hours for matched employees instead of adding them together. |
| 11 | RBAC: Restrict unauthorized views | **Given** a Delivery Manager logs in, **When** they attempt to hit the HR API endpoint for CTC data, **Then** the system responds with `403 Forbidden`. |
| 12 | HR: Pro-rate partial month joiners | **Given** Employee B joins on the 15th of a 30-day month, **When** HR creates the record, **Then** standard expected hours are calculated as `160 * 0.5 = 80`. |

---

## Section 8: Glossary

- **Admin / RBAC:** Role-Based Access Control; system mechanism dictating what screens/data a user can see based on their profile.
- **AMC (Annual Maintenance Contract):** A project type billed annually for providing continuous support.
- **Billable Hours:** Time logged by an employee directly correlated with client invoice generation.
- **Burn Rate:** The speed at which a project consumes its allocated financial budget. Calculated as Cost to-date / Fixed Budget.
- **CTC (Cost to Company):** Total annual gross salary block including strict base pay, allowances, and statutory company contributions for an employee.
- **Fixed Cost (Fixed Price):** A project billed at a flat pre-agreed rate, regardless of the actual hours taken by the team to deliver it.
- **Gross Margin:** The financial metric indicating profitability. Formula: (Revenue - Cost of Goods/Services Sold) / Revenue.
- **MoM (Month-over-Month):** Comparison metric showing the change corresponding to the immediate previous month.
- **Non-Billable Hours:** Time logged for internal meetings, training, bench time, or pre-sales which cannot be invoiced to a client.
- **Overhead Cost:** Indirect facility, operational, software, and administrative costs distributed across employees as a portion of their total hourly cost.
- **T&M (Time & Materials):** A project billing model where the client pays for exact hours worked multiplied by an agreed external billing rate.
- **Utilization:** The percentage measure of an employee's billable and productive time against their available standard working hours.
- **Vertical:** Industry sector categorization for projects (e.g., Enterprise, Municipal, AI, FinTech).
- **YTD (Year-to-Date):** Accumulation of data from the start of the current financial year up to the present date.
