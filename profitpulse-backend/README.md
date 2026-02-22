# ProfitPulse Backend

## Overview
ProfitPulse is an internal profitability intelligence system backend built with Node.js, Express, Sequelize, and MySQL.

## Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)

## Setup

1. **Install dependencies**
   ```bash
   cd profitpulse-backend
   npm install
   ```

2. **Configure Database**
   Create a schema in your MySQL server:
   ```sql
   CREATE DATABASE IF NOT EXISTS profitpulse_db;
   ```
   Ensure `.env` has the correct `DB_USER` and `DB_PASSWORD`.

3. **Initialize Database**
   Since the models are fully defined with associations, run the sync script to automatically create tables and seed the Admin user.
   ```bash
   node sync.js
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## Admin Login
- Email: `admin@profitpulse.com`
- Password: `Admin@123`

## Features Included
- ESM Strict Modules architecture
- RBAC Middleware properly scoped
- Transactional Excel Uploads with Upsert logic
- Complex margin, profitability, and burn rate pure functions
- Joi validation & Winston logging
- Rate limiting, compression & helmet standard security measures

Documentation is available at `http://localhost:5000/api-docs` once running.
