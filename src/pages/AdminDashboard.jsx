import React from "react";
import { useAuth } from "../context/AuthContext";
import { Users, UserCheck, ClipboardCopy, Target, ArrowUpRight, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { users, leaveRequests, getLeaderboardData } = useAuth();

  // Compute stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const pendingLeaves = leaveRequests.filter((r) => r.status === "Pending").length;
  
  // Find top player
  const leaderboard = getLeaderboardData();
  const topPlayer = leaderboard.length > 0 ? leaderboard[0] : null;

  const stats = [
    {
      title: "Total Soldiers",
      value: totalUsers,
      icon: Users,
      color: "var(--primary-accent)",
      link: "/admin/users",
      linkLabel: "Manage Soldiers"
    },
    {
      title: "Active Deployment",
      value: activeUsers,
      icon: UserCheck,
      color: "#00e676",
      link: "/admin/users",
      linkLabel: "View Statuses"
    },
    {
      title: "Pending Leaves",
      value: pendingLeaves,
      icon: ClipboardCopy,
      color: "#ffd600",
      link: "/admin/leaves",
      linkLabel: "Approve/Reject"
    },
    {
      title: "Apex Predator",
      value: topPlayer ? `${topPlayer.kills} Kills` : "0 Kills",
      subtitle: topPlayer ? playerTruncate(topPlayer.name) : "N/A",
      icon: Target,
      color: "#ff1744",
      link: "/admin/leaderboard",
      linkLabel: "View Standings"
    }
  ];

  function playerTruncate(str) {
    if (str.length > 12) return str.slice(0, 10) + "..";
    return str;
  }

  // Get recent 3 leave requests
  const recentLeaves = leaveRequests.slice(0, 3);

  return (
    <div className="page-container">
      {/* Statistics Cards Grid */}
      <div className="stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="stat-card glass-panel" style={{ "--glow-color": stat.color }}>
              <div className="stat-card-header">
                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  <Icon size={24} />
                </div>
                <span className="stat-card-title">{stat.title}</span>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-card-value">{stat.value}</h2>
                {stat.subtitle && <p className="stat-card-subtitle">{stat.subtitle}</p>}
              </div>
              <div className="stat-card-footer">
                <Link to={stat.link} className="stat-card-link">
                  <span>{stat.linkLabel}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Rows */}
      <div className="dashboard-grid-row">
        {/* Recent Leaves Overview */}
        <div className="dashboard-panel-card glass-panel flex-1">
          <div className="panel-card-header">
            <h3 className="panel-title">Pending Leave Briefings</h3>
            <Link to="/admin/leaves" className="btn btn-secondary btn-small-text">All Requests</Link>
          </div>
          <div className="panel-card-body">
            {recentLeaves.length === 0 ? (
              <p className="no-records-text">No active leave files registered.</p>
            ) : (
              <div className="mini-list">
                {recentLeaves.map((req) => (
                  <div key={req.id} className="mini-item">
                    <div className="mini-item-profile">
                      <img src={req.userAvatar} alt={req.userName} className="mini-avatar" />
                      <div>
                        <h4 className="mini-name">{req.userName}</h4>
                        <span className="mini-date">{req.leaveDate}</span>
                      </div>
                    </div>
                    <span className={`badge ${
                      req.status === "Approved" 
                        ? "badge-active" 
                        : req.status === "Rejected" 
                        ? "badge-rejected" 
                        : "badge-pending"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mini Leaderboard Overview */}
        <div className="dashboard-panel-card glass-panel flex-1">
          <div className="panel-card-header">
            <h3 className="panel-title">
              <Trophy size={16} className="title-icon-inline" /> Top Rank Standings
            </h3>
            <Link to="/admin/leaderboard" className="btn btn-secondary btn-small-text">Leaderboard</Link>
          </div>
          <div className="panel-card-body">
            {leaderboard.length === 0 ? (
              <p className="no-records-text">No battle logs collected yet.</p>
            ) : (
              <div className="mini-list">
                {leaderboard.slice(0, 4).map((player, index) => (
                  <div key={player.id} className="mini-item">
                    <div className="mini-item-profile">
                      <div className={`mini-rank-badge r-${index + 1}`}>{index + 1}</div>
                      <img src={player.avatar} alt={player.name} className="mini-avatar" />
                      <div>
                        <h4 className="mini-name">{player.name}</h4>
                        <span className="mini-squad">{player.squadName}</span>
                      </div>
                    </div>
                    <div className="mini-stat-val">
                      <Target size={12} className="target-icon" />
                      <span>{player.kills} Kills</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
