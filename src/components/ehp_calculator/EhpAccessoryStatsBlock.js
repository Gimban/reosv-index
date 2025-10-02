import React, { useState, useEffect } from "react";

// 이 컴포넌트는 현재는 입력 필드만 제공하며,
// 향후 DPS 계산기처럼 장신구 데이터를 기반으로 드롭다운 선택 기능을 추가할 수 있습니다.
function EhpAccessoryStatsBlock({ onStatsChange, accessoryBaseData, accessoryPotentialOptionData }) {
  const [stats, setStats] = useState({
    maxHp: 0,
    maxHpPercent: 0,
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
      <h2>장신구</h2>
      <div className="form-grid">
        <div className="form-group"><label>최대 체력</label><input type="number" name="maxHp" value={stats.maxHp} onChange={handleChange} /></div>
        <div className="form-group"><label>최대 체력 %</label><input type="number" name="maxHpPercent" value={stats.maxHpPercent} onChange={handleChange} /></div>
        <div className="form-group"><label>피해 감소 %</label><input type="number" name="damageReduction" value={stats.damageReduction} onChange={handleChange} /></div>
      </div>
    </div>
  );
}

export default EhpAccessoryStatsBlock;
