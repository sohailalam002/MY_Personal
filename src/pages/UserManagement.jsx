import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Search, UserPlus, Grid, List, X, Upload } from "lucide-react";
import UserTable from "../components/UserTable";
import UserCard from "../components/UserCard";
import "./UserManagement.css";

const PRESET_AVATARS = [
  { name: "Hayato", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hayato" },
  { name: "Alok", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alok" },
  { name: "Chrono", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Chrono" },
  { name: "Kelly", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kelly" },
  { name: "Wukong", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Wukong" },
  { name: "Moco", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Moco" },
  { name: "Maxim", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Maxim" },
  { name: "Steffie", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Steffie" }
];

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    squadName: "",
    kills: 0,
    status: "Active",
    avatar: PRESET_AVATARS[0].url
  });
  const [customAvatarBase64, setCustomAvatarBase64] = useState("");
  const [formError, setFormError] = useState("");

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.squadName.toLowerCase().includes(term)
    );
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      squadName: "",
      kills: 0,
      status: "Active",
      avatar: PRESET_AVATARS[0].url
    });
    setCustomAvatarBase64("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || "",
      squadName: user.squadName,
      kills: user.kills,
      status: user.status,
      avatar: user.avatar
    });
    setCustomAvatarBase64(user.avatar.startsWith("data:") ? user.avatar : "");
    setFormError("");
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "kills" ? Math.max(0, parseInt(value || 0, 10)) : value
    }));
  };

  const handleAvatarSelect = (url) => {
    setCustomAvatarBase64("");
    setFormData((prev) => ({ ...prev, avatar: url }));
  };

  // Compress image using canvas (max 400×400, 80% JPEG quality)
  // This handles large mobile camera photos (3–10MB) without hitting localStorage limits
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => reject(new Error("Failed to read file"));

      reader.onload = (evt) => {
        const img = new Image();

        img.onerror = () => reject(new Error("Failed to load image"));

        img.onload = () => {
          const MAX_SIZE = 400; // max width or height in px
          let { width, height } = img;

          // Scale down proportionally
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG at 80% quality → small base64
          const compressed = canvas.toDataURL("image/jpeg", 0.8);
          resolve(compressed);
        };

        img.src = evt.target.result;
      };

      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e) => {
    // Reset input value so the same file can be re-selected on mobile
    const file = e.target.files[0];
    e.target.value = "";

    if (!file) return;

    // Accept any image regardless of size — canvas will compress it
    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file (JPG, PNG, WEBP, etc.).");
      return;
    }

    setFormError("");

    try {
      const compressed = await compressImage(file);
      setCustomAvatarBase64(compressed);
      setFormData((prev) => ({ ...prev, avatar: compressed }));
    } catch (err) {
      console.error("Image compression failed:", err);
      setFormError("Could not process image. Please try a different photo.");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    // Validate email uniquely on add
    if (!editingUser) {
      const emailExists = users.some((u) => u.email.toLowerCase() === formData.email.toLowerCase());
      if (emailExists) {
        setFormError("A soldier with this email address already exists.");
        return;
      }
    } else {
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUser.id
      );
      if (emailExists) {
        setFormError("A soldier with this email address already exists.");
        return;
      }
    }

    try {
      if (editingUser) {
        updateUser(editingUser.id, formData);
      } else {
        addUser(formData);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError("An unexpected error occurred saving user information.");
    }
  };

  const handleDeleteClick = (userId) => {
    if (window.confirm("Are you sure you want to dismiss this soldier from the squad?")) {
      deleteUser(userId);
    }
  };

  return (
    <div className="page-container">
      {/* Filtering and Actions Bar */}
      <div className="management-action-bar glass-panel">
        <div className="search-box-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search soldiers by name, email, or squad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="action-buttons-group">
          {/* Toggle Display Layouts */}
          <div className="toggle-view-buttons">
            <button
              onClick={() => setViewMode("table")}
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`toggle-btn ${viewMode === "card" ? "active" : ""}`}
              title="Card Grid View"
            >
              <Grid size={16} />
            </button>
          </div>

          <button onClick={openAddModal} className="btn btn-primary">
            <UserPlus size={16} /> Add Soldier
          </button>
        </div>
      </div>

      {/* Main Roster Listing */}
      {viewMode === "table" ? (
        <UserTable
          usersList={filteredUsers}
          onEdit={openEditModal}
          onDelete={handleDeleteClick}
        />
      ) : (
        <div className="cards-grid">
          {filteredUsers.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "var(--text-gray)" }}>
              No soldiers registered in this squad.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={openEditModal}
                onDelete={handleDeleteClick}
              />
            ))
          )}
        </div>
      )}

      {/* Add / Edit Modal Drawer */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel glowing-border">
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? "Edit Soldier Profile" : "Register New Soldier"}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && <div className="user-alert alert-danger" style={{ marginBottom: "16px" }}>{formError}</div>}

            <form onSubmit={handleFormSubmit} className="user-edit-form">
              {/* Profile Avatar Selection Box */}
              <div className="avatar-selection-container">
                <span className="form-label" style={{ marginBottom: "8px", display: "block" }}>Profile Avatar</span>
                
                {/* Preset Avatars Gallery */}
                <div className="presets-gallery">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.name}
                      type="button"
                      className={`preset-av-btn ${formData.avatar === av.url ? "selected" : ""}`}
                      onClick={() => handleAvatarSelect(av.url)}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} />
                    </button>
                  ))}
                  {customAvatarBase64 && (
                    <button
                      type="button"
                      className={`preset-av-btn selected`}
                      onClick={() => handleAvatarSelect(customAvatarBase64)}
                      title="Uploaded photo"
                    >
                      <img src={customAvatarBase64} alt="Custom" />
                    </button>
                  )}
                </div>

                {/* File Upload Box — mobile friendly */}
                <label className="custom-photo-upload-label" style={{ position: "relative" }}>
                  <Upload size={14} /> Upload Photo from Gallery / Camera
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif,image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {customAvatarBase64 && (
                  <p style={{ fontSize: "11px", color: "var(--success)", marginTop: "4px" }}>
                    ✓ Photo uploaded & compressed successfully
                  </p>
                )}
              </div>

              {/* Form Input fields */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-name">Soldier Tag Name</label>
                  <input
                    id="field-name"
                    name="name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-email">System Email</label>
                  <input
                    id="field-email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-password">Access Code (Password)</label>
                  <input
                    id="field-password"
                    name="password"
                    type="text"
                    className="form-input"
                    placeholder="Enter password..."
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-squad">Squad Name</label>
                  <input
                    id="field-squad"
                    name="squadName"
                    type="text"
                    className="form-input"
                    value={formData.squadName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-kills">Total Kills</label>
                  <input
                    id="field-kills"
                    name="kills"
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.kills}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-status">Status</label>
                  <select
                    id="field-status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-actions-submit">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? "Apply Updates" : "Deploy Soldier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
