import { useEffect, useState } from "react";
import {
  Brain,
  Package,
  AlertOctagon,
  AlertTriangle,
  ShoppingCart,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { getReorderPredictions } from "../services/api";
import "./Predictions.css";

function Predictions() {
  const [predictionsData, setPredictionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("ALL");

  const fetchPredictions = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await getReorderPredictions();
      setPredictionsData(data);
    } catch (err) {
      console.error("Error fetching AI predictions:", err);
      setError(err.message || "Failed to load AI predictions. Ensure your server is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const summary = predictionsData?.summary || {
    total_products_analyzed: 0,
    critical_products: 0,
    high_risk_products: 0,
    products_requiring_reorder: 0,
  };

  const rawPredictions = predictionsData?.predictions || [];

  // Filter products by search term and risk level
  const filteredPredictions = rawPredictions.filter((item) => {
    const matchesSearch =
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      selectedRiskFilter === "ALL" ||
      item.risk_level?.toUpperCase() === selectedRiskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskBadgeClass = (risk) => {
    switch (risk?.toUpperCase()) {
      case "CRITICAL":
        return "badge-critical";
      case "HIGH":
        return "badge-high";
      case "MEDIUM":
        return "badge-medium";
      case "LOW":
        return "badge-low";
      default:
        return "badge-default";
    }
  };

  const getHealthBarColor = (score) => {
    if (score < 35) return "#dc2626"; // red
    if (score < 70) return "#f59e0b"; // amber
    return "#10b981"; // green
  };

  if (loading) {
    return (
      <div className="predictions-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Running AI Inventory Analysis...</h2>
          <p>Evaluating stock levels, consumption rates, and calculating optimal replenishment points.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictions-page">
        <div className="error-card">
          <AlertOctagon size={48} color="#dc2626" />
          <h2>Failed to Load AI Predictions</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => fetchPredictions()}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-page">
      {/* Header */}
      <div className="predictions-header">
        <div>
          <div className="title-with-badge">
            <h1>AI Reorder Predictions</h1>
            <span className="ai-status-pill">
              <Brain size={15} /> Machine Learning Engine
            </span>
          </div>
          <p>Predictive stock health monitoring and automated reorder intelligence</p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => fetchPredictions(true)}
          disabled={refreshing}
          title="Refresh calculations"
        >
          <RefreshCw size={18} className={refreshing ? "spin-icon" : ""} />
          {refreshing ? "Refreshing..." : "Recalculate"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card card-analyzed">
          <div className="card-info">
            <span className="card-label">Analyzed Items</span>
            <span className="card-value">{summary.total_products_analyzed}</span>
            <span className="card-hint">Total catalog SKU scan</span>
          </div>
          <div className="card-icon-bubble bubble-blue">
            <Package size={26} />
          </div>
        </div>

        <div className="summary-card card-critical">
          <div className="card-info">
            <span className="card-label">Critical Shortage</span>
            <span className="card-value">{summary.critical_products}</span>
            <span className="card-hint">Immediate replenishment needed</span>
          </div>
          <div className="card-icon-bubble bubble-red">
            <AlertOctagon size={26} />
          </div>
        </div>

        <div className="summary-card card-high">
          <div className="card-info">
            <span className="card-label">High Risk Items</span>
            <span className="card-value">{summary.high_risk_products}</span>
            <span className="card-hint">Approaching or under safety mark</span>
          </div>
          <div className="card-icon-bubble bubble-orange">
            <AlertTriangle size={26} />
          </div>
        </div>

        <div className="summary-card card-reorder">
          <div className="card-info">
            <span className="card-label">Reorders Recommended</span>
            <span className="card-value">{summary.products_requiring_reorder}</span>
            <span className="card-hint">Purchase orders ready</span>
          </div>
          <div className="card-icon-bubble bubble-purple">
            <ShoppingCart size={26} />
          </div>
        </div>
      </div>

      {/* Table & Controls Section */}
      <div className="predictions-container">
        {/* Filter and Search Bar */}
        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">Risk Filter:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
              <button
                key={risk}
                className={`filter-chip ${selectedRiskFilter === risk ? "active" : ""}`}
                onClick={() => setSelectedRiskFilter(risk)}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Results Table */}
        <div className="table-responsive">
          <table className="predictions-table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Stock / Threshold</th>
                <th>Stock Health Score</th>
                <th>Risk Level</th>
                <th>Priority</th>
                <th>Recommended Reorder</th>
                <th>AI Action Plan</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.length > 0 ? (
                filteredPredictions.map((pred, idx) => (
                  <tr
                    key={pred.sku || idx}
                    className={`table-row ${pred.reorder_required ? "row-reorder-needed" : ""}`}
                  >
                    <td>
                      <div className="product-title-cell">
                        <span className="product-name">{pred.product_name}</span>
                        <span className="sku-code">{pred.sku}</span>
                      </div>
                    </td>

                    <td>
                      <div className="qty-cell">
                        <span className="current-qty">{pred.current_quantity}</span>
                        <span className="reorder-level">/ {pred.reorder_level} min</span>
                      </div>
                    </td>

                    <td>
                      <div className="health-score-cell">
                        <div className="health-bar-container">
                          <div
                            className="health-bar-fill"
                            style={{
                              width: `${Math.min(pred.stock_health_score, 100)}%`,
                              backgroundColor: getHealthBarColor(pred.stock_health_score),
                            }}
                          ></div>
                        </div>
                        <span className="health-score-text">
                          {pred.stock_health_score}%
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`risk-badge ${getRiskBadgeClass(pred.risk_level)}`}>
                        {pred.risk_level}
                      </span>
                    </td>

                    <td>
                      <span className="priority-tag">
                        {pred.priority === "URGENT" && <Clock size={13} className="text-red" />}
                        {pred.priority}
                      </span>
                    </td>

                    <td>
                      <span className="reorder-qty-pill">
                        +{pred.recommended_reorder_quantity} units
                      </span>
                    </td>

                    <td>
                      <div className="action-recommendation">
                        {pred.reorder_required ? (
                          <span className="action-warning">
                            <AlertTriangle size={14} />
                            {pred.recommended_action}
                          </span>
                        ) : (
                          <span className="action-healthy">
                            <CheckCircle size={14} />
                            {pred.recommended_action}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <Link
                        to="/inventory"
                        className="manage-stock-btn"
                        title="Open inventory to update product"
                      >
                        Manage <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    No products matching your search or risk filter.
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

export default Predictions;
