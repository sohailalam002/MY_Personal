import React from "react";
import { Trophy, Target, Crown, Award, Medal } from "lucide-react";
import "./Leaderboard.css";

const Leaderboard = ({ players }) => {
  // Sort players by kills descending
  const sortedPlayers = [...players].sort((a, b) => b.kills - a.kills);

  // Divide into podium (top 3) and list (rest)
  const podium = sortedPlayers.slice(0, 3);
  const remainder = sortedPlayers.slice(3);

  // Order podium as [2nd, 1st, 3rd] for classic visual display
  const orderedPodium = [];
  if (podium[1]) orderedPodium.push({ ...podium[1], rank: 2 });
  if (podium[0]) orderedPodium.push({ ...podium[0], rank: 1 });
  if (podium[2]) orderedPodium.push({ ...podium[2], rank: 3 });

  const getPodiumClass = (rank) => {
    if (rank === 1) return "podium-gold";
    if (rank === 2) return "podium-silver";
    return "podium-bronze";
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <Crown className="podium-crown gold" size={24} />;
    if (rank === 2) return <Award className="podium-crown silver" size={20} />;
    return <Medal className="podium-crown bronze" size={20} />;
  };

  return (
    <div className="leaderboard-wrapper">
      {/* Top 3 Podium Displays */}
      {podium.length > 0 && (
        <div className="leaderboard-podium-section">
          {orderedPodium.map((player) => (
            <div key={player.id} className={`podium-card glass-panel ${getPodiumClass(player.rank)}`}>
              <div className="podium-badge-wrapper">
                {getRankBadge(player.rank)}
                <div className={`rank-number-bubble r-${player.rank}`}>{player.rank}</div>
              </div>
              
              <div className="podium-avatar-wrapper">
                <img src={player.avatar} alt={player.name} className="podium-avatar" />
              </div>

              <div className="podium-info">
                <h3 className="podium-name">{player.name}</h3>
                <span className="podium-squad">{player.squadName}</span>
                
                <div className="podium-kills-capsule">
                  <Target size={12} className="target-icon" />
                  <span className="kills-val">{player.kills} Kills</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Standings Table List */}
      <div className="leaderboard-table-section glass-panel">
        <div className="leaderboard-table-header">
          <Trophy size={18} className="trophy-icon" />
          <span>General Standings</span>
        </div>

        <div className="table-container">
          <table className="gaming-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Rank</th>
                <th>Survivor</th>
                <th>Squad Name</th>
                <th>Total Kills</th>
              </tr>
            </thead>
            <tbody>
              {remainder.length === 0 && podium.length <= 3 && remainder.length === 0 ? (
                // If we display all in podium, or list has none
                sortedPlayers.map((player, index) => {
                  if (index < 3) return null; // Already in podium
                  return null;
                })
              ) : null}
              
              {sortedPlayers.map((player, index) => {
                const rank = index + 1;
                // Still show everybody in the table for a comprehensive list
                return (
                  <tr key={player.id} className={rank <= 3 ? "highlight-rank-row" : ""}>
                    <td>
                      <div className={`rank-circle r-${rank}`}>
                        {rank}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: rank <= 3 ? "2px solid var(--primary-accent)" : "1px solid rgba(255,255,255,0.15)",
                          background: "rgba(0,0,0,0.2)"
                        }}>
                          <img 
                            src={player.avatar} 
                            alt={player.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <span style={{ fontWeight: "600" }}>{player.name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: "500", color: "#ff8a36" }}>{player.squadName}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
                        <Target size={14} style={{ color: "var(--primary-accent)" }} />
                        <span>{player.kills}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
