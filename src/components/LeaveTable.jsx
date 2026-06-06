import React from "react";
import { Check, X, ShieldQuestion } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LeaveTable = ({ requests, onApprove, onReject }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="table-container glass-panel">
      <table className="gaming-table">
        <thead>
          <tr>
            <th>Soldier</th>
            <th>Leave Date</th>
            <th>Reason Details</th>
            <th>Status</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: "center", padding: "30px", color: "var(--text-gray)" }}>
                No active leave requests found.
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", 
                      height: "36px", 
                      borderRadius: "50%", 
                      overflow: "hidden", 
                      border: "2px solid var(--primary-accent)",
                      background: "rgba(0,0,0,0.2)"
                    }}>
                      <img 
                        src={req.userAvatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder"} 
                        alt={req.userName} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <span style={{ fontWeight: "600" }}>{req.userName}</span>
                  </div>
                </td>
                <td style={{ fontWeight: "600", color: "#ff8a36" }}>
                  {new Date(req.leaveDate).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>{req.reason}</td>
                <td>
                  <span className={`badge ${
                    req.status === "Approved" 
                      ? "badge-active" 
                      : req.status === "Rejected" 
                      ? "badge-rejected" 
                      : "badge-pending"
                  }`}>
                    {req.status}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    {req.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => onApprove(req.id)}
                          className="btn btn-success"
                          style={{ padding: "6px 12px" }}
                          title="Approve Request"
                        >
                          <Check size={14} style={{ marginRight: "4px" }} /> Approve
                        </button>
                        <button
                          onClick={() => onReject(req.id)}
                          className="btn btn-danger"
                          style={{ padding: "6px 12px" }}
                          title="Reject Request"
                        >
                          <X size={14} style={{ marginRight: "4px" }} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--text-gray)", fontStyle: "italic" }}>
                        Processed
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveTable;
