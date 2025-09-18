import React, { useState, useMemo, useEffect } from "react";
import "./ArmorEnhancementCalculator.css";

const parseNum = (val) => Number(String(val || "0").replace(/,/g, ""));

function ArmorEnhancementCalculator({ costData }) {
  const [currentGrade, setCurrentGrade] = useState("");
  const [currentEnh, setCurrentEnh] = useState(0);
  const [targetGrade, setTargetGrade] = useState("");
  const [targetEnh, setTargetEnh] = useState(1);

  const { levels } = useMemo(() => {
    if (!costData || costData.length === 0) {
      return { levels: {} };
    }

    const levels = { grade: new Set(), enh: {} };

    costData.forEach((row) => {
      const grade = row["등급"];
      const enh = parseNum(row["강화 차수"]);

      if (!grade) return;

      levels.grade.add(grade);
      if (!levels.enh[grade]) {
        levels.enh[grade] = new Set();
      }
      levels.enh[grade].add(enh);
    });

    // 등급 순서 (일반, 고급, 희귀, 영웅, 전설)
    const gradeOrder = ["일반", "레어", "에픽", "유니크", "레전드"];
    levels.grade = [...levels.grade].sort(
      (a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b)
    );

    for (const grade in levels.enh) {
      levels.enh[grade] = [...levels.enh[grade]].sort((a, b) => a - b);
    }

    return { levels };
  }, [costData]);

  // 초기값 설정 및 등급 변경 시 강화 차수 리셋
  useEffect(() => {
    if (levels.grade?.length > 0) {
      if (!currentGrade) setCurrentGrade(levels.grade[0]);
      if (!targetGrade) setTargetGrade(levels.grade[0]);
    }
  }, [levels, currentGrade, targetGrade]);

  useEffect(() => {
    if (levels.enh && levels.enh[currentGrade]?.length > 0) {
      if (!levels.enh[currentGrade].includes(currentEnh)) {
        setCurrentEnh(levels.enh[currentGrade][0]);
      }
    }
  }, [currentGrade, levels]);

  useEffect(() => {
    if (levels.enh && levels.enh[targetGrade]?.length > 0) {
      if (!levels.enh[targetGrade].includes(targetEnh)) {
        setTargetEnh(levels.enh[targetGrade][0]);
      }
    }
  }, [targetGrade, levels]);

  const calculatedCost = useMemo(() => {
    if (!costData || !currentGrade || !targetGrade) return null;

    const gradeOrder = ["일반", "레어", "에픽", "유니크", "레전드"];
    const currentGradeIndex = gradeOrder.indexOf(currentGrade);
    const targetGradeIndex = gradeOrder.indexOf(targetGrade);

    if (
      currentGradeIndex > targetGradeIndex ||
      (currentGradeIndex === targetGradeIndex && currentEnh >= targetEnh)
    ) {
      return { error: "목표가 현재 레벨보다 낮거나 같습니다." };
    }

    const totalCost = {
      골드: 0,
    };
    let currentHealth = 0;
    let targetHealth = 0;

    let inRange = false;
    for (const row of costData) {
      const rowGrade = row["등급"];
      const rowEnh = parseNum(row["강화 차수"]);

      if (!inRange && rowGrade === currentGrade && rowEnh === currentEnh) {
        currentHealth = parseNum(row["체력"]);
        inRange = true;
        continue; // 현재 단계의 비용은 건너뜁니다.
      }

      if (inRange) {
        totalCost["골드"] += parseNum(row["골드"]);
      }

      if (rowGrade === targetGrade && rowEnh === targetEnh) {
        targetHealth = parseNum(row["체력"]);
        break;
      }
    }

    totalCost["체력 증가량"] = targetHealth - currentHealth;

    return totalCost;
  }, [currentGrade, currentEnh, targetGrade, targetEnh, costData]);

  const renderSelect = (label, value, setter, options, isEnh = false) => (
    <div className="form-group">
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) =>
          isEnh ? setter(parseNum(e.target.value)) : setter(e.target.value)
        }
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  if (!costData || costData.length === 0) {
    return <p>방어구 강화 비용 데이터를 불러오는 중입니다...</p>;
  }

  return (
    <div className="armor-enhancement-calculator">
      <h1>방어구 강화 비용 계산기</h1>
      <div className="calculator-main">
        <div className="calculator-controls">
          <fieldset>
            <legend>현재 상태</legend>
            {renderSelect("등급", currentGrade, setCurrentGrade, levels.grade || [])}
            {renderSelect( "강화 차수", currentEnh, setCurrentEnh, levels.enh[currentGrade] || [], true )}
          </fieldset>
          <fieldset>
            <legend>목표 상태</legend>
            {renderSelect("등급", targetGrade, setTargetGrade, levels.grade || [])}
            {renderSelect( "강화 차수", targetEnh, setTargetEnh, levels.enh[targetGrade] || [], true )}
          </fieldset>
        </div>
        <div className="calculator-results">
          <h2>계산 결과</h2>
          {calculatedCost ? (
            calculatedCost.error ? (
              <p className="error-message">{calculatedCost.error}</p>
            ) : (
              <ul className="cost-list">
                {Object.entries(calculatedCost).map(
                  ([item, amount]) =>
                    amount > 0 && (
                      <li key={item}>
                        <span className="material-name">{item}</span>
                        <span className="material-amount">
                          {amount.toLocaleString()}
                        </span>
                      </li>
                    )
                )}
              </ul>
            )
          ) : (
            <p>상태를 선택하여 비용을 계산하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArmorEnhancementCalculator;