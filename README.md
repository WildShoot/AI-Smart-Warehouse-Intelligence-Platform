# 🏢 AI Smart Warehouse Intelligence Platform

An enterprise-grade, full-stack warehouse intelligence system powered by Flask, MongoDB, and React. Delivers real-time inventory monitoring, category analytics, and automated machine learning reorder recommendations.

---

## ✨ Features & Architecture

### 1. 🤖 AI Predictive Stock Health & Reorder Intelligence (`/predictions`)
- **Automated Replenishment Predictions**: Evaluates current stock against dynamic safety buffer levels.
- **Risk Classification Badges**: Categorizes every SKU into `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW` risk.
- **Stock Health Scoring**: Visual score gauges (0-100%) indicating stock sufficiency.
- **Recommended Order Calculation**: Calculates exact reorder quantities based on buffer multipliers.
- **Filtering & Search**: Live SKU search and risk level chips for rapid triage.

### 2. 📊 Real-Time Warehouse Analytics (`/analytics`)
- **Comprehensive KPI Telemetry**: Total catalog SKUs, physical stock unit count, cumulative valuation (₹), low-stock count, and health index.
- **Category Valuation Breakdown**: Visual proportional progress bars comparing capital invested across categories.
- **Portfolio Share Donut Chart**: Dynamic CSS conic-gradient asset breakdown with legend and percentage distributions.
- **High-Value Asset Leaderboard**: Top products ranked by capital allocation (#1 Gold, #2 Silver, #3 Bronze).

### 3. 📦 Inventory Management (`/inventory`)
- Full CRUD operations: Create, Read, Update, and Delete products with SKU keys.
- Real-time stock status badges (`Healthy` vs `Low Stock`).
- Modal forms with client and server-side validation.

### 4. 🎛️ Executive Intelligence Dashboard (`/`)
- 5 Key KPI cards with icon indicators.
- Circular Operational Health Gauge with dynamic color thresholds.
- Low stock and critical alert messaging with direct action links.
- AI Replenishment action banner.

### 5. 🔐 Security & Administration (`/login`, `/register`, `/account`)
- JWT-based authentication (`flask_jwt_extended`).
- Protected React routing with session verification.
- Dynamic administrator profile menu in the header.
- Password change and profile management.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)

---

### Backend Setup

1. **Activate Virtual Environment** (from project root):
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

2. **Navigate to Backend**:
   ```powershell
   cd backend
   ```

3. **Install Requirements** (if not already installed):
   ```powershell
   pip install -r requirements.txt
   ```

4. **Environment Variables** (`backend/.env`):
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=Warehouse
   DATABASE_NAME=smart_warehouse
   JWT_SECRET_KEY=smart_warehouse_super_secret_key_2026
   ```
   > **Note**: If remote MongoDB Atlas is temporarily unreachable, the platform automatically and gracefully falls back to a fast local store, pre-populated with realistic warehouse demo data!

5. **Start Flask API Server**:
   ```powershell
   python app.py
   ```
   Backend will start at: `http://127.0.0.1:5000`

---

### Frontend Setup

1. **Navigate to Frontend**:
   ```powershell
   cd frontend
   ```

2. **Install Dependencies**:
   ```powershell
   npm install
   ```

3. **Launch Development Server**:
   ```powershell
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔑 Default Administrator Credentials

When starting with seeded demo data:
- **Email**: `deepmalya.football@gmail.com`
- **Password**: `admin123`

*(You can also click **Create New Account** on the login page to register any new administrator)*

---

## 📡 API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new administrator |
| `POST` | `/api/auth/login` | Log in and receive JWT token |
| `GET` | `/api/auth/profile` | Retrieve current admin profile |
| `PUT` | `/api/auth/change-password` | Update account password |
| `GET` | `/api/products` | Retrieve all inventory products |
| `POST` | `/api/products` | Add a new product to inventory |
| `GET` | `/api/products/<sku>` | Retrieve single product by SKU |
| `PUT` | `/api/products/<sku>` | Update existing product |
| `DELETE` | `/api/products/<sku>` | Remove product from inventory |
| `GET` | `/api/inventory/summary` | Low stock and inventory summary |
| `GET` | `/api/analytics/dashboard` | Category and overview metrics |
| `GET` | `/api/ai/reorder-predictions` | Machine learning reorder predictions |
