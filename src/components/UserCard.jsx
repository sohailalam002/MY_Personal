import React from "react";
import { Edit2, Trash2, Shield, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./UserCard.css";

const UserCard = ({ user, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="user-card glass-panel">
      {/* Status Badge */}
      <span className={`user-card-status-badge badge ${user.status === "Active" ? "badge-active" : "badge-inactive"}`}>
        {user.status}
      </span>

      {/* Avatar Container */}
      <div className="user-card-avatar-wrapper">
        <div className="user-card-avatar">
          <img src={user.avatar} alt={user.name} />
        </div>
      </div>

      {/* Body Info */}
      <div className="user-card-info">
        <h3 className="user-card-name">
          {user.name}
          {user.role === "admin" && <Shield className="admin-icon" size={14} />}
        </h3>
        <p className="user-card-email">{user.email}</p>
        
        <div className="user-card-squad">
          <span className="info-label">Squad</span>
          <span className="info-value">{user.squadName}</span>
        </div>

        <div className="user-card-kills-stat">
          <Target className="target-icon" size={16} />
          <span className="kills-count">{user.kills}</span>
          <span className="kills-label">Kills</span>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="user-card-actions">
          <button onClick={() => onEdit(user)} className="btn btn-secondary card-action-btn" title="Edit Soldier">
            <Edit2 size={14} /> Edit
          </button>
          {user.id !== currentUser.id ? (
            <button onClick={() => onDelete(user.id)} className="btn btn-danger card-action-btn" title="Dismiss Soldier">
              <Trash2 size={14} /> Dismiss
            </button>
          ) : (
            <div className="active-admin-tag">Active Admin</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCard;
