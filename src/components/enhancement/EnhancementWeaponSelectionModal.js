import React, { useState, useMemo, useEffect } from "react";
import "../calculator/WeaponSelectionModal.css"; // 스타일 재사용

const ALLOWED_GRADES = ["필멸", "전설", "영웅", "희귀", "고급", "일반"];

// 강화 시뮬레이터에서 제외할 무기 목록 (하드코딩)
const EXCLUDED_WEAPONS = ["방랑자, 플레탄"];

function EnhancementWeaponSelectionModal({ weaponData, onClose, onSelect }) {
  const [gradeFilters, setGradeFilters] = useState(
    ALLOWED_GRADES.reduce((acc, grade) => ({ ...acc, [grade]: false }), {})
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
      const weaponGrade = baseWeapon["등급"];
      const weaponName = baseWeapon["이름"];

      // 허용된 등급이며, 제외 목록에 없는 무기만 필터링합니다.
      return (
        ALLOWED_GRADES.includes(weaponGrade) &&
        !EXCLUDED_WEAPONS.includes(weaponName)
      );
    });

    const weaponsByGrade = validWeaponGroups.reduce((acc, weaponGroup) => {
      const grade = weaponGroup[0]["등급"];
      if (!acc[grade]) acc[grade] = [];
      acc[grade].push(weaponGroup);
      return acc;
    }, {});

    return weaponsByGrade;
  }, [weaponData]);

  const sortedGrades = useMemo(() => {
    return Object.keys(processedWeapons).sort(
      (a, b) => ALLOWED_GRADES.indexOf(a) - ALLOWED_GRADES.indexOf(b)
    );
  }, [processedWeapons]);

  const handleAllModeChange = (e) => {
    if (e.target.checked) {
      setIsAllMode(true);
      setGradeFilters(
        ALLOWED_GRADES.reduce((acc, grade) => ({ ...acc, [grade]: false }), {})
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
          <button onClick={onClose} className="close-button">
            &times;
          </button>
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
            {ALLOWED_GRADES.map((grade) =>
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

export default EnhancementWeaponSelectionModal;
