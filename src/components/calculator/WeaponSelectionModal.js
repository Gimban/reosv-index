import React, { useState, useMemo, useEffect } from "react";
import "./WeaponSelectionModal.css";

const GRADE_ORDER = ["필멸", "전설", "영웅", "희귀", "고급", "일반", "보스"];

function WeaponSelectionModal({ weaponData, onClose, onSelect }) {
  const [gradeFilters, setGradeFilters] = useState(
    GRADE_ORDER.reduce((acc, grade) => ({ ...acc, [grade]: false }), {})
  );
  const [isAllMode, setIsAllMode] = useState(true);

  const processedWeapons = useMemo(() => {
    if (!weaponData || weaponData.length === 0) {
      return {};
    }

    const weaponsByName = weaponData.reduce((acc, weapon) => {
      const name = weapon["이름"];
      if (!name) return acc;
      if (!acc[name]) acc[name] = [];
      acc[name].push(weapon);
      return acc;
    }, {});

    const validWeaponGroups = Object.values(weaponsByName).filter((group) => {
      const baseWeapon =
        group.find((w) => Number(w["강화 차수"]) === 0) || group[0];
      const damage = Number(
        String(baseWeapon["피해량"] || "0").replace(/,/g, "")
      );
      return damage > 0;
    });

    const weaponsByGrade = validWeaponGroups.reduce((acc, weaponGroup) => {
      const grade = weaponGroup[0]["등급"];
      if (!grade || grade === "기타" || grade === "운명") return acc;
      if (!acc[grade]) acc[grade] = [];
      acc[grade].push(weaponGroup);
      return acc;
    }, {});

    return weaponsByGrade;
  }, [weaponData]);

  const sortedGrades = useMemo(() => {
    return Object.keys(processedWeapons).sort((a, b) => {
      const indexA = GRADE_ORDER.indexOf(a);
      const indexB = GRADE_ORDER.indexOf(b);
      const finalIndexA = indexA === -1 ? GRADE_ORDER.length : indexA;
      const finalIndexB = indexB === -1 ? GRADE_ORDER.length : indexB;
      return finalIndexA - finalIndexB;
    });
  }, [processedWeapons]);

  const handleAllModeChange = (e) => {
    if (e.target.checked) {
      setIsAllMode(true);
      setGradeFilters(
        GRADE_ORDER.reduce((acc, grade) => ({ ...acc, [grade]: false }), {})
      );
    }
  };

  const handleCheckboxChange = (grade) => {
    setIsAllMode(false);
    setGradeFilters((prev) => ({ ...prev, [grade]: !prev[grade] }));
  };

  useEffect(() => {
    const anyChecked = Object.values(gradeFilters).some((v) => v);
    if (!anyChecked) {
      setIsAllMode(true);
    }
  }, [gradeFilters]);

  const filteredGrades = useMemo(() => {
    if (isAllMode) {
      return sortedGrades;
    }
    return sortedGrades.filter((g) => gradeFilters[g]);
  }, [isAllMode, gradeFilters, sortedGrades]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>무기 선택</h2>
          <div className="modal-header-buttons">
            <button
              type="button"
              className="deselect-button"
              onClick={() => onSelect(null)}
            >
              선택 해제
            </button>
            <button onClick={onClose} className="close-button">
              &times;
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="filter-controls">
            <label>
              <input
                type="radio"
                name="grade-filter-mode"
                value="all"
                checked={isAllMode}
                onChange={handleAllModeChange}
              />
              모든 무기
            </label>
            {GRADE_ORDER.map((grade) =>
              processedWeapons[grade] ? (
                <label key={grade}>
                  <input
                    type="checkbox"
                    value={grade}
                    checked={gradeFilters[grade]}
                    onChange={() => handleCheckboxChange(grade)}
                  />
                  {grade}
                </label>
              ) : null
            )}
          </div>
          <div className="weapon-list">
            {filteredGrades.map((grade) => (
              <div key={grade} className="grade-group">
                <h3>{grade}</h3>
                <div className="weapon-items">
                  {processedWeapons[grade].map((weaponGroup) => (
                    <button
                      key={weaponGroup[0]["이름"]}
                      className="weapon-item-button"
                      onClick={() => onSelect(weaponGroup)}
                    >
                      {weaponGroup[0]["이름"]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeaponSelectionModal;
