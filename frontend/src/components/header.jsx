import {
    UserCircle,
    Settings,
    LogOut
} from "lucide-react";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
    const [open, setOpen] = useState(false);
    const [admin, setAdmin] = useState({
        name: "Administrator",
        email: "admin@warehouse.local"
    });

    const navigate = useNavigate();
    const menuRef = useRef();

    // Load admin profile from localStorage
    useEffect(() => {
        try {
            const storedAdmin = localStorage.getItem("admin");
            if (storedAdmin) {
                const parsed = JSON.parse(storedAdmin);
                if (parsed && (parsed.name || parsed.email)) {
                    setAdmin({
                        name: parsed.name || "Administrator",
                        email: parsed.email || "admin@warehouse.local"
                    });
                }
            }
        } catch (e) {
            console.error("Error reading admin profile in header:", e);
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        navigate("/login");
    };

    return (
        <header className="header">
            <div>
                <h2>Warehouse Dashboard</h2>
                <p>Monitor your inventory and AI insights in real-time</p>
            </div>

            <div className="header-right">
                <div
                    className="profile-wrapper"
                    ref={menuRef}
                >
                    <div
                        className="profile-trigger"
                        onClick={() => setOpen(!open)}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                    >
                        <UserCircle
                            size={44}
                            className="profile-icon"
                        />
                        <div className="profile-badge-text" style={{ textAlign: "left" }}>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>
                                {admin.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                Admin
                            </div>
                        </div>
                    </div>

                    {open && (
                        <div className="profile-menu">
                            <h3>{admin.name}</h3>
                            <p>{admin.email}</p>

                            <button
                                onClick={() => {
                                    navigate("/account");
                                    setOpen(false);
                                }}
                            >
                                <Settings size={18} />
                                Account Settings
                            </button>

                            <button
                                className="logout"
                                onClick={logout}
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
