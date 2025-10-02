import React, { useState, useMemo, useEffect } from "react";

const MAX_PLAYER_LEVEL = 100;

function EhpPlayerStatsBlock({ onStatsChange }) {
  const [level, setLevel] = useState(1);
  const [moveSpeedPoints, setMoveSpeedPoints] = useState(0);
  const [finalDamagePoints, setFinalDamagePoints] = useState(0);

  const handleLevelChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 1;
    setLevel(Math.max(1, Math.min(MAX_PLAYER_LEVEL, value)));
  };

  const handleMoveSpeedChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 0;
    setMoveSpeedPoints(Math.max(0, Math.min(10, value)));
  };

  const calculatedStats = useMemo(() => {
    const validLevel = Math.max(1, level || 1);
    // 총 포인트 = 플레이어 레벨 - 1
    const totalPoints = validLevel > 1 ? validLevel - 1 : 0;
    const usedPoints = (moveSpeedPoints || 0) + (finalDamagePoints || 0);

    // 체력에 투자된 포인트 = (플레이어 레벨 - (1 + 이동 속도 포인트 + 최종 데미지 포인트))
    const healthPoints = Math.max(
      0,
      validLevel - (1 + (moveSpeedPoints || 0) + (finalDamagePoints || 0))
    );

    // 레벨업으로 얻는 체력 = 체력 포인트 * 25
    const levelUpHp = healthPoints * 25;

    const isInputExceeded = usedPoints > totalPoints;

    return {
      baseHp: 20, // 기본 체력 20으로 고정
      totalPoints,
      usedPoints,
      levelUpHp: levelUpHp,
      inputWarning: isInputExceeded
        ? `분배한 포인트(${usedPoints})가 총 포인트(${totalPoints})를 초과했습니다.`
        : null,
    };
  }, [level, moveSpeedPoints, finalDamagePoints]);

  useEffect(() => {
    onStatsChange(calculatedStats);
  }, [calculatedStats, onStatsChange]);

  const { totalPoints, usedPoints, levelUpHp, inputWarning } = calculatedStats;

  return (
    <div className="calculator-block">
      <h2>플레이어 스탯</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>플레이어 레벨 (1-{MAX_PLAYER_LEVEL})</label>
          <input type="number" value={level} onChange={handleLevelChange} />
        </div>
        <div className="form-group">
          <label>이동 속도 포인트 (0-10)</label>
          <input type="number" value={moveSpeedPoints} onChange={handleMoveSpeedChange} />
        </div>
        <div className="form-group">
          <label>최종 데미지 포인트</label>
          <input
            type="number"
            value={finalDamagePoints}
            onChange={(e) => setFinalDamagePoints(parseInt(e.target.value, 10) || 0)}
            min="0"
          />
        </div>
      </div>
      {inputWarning && <p className="warning-text">{inputWarning}</p>}
      <div className="calculation-summary">
        <h3>계산 정보</h3>
        <p>
          총 포인트: <strong>{totalPoints}</strong>
        </p>
        <p>
          사용된 포인트 (이속+최종뎀): <strong>{usedPoints}</strong>
        </p>
        <p>
          레벨업으로 얻는 체력(+n): <strong>{levelUpHp}</strong>
        </p>
      </div>
    </div>
  );
}

export default EhpPlayerStatsBlock;
