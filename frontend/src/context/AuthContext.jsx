import { createContext, useContext, useState, useEffect } from "react";
import { loginAdmin as apiLogin } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem("admin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep localStorage in sync if state changes
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (admin) {
      localStorage.setItem("admin", JSON.stringify(admin));
    } else {
      localStorage.removeItem("admin");
    }
  }, [token, admin]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data && data.access_token) {
        setToken(data.access_token);
        setAdmin(data.admin);
        return { success: true, data };
      }
      throw new Error(data.message || "Login failed");
    } catch (err) {
      return { success: false, error: err.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
  };

  const updateAdminProfile = (updatedFields) => {
    setAdmin((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const value = {
    token,
    admin,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
    updateAdminProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
