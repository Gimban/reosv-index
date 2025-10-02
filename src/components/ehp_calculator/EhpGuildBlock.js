import React, { useState, useEffect, useMemo } from "react";

const MAX_GUILD_UPGRADE_LEVEL = 6;

function EhpGuildBlock({ onStatsChange }) {
  const [bondLevel, setBondLevel] = useState(1);
  const [spiritLevel, setSpiritLevel] = useState(1);

  const handleLevelChange = (setter) => (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 1;
    const clampedValue = Math.max(1, Math.min(MAX_GUILD_UPGRADE_LEVEL, value));
    setter(clampedValue);
  };

  const calculatedStats = useMemo(() => {
    // 1레벨은 효과가 없으므로 (레벨 - 1)을 적용합니다.
    const hpStat = Math.max(0, bondLevel - 1);
    const damageReduction = Math.max(0, spiritLevel - 1);

    return {
      hpStat,
      damageReduction,
    };
  }, [bondLevel, spiritLevel]);

  useEffect(() => {
    onStatsChange(calculatedStats);
  }, [calculatedStats, onStatsChange]);

  return (
    <div className="calculator-block">
      <h2>길드</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>길드원의 유대 (1-{MAX_GUILD_UPGRADE_LEVEL})</label>
          <input type="number" value={bondLevel} onChange={handleLevelChange(setBondLevel)} min="1" max={MAX_GUILD_UPGRADE_LEVEL} />
          <p style={{ fontSize: '0.8em', color: 'gray', marginTop: '5px' }}>
            최대 체력 스탯 +{calculatedStats.hpStat}
          </p>
        </div>
        <div className="form-group">
          <label>불굴의 투지 (1-{MAX_GUILD_UPGRADE_LEVEL})</label>
          <input type="number" value={spiritLevel} onChange={handleLevelChange(setSpiritLevel)} min="1" max={MAX_GUILD_UPGRADE_LEVEL} />
          <p style={{ fontSize: '0.8em', color: 'gray', marginTop: '5px' }}>
            받는 피해 감소 +{calculatedStats.damageReduction}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default EhpGuildBlock;
