import React, { useState, useMemo, useEffect } from "react";
import "./EnhancementControls.css";
import {
  getEnhancementInfo,
  performEnhancement as performEnhancementLogic,
} from "./enhancementHelper";

const parseNum = (val) => Number(String(val || "0").replace(/,/g, ""));

function EnhancementControls({
  weapon,
  currentLevel,
  guaranteedCostData,
  probabilisticCostData,
  onEnhance,
  isAutoEnhancing,
}) {
  const [probOptions, setProbOptions] = useState({
    downgradeProtection: false,
    resetProtection: false,
  });

  const weaponGrade = weapon[0]["등급"];
  const nextLevel = currentLevel + 1;

  const enhancementInfo = useMemo(
    () =>
      getEnhancementInfo(
        weaponGrade,
        nextLevel,
        guaranteedCostData,
        probabilisticCostData
      ),
    [weaponGrade, nextLevel, guaranteedCostData, probabilisticCostData]
  );

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
    const result = performEnhancementLogic(
      type,
      enhancementInfo,
      probOptions,
      currentLevel,
      weapon
    );
    if (result) onEnhance(result);
  };

  const renderCosts = (data) => {
    if (!data) return null;
    const costItems = [
      { name: "골드", value: parseNum(data["골드"]) },
      { name: "무형의 파편", value: parseNum(data["무형의 파편"]) },
      { name: "정교한 강화석", value: parseNum(data["정교한 강화석"]) },
      { name: "미가공 강화 원석", value: parseNum(data["미가공 강화 원석"]) },
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
            <button
              onClick={() => performEnhancement("guaranteed")}
              disabled={isAutoEnhancing}
            >
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
                    disabled={isAutoEnhancing}
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
                    disabled={isAutoEnhancing}
                  />
                  리셋 방지 (리셋 시 +0 무기 소모)
                  {probabilistic["리셋 방지 비용"] > 0 &&
                    ` (+${parseNum(
                      probabilistic["리셋 방지 비용"]
                    ).toLocaleString()} 골드)`}
                </label>
              )}
            </div>
            <button
              onClick={() => performEnhancement("probabilistic")}
              disabled={isAutoEnhancing}
            >
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
