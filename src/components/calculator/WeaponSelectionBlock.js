import React, { useState, useEffect, useCallback, useMemo } from "react";
import WeaponSelectionModal from "./WeaponSelectionModal";
import "./WeaponSelectionBlock.css";

const NUM_WEAPON_SLOTS = 12;

const getCssClassForGrade = (grade) => {
  const gradeMap = {
    일반: "grade-normal",
    고급: "grade-uncommon",
    희귀: "grade-rare",
    영웅: "grade-heroic",
    전설: "grade-legendary",
    필멸: "grade-mortal",
    보스: "grade-boss",
    운명: "grade-destiny",
  };
  return gradeMap[grade] || "";
};

const StatDisplay = ({ stats, enabled = true }) => {
  if (!stats || stats.dps === 0) return null;
  const { formula } = stats;
  const wrapperClass = `weapon-slot-stats ${!enabled ? "disabled-stats" : ""}`;

  const formatNum = (num, digits = 0) =>
    (num || 0).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const damageParts = [];
  if (formula.baseDamage > 0) {
    let baseDamageStr = `${formatNum(formula.baseDamage, 0)}(기본)`;
    if (formula.hits > 1) {
      baseDamageStr = `(${baseDamageStr} × ${formula.hits}(타수))`;
    }
    damageParts.push(baseDamageStr);
  }

  if (formula.totalStatDamageIncrease > 0) {
    damageParts.push(
      `(100% + ${formatNum(
        formula.totalStatDamageIncrease,
        2
      )}%(최종 데미지 %))`
    );
  }

  const accessoryBonuses = [];
  if (formula.specialWeaponDmg > 0) {
    accessoryBonuses.push(
      `${formatNum(formula.specialWeaponDmg, 2)}%(특수 무기 데미지 %)`
    );
  }
  if (formula.gradeDmg > 0) {
    accessoryBonuses.push(
      `${formatNum(formula.gradeDmg, 2)}%(등급 무기 데미지 %)`
    );
  }
  if (accessoryBonuses.length > 0) {
    damageParts.push(`(100% + ${accessoryBonuses.join(" + ")})`);
  }

  const damageFormulaStr = damageParts.join(" × ");
  const showDamageFormula = damageParts.length > 1;

  return (
    <>
      <div className={wrapperClass}>
        <div className="stat-item">
          <span className="label">총딜</span>
          <span className="value">{formatNum(stats.totalDamage, 0)}</span>
        </div>
        <div className="stat-item">
          <span className="label">쿨</span>
          <span className="value">{stats.cooldown.toFixed(2)}초</span>
        </div>
        <div className="stat-item">
          <span className="label">DPS</span>
          <span className="value">{formatNum(stats.dps, 2)}</span>
        </div>
        <div className="stat-item">
          <span className="label">DPM</span>
          <span className="value">{formatNum(stats.dpm, 2)}</span>
        </div>
      </div>
      {formula && (
        <div className={`formula-display ${!enabled ? "disabled-stats" : ""}`}>
          {showDamageFormula && (
            <div className="formula-item small-text">
              <span className="formula-label">피해량:</span>
              <span className="formula-expression">
                {damageFormulaStr} ={" "}
                <strong>{formatNum(stats.totalDamage, 0)}</strong>
              </span>
            </div>
          )}
          {formula.cooldownReduction > 0 && (
            <div className="formula-item small-text">
              <span className="formula-label">쿨타임:</span>
              <span className="formula-expression">
                {formatNum(formula.baseCooldown, 2)}초(기본) × (100% -{" "}
                {formula.cooldownReduction}
                %(쿨타임 감소 %)) ={" "}
                <strong>{formatNum(stats.cooldown, 2)}초</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

function WeaponSelectionBlock({ weaponData, onStatsChange, calculatedStats }) {
  // NUM_WEAPON_SLOTS is for normal slots only.
  const [selectedWeapons, setSelectedWeapons] = useState(
    Array(NUM_WEAPON_SLOTS).fill(null)
  );
  const [enhancements, setEnhancements] = useState(
    Array(NUM_WEAPON_SLOTS).fill(0)
  );
  const [destinyEnhancements, setDestinyEnhancements] = useState({});
  const [destinyWeaponEnabled, setDestinyWeaponEnabled] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);

  const handleOpenModal = (index) => {
    setEditingSlotIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSlotIndex(null);
  }, []);

  const handleWeaponSelect = useCallback(
    (weaponGroup) => {
      // weaponGroup이 null이면 선택 해제를 의미합니다.
      const minEnh = weaponGroup ? Number(weaponGroup[0]["강화 차수"]) : 0;
      setSelectedWeapons((prev) => {
        const newWeapons = [...prev];
        newWeapons[editingSlotIndex] = weaponGroup; // 선택 해제 시 null로 설정
        return newWeapons;
      });
      setEnhancements((prev) => {
        const newEnhancements = [...prev];
        newEnhancements[editingSlotIndex] = minEnh; // 선택 해제 시 0으로 설정
        return newEnhancements;
      });
      handleCloseModal();
    },
    [editingSlotIndex, handleCloseModal]
  );

  const destinyWeapons = useMemo(() => {
    if (!weaponData) return [];

    const weaponsByName = weaponData.reduce((acc, weapon) => {
      const name = weapon["이름"];
      if (!name) return acc;
      if (!acc[name]) acc[name] = [];
      acc[name].push(weapon);
      return acc;
    }, {});

    const destinyGroups = Object.values(weaponsByName).filter((group) => {
      const baseWeapon =
        group.find((w) => Number(w["강화 차수"]) === 0) || group[0];
      if (baseWeapon["등급"] !== "운명") return false;
      const damage = Number(
        String(baseWeapon["피해량"] || "0").replace(/,/g, "")
      );
      return damage > 0;
    });

    return destinyGroups;
  }, [weaponData]);

  const handleEnhancementChange = (index, value) => {
    const weaponGroup = selectedWeapons[index];
    if (!weaponGroup) return;

    const minEnh = Number(weaponGroup[0]["강화 차수"]);
    const maxEnh = Number(weaponGroup[weaponGroup.length - 1]["강화 차수"]);

    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(minEnh, Math.min(maxEnh, numValue));

    const newEnhancements = [...enhancements];
    newEnhancements[index] = clampedValue;
    setEnhancements(newEnhancements);
  };

  const handleDestinyEnhancementChange = (weaponName, value) => {
    const weaponGroup = (destinyWeapons || []).find(
      (group) => group[0]["이름"] === weaponName
    );
    if (!weaponGroup) return;

    const minEnh = Number(weaponGroup[0]["강화 차수"]);
    const maxEnh = Number(weaponGroup[weaponGroup.length - 1]["강화 차수"]);

    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(minEnh, Math.min(maxEnh, numValue));

    setDestinyEnhancements((prev) => ({
      ...prev,
      [weaponName]: clampedValue,
    }));
  };

  const handleDestinyEnableChange = (weaponName, isChecked) => {
    setDestinyWeaponEnabled((prev) => ({
      ...prev,
      [weaponName]: isChecked,
    }));
  };

  useEffect(() => {
    const stats = {
      selectedWeapons,
      enhancements,
      destinySelections: destinyWeapons.map((weaponGroup) => ({
        weapon: weaponGroup,
        enhancement: destinyEnhancements[weaponGroup[0]["이름"]] || 0,
        enabled: !!destinyWeaponEnabled[weaponGroup[0]["이름"]],
      })),
    };
    onStatsChange(stats);
  }, [
    selectedWeapons,
    enhancements,
    destinyWeapons,
    destinyEnhancements,
    destinyWeaponEnabled,
    onStatsChange,
  ]);

  return (
    <div className="calculator-block">
      <h2>무기 선택</h2>

      <div className="destiny-weapon-block">
        <h3>운명 무기</h3>
        <div className="weapon-selection-grid">
          {destinyWeapons.map((weaponGroup, index) => {
            const weaponName = weaponGroup[0]["이름"];
            const grade = weaponGroup[0]["등급"];
            const gradeClass = getCssClassForGrade(grade);
            const isEnabled = !!destinyWeaponEnabled[weaponName];
            const minEnh = Number(weaponGroup[0]["강화 차수"]);
            const maxEnh = Number(
              weaponGroup[weaponGroup.length - 1]["강화 차수"]
            );
            return (
              <div key={weaponName} className="weapon-slot destiny-slot">
                <div className="weapon-slot-main">
                  <input
                    type="checkbox"
                    className="enable-checkbox"
                    checked={isEnabled}
                    onChange={(e) =>
                      handleDestinyEnableChange(weaponName, e.target.checked)
                    }
                    title={`${weaponName} DPS 계산에 포함`}
                  />
                  <span className={`weapon-name-display ${gradeClass}`}>
                    {weaponName}
                  </span>
                  <input
                    type="number"
                    value={destinyEnhancements[weaponName] || 0}
                    onChange={(e) =>
                      handleDestinyEnhancementChange(weaponName, e.target.value)
                    }
                    min={minEnh}
                    max={maxEnh}
                    placeholder="강화"
                    disabled={!isEnabled}
                  />
                </div>
                <StatDisplay
                  stats={calculatedStats?.[NUM_WEAPON_SLOTS + index]}
                  enabled={isEnabled}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="weapon-selection-grid">
        {Array.from({ length: NUM_WEAPON_SLOTS }).map((_, index) => {
          const weaponGroup = selectedWeapons[index];

          const grade = weaponGroup ? weaponGroup[0]["등급"] : null;
          const gradeClass = getCssClassForGrade(grade);
          const minEnh = weaponGroup ? Number(weaponGroup[0]["강화 차수"]) : 0;
          const maxEnh = weaponGroup
            ? Number(weaponGroup[weaponGroup.length - 1]["강화 차수"])
            : 0;
          const isDisabled = !weaponGroup;
          return (
            <div key={index} className="weapon-slot">
              <div className="weapon-slot-main">
                <button
                  onClick={() => handleOpenModal(index)}
                  className={`select-weapon-btn ${gradeClass}`}
                >
                  {selectedWeapons[index]
                    ? selectedWeapons[index][0]["이름"]
                    : "무기 선택"}
                </button>
                <input
                  type="number"
                  value={enhancements[index]}
                  onChange={(e) =>
                    handleEnhancementChange(index, e.target.value)
                  }
                  min={minEnh}
                  max={maxEnh}
                  disabled={isDisabled}
                  placeholder="강화"
                  aria-label={`${index + 1}번 무기 강화 차수`}
                />
              </div>
              <StatDisplay stats={calculatedStats?.[index]} />
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <WeaponSelectionModal
          weaponData={weaponData}
          onClose={handleCloseModal}
          onSelect={handleWeaponSelect}
        />
      )}
    </div>
  );
}

export default WeaponSelectionBlock;
