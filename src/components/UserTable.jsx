import React from "react";
import { Edit2, Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserTable = ({ usersList, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="table-container glass-panel">
      <table className="gaming-table">
        <thead>
          <tr>
            <th>Soldier</th>
            <th>Email</th>
            <th>Squad Name</th>
            <th>Kills</th>
            <th>Status</th>
            {isAdmin && <th>Operations</th>}
          </tr>
        </thead>
        <tbody>
          {usersList.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: "center", padding: "30px", color: "var(--text-gray)" }}>
                No soldiers registered in this squad.
              </td>
            </tr>
          ) : (
            usersList.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%", 
                      overflow: "hidden", 
                      border: "2px solid var(--primary-accent)",
                      background: "rgba(0,0,0,0.2)"
                    }}>
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                        {user.name}
                        {user.role === "admin" && (
                          <span title="Administrator" style={{ color: "var(--primary-accent)", display: "inline-flex" }}>
                            <ShieldAlert size={14} />
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-gray)" }}>ID: {user.id.slice(0, 10)}</span>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td style={{ fontWeight: "500", color: "#ff8a36" }}>{user.squadName}</td>
                <td style={{ fontWeight: "700", fontSize: "15px" }}>{user.kills}</td>
                <td>
                  <span className={`badge ${user.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                    {user.status}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => onEdit(user)}
                        className="btn btn-secondary"
                        style={{ padding: "6px 10px" }}
                        title="Edit Soldier"
                      >
                        <Edit2 size={14} />
                      </button>
                      {user.id !== currentUser.id ? (
                        <button
                          onClick={() => onDelete(user.id)}
                          className="btn btn-danger"
                          style={{ padding: "6px 10px" }}
                          title="Dismiss Soldier"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-gray)", fontStyle: "italic", alignSelf: "center" }}>
                          Active Admin
                        </span>
                      )}
                    </div>
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

export default UserTable;
