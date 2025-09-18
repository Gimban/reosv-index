import React, { useState, useMemo, useEffect } from "react";
import "./ClassEnhancementCalculator.css";

const parseNum = (val) => Number(String(val || "0").replace(/,/g, ""));

function ClassEnhancementCalculator({ costData }) {
  const [currentAdv, setCurrentAdv] = useState(1);
  const [currentEnh, setCurrentEnh] = useState(1);
  const [targetAdv, setTargetAdv] = useState(1);
  const [targetEnh, setTargetEnh] = useState(1);

  const { levels, materials } = useMemo(() => {
    if (!costData || costData.length === 0) { // materials는 이제 사용되지 않으므로 제거해도 됩니다.
      return { levels: {}, materials: [] };
    }

    const levels = { adv: new Set(), enh: {} };
    const materialSet = new Set(["골드", "무형의 파편"]);

    costData.forEach((row) => {
      const adv = parseNum(row["전직 차수"]);
      const enh = parseNum(row["강화 차수"]);

      levels.adv.add(adv);
      if (!levels.enh[adv]) {
        levels.enh[adv] = new Set();
      }
      levels.enh[adv].add(enh);

    });

    // Set을 정렬된 배열로 변환
    levels.adv = [...levels.adv].sort((a, b) => a - b);
    for (const adv in levels.enh) {
      levels.enh[adv] = [...levels.enh[adv]].sort((a, b) => a - b);
    }

    return { levels, materials: [] }; // 더 이상 materials를 사용하지 않음
  }, [costData]);

  // 현재 전직 차수가 변경되거나 레벨 데이터가 로드될 때 현재 강화 차수를 업데이트
useEffect(() => {
  if (levels.enh && levels.enh[currentAdv]?.length > 0) {
    // 현재 강화 레벨이 유효하지 않은 경우 (초기 null 상태 포함) 첫 번째 값으로 설정
    if (currentEnh === null || !levels.enh[currentAdv].includes(currentEnh)) {
      setCurrentEnh(levels.enh[currentAdv][0]);
    }
  }
}, [currentAdv, levels, currentEnh]);

  // 목표 전직 차수가 변경될 때 목표 강화 차수를 업데이트
  useEffect(() => {
    if (levels.enh && levels.enh[targetAdv]?.length > 0) {
      if (!levels.enh[targetAdv].includes(targetEnh)) {
        setTargetEnh(levels.enh[targetAdv][0]);
      }
    }
  }, [targetAdv, levels]);


  const calculatedCost = useMemo(() => {
    if (!costData || costData.length === 0) return null;

    const startKey = `${currentAdv}-${currentEnh}`;
    const endKey = `${targetAdv}-${targetEnh}`;

    if (
      currentAdv > targetAdv ||
      (currentAdv === targetAdv && currentEnh >= targetEnh)
    ) {
      return { error: "목표가 현재 레벨보다 낮거나 같습니다." };
    }

    const totalCost = {
      "골드": 0,
      "무형의 파편": 0,
      "추가 재료": []
    };

    let inRange = false;
    for (const row of costData) {
      const rowAdv = parseNum(row["전직 차수"]);
      const rowEnh = parseNum(row["강화 차수"]);
      const rowKey = `${rowAdv}-${rowEnh}`;

      if (rowKey === startKey) {
        inRange = true;
      }

      if (inRange) {
        totalCost["골드"] += parseNum(row["골드"]);
        totalCost["무형의 파편"] += parseNum(row["무형의 파편"]);

        // 동적 재료 처리
        for (let i = 1; i <= 3; i++) {
          const materialColumn = `강화 재료 ${i}`;
          const materialText = row[materialColumn];
          if (materialText) {
            totalCost["추가 재료"].push(materialText);
          }
        }
      }

      if (rowKey === endKey) {
        inRange = false;
        break;
      }
    }

    return totalCost;
  }, [currentAdv, currentEnh, targetAdv, targetEnh, costData]);

  const renderSelect = (label, value, setter, options) => (
    <div className="form-group">
      <label>{label}</label>
      <select value={value} onChange={(e) => setter(parseNum(e.target.value))}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  if (!costData || costData.length === 0) {
    return <p>클래스 무기 강화 비용 데이터를 불러오는 중입니다...</p>;
  }

  return (
    <div className="class-enhancement-calculator">
      <h1>클래스 무기 강화 비용 계산기</h1>
      <div className="calculator-main">
        <div className="calculator-controls">
          <fieldset>
            <legend>현재 레벨</legend>
            {renderSelect(
              "전직 차수",
              currentAdv,
              setCurrentAdv,
              levels.adv || []
            )}
            {renderSelect(
              "강화 차수",
              currentEnh,
              setCurrentEnh,
              levels.enh[currentAdv] || []
            )}
          </fieldset>
          <fieldset>
            <legend>목표 레벨</legend>
            {renderSelect(
              "전직 차수",
              targetAdv,
              setTargetAdv,
              levels.adv || []
            )}
            {renderSelect(
              "강화 차수",
              targetEnh,
              setTargetEnh,
              levels.enh[targetAdv] || []
            )}
          </fieldset>
        </div>
        <div className="calculator-results">
          <h2>필요 재료 총합</h2>
          {calculatedCost ? (
            calculatedCost.error ? (
              <p className="error-message">{calculatedCost.error}</p>
            ) : (
              <ul className="cost-list">
                {Object.entries(calculatedCost).map(
                  ([material, amount]) =>
                    // amount가 숫자일 경우(기본 재료)와 배열일 경우(추가 재료)를 모두 처리
                    (typeof amount === 'number' ? amount > 0 : amount.length > 0) && (
                      <li key={material}>
                        <span className="material-name">{material}</span>
                        {typeof amount === 'number' ? (
                          <span className="material-amount">{amount.toLocaleString()}</span>
                        ) : (
                          // 배열인 경우, 각 항목을 별도의 줄에 표시
                          <div className="material-amount-list">
                            {amount.map((text, index) => <div key={index}>{text}</div>)}
                          </div>
                        )}
                      </li>
                    )
                )}
              </ul>
            )
          ) : (
            <p>레벨을 선택하여 비용을 계산하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassEnhancementCalculator;
