import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protect routes that require authentication
export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protect admin-only routes
export const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "admin") {
    // If user is normal user, redirect to user dashboard
    return <Navigate to="/user" replace />;
  }

  return children;
};

// Redirect logged-in users away from the login page
export const AnonymousRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    if (currentUser.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }

  return children;
};
