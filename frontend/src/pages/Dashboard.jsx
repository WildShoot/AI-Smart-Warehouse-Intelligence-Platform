import { useEffect, useState } from "react";
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Layers,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/statcard";
import { getDashboardAnalytics } from "../services/api";
import "./Dashboard.css";

const CATEGORY_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#ea580c",
  "#0891b2",
  "#db2777"
];

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardAnalytics();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to fetch warehouse data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="dash-spinner"></div>
          <h2>Loading warehouse data...</h2>
          <p>Connecting to backend and aggregating real-time inventory statistics.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <AlertTriangle size={40} color="#dc2626" />
          <h2>Error loading dashboard</h2>
          <p>{error}</p>
          <button className="dash-retry-btn" onClick={fetchDashboardData}>
            <RefreshCw size={15} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.overview || {};
  const categories = dashboardData?.category_analysis || [];
  const topProducts = dashboardData?.top_valuable_products || [];

  const healthScore = overview.warehouse_health_score ?? 100;

  // Determine health status color & label
  let healthColor = "#10b981";
  let healthLabel = "Optimal Status";
  if (healthScore < 50) {
    healthColor = "#dc2626";
    healthLabel = "Critical Shortage";
  } else if (healthScore < 80) {
    healthColor = "#f59e0b";
    healthLabel = "Attention Required";
  }

  const maxCatValue = categories.reduce((max, c) => Math.max(max, c.total_value || 0), 1);

  return (
    <div className="dashboard">
      {/* Title & Welcome */}
      <div className="dashboard-title">
        <div className="dashboard-header-row">
          <div>
            <h1>AI Smart Warehouse Intelligence Platform</h1>
            <p>Real-time inventory monitoring, category telemetry, and machine learning insights</p>
          </div>
          <div className="header-badges">
            <span className="system-live-pill">
              <span className="pulse-dot"></span> System Online
            </span>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={overview.total_products || 0}
          icon={<Package size={25} />}
          color="#2563eb"
        />

        <StatCard
          title="Total Quantity"
          value={(overview.total_quantity || 0).toLocaleString()}
          icon={<Boxes size={25} />}
          color="#7c3aed"
        />

        <StatCard
          title="Inventory Value"
          value={`₹ ${(overview.total_inventory_value || 0).toLocaleString()}`}
          icon={<IndianRupee size={25} />}
          color="#059669"
        />

        <StatCard
          title="Low Stock Items"
          value={overview.low_stock_count || 0}
          icon={<AlertTriangle size={25} />}
          color="#dc2626"
        />

        <StatCard
          title="Warehouse Health"
          value={`${healthScore}%`}
          icon={<Activity size={25} />}
          color="#ea580c"
        />
      </div>

      {/* AI Intelligence Action Banner */}
      <div className="ai-banner-card">
        <div className="ai-banner-left">
          <div className="ai-icon-circle">
            <Brain size={28} />
          </div>
          <div>
            <h3>AI Predictive Replenishment Engine</h3>
            <p>
              Autonomous model scanning SKU depletion velocities, safety stock buffers, and reorder levels.
            </p>
          </div>
        </div>
        <Link to="/predictions" className="ai-banner-btn">
          View AI Predictions <ArrowRight size={16} />
        </Link>
      </div>

      {/* Visual Analytics Sections Grid */}
      <div className="dash-sections-grid">
        {/* Category Overview Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <Layers size={18} className="text-blue" />
              <h3>Category Valuation</h3>
            </div>
            <Link to="/analytics" className="dash-card-link">
              Detailed Analytics <ArrowRight size={14} />
            </Link>
          </div>

          <div className="dash-category-list">
            {categories.length > 0 ? (
              categories.slice(0, 5).map((cat, idx) => {
                const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                const barWidth = ((cat.total_value || 0) / maxCatValue) * 100;
                return (
                  <div key={cat.category || idx} className="dash-cat-row">
                    <div className="dash-cat-info">
                      <span className="dash-cat-name">
                        <span className="dot" style={{ backgroundColor: color }}></span>
                        {cat.category}
                      </span>
                      <span className="dash-cat-val">
                        ₹ {cat.total_value.toLocaleString()}
                      </span>
                    </div>
                    <div className="dash-cat-track">
                      <div
                        className="dash-cat-fill"
                        style={{ width: `${barWidth}%`, backgroundColor: color }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-data-text">No category data available.</p>
            )}
          </div>
        </div>

        {/* Operational Health & Alert Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <ShieldCheck size={18} className="text-green" />
              <h3>Operational Health & Stock Alerts</h3>
            </div>
            <Link to="/inventory" className="dash-card-link">
              Manage Stock <ArrowRight size={14} />
            </Link>
          </div>

          <div className="health-gauge-box">
            <div
              className="health-circle-meter"
              style={{
                background: `conic-gradient(${healthColor} ${healthScore}%, #f3f4f6 ${healthScore}% 100%)`
              }}
            >
              <div className="health-circle-inner">
                <span className="gauge-score">{healthScore}%</span>
                <span className="gauge-label">{healthLabel}</span>
              </div>
            </div>

            <div className="alerts-summary-box">
              {overview.low_stock_count > 0 ? (
                <div className="alert-item alert-warning">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>{overview.low_stock_count} SKUs below minimum stock</strong>
                    <p>Immediate purchase or transfer order recommended to prevent stockouts.</p>
                  </div>
                </div>
              ) : (
                <div className="alert-item alert-success">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>All stock levels within safe limits</strong>
                    <p>No critical shortage detected across any registered warehouse SKU.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Valuable Products Quick View */}
      {topProducts.length > 0 && (
        <div className="dash-card top-assets-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <TrendingUp size={18} className="text-emerald" />
              <h3>Top Capital Assets by Valuation</h3>
            </div>
            <Link to="/analytics" className="dash-card-link">
              Full Breakdown <ArrowRight size={14} />
            </Link>
          </div>

          <div className="top-assets-grid">
            {topProducts.slice(0, 4).map((prod, idx) => (
              <div key={prod.sku || idx} className="asset-mini-card">
                <div className="asset-rank">#{idx + 1}</div>
                <div className="asset-details">
                  <span className="asset-name">{prod.product_name}</span>
                  <span className="asset-sku">{prod.sku}</span>
                </div>
                <div className="asset-valuation">
                  ₹ {prod.inventory_value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
