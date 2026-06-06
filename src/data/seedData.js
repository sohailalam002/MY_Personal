// Only admin is seeded by default.
// All regular users are created by Admin through the User Management panel.
export const seedUsers = [
  {
    id: "admin-1",
    name: "Admin Tung Tung",
    email: "admin@tungtungsahur.com",
    password: "Admin@123",
    role: "admin",
    squadName: "Tung Tung HQ",
    kills: 450,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin"
  }
];

// Leave requests start empty — users submit them from their dashboard.
export const seedLeaveRequests = [];
