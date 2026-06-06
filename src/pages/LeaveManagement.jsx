import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LeaveTable from "../components/LeaveTable";
import { ClipboardList, Filter } from "lucide-react";
import "./LeaveManagement.css";

const LeaveManagement = () => {
  const { leaveRequests, updateLeaveStatus } = useAuth();
  const [filterStatus, setFilterStatus] = useState("All"); // 'All', 'Pending', 'Approved', 'Rejected'

  const handleApprove = (id) => {
    updateLeaveStatus(id, "Approved");
  };

  const handleReject = (id) => {
    updateLeaveStatus(id, "Rejected");
  };

  // Filter leaves based on active tab
  const filteredRequests = leaveRequests.filter((req) => {
    if (filterStatus === "All") return true;
    return req.status === filterStatus;
  });

  const getTabCount = (status) => {
    if (status === "All") return leaveRequests.length;
    return leaveRequests.filter((r) => r.status === status).length;
  };

  return (
    <div className="page-container">
      {/* Category Tabs Panel */}
      <div className="leave-filter-bar glass-panel">
        <div className="filter-title-wrapper">
          <Filter size={16} className="filter-title-icon" />
          <span>Filter Status</span>
        </div>

        <div className="leave-tabs-container">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`leave-tab-btn ${filterStatus === status ? "active" : ""}`}
            >
              <span>{status}</span>
              <span className="tab-count">{getTabCount(status)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Leave requests table roster */}
      <div className="leave-table-section">
        <div className="leave-section-header glass-panel">
          <ClipboardList size={18} className="leave-icon" />
          <h3 className="leave-section-title">Leave Request Records ({filteredRequests.length})</h3>
        </div>

        <LeaveTable
          requests={filteredRequests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  );
};

export default LeaveManagement;
