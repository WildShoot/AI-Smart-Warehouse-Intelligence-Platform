import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Brain,
  BarChart3,
  Warehouse,
} from "lucide-react";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="sidebar-logo">
        <Warehouse size={30} />
        <h2>Smart Warehouse</h2>
      </div>

      <nav className="sidebar-menu">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <LayoutDashboard size={22} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <Package size={22} />
          <span>Inventory</span>
        </NavLink>

        <NavLink
          to="/predictions"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <Brain size={22} />
          <span>AI Predictions</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <BarChart3 size={22} />
          <span>Analytics</span>
        </NavLink>

      </nav>

    </div>
  );
}

export default Sidebar;