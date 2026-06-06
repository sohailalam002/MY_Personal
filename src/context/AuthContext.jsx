import React, { createContext, useContext, useState, useEffect } from "react";
import { seedUsers, seedLeaveRequests } from "../data/seedData";

const AuthContext = createContext();

// Bump this version whenever seedData changes — forces a localStorage reset
const DATA_VERSION = "v3";

const initUsers = () => {
  const storedVersion = localStorage.getItem("tung_tung_version");

  // If version mismatch, wipe old data and re-seed
  if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem("tung_tung_users");
    localStorage.removeItem("tung_tung_leaves");
    localStorage.removeItem("tung_tung_current_user");
    localStorage.setItem("tung_tung_version", DATA_VERSION);
  }

  const saved = localStorage.getItem("tung_tung_users");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
    }
  }

  localStorage.setItem("tung_tung_users", JSON.stringify(seedUsers));
  return seedUsers;
};

const initLeaves = () => {
  const saved = localStorage.getItem("tung_tung_leaves");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Failed to parse leaves from localStorage", e);
    }
  }
  localStorage.setItem("tung_tung_leaves", JSON.stringify(seedLeaveRequests));
  return seedLeaveRequests;
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(initUsers);
  const [leaveRequests, setLeaveRequests] = useState(initLeaves);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("tung_tung_current_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse current user", e);
      }
    }
    return null;
  });

  const [notifications, setNotifications] = useState([]);

  // Sync users to localStorage whenever users state changes
  useEffect(() => {
    localStorage.setItem("tung_tung_users", JSON.stringify(users));
  }, [users]);

  // Sync leave requests to localStorage
  useEffect(() => {
    localStorage.setItem("tung_tung_leaves", JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  // Sync logged-in user to localStorage
  useEffect(() => {
    if (currentUser) {
      // Always keep the session user in sync with the latest users array
      localStorage.setItem("tung_tung_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("tung_tung_current_user");
    }
  }, [currentUser]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = (email, password) => {
    // Always read from the LATEST localStorage to catch admin-created users
    let latestUsers = users;
    try {
      const raw = localStorage.getItem("tung_tung_users");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          latestUsers = parsed;
        }
      }
    } catch (e) {
      // fall back to state
    }

    const foundUser = latestUsers.find(
      (u) =>
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      // Keep state in sync if it was stale
      if (latestUsers !== users) setUsers(latestUsers);
      return { success: true, user: foundUser };
    }

    return { success: false, message: "Invalid email or password. Please check credentials." };
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    setCurrentUser(null);
  };

  // ── Add User (Admin only) ──────────────────────────────────────────────────
  const addUser = (userData) => {
    const newUser = {
      id: "user-" + Date.now(),
      name: userData.name,
      email: userData.email.trim(),
      password: userData.password || "User@123",
      role: userData.role || "user",
      squadName: userData.squadName || "Unassigned",
      kills: parseInt(userData.kills || 0, 10),
      status: userData.status || "Active",
      avatar:
        userData.avatar ||
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}`
    };

    setUsers((prev) => {
      const updated = [...prev, newUser];
      // Immediately persist so login can find the user right away
      localStorage.setItem("tung_tung_users", JSON.stringify(updated));
      return updated;
    });

    addNotification(`New soldier "${newUser.name}" registered. Email: ${newUser.email}`);
    return newUser;
  };

  // ── Update User ────────────────────────────────────────────────────────────
  const updateUser = (userId, updatedData) => {
    setUsers((prev) => {
      const updated = prev.map((user) => {
        if (user.id === userId) {
          const merged = { ...user, ...updatedData };
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(merged);
          }
          return merged;
        }
        return user;
      });
      localStorage.setItem("tung_tung_users", JSON.stringify(updated));
      return updated;
    });
    addNotification(`Soldier "${updatedData.name || userId}" profile updated.`);
  };

  // ── Delete User ────────────────────────────────────────────────────────────
  const deleteUser = (userId) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (userToDelete) {
      setUsers((prev) => {
        const updated = prev.filter((u) => u.id !== userId);
        localStorage.setItem("tung_tung_users", JSON.stringify(updated));
        return updated;
      });
      setLeaveRequests((prev) => prev.filter((l) => l.userId !== userId));
      addNotification(`Soldier "${userToDelete.name}" dismissed from the squad.`);
    }
  };

  // ── Submit Leave Request (User only) ───────────────────────────────────────
  const submitLeaveRequest = (leaveDate, reason) => {
    if (!currentUser) return;
    const newRequest = {
      id: "leave-" + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      leaveDate,
      reason,
      status: "Pending"
    };
    setLeaveRequests((prev) => [newRequest, ...prev]);
    addNotification(`Leave request submitted by "${currentUser.name}".`);
  };

  // ── Approve / Reject Leave ─────────────────────────────────────────────────
  const updateLeaveStatus = (leaveId, status) => {
    const request = leaveRequests.find((l) => l.id === leaveId);
    setLeaveRequests((prev) =>
      prev.map((leave) => (leave.id === leaveId ? { ...leave, status } : leave))
    );
    if (request) {
      addNotification(
        `Leave request for "${request.userName}" has been ${status.toLowerCase()}.`
      );
    }
  };

  // ── Notifications ──────────────────────────────────────────────────────────
  const addNotification = (message) => {
    const newNotif = {
      id: "notif-" + Date.now(),
      message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
  };

  const clearNotifications = () => setNotifications([]);

  // ── Leaderboard ────────────────────────────────────────────────────────────
  const getLeaderboardData = () =>
    [...users].sort((a, b) => b.kills - a.kills);

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        leaveRequests,
        notifications,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        submitLeaveRequest,
        updateLeaveStatus,
        getLeaderboardData,
        clearNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
