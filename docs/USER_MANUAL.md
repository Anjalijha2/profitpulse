# ProfitPulse User Manual & Testing Guide

Welcome to the **ProfitPulse** End-User Manual. Use this guide to understand the application's functionality, its core financial calculations, and how to verify its accuracy during testing.

---

## 📑 Table of Contents
1. [Core Calculations & Logic](#core-calculations--logic)
2. [Module Overview](#module-overview)
3. [End-to-End Testing Scenarios](#end-to-end-testing-scenarios)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Data Integrity & Upload Center](#data-integrity--upload-center)

---

## 🧮 Core Calculations & Logic

ProfitPulse uses standard financial formulas to track project and employee profitability.

### 1. Employee Hourly Cost
Every employee's cost to the company is calculated based on their Annual CTC (Cost to Company), overheads, and standard working hours.
> **Formula:** `(Annual CTC + Overhead Cost Per Year) / 12 / Standard Monthly Hours`
> *   **Annual CTC:** From Employee records.
> *   **Overhead:** Global or department-level overhead (Configurable in System Config).
> *   **Standard Hours:** Usually set to 160 hours/month.

### 2. Project Revenue (T&M)
For Time & Material (T&M) projects, revenue is derived from billable hours logged.
> **Formula:** `Billed Hours × Project Billing Rate`

### 3. Project Cost
> **Formula:** `Logged Hours × Employee Hourly Cost`
> *   *Note:* Total hours include both billable and non-billable for cost reflection.

### 4. Profit & Net Margin
> **Profit:** `Revenue - Cost`
> **Margin (%):** `(Profit / Revenue) × 100`

### 5. Resource Utilization
Measures how much of an employee's time is being billed to clients.
> **Formula:** `(Billable Hours / Standard Monthly Hours) × 100`

---

## 🚀 Module Overview

### 1. Dashboards
*   **Executive Dashboard:** High-level view of company revenue, total cost, and average margin. Includes Trend analysis (Month-over-Month changes) and Top/Bottom 5 projects by margin.
*   **Employee Dashboard:** Individual performance metrics. Ranks employees by profit contribution and shows their utilization percentage.
*   **Project Dashboard:** Drill-down into specific project verticals (e.g., Software, Testing) and project status.
*   **Client Dashboard:** Aggregates health metrics at the client level.

### 2. Data Hub
*   **Upload Center:** The "Heart" of the data. Admin/HR can upload CSV/Excel files for:
    *   **Employees:** Master list with CTC details.
    *   **Timesheets:** Logged hours per project.
    *   **Revenue:** Client invoices.
*   **Resource Lists:** CRUD (Create, Read, Update, Delete) views for Employees and Projects.

### 3. Administration
*   **User Management:** Manage application users and their roles.
*   **Role Access Config:** Toggle portal sections ON/OFF for different roles (Finance, Delivery Mgr, Dept Head, HR).
*   **System Config:** Global settings like standard monthly hours and overhead costs.

---

## 🧪 End-to-End Testing Scenarios

Use these steps to verify "Happy Path" functionality:

### Scenario A: New Employee Onboarding & Revenue Loop
1.  **Login** as Admin.
2.  Go to **Resource Management → Employees** and add a new employee with a specific CTC.
3.  Go to **Upload Center** and upload a Timesheet for this employee against an existing T&M Project.
4.  Upload a Revenue record for that project in the same month.
5.  **Verify:** Navigate to **Employee Dashboard**. Confirm the new employee is visible, their cost is calculated correctly (Formula 1), and their margin is displayed.

### Scenario B: RBAC Restriction Testing
1.  As Admin, go to **Administration → Role Access Config**.
2.  Turn **OFF** the "Executive Dashboard" for the "HR" Role.
3.  Logout and **Login as HR**.
4.  **Verify:** The "Executive" link in the sidebar should be hidden, and manual navigation to `/dashboard/executive` should return a **403 Forbidden** page.

---

## 🔐 Role-Based Access Control (RBAC)

| Role | Primary Purpose | Key Permissions |
|---|---|---|
| **System Admin** | Global oversight | All modules, System Config, RBAC management. |
| **Finance** | Financial health | Revenue tracking, Executive Dashboard, Financial Reports. |
| **Delivery Mgr** | Project health | Focuses on Project Dashboards for their assigned projects. |
| **Dept Head** | Dept efficiency | Focuses on Employee Dashboard for their department members. |
| **HR** | Resource management | Employee data, Timesheet uploads, Utilization reports. |

---

## 📂 Data Integrity & Upload Center

When testing the **Upload Center**, always verify:
1.  **File Format Validation:** Attempt to upload a non-CSV file to ensure the system rejects it.
2.  **Schema Matching:** Ensure the columns in your file match the required headers (Refer to Sample Templates available in the UI).
3.  **Error Handling:** If a timesheet refers to a non-existent Employee Code, the system should flag an error before processing.
4.  **Audit Logs:** Every successful upload and critical code change is logged in **Administration → Audit Log**. Check this after every major action to ensure traceability.

---

*Manual version: 1.2 — 2026-02-25 | ProfitPulse Quality Assurance Team*
