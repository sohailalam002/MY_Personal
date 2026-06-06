import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Trophy,
  LogOut,
  X,
  Swords
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) return null;

  const isAdmin = currentUser.role === "admin";

  const menuItems = isAdmin
    ? [
        { path: "/admin", name: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/users", name: "Users", icon: Users },
        { path: "/admin/leaves", name: "Leave Requests", icon: ClipboardList },
        { path: "/admin/leaderboard", name: "Leaderboard", icon: Trophy }
      ]
    : [
        { path: "/user", name: "Dashboard", icon: LayoutDashboard },
        { path: "/user/leaderboard", name: "Leaderboard", icon: Trophy }
      ];

  const handleLogout = () => {
    logout();
    if (toggleSidebar) toggleSidebar();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <aside className={`sidebar-container glass-panel ${isOpen ? "open" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Swords className="logo-icon" />
            <div className="logo-text">
              <span>TUNG TUNG</span>
              <span className="accent-text">SAHUR</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* User Info Capsule */}
        <div className="sidebar-user-capsule">
          <div className="user-capsule-avatar">
            <img src={currentUser.avatar} alt={currentUser.name} />
          </div>
          <div className="user-capsule-info">
            <h4 className="user-capsule-name">{currentUser.name}</h4>
            <span className="user-capsule-role">{currentUser.role}</span>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active-link" : ""}`
                }
                onClick={() => {
                  if (isOpen && toggleSidebar) toggleSidebar();
                }}
              >
                <Icon size={18} className="link-icon" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
