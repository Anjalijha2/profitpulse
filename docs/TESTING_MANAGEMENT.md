# 🧪 Testing Management

Welcome to the **ProfitPulse Testing Management** hub. This document serves as the central point for all Quality Assurance (QA) activities, documentation, and artifacts related to the project.

---

## 📋 Table of Contents
1. [Test Documentation](#test-documentation)
2. [Test Cases & Scenarios](#test-cases--scenarios)
3. [Bug Tracking](#bug-tracking)
4. [Automation Testing](#automation-testing)
5. [Test Data](#test-data)
6. [QA Status Reports](#qa-status-reports)

---

## 📄 Test Documentation
Overview and strategic documents for testing.
- **System Requirements Document**: [SRD_ProfitPulse.md](SRD_ProfitPulse.md) - Contains the foundational requirements being tested.
- **User Manual & Testing Guide**: [USER_MANUAL.md](USER_MANUAL.md) - **(New)** Comprehensive guide on calculations, functionality, and manual E2E testing scenarios.

## ✅ Test Cases & Scenarios
Detailed test cases covering various modules (Admin, HR, Employee).
- **Master Test Cases**: [TEST_CASES.md](TEST_CASES.md) - Comprehensive list of manual and functional test cases.

## 🐞 Bug Tracking
Monitoring and resolution of identified issues.
- **Bug Tracker**: [BUG_TRACKER.md](BUG_TRACKER.md) - Active list of bugs, their status, and resolution details.

## 🤖 Automation Testing
Scripts and configurations for automated verification.
- **Playwright Config**: [playwright.config.js](../playwright.config.js)
- **Test Scripts**: [tests/](../tests/) - Directory containing automated test specifications.
  - [example.spec.js](../tests/example.spec.js)
- **Execution Command**:
  ```bash
  npx playwright test
  ```

## 📊 Test Data
Resources used for simulating real-world scenarios.
- **Login Credentials**: [login_data.json](../login_data.json) - Mock credentials used for automated and manual testing.

## 📈 QA Status Reports
Summary of testing progress and final sign-offs.
- **QA Status Report**: [QA_STATUS_REPORT.md](QA_STATUS_REPORT.md) - Final summary of the QA cycle completion.
- **Project Walkthrough**: [WALKTHROUGH.md](WALKTHROUGH.md) - Tech summary and bug fix logs.

---

## 🛠️ How to Contribute to Testing
1. **Reporting Bugs**: Add new entries to [BUG_TRACKER.md](BUG_TRACKER.md) with steps to reproduce.
2. **Adding Test Cases**: Update [TEST_CASES.md](TEST_CASES.md) when new features are implemented.
3. **Running Automation**: Ensure all tests pass before submitting PRs.
