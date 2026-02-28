# ProfitPulse Bug Tracker

| Bug ID | Severity | Description | Root Cause | Status | Fix Details |
|---|---|---|---|---|---|
| BUG-001 | High | `getExecutiveDashboard` 500 on `YYYY-MM` month param. | Incorrect date parsing logic. | Fixed | Corrected logic in `dashboard.service.js`. |
| BUG-002 | High | `generateProjectReport` 500 error. | Forbidden column `month` in `Project.findAll`. | Fixed | Exfiltrated `month` from filters in `report.service.js`. |
| BUG-003 | High | `/dashboard/project` 500 error. | Process hang/Zombie process on port 5000. | Fixed | Killed PID 26572 and restarted server. |
| BUG-004 | High | `Employees.jsx` & `Projects.jsx` data rendering fail. | Incorrect property access (`response.data.items`). | Fixed | Updated property access and switched to `axiosInstance`. |
| BUG-005 | High | `ReportCenter.jsx` missing filters in API call. | Params not passed to `axiosInstance`. | Fixed | Updated `ReportCenter.jsx` to pass months in params. |
| BUG-006 | Low | `ExecutiveDashboard.jsx` hardcoded trend labels. | UI lacks trend calculation logic. | Fixed | Implemented MoM trend calculation in `dashboard.service.js` and updated UI to use dynamic data. |
