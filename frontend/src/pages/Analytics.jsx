import { useEffect, useState } from "react";
import {
  BarChart3,
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  Activity,
  RefreshCw,
  TrendingUp,
  PieChart,
  Award,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardAnalytics } from "../services/api";
import "./Analytics.css";

const PALETTE = [
  "#2563eb", // Royal Blue
  "#7c3aed", // Violet
  "#059669", // Emerald
  "#ea580c", // Orange
  "#0891b2", // Cyan
  "#db2777", // Pink
  "#d97706", // Amber
  "#4f46e5", // Indigo
];

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await getDashboardAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overview = analyticsData?.overview || {
    total_products: 0,
    total_quantity: 0,
    total_inventory_value: 0,
    low_stock_count: 0,
    warehouse_health_score: 100,
  };

  const categories = analyticsData?.category_analysis || [];
  const topProducts = analyticsData?.top_valuable_products || [];

  // Calculate highest values for relative bar widths
  const maxCategoryValue = categories.reduce(
    (max, cat) => Math.max(max, cat.total_value || 0),
    1
  );

  const maxProductValue = topProducts.reduce(
    (max, prod) => Math.max(max, prod.inventory_value || 0),
    1
  );

  // Generate CSS conic-gradient string for donut chart
  const totalValuation = overview.total_inventory_value || 1;
  let accumulatedPercent = 0;
  const gradientStops = categories.map((cat, idx) => {
    const color = PALETTE[idx % PALETTE.length];
    const catPercent = ((cat.total_value || 0) / totalValuation) * 100;
    const start = accumulatedPercent;
    accumulatedPercent += catPercent;
    return `${color} ${start}% ${accumulatedPercent}%`;
  });

  const donutGradient =
    gradientStops.length > 0
      ? `conic-gradient(${gradientStops.join(", ")})`
      : "conic-gradient(#e5e7eb 0% 100%)";

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner"></div>
          <h2>Aggregating Warehouse Analytics...</h2>
          <p>Analyzing stock distribution, monetary valuations, and category volume.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error-card">
          <AlertTriangle size={48} color="#dc2626" />
          <h2>Analytics Unavailable</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => fetchAnalytics()}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div className="analytics-header">
        <div>
          <div className="header-title-badge">
            <h1>Warehouse Analytics</h1>
            <span className="live-badge">
              <span className="live-dot"></span> Live Intelligence
            </span>
          </div>
          <p>Comprehensive portfolio valuation, category distribution, and risk telemetry</p>
        </div>

        <button
          className="analytics-refresh-btn"
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
        >
          <RefreshCw size={17} className={refreshing ? "spin-icon" : ""} />
          {refreshing ? "Updating..." : "Refresh Metrics"}
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Products</span>
            <div className="kpi-icon-box bg-blue">
              <Package size={22} />
            </div>
          </div>
          <div className="kpi-number">{overview.total_products}</div>
          <div className="kpi-subtext">Active SKUs tracked</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Stock Volume</span>
            <div className="kpi-icon-box bg-purple">
              <Boxes size={22} />
            </div>
          </div>
          <div className="kpi-number">{overview.total_quantity.toLocaleString()}</div>
          <div className="kpi-subtext">Units on warehouse shelves</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Valuation</span>
            <div className="kpi-icon-box bg-emerald">
              <IndianRupee size={22} />
            </div>
          </div>
          <div className="kpi-number">₹ {overview.total_inventory_value.toLocaleString()}</div>
          <div className="kpi-subtext">Cumulative asset value</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Low Stock Alert</span>
            <div className="kpi-icon-box bg-red">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="kpi-number text-red">{overview.low_stock_count}</div>
          <div className="kpi-subtext">Below threshold level</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Health Rating</span>
            <div className="kpi-icon-box bg-orange">
              <Activity size={22} />
            </div>
          </div>
          <div className="kpi-number">{overview.warehouse_health_score}%</div>
          <div className="kpi-subtext">Overall operational score</div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="analytics-main-grid">
        {/* Left Column: Category Valuation Breakdown */}
        <div className="analytics-panel category-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <Layers size={20} className="panel-icon" />
              <h3>Category Valuation Breakdown</h3>
            </div>
            <span className="panel-badge">{categories.length} Categories</span>
          </div>

          <div className="category-bars-list">
            {categories.length > 0 ? (
              categories.map((cat, idx) => {
                const color = PALETTE[idx % PALETTE.length];
                const percentage =
                  overview.total_inventory_value > 0
                    ? ((cat.total_value / overview.total_inventory_value) * 100).toFixed(1)
                    : 0;
                const barWidth = ((cat.total_value || 0) / maxCategoryValue) * 100;

                return (
                  <div key={cat.category || idx} className="category-bar-item">
                    <div className="cat-bar-header">
                      <span className="cat-name">
                        <span
                          className="cat-color-dot"
                          style={{ backgroundColor: color }}
                        ></span>
                        {cat.category}
                      </span>
                      <div className="cat-values">
                        <span className="cat-amount">
                          ₹ {cat.total_value.toLocaleString()}
                        </span>
                        <span className="cat-percentage">({percentage}%)</span>
                      </div>
                    </div>

                    <div className="cat-progress-track">
                      <div
                        className="cat-progress-fill"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: color,
                        }}
                      ></div>
                    </div>

                    <div className="cat-meta-row">
                      <span>{cat.total_products} unique SKUs</span>
                      <span>{cat.total_quantity} physical units</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="panel-empty">No category data available yet.</div>
            )}
          </div>
        </div>

        {/* Right Column: Donut Chart Distribution */}
        <div className="analytics-panel donut-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <PieChart size={20} className="panel-icon" />
              <h3>Portfolio Asset Share</h3>
            </div>
          </div>

          <div className="donut-chart-container">
            <div
              className="donut-graphic"
              style={{ background: donutGradient }}
            >
              <div className="donut-hole">
                <span className="donut-center-title">Valuation</span>
                <span className="donut-center-value">
                  ₹ {overview.total_inventory_value.toLocaleString()}
                </span>
                <span className="donut-center-count">
                  {overview.total_products} SKUs
                </span>
              </div>
            </div>
          </div>

          <div className="donut-legend">
            {categories.map((cat, idx) => {
              const color = PALETTE[idx % PALETTE.length];
              const percentage =
                overview.total_inventory_value > 0
                  ? ((cat.total_value / overview.total_inventory_value) * 100).toFixed(1)
                  : 0;

              return (
                <div key={cat.category || idx} className="legend-row">
                  <div className="legend-name">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span>{cat.category}</span>
                  </div>
                  <span className="legend-value">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Valuable Products Ranking Leaderboard */}
      <div className="analytics-panel top-products-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <Award size={22} className="panel-icon" />
            <div>
              <h3>High-Value Inventory Assets</h3>
              <p className="panel-subtitle">Top products contributing the highest capital to the warehouse</p>
            </div>
          </div>

          <Link to="/inventory" className="view-all-link">
            Open Inventory <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="top-products-table-wrap">
          <table className="top-products-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Rank</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Capital Share</th>
                <th style={{ textAlign: "right" }}>Inventory Valuation</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? (
                topProducts.map((prod, idx) => {
                  const sharePercentage = (
                    (prod.inventory_value / maxProductValue) *
                    100
                  ).toFixed(1);

                  return (
                    <tr key={prod.sku || idx}>
                      <td>
                        <span className={`rank-badge rank-${idx + 1}`}>
                          #{idx + 1}
                        </span>
                      </td>

                      <td>
                        <span className="prod-title">{prod.product_name}</span>
                      </td>

                      <td>
                        <span className="prod-sku">{prod.sku}</span>
                      </td>

                      <td style={{ width: "30%" }}>
                        <div className="capital-bar-wrap">
                          <div className="capital-bar-track">
                            <div
                              className="capital-bar-fill"
                              style={{ width: `${sharePercentage}%` }}
                            ></div>
                          </div>
                          <span className="capital-bar-text">{sharePercentage}%</span>
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <span className="prod-valuation">
                          ₹ {prod.inventory_value.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="panel-empty">
                    No products found in the catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
