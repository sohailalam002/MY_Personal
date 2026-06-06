import React from "react";
import { useAuth } from "../context/AuthContext";
import Leaderboard from "../components/Leaderboard";

const LeaderboardPage = () => {
  const { users } = useAuth();

  return (
    <div className="page-container">
      <Leaderboard players={users} />
    </div>
  );
};

export default LeaderboardPage;
