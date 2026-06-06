import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Swords, Lock, Mail, AlertTriangle } from "lucide-react";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        if (result.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      } else {
        setError(result.message);
      }
    }, 800); // Small delay for immersive loading experience
  };



  return (
    <div className="login-page-container">
      <div className="login-card glass-panel glowing-border">
        {/* Gaming Brand Logo */}
        <div className="login-brand">
          <div className="brand-icon-glow">
            <Swords className="login-logo-icon" size={40} />
          </div>
          <h2 className="login-app-title">
            TUNG TUNG <span className="accent-text">SAHUR</span>
          </h2>
          <p className="login-app-subtitle">FREE FIRE SQUAD CONTROL</p>
        </div>

        {/* Errors alerts */}
        {error && (
          <div className="login-error-alert">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group relative">
            <label className="form-label" htmlFor="login-email">Soldier Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="Enter registered email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group relative">
            <label className="form-label" htmlFor="login-password">Access Code</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Enter password code..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
            {loading ? "Decrypting Signals..." : "Connect to Server"}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
