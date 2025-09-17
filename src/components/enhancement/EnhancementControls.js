import React, { useState, useMemo, useEffect } from "react";
import "./EnhancementControls.css";

const parseNum = (val) => Number(String(val || "0").replace(/,/g, ""));

function EnhancementControls({
  weapon,
  currentLevel,
  guaranteedCostData,
  probabilisticCostData,
  onEnhance,
}) {
  const [probOptions, setProbOptions] = useState({
    downgradeProtection: false,
    resetProtection: false,
  });

  const weaponGrade = weapon[0]["등급"];
  const nextLevel = currentLevel + 1;

  const enhancementInfo = useMemo(() => {
    const guaranteed = guaranteedCostData.find(
      (d) => d["등급"] === weaponGrade && parseNum(d["강화 차수"]) === nextLevel
    );
    const probabilistic = probabilisticCostData.find(
      (d) => d["등급"] === weaponGrade && parseNum(d["강화 차수"]) === nextLevel
    );
    return { guaranteed, probabilistic };
  }, [weaponGrade, nextLevel, guaranteedCostData, probabilisticCostData]);

  const { guaranteed, probabilistic } = enhancementInfo;

  // 강화 단계가 변경되어 옵션이 더 이상 유효하지 않을 때, 체크박스를 자동으로 해제합니다.
  useEffect(() => {
    const canDowngrade =
      probabilistic && parseNum(probabilistic["하락 확률"]) > 0;
    const canReset = probabilistic && parseNum(probabilistic["리셋 확률"]) > 0;

    setProbOptions((prev) => {
      if (
        (!canDowngrade && prev.downgradeProtection) ||
        (!canReset && prev.resetProtection)
      ) {
        return {
          ...prev,
          downgradeProtection: canDowngrade ? prev.downgradeProtection : false,
          resetProtection: canReset ? prev.resetProtection : false,
        };
      }
      return prev;
    });
  }, [probabilistic]);

  const handleProbOptionChange = (e) => {
    const { name, checked } = e.target;
    setProbOptions((prev) => ({ ...prev, [name]: checked }));
  };

  const performEnhancement = (type) => {
    let result = { fromLevel: currentLevel };
    const { guaranteed, probabilistic } = enhancementInfo;

    if (type === "guaranteed" && guaranteed) {
      const costs = {
        골드: parseNum(guaranteed["골드"]),
        "무형의 파편": parseNum(guaranteed["무형의 파편"]),
        "정교한 강화석": parseNum(guaranteed["정교한 강화석"]),
      };
      result = {
        ...result,
        outcome: "성공 (확정)",
        newLevel: nextLevel,
        costs,
      };
    } else if (type === "probabilistic" && probabilistic) {
      let successChance = parseNum(probabilistic["성공 확률"]);
      let failureChance = parseNum(probabilistic["실패 확률"]);
      let downgradeChance = parseNum(probabilistic["하락 확률"]);

      const costs = {
        골드: parseNum(probabilistic["골드"]),
        "무형의 파편": parseNum(probabilistic["무형의 파편"]),
        "정교한 강화석": parseNum(probabilistic["정교한 강화석"]),
      };

      if (probOptions.downgradeProtection) {
        const halfSuccess = successChance / 2;
        failureChance += downgradeChance + halfSuccess;
        downgradeChance = 0;
        successChance = halfSuccess;
        costs["골드"] += parseNum(probabilistic["하락 방지 비용"]);
      }

      const rand = Math.random();
      let cumulativeChance = 0;

      cumulativeChance += successChance;
      if (rand < cumulativeChance) {
        result = { ...result, outcome: "성공", newLevel: nextLevel, costs };
      } else {
        cumulativeChance += failureChance;
        if (rand < cumulativeChance) {
          result = {
            ...result,
            outcome: "실패",
            newLevel: currentLevel,
            costs,
          };
        } else {
          cumulativeChance += downgradeChance;
          if (rand < cumulativeChance) {
            result = {
              ...result,
              outcome: "하락",
              newLevel: Math.max(0, currentLevel - 1),
              costs,
            };
          } else {
            // Reset
            if (probOptions.resetProtection) {
              costs["골드"] += parseNum(probabilistic["리셋 방지 비용"]);
              result = {
                ...result,
                outcome: "리셋 (방지됨)",
                newLevel: currentLevel,
                costs,
                consumedWeaponName: weapon[0]["이름"],
              };
            } else {
              result = { ...result, outcome: "리셋", newLevel: 0, costs };
            }
          }
        }
      }
    } else {
      return; // No valid enhancement type
    }
    onEnhance(result);
  };

  const renderCosts = (data) => {
    if (!data) return null;
    const costItems = [
      { name: "골드", value: parseNum(data["골드"]) },
      { name: "무형의 파편", value: parseNum(data["무형의 파편"]) },
      { name: "정교한 강화석", value: parseNum(data["정교한 강화석"]) },
    ];
    return (
      <ul className="cost-list">
        {costItems
          .filter((item) => item.value > 0)
          .map((item) => (
            <li key={item.name}>
              {item.name}: {item.value.toLocaleString()}
            </li>
          ))}
      </ul>
    );
  };

  const displayProbs = useMemo(() => {
    if (!probabilistic) {
      return null;
    }

    let success = parseNum(probabilistic["성공 확률"]);
    let failure = parseNum(probabilistic["실패 확률"]);
    let downgrade = parseNum(probabilistic["하락 확률"]);
    const reset = parseNum(probabilistic["리셋 확률"]);

    if (probOptions.downgradeProtection) {
      const halfSuccess = success / 2;
      failure += downgrade + halfSuccess;
      downgrade = 0;
      success = halfSuccess;
    }

    return { success, failure, downgrade, reset };
  }, [probabilistic, probOptions.downgradeProtection]);

  return (
    <div className="enhancement-controls">
      <div className="enhancement-option guaranteed">
        <h3>확정 강화 (+{nextLevel})</h3>
        {guaranteed ? (
          <>
            {renderCosts(guaranteed)}
            <button onClick={() => performEnhancement("guaranteed")}>
              확정 강화 시도
            </button>
          </>
        ) : (
          <>
            <div className="no-info-container">
              <p>해당 단계의 확정 강화 정보가 없습니다.</p>
            </div>
            <button disabled>강화 불가</button>
          </>
        )}
      </div>
      <div className="enhancement-option probabilistic">
        <h3>확률 강화 (+{nextLevel})</h3>
        {probabilistic ? (
          <>
            <div className="prob-info">
              {displayProbs.success > 0 && (
                <p className="prob-success">
                  성공: {(displayProbs.success * 100).toFixed(1)}%
                </p>
              )}
              {displayProbs.failure > 0 && (
                <p className="prob-failure">
                  실패: {(displayProbs.failure * 100).toFixed(1)}%
                </p>
              )}
              {displayProbs.downgrade > 0 && (
                <p className="prob-downgrade">
                  하락: {(displayProbs.downgrade * 100).toFixed(1)}%
                </p>
              )}
              {displayProbs.reset > 0 && (
                <p className="prob-reset">
                  리셋: {(displayProbs.reset * 100).toFixed(1)}%
                </p>
              )}
            </div>
            {renderCosts(probabilistic)}
            <div className="prob-options">
              {parseNum(probabilistic["하락 확률"]) > 0 && (
                <label>
                  <input
                    type="checkbox"
                    name="downgradeProtection"
                    checked={probOptions.downgradeProtection}
                    onChange={handleProbOptionChange}
                  />
                  하락 방지 (성공 확률 1/2, 하락/감소분은 실패 확률로)
                  {probabilistic["하락 방지 비용"] > 0 &&
                    ` (+${parseNum(
                      probabilistic["하락 방지 비용"]
                    ).toLocaleString()} 골드)`}
                </label>
              )}
              {parseNum(probabilistic["리셋 확률"]) > 0 && (
                <label>
                  <input
                    type="checkbox"
                    name="resetProtection"
                    checked={probOptions.resetProtection}
                    onChange={handleProbOptionChange}
                  />
                  리셋 방지 (리셋 시 +0 무기 소모)
                  {probabilistic["리셋 방지 비용"] > 0 &&
                    ` (+${parseNum(
                      probabilistic["리셋 방지 비용"]
                    ).toLocaleString()} 골드)`}
                </label>
              )}
            </div>
            <button onClick={() => performEnhancement("probabilistic")}>
              확률 강화 시도
            </button>
          </>
        ) : (
          <>
            <div className="no-info-container">
              <p>해당 단계의 확률 강화 정보가 없습니다.</p>
            </div>
            <button disabled>강화 불가</button>
          </>
        )}
      </div>
    </div>
  );
}

export default EnhancementControls;
