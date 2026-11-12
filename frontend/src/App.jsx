import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Predictions from "./pages/Predictions";
import Analytics from "./pages/Analytics";
import Account from "./pages/Account";

import Sidebar from "./components/sidebar";
import Header from "./components/header";

import "./App.css";

function ProtectedLayout({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <Header />
                {children}
            </div>
        </div>
    );
}

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedLayout>
                        <Dashboard />
                    </ProtectedLayout>
                }
            />

            <Route
                path="/inventory"
                element={
                    <ProtectedLayout>
                        <Inventory />
                    </ProtectedLayout>
                }
            />

            <Route
                path="/predictions"
                element={
                    <ProtectedLayout>
                        <Predictions />
                    </ProtectedLayout>
                }
            />

            <Route
                path="/analytics"
                element={
                    <ProtectedLayout>
                        <Analytics />
                    </ProtectedLayout>
                }
            />

            <Route
                path="/account"
                element={
                    <ProtectedLayout>
                        <Account />
                    </ProtectedLayout>
                }
            />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
