import React, { useState, useEffect, useMemo } from "react";
import "./AutoEnhancementControls.css";

const parseNum = (val) => Number(String(val || "0").replace(/,/g, ""));

function AutoEnhancementControls({
  maxLevel,
  onStart,
  onPause,
  onStop,
  isAutoEnhancing,
  isAutoPaused,
  probabilisticCostData,
  guaranteedCostData,
  weaponGrade,
}) {
  const [targetLevel, setTargetLevel] = useState(maxLevel);
  const [downgradeProtectLevels, setDowngradeProtectLevels] = useState(
    new Set()
  );
  const [resetProtectLevels, setResetProtectLevels] = useState(new Set());
  const [guaranteedLevels, setGuaranteedLevels] = useState(new Set());

  const availableProtections = useMemo(() => {
    const downgrade = new Set();
    const reset = new Set();
    if (!probabilisticCostData || !weaponGrade) return { downgrade, reset };

    probabilisticCostData.forEach((d) => {
      if (d["등급"] === weaponGrade) {
        const level = parseNum(d["강화 차수"]);
        if (parseNum(d["하락 확률"]) > 0) {
          downgrade.add(level);
        }
        if (parseNum(d["리셋 확률"]) > 0) {
          reset.add(level);
        }
      }
    });
    return { downgrade, reset };
  }, [probabilisticCostData, weaponGrade]);

  const availableGuaranteedLevels = useMemo(() => {
    const levels = new Set();
    if (!guaranteedCostData || !weaponGrade) return levels;

    guaranteedCostData.forEach((d) => {
      if (d["등급"] === weaponGrade) {
        const level = parseNum(d["강화 차수"]);
        levels.add(level);
      }
    });
    return levels;
  }, [guaranteedCostData, weaponGrade]);

  useEffect(() => {
    setTargetLevel(maxLevel);
    // Reset protection levels when weapon changes
    setDowngradeProtectLevels(new Set());
    setResetProtectLevels(new Set());
    setGuaranteedLevels(new Set());
  }, [maxLevel, weaponGrade]); // weaponGrade to ensure reset on weapon change

  const handleSelectAll = (type) => {
    if (type === "guaranteed") {
      setGuaranteedLevels(new Set(availableGuaranteedLevels));
    } else if (type === "downgrade") {
      setDowngradeProtectLevels(new Set(availableProtections.downgrade));
    } else {
      // reset
      setResetProtectLevels(new Set(availableProtections.reset));
    }
  };

  const handleDeselectAll = (type) => {
    if (type === "guaranteed") {
      setGuaranteedLevels(new Set());
    } else if (type === "downgrade") {
      setDowngradeProtectLevels(new Set());
    } else {
      setResetProtectLevels(new Set());
    }
  };

  const handleLevelToggle = (type, level) => {
    const updater =
      type === "guaranteed"
        ? setGuaranteedLevels
        : type === "downgrade"
        ? setDowngradeProtectLevels
        : setResetProtectLevels;
    updater((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const handleStartClick = () => {
    onStart({
      targetLevel,
      guaranteedLevels,
      downgradeProtectLevels,
      resetProtectLevels,
    });
  };

  return (
    <div className="auto-enhancement-controls">
      <h3>자동 강화 설정</h3>
      <div className="auto-setting-item">
        <label htmlFor="target-level">목표 강화 (+{targetLevel})</label>
        <input
          type="range"
          id="target-level"
          min="1"
          max={maxLevel}
          value={targetLevel}
          onChange={(e) => setTargetLevel(Number(e.target.value))}
          disabled={isAutoEnhancing}
        />
      </div>
      <div className="protection-settings">
        <div className="protection-item">
          <div className="protection-header">
            <span className="protection-title">확정 강화</span>
            <div className="protection-header-buttons">
              <button
                onClick={() => handleSelectAll("guaranteed")}
                disabled={
                  isAutoEnhancing || availableGuaranteedLevels.size === 0
                }
              >
                모두 선택
              </button>
              <button
                onClick={() => handleDeselectAll("guaranteed")}
                disabled={isAutoEnhancing || guaranteedLevels.size === 0}
              >
                모두 해제
              </button>
            </div>
          </div>
          {availableGuaranteedLevels.size > 0 && (
            <div className="level-checkbox-grid">
              {[...availableGuaranteedLevels]
                .sort((a, b) => a - b)
                .map((level) => (
                  <label key={`g-${level}`}>
                    <input
                      type="checkbox"
                      checked={guaranteedLevels.has(level)}
                      onChange={() => handleLevelToggle("guaranteed", level)}
                      disabled={isAutoEnhancing}
                    />
                    +{level}
                  </label>
                ))}
            </div>
          )}
        </div>
        <div className="protection-item">
          <div className="protection-header">
            <span className="protection-title">하락 방지</span>
            <div className="protection-header-buttons">
              <button
                onClick={() => handleSelectAll("downgrade")}
                disabled={
                  isAutoEnhancing || availableProtections.downgrade.size === 0
                }
              >
                모두 선택
              </button>
              <button
                onClick={() => handleDeselectAll("downgrade")}
                disabled={isAutoEnhancing || downgradeProtectLevels.size === 0}
              >
                모두 해제
              </button>
            </div>
          </div>
          {availableProtections.downgrade.size > 0 && (
            <div className="level-checkbox-grid">
              {[...availableProtections.downgrade]
                .sort((a, b) => a - b)
                .map((level) => (
                  <label key={`d-${level}`}>
                    <input
                      type="checkbox"
                      checked={downgradeProtectLevels.has(level)}
                      onChange={() => handleLevelToggle("downgrade", level)}
                      disabled={isAutoEnhancing}
                    />
                    +{level}
                  </label>
                ))}
            </div>
          )}
        </div>
        <div className="protection-item">
          <div className="protection-header">
            <span className="protection-title">리셋 방지</span>
            <div className="protection-header-buttons">
              <button
                onClick={() => handleSelectAll("reset")}
                disabled={
                  isAutoEnhancing || availableProtections.reset.size === 0
                }
              >
                모두 선택
              </button>
              <button
                onClick={() => handleDeselectAll("reset")}
                disabled={isAutoEnhancing || resetProtectLevels.size === 0}
              >
                모두 해제
              </button>
            </div>
          </div>
          {availableProtections.reset.size > 0 && (
            <div className="level-checkbox-grid">
              {[...availableProtections.reset]
                .sort((a, b) => a - b)
                .map((level) => (
                  <label key={`r-${level}`}>
                    <input
                      type="checkbox"
                      checked={resetProtectLevels.has(level)}
                      onChange={() => handleLevelToggle("reset", level)}
                      disabled={isAutoEnhancing}
                    />
                    +{level}
                  </label>
                ))}
            </div>
          )}
        </div>
      </div>
      <div className="auto-buttons">
        {!isAutoEnhancing ? (
          <button className="start-btn" onClick={handleStartClick}>
            자동 강화 시작
          </button>
        ) : (
          <>
            <button className="pause-btn" onClick={onPause}>
              {isAutoPaused ? "재개" : "일시정지"}
            </button>
            <button className="stop-btn" onClick={onStop}>
              중단
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AutoEnhancementControls;
