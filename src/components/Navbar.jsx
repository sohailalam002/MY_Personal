import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, Menu, ShieldAlert, Sparkles, Trash2 } from "lucide-react";
import "./Navbar.css";

const Navbar = ({ onMenuClick }) => {
  const { currentUser, notifications, clearNotifications } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentUser) return null;

  // Generate dynamic page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/admin/users")) return "User Management";
    if (path.includes("/admin/leaves")) return "Leave Management";
    if (path.includes("/admin/leaderboard") || path.includes("/user/leaderboard")) return "Battle Leaderboard";
    if (path === "/admin") return "Admin Control Center";
    if (path === "/user") return "Survivor Dashboard";
    return "Tung Tung Sahur";
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClearNotif = (e) => {
    e.stopPropagation();
    clearNotifications();
  };

  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-left">
        {/* Mobile menu toggle */}
        <button className="navbar-mobile-toggle" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <h1 className="navbar-page-title">{getPageTitle()}</h1>
      </div>

      <div className="navbar-right">
        {/* Notifications Icon with Dropdown */}
        <div className="navbar-notifications">
          <button className="navbar-icon-btn" onClick={toggleNotifications} aria-label="Notifications">
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="notif-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notif-dropdown glass-panel">
              <div className="notif-header">
                <span className="notif-title">Recent Transmissions</span>
                {notifications.length > 0 && (
                  <button className="notif-clear" onClick={handleClearNotif}>
                    <Trash2 size={14} /> Clear All
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Sparkles className="empty-icon" size={24} />
                    <span>No communications received. All quiet.</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="notif-item">
                      <p className="notif-message">{n.message}</p>
                      <span className="notif-time">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Quick Identity */}
        <div className="navbar-profile-info">
          <div className="navbar-profile-text">
            <span className="navbar-profile-name">{currentUser.name}</span>
            <span className="navbar-profile-role-badge">
              {currentUser.role === "admin" ? (
                <>
                  <ShieldAlert size={10} className="shield-icon" /> ADMIN
                </>
              ) : (
                "SURVIVOR"
              )}
            </span>
          </div>
          <div className="navbar-profile-avatar">
            <img src={currentUser.avatar} alt={currentUser.name} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
