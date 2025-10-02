import React, { useState, useEffect } from "react";

function EhpDivineShardBlock({ onStatsChange }) {
  const [flatHp, setFlatHp] = useState(0);

  useEffect(() => {
    onStatsChange({ flatHp });
  }, [flatHp, onStatsChange]);

  const handleChange = (e) => {
    const { value } = e.target;
    setFlatHp(parseFloat(value) || 0);
  };

  return (
    <div className="calculator-block">
      <h2>디바인 샤드</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>최대 체력 증가 +</label>
          <input type="number" name="flatHp" value={flatHp} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}

export default EhpDivineShardBlock;
