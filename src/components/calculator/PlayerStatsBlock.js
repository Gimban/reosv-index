import React, { useState, useMemo, useEffect } from "react";
import "./PlayerStatsBlock.css";

function PlayerStatsBlock({
  maxLevel,
  damagePerAttack,
  damagePerHealth,
  onStatsChange,
}) {
  // Internal state for interactive mode
  const [level, setLevel] = useState(1);
  const [statDistribution, setStatDistribution] = useState("allAttack");
  const [moveSpeedPoints, setMoveSpeedPoints] = useState(0);
  const [directAttackPoints, setDirectAttackPoints] = useState(0);
  const [directHealthPoints, setDirectHealthPoints] = useState(0);

  const handleLevelChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 1;
    }
    const clampedValue = Math.max(1, Math.min(maxLevel, value));
    setLevel(clampedValue);
  };

  const handleMoveSpeedChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 0;
    }
    const clampedValue = Math.max(0, Math.min(10, value));
    setMoveSpeedPoints(clampedValue);
  };

  const calculatedStats = useMemo(() => {
    const validLevel = Math.max(1, level || 1);
    const totalPoints = validLevel > 1 ? validLevel - 1 : 0;
    const statPoints = Math.max(0, totalPoints - moveSpeedPoints);

    let finalAttackPoints = 0;
    let finalHealthPoints = 0;

    if (statDistribution === "allAttack") {
      finalAttackPoints = statPoints;
    } else if (statDistribution === "allHealth") {
      finalHealthPoints = statPoints;
    } else if (statDistribution === "directInput") {
      finalAttackPoints = Math.max(0, directAttackPoints || 0);
      finalHealthPoints = Math.max(0, directHealthPoints || 0);
    }

    const damageFromAttack = finalAttackPoints * damagePerAttack;
    const damageFromHealth = finalHealthPoints * damagePerHealth;
    const totalDamageIncrease = damageFromAttack + damageFromHealth;

    const isInputExceeded =
      statDistribution === "directInput" &&
      finalAttackPoints + finalHealthPoints > statPoints;

    return {
      totalPoints,
      statPoints,
      attackPoints: finalAttackPoints,
      healthPoints: finalHealthPoints,
      totalDamageIncrease,
      inputWarning: isInputExceeded
        ? `분배한 스탯 포인트(${
            finalAttackPoints + finalHealthPoints
          })가 가용 포인트(${statPoints})를 초과했습니다.`
        : null,
    };
  }, [
    level,
    statDistribution,
    moveSpeedPoints,
    directAttackPoints,
    directHealthPoints,
    damagePerAttack,
    damagePerHealth,
  ]);

  useEffect(() => {
    onStatsChange(calculatedStats);
  }, [calculatedStats, onStatsChange]);

  const { totalPoints, statPoints, totalDamageIncrease, inputWarning } =
    calculatedStats;

  return (
    <div className="calculator-block">
      <h2>플레이어 스탯</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="player-level">플레이어 레벨 (1-{maxLevel})</label>
          <input
            type="number"
            id="player-level"
            value={level}
            onChange={handleLevelChange}
            min="1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="move-speed-points">이동 속도 포인트 (0-10)</label>
          <input
            type="number"
            id="move-speed-points"
            value={moveSpeedPoints}
            onChange={handleMoveSpeedChange}
          />
        </div>
        <div className="form-group radio-group">
          <label>스탯 분배</label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="stat-distribution"
                value="allAttack"
                checked={statDistribution === "allAttack"}
                onChange={(e) => setStatDistribution(e.target.value)}
              />
              All 공격력
            </label>
            <label>
              <input
                type="radio"
                name="stat-distribution"
                value="allHealth"
                checked={statDistribution === "allHealth"}
                onChange={(e) => setStatDistribution(e.target.value)}
              />
              All 체력
            </label>
            <label>
              <input
                type="radio"
                name="stat-distribution"
                value="directInput"
                checked={statDistribution === "directInput"}
                onChange={(e) => setStatDistribution(e.target.value)}
              />
              직접 입력
            </label>
          </div>
        </div>

        {statDistribution === "directInput" && (
          <>
            <div className="form-group">
              <label htmlFor="attack-points">공격력 포인트</label>
              <input
                type="number"
                id="attack-points"
                value={directAttackPoints}
                onChange={(e) =>
                  setDirectAttackPoints(parseInt(e.target.value, 10) || 0)
                }
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="health-points">체력 포인트</label>
              <input
                type="number"
                id="health-points"
                value={directHealthPoints}
                onChange={(e) =>
                  setDirectHealthPoints(parseInt(e.target.value, 10) || 0)
                }
                min="0"
              />
            </div>
          </>
        )}
      </div>
      <div className="calculation-summary">
        <h3>계산 결과</h3>
        <p>
          총 스탯 포인트: <strong>{totalPoints}</strong>
        </p>
        <p>
          가용 스탯 포인트 (이속 제외): <strong>{statPoints}</strong>
        </p>
        {inputWarning && <p className="warning-text">{inputWarning}</p>}
        <p>
          레벨업 데미지 증가: <strong>{totalDamageIncrease.toFixed(2)}%</strong>
        </p>
      </div>
    </div>
  );
}

export default PlayerStatsBlock;
