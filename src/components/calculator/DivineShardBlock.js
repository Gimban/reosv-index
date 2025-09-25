import React, { useState, useEffect } from "react";

function DivineShardBlock({ onStatsChange }) {
  const [finalDamage, setFinalDamage] = useState(0);

  useEffect(() => {
    if (onStatsChange) onStatsChange({ finalDamage });
  }, [finalDamage, onStatsChange]);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setFinalDamage(Number(value) || 0);
  };

  return (
    <div className="calculator-block">
      <h2>디바인 샤드</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="divine-final-damage">
            최종 데미지 증가 (%)
            <br />
          </label>
          <input
            type="number"
            id="divine-final-damage"
            name="finalDamage"
            value={finalDamage}
            onChange={handleInputChange}
            min="0"
          />
        </div>
      </div>
    </div>
  );
}

export default DivineShardBlock;
