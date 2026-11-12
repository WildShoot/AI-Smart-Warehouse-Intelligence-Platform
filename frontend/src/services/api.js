const BASE_URL = "http://127.0.0.1:5000/api";

/**
 * Returns common authentication and content-type headers using the stored JWT token.
 */
export const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Central API request wrapper with automatic auth header injection and session expiry handling.
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = getAuthHeaders(options.headers || {});

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  // If token is invalid or expired
  if (response.status === 401 || response.status === 422) {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    // Trigger redirect to login if not already on login/register page
    if (
      !window.location.pathname.includes("/login") &&
      !window.location.pathname.includes("/register")
    ) {
      window.location.href = "/login";
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.msg || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ==========================================
// Authentication APIs
// ==========================================

export const loginAdmin = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Invalid credentials");
  }
  return data;
};

export const registerAdmin = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

export const getAdminProfile = async () => {
  return apiRequest("/auth/profile", { method: "GET" });
};

export const updatePassword = async (oldPassword, newPassword) => {
  return apiRequest("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });
};

// ==========================================
// Products & Inventory APIs
// ==========================================

export const getProducts = async () => {
  return apiRequest("/products", { method: "GET" });
};

export const getProductBySku = async (sku) => {
  return apiRequest(`/products/${sku}`, { method: "GET" });
};

export const createProduct = async (productData) => {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (sku, productData) => {
  return apiRequest(`/products/${sku}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (sku) => {
  return apiRequest(`/products/${sku}`, {
    method: "DELETE",
  });
};

export const getInventorySummary = async () => {
  return apiRequest("/inventory/summary", { method: "GET" });
};

// ==========================================
// Analytics & AI APIs
// ==========================================

export const getDashboardAnalytics = async () => {
  return apiRequest("/analytics/dashboard", { method: "GET" });
};

export const getReorderPredictions = async () => {
  return apiRequest("/ai/reorder-predictions", { method: "GET" });
};

export default {
  apiRequest,
  getAuthHeaders,
  loginAdmin,
  registerAdmin,
  getAdminProfile,
  updatePassword,
  getProducts,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventorySummary,
  getDashboardAnalytics,
  getReorderPredictions,
};
