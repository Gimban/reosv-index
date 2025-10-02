import React, { useState, useEffect } from "react";

function EhpDivineShardBlock({ onStatsChange }) {
  const [stats, setStats] = useState({
    maxHp: 0,
    damageReduction: 0,
  });

  useEffect(() => {
    onStatsChange(stats);
  }, [stats, onStatsChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStats(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="calculator-block">
      <h2>디바인 샤드</h2>
      <div className="form-grid">
        <div className="form-group"><label>최대 체력</label><input type="number" name="maxHp" value={stats.maxHp} onChange={handleChange} /></div>
        <div className="form-group"><label>피해 감소 %</label><input type="number" name="damageReduction" value={stats.damageReduction} onChange={handleChange} /></div>
      </div>
    </div>
  );
}

export default EhpDivineShardBlock;
