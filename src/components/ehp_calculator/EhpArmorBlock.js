import React, { useState, useMemo, useEffect, useCallback } from "react";
import "./EhpArmorBlock.css";

const parseNum = (val) => Number(String(val || "0").replace(/,/g, ""));

function EhpArmorBlock({ onStatsChange, costData }) {
  const [mode, setMode] = useState("direct"); // 'direct' or 'setup'
  const [directHp, setDirectHp] = useState(0);

  const [top, setTop] = useState({ grade: "", enh: 0 });
  const [bottom, setBottom] = useState({ grade: "", enh: 0 });
  const [shoesEnh, setShoesEnh] = useState(0);

  const armorData = useMemo(() => {
    if (!costData || costData.length === 0) return { grades: [], enhMap: {} };

    const grades = new Set();
    const enhMap = {};
    const gradeOrder = ["일반", "레어", "에픽", "유니크", "레전드"];

    costData.forEach((row) => {
      const grade = row["등급"];
      const enh = parseNum(row["강화 차수"]);
      if (!grade) return;

      grades.add(grade);
      if (!enhMap[grade]) enhMap[grade] = new Set();
      enhMap[grade].add(enh);
    });

    const sortedGrades = [...grades].sort(
      (a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b)
    );

    for (const grade in enhMap) {
      enhMap[grade] = [...enhMap[grade]].sort((a, b) => a - b);
    }

    return { grades: sortedGrades, enhMap };
  }, [costData]);

  useEffect(() => {
    if (armorData.grades.length > 0) {
      const initialGrade = armorData.grades[0];
      // 해당 등급의 첫 번째 강화 레벨로 초기화
      const initialEnh = armorData.enhMap[initialGrade]?.[0] ?? 0;
      setTop({ grade: initialGrade, enh: initialEnh });
      setBottom({ grade: initialGrade, enh: initialEnh });
    }
  }, [armorData.grades]);

  const findHp = useCallback((grade, enh) => {
    if (!costData) return 0;
    const row = costData.find(
      (r) => r["등급"] === grade && parseNum(r["강화 차수"]) === enh
    );
    return row ? parseNum(row["체력"]) : 0;
  }, [costData]);

  const calculatedHp = useMemo(() => {
    if (mode === "direct") {
      return directHp;
    }
    const topHp = findHp(top.grade, top.enh);
    const bottomHp = findHp(bottom.grade, bottom.enh);
    const shoesHp = Math.max(0, shoesEnh) * 100;
    return topHp + bottomHp + shoesHp;
  }, [mode, directHp, top, bottom, shoesEnh, findHp]);

  useEffect(() => {
    onStatsChange({ flatHp: calculatedHp });
  }, [calculatedHp, onStatsChange]);

  const handlePartChange = (part, type, value) => {
    const setter = part === "top" ? setTop : setBottom;
    setter((prev) => {
      const newState = { ...prev, [type]: value };
      if (type === "grade") {
        // 등급 변경 시 해당 등급의 첫 번째 강화 레벨로 초기화
        newState.enh = armorData.enhMap[value]?.[0] ?? 0;
      }
      return newState;
    });
  };

  const renderArmorSetup = () => (
    <div className="armor-setup-grid">
      {/* 상의 */}
      <div className="armor-part">
        <h4>상의</h4>
        <div className="form-group">
          <label>등급</label>
          <select value={top.grade} onChange={(e) => handlePartChange("top", "grade", e.target.value)}>
            <option value="">없음</option>{armorData.grades.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
        </div>
        <div className="form-group">
          <label>강화</label>
          <select value={top.enh} onChange={(e) => handlePartChange("top", "enh", parseNum(e.target.value))}>
            {(armorData.enhMap[top.grade] || []).map((e) => (<option key={e} value={e}>+{e}</option>))}
          </select>
        </div>
      </div>

      {/* 하의 */}
      <div className="armor-part">
        <h4>하의</h4>
        <div className="form-group">
          <label>등급</label>
          <select value={bottom.grade} onChange={(e) => handlePartChange("bottom", "grade", e.target.value)}>
            <option value="">없음</option>{armorData.grades.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
        </div>
        <div className="form-group">
          <label>강화</label>
          <select value={bottom.enh} onChange={(e) => handlePartChange("bottom", "enh", parseNum(e.target.value))}>
            {(armorData.enhMap[bottom.grade] || []).map((e) => (<option key={e} value={e}>+{e}</option>))}
          </select>
        </div>
      </div>

      {/* 신발 */}
      <div className="armor-part">
        <h4>신발</h4>
        <div className="form-group">
          <label>강화 (0-7)</label>
          <input type="number" value={shoesEnh} min="0" max="7" onChange={(e) => setShoesEnh(Math.max(0, Math.min(7, parseNum(e.target.value))))} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="calculator-block">
      <div className="armor-block-header">
        <h2>방어구</h2>
        <div className="radio-options">
          <label>
            <input type="radio" value="direct" checked={mode === "direct"} onChange={(e) => setMode(e.target.value)} />
            직접 입력
          </label>
          <label>
            <input type="radio" value="setup" checked={mode === "setup"} onChange={(e) => setMode(e.target.value)} />
            방어구 설정
          </label>
        </div>
      </div>

      {mode === "direct" ? (
        <div className="form-grid">
          <div className="form-group">
            <label>방어구로 얻는 총 체력</label>
            <input type="number" value={directHp} onChange={(e) => setDirectHp(parseNum(e.target.value))} />
          </div>
        </div>
      ) : (
        renderArmorSetup()
      )}
      <div className="calculation-summary">
        <p>방어구로 얻는 체력(+n): <strong>{calculatedHp.toLocaleString()}</strong></p>
      </div>
    </div>
  );
}

export default EhpArmorBlock;