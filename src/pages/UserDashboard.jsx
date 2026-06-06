import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Target, Calendar, ClipboardList, Send, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { currentUser, users, leaveRequests, submitLeaveRequest, getLeaderboardData } = useAuth();
  const [leaveDate, setLeaveDate] = useState("");
  const [reason, setReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!currentUser) return null;

  // Calculate user rank from leaderboard
  const leaderboard = getLeaderboardData();
  const userRankIndex = leaderboard.findIndex((u) => u.id === currentUser.id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : "N/A";

  // Find squad members
  const squadMembers = users.filter(
    (u) => u.squadName === currentUser.squadName && u.id !== currentUser.id
  );

  // Find user's own leave requests
  const myLeaves = leaveRequests.filter((r) => r.userId === currentUser.id);

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!leaveDate || !reason.trim()) {
      setErrorMsg("Please provide both date and reasoning.");
      return;
    }

    try {
      submitLeaveRequest(leaveDate, reason);
      setSuccessMsg("Request dispatched to Commander approval.");
      setLeaveDate("");
      setReason("");
      
      // Auto-clear message
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="page-container">
      {/* Top Welcome Panel */}
      <div className="user-welcome-panel glass-panel">
        <div className="welcome-avatar-wrapper">
          <img src={currentUser.avatar} alt={currentUser.name} className="welcome-avatar" />
        </div>
        <div className="welcome-text-info">
          <span className="welcome-tag">SQUAD ACTIVE SURVIVOR</span>
          <h2 className="welcome-username">{currentUser.name}</h2>
          <p className="welcome-email">{currentUser.email}</p>
        </div>
        
        <div className="welcome-stats-row">
          <div className="welcome-stat-box">
            <span className="stat-label">Rank</span>
            <div className="stat-value-group">
              <Trophy size={16} className="trophy-icon gold" />
              <span className="stat-value">#{userRank}</span>
            </div>
          </div>
          <div className="welcome-stat-box">
            <span className="stat-label">Kills</span>
            <div className="stat-value-group">
              <Target size={16} className="target-icon red" />
              <span className="stat-value">{currentUser.kills}</span>
            </div>
          </div>
          <div className="welcome-stat-box">
            <span className="stat-label">Squad</span>
            <span className="stat-value-squad">{currentUser.squadName}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="user-dashboard-grid">
        {/* Left Side: Squad Members & Actions */}
        <div className="user-grid-left">
          {/* Squad Comrades Card */}
          <div className="glass-panel dashboard-section-panel">
            <div className="section-panel-header">
              <h3 className="section-panel-title">
                <Users size={16} className="title-icon-inline" /> Squad Comrades
              </h3>
              <span className="badge badge-active">{currentUser.squadName}</span>
            </div>
            
            <div className="section-panel-body">
              {squadMembers.length === 0 ? (
                <p className="empty-section-text">You are the lone survivor in this squad.</p>
              ) : (
                <div className="squad-members-grid">
                  {squadMembers.map((member) => (
                    <div key={member.id} className="squad-member-mini-card">
                      <div className="member-avatar-box">
                        <img src={member.avatar} alt={member.name} />
                      </div>
                      <h4 className="member-name">{member.name}</h4>
                      <span className="member-kills">
                        <Target size={10} /> {member.kills} Kills
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Standings Callout */}
          <div className="glass-panel quick-leaderboard-callout">
            <div className="callout-content">
              <h4>Compete for the Title!</h4>
              <p>Climb the rankings by securing kills and leading your squad to victory.</p>
              <Link to="/user/leaderboard" className="btn btn-primary">
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Leave Request Form & History */}
        <div className="user-grid-right">
          {/* Submit Leave Panel */}
          <div className="glass-panel dashboard-section-panel">
            <div className="section-panel-header">
              <h3 className="section-panel-title">
                <Calendar size={16} className="title-icon-inline" /> Request Leave File
              </h3>
            </div>
            <div className="section-panel-body">
              {successMsg && <div className="user-alert alert-success">{successMsg}</div>}
              {errorMsg && <div className="user-alert alert-danger">{errorMsg}</div>}
              
              <form onSubmit={handleLeaveSubmit} className="user-leave-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="leave-date">Select Date</label>
                  <input
                    id="leave-date"
                    type="date"
                    className="form-input"
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="leave-reason">Reasoning Briefing</label>
                  <textarea
                    id="leave-reason"
                    rows="3"
                    className="form-input"
                    placeholder="Briefly describe reasons for being AFK..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    style={{ resize: "none" }}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-submit-leave">
                  <Send size={14} /> Dispatch Request
                </button>
              </form>
            </div>
          </div>

          {/* Leave History Logs */}
          <div className="glass-panel dashboard-section-panel">
            <div className="section-panel-header">
              <h3 className="section-panel-title">
                <ClipboardList size={16} className="title-icon-inline" /> Request Log History
              </h3>
              <span className="badge-count-tag">{myLeaves.length} Files</span>
            </div>
            <div className="section-panel-body">
              {myLeaves.length === 0 ? (
                <p className="empty-section-text">No previous leave requests dispatched.</p>
              ) : (
                <div className="leaves-history-timeline">
                  {myLeaves.map((req) => (
                    <div key={req.id} className="history-timeline-item">
                      <div className="timeline-item-meta">
                        <span className="timeline-date">
                          {new Date(req.leaveDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
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
                      <p className="timeline-reason">{req.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
