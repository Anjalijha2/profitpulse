# ProfitPulse

**ProfitPulse** is a comprehensive Profitability Intelligence System designed to provide deep insights into project, employee, and department-level profitability. It features a robust Role-Based Access Control (RBAC) system, dynamic dashboards, and high-performance data processing.

---

## 🏗 Project Structure

The project is structured as a monorepo containing both the frontend and backend:

- **`/profitpulse-frontend`**: React + Vite application with Ant Design and Tailwind CSS.
- **`/profitpulse-backend`**: Node.js + Express API with Sequelize ORM and MySQL.
- **`/docs`**: System Requirements and further documentation.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **State Management:** Zustand (with Persistence)
- **Data Fetching:** TanStack Query (React Query)
- **UI Components:** Ant Design (v5)
- **Icons:** Lucide React
- **Styling:** Vanilla CSS + Modern CSS Variables

### Backend
- **Runtime:** Node.js (ESM)
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Security:** JWT Authentication, Helmet, Rate Limiting, RBAC Middleware
- **Documentation:** Swagger (OpenAPI)

---

## 🛠 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MySQL](https://www.mysql.com/) (v8.0+)

### 1. Clone the repository
```bash
git clone https://github.com/Anjalijha2/profitpulse.git
cd profitpulse
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd profitpulse-backend
   npm install
   ```
2. Create clinical database in MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS profitpulse_db;
   ```
3. Configure your environment:
   Create a `.env` file in `/profitpulse-backend` based on the provided configuration (ensure `DB_USER` and `DB_PASSWORD` are correct).
4. Initialize the database (Sync models & Seed Admin):
   ```bash
   node sync.js
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../profitpulse-frontend
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

---

## 🔐 Authentication & RBAC

ProfitPulse features a dynamic **Role-Based Access Control** system. Administrators can configure portal access for the following roles via the UI at `/admin/rbac`:
- **Finance**
- **Delivery Manager**
- **Dept Head**
- **HR**

### Default Admin Credentials
- **Email:** `admin@profitpulse.com`
- **Password:** `Admin@123`

---

## ✨ Features
- **Dynamic Dashboards:** Executive, Project, Employee, and Department-level views.
- **Data Hub:** Centralized management for employee, project, and revenue data.
- **Role-Based Access:** Fine-grained control over visibility and functionality.
- **Audit Logs:** Full tracking of administrative actions.
- **Excel Center:** High-performance data ingestion with validation.
- **Responsive UI:** Optimized for various devices with a premium look and feel.

---

## 📖 Documentation
Backend API documentation is available at `http://localhost:5000/api-docs` when the server is running.
Detailed System Requirements (SRD) can be found in `/docs/SRD_ProfitPulse.md`.
