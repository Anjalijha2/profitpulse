# ProfitPulse — Project Walkthrough & Technical Summary

This document provides a comprehensive overview of the ProfitPulse project, its restoration, and final QA status as of February 26, 2026.

---

## 🚀 1. Project Overview
**ProfitPulse** is a financial intelligence platform that calculates and visualizes profitability across:
- **Projects**: (T&M, Fixed Cost, Infrastructure, AMC)
- **Employees**: (Billable vs Non-Billable, Utilization)
- **Departments**: (Engineering, Sales, HR, etc.)
- **Clients**: (Aggregated health metrics)

---

## 🛠 2. Technical Restoration (The "Fix-It" Phase)

The project underwent a significant stabilization phase where several critical "Internal Server Error" (500) blockers and UI bugs were resolved.

### 🐞 Bug Fix Summary
| Bug ID | Description | Resolution |
|---|---|---|
| **BUG-001** | Executive Dashboard 500 Error | Corrected date parsing logic in `dashboard.service.js` to handle `YYYY-MM` format. |
| **BUG-002** | Report Center 500 on Download | Fixed SQL error where the `month` column was incorrectly used in filters. |
| **BUG-003** | Backend Process Hang | Identified and killed zombie processes on Port 5000; stabilized startup scripts. |
| **BUG-004** | Sidebar/Data Rendering Fails | Updated frontend to correctly access `response.data.items` and switched to unified `axiosInstance`. |
| **BUG-005** | Missing Report Filters | Improved `ReportCenter.jsx` to correctly pass query parameters for month filtering. |
| **BUG-006** | Hardcoded Trend Labels | Implemented dynamic MoM (Month-over-Month) trend calculations in the backend. |

---

## 🏗 3. System Architecture

### Backend (Node.js/Express)
- **Services Layer**: Business logic (e.g., `dashboard.service.js`) handles complex SQLite/MySQL aggregations.
- **Formulas**: Centralized in `calculations.js` for consistency.
- **RBAC**: Middleware-driven authorization based on JWT roles.

### Frontend (React/Vite)
- **State**: `Zustand` for persistence (e.g., keeping the user logged in and maintaining the selected month).
- **Queries**: `TanStack Query` for high-performance data fetching and caching.
- **UI**: `Ant Design 5.0` with custom CSS variables for a premium "Glassmorphism" look.

---

## 🧪 4. Final QA Status

- **Core Stability**: 100% (No persistent 500 errors).
- **Data Integrity**: Verified formula accuracy for Cost/hr and Net Margin.
- **Documentation**: 
    - [System Requirements (SRD)](SRD_ProfitPulse.md)
    - [Master Test Cases](TEST_CASES.md)
    - [User Manual](USER_MANUAL.md)
    - [Testing Management Hub](TESTING_MANAGEMENT.md)
- **Status Report**: [QA_STATUS_REPORT.md](QA_STATUS_REPORT.md) — **Status: COMPLETE**.

---

## 🏃 5. How to Run & Verify

1.  **Backend**:
    ```bash
    cd profitpulse-backend
    npm run dev  # Starts on Port 5000
    ```
2.  **Frontend**:
    ```bash
    cd profitpulse-frontend
    npm run dev  # Starts on Port 5173
    ```
3.  **Verify**: Login with `admin@profitpulse.com` / `Admin@123` and navigate to the **Executive Dashboard**. Confirm that the KPIs show dynamic data and trend percentages (e.g., "+5% vs Prev").

---
*Created by: Antigravity AI | Date: February 26, 2026*
