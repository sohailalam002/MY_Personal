import React, { createContext, useContext, useState, useEffect } from "react";
import { seedUsers, seedLeaveRequests } from "../data/seedData";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("tung_tung_users");
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch (e) {
        console.error("Failed to parse users from localStorage", e);
      }
    }
    localStorage.setItem("tung_tung_users", JSON.stringify(seedUsers));
    return seedUsers;
  });

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const savedLeaves = localStorage.getItem("tung_tung_leaves");
    if (savedLeaves) {
      try {
        return JSON.parse(savedLeaves);
      } catch (e) {
        console.error("Failed to parse leaves from localStorage", e);
      }
    }
    localStorage.setItem("tung_tung_leaves", JSON.stringify(seedLeaveRequests));
    return seedLeaveRequests;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("tung_tung_current_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Failed to parse current user", e);
      }
    }
    return null;
  });

  const [notifications, setNotifications] = useState([]);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem("tung_tung_users", JSON.stringify(users));
  }, [users]);

  // Sync leave requests to localStorage
  useEffect(() => {
    localStorage.setItem("tung_tung_leaves", JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("tung_tung_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("tung_tung_current_user");
    }
  }, [currentUser]);

  // Login handler
  const login = (email, password) => {
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: "Invalid email or password" };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
  };

  // Add User (Admin only)
  const addUser = (userData) => {
    const newUser = {
      id: "user-" + Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password || "User@123", // default password
      role: userData.role || "user",
      squadName: userData.squadName || "Unassigned",
      kills: parseInt(userData.kills || 0, 10),
      status: userData.status || "Active",
      avatar: userData.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userData.name}`
    };

    setUsers((prev) => [...prev, newUser]);
    addNotification(`New user "${newUser.name}" has been registered.`);
    return newUser;
  };

  // Update User (Admin only, or user updating own photo if allowed)
  const updateUser = (userId, updatedData) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const merged = { ...user, ...updatedData };
          // If the updated user is the currently logged in user, update their session as well
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(merged);
          }
          return merged;
        }
        return user;
      })
    );
    addNotification(`User "${updatedData.name || userId}" profile updated.`);
  };

  // Delete User (Admin only)
  const deleteUser = (userId) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (userToDelete) {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      // Delete their leave requests too
      setLeaveRequests((prev) => prev.filter((leave) => leave.userId !== userId));
      addNotification(`User "${userToDelete.name}" was removed from the system.`);
    }
  };

  // Submit Leave Request (User only)
  const submitLeaveRequest = (leaveDate, reason) => {
    if (!currentUser) return;
    const newRequest = {
      id: "leave-" + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      leaveDate: leaveDate,
      reason: reason,
      status: "Pending"
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);
    addNotification(`Leave request submitted by "${currentUser.name}".`);
  };

  // Approve/Reject Leave Request (Admin only)
  const updateLeaveStatus = (leaveId, status) => {
    setLeaveRequests((prev) =>
      prev.map((leave) => {
        if (leave.id === leaveId) {
          return { ...leave, status };
        }
        return leave;
      })
    );
    
    // Find request to create custom notification
    const request = leaveRequests.find((l) => l.id === leaveId);
    if (request) {
      addNotification(`Leave request for "${request.userName}" has been ${status.toLowerCase()}.`);
    }
  };

  // Add a simple in-memory notification
  const addNotification = (message) => {
    const newNotif = {
      id: "notif-" + Date.now(),
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 10)); // Keep last 10
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Derived Leaderboard Data
  const getLeaderboardData = () => {
    // Return users sorted by kills descending, excluding admin (or including them if they have kills)
    // The prompt says "Ranking System Based On Kills", so we sort users by kills descending.
    return [...users]
      .filter((u) => u.role !== "admin" || u.kills > 0) // include admin if they have kills, or sort all
      .sort((a, b) => b.kills - a.kills);
  };

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
