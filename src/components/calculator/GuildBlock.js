import React, { useState, useEffect } from "react";

const MAX_BOND_LEVEL = 6;

function GuildBlock({ onStatsChange }) {
  const [bondLevel, setBondLevel] = useState(1);

  const handleLevelChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 1;
    }
    const clampedValue = Math.max(1, Math.min(MAX_BOND_LEVEL, value));
    setBondLevel(clampedValue);
  };

  useEffect(() => {
    const bonusPoints = Math.max(0, bondLevel - 1);
    const stats = {
      finalDmgStat: bonusPoints,
      maxHpStat: bonusPoints,
    };
    if (onStatsChange) {
      onStatsChange(stats);
    }
  }, [bondLevel, onStatsChange]);

  return (
    <div className="calculator-block">
      <h2>길드 업그레이드</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="guild-bond-level">
            길드원의 유대 (Max Lv: {MAX_BOND_LEVEL})
          </label>
          <input
            type="number"
            id="guild-bond-level"
            value={bondLevel}
            onChange={handleLevelChange}
            min="1"
            max={MAX_BOND_LEVEL}
          />
        </div>
      </div>
    </div>
  );
}

export default GuildBlock;
