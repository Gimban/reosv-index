import React, { useState, useMemo, useEffect } from "react";
import "./WeaponCard.css";

function WeaponCard({
  weaponData,
  grade,
  showDescription,
  globalEnhancement,
  imageSrc,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (globalEnhancement !== "개별" && weaponData.length > 0) {
      const targetEnhancement = Number(globalEnhancement);

      // Find the index of the weapon that best matches the target enhancement
      const bestMatchIndex = weaponData.reduce(
        (bestIndex, weapon, currentIndex) => {
          const currentDiff = Math.abs(
            Number(weapon["강화 차수"]) - targetEnhancement
          );
          const bestDiff = Math.abs(
            Number(weaponData[bestIndex]["강화 차수"]) - targetEnhancement
          );
          return currentDiff < bestDiff ? currentIndex : bestIndex;
        },
        0
      );

      setCurrentIndex(bestMatchIndex);
    }
  }, [globalEnhancement, weaponData]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? weaponData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === weaponData.length - 1 ? 0 : prev + 1));
  };

  const currentStats = weaponData[currentIndex];
  // 1강 이상일 경우, 이전 강화 차수 데이터를 가져옵니다.
  const previousStats = currentIndex > 0 ? weaponData[currentIndex - 1] : null;

  // Memoize derived stats to avoid recalculating on every render
  const { dps, dpm, manaEfficiency, mps } = useMemo(() => {
    if (!currentStats) {
      return { dps: null, dpm: null, manaEfficiency: null, mps: null };
    }

    const numericDamage = Number(
      String(currentStats["피해량"] || "0").replace(/,/g, "")
    );
    const numericHits = Number(currentStats["타수"] || "1");
    const numericCooldown = Number(currentStats["쿨타임"] || "0");
    const numericMana = Number(
      String(currentStats["마나"] || "0").replace(/,/g, "")
    );

    const totalDamage = numericDamage * numericHits;

    let dps = null;
    let dpm = null;
    if (numericDamage > 0 && numericCooldown > 0) {
      const dpsRaw = totalDamage / numericCooldown;
      dps = dpsRaw.toFixed(1);
      dpm = (dpsRaw * 60).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    }
    const manaEfficiencyValue =
      numericDamage > 0 && numericMana > 0
        ? (totalDamage / numericMana).toFixed(1)
        : null;
    const mpsValue =
      numericMana > 0 && numericCooldown > 0
        ? (numericMana / numericCooldown).toFixed(1)
        : null;

    return {
      dps: dps,
      dpm: dpm,
      manaEfficiency: manaEfficiencyValue,
      mps: mpsValue,
    };
  }, [currentStats]);

  if (!currentStats) return null;

  const {
    이름: name,
    "강화 차수": enhancement,
    피해량: damage,
    타수: hits,
    쿨타임: cooldown,
    마나: mana,
    비고: note,
    설명: description,
  } = currentStats;

  const getStatDiffText = (current, previous) => {
    if (previous === null || previous === undefined || !current) {
      return "";
    }

    const currentValue = Number(String(current).replace(/,/g, ""));
    const previousValue = Number(String(previous).replace(/,/g, ""));

    if (isNaN(currentValue) || isNaN(previousValue)) {
      return "";
    }

    const diff = currentValue - previousValue;

    if (diff === 0) {
      return "";
    }

    const roundedDiff = Math.round(diff * 100) / 100;
    const diffString = roundedDiff.toLocaleString();

    return ` (${roundedDiff > 0 ? "+" : ""}${diffString})`;
  };

  const formatDamage = () => {
    if (!damage || damage === "0") return null;

    const numericDamage = Number(String(damage).replace(/,/g, ""));
    const numericHits = Number(hits);

    const damageDiff = getStatDiffText(
      numericDamage,
      previousStats?.["피해량"]
    );
    const formattedDamage = numericDamage.toLocaleString();

    if (numericHits > 1) {
      const hitsDiff = getStatDiffText(numericHits, previousStats?.["타수"]);

      // 총 피해량 계산
      const totalDamage = numericDamage * numericHits;
      const formattedTotalDamage = totalDamage.toLocaleString();

      // 이전 총 피해량 계산
      let previousTotalDamage = null;
      if (previousStats) {
        const prevDamage = Number(
          String(previousStats["피해량"] || "0").replace(/,/g, "")
        );
        const prevHits = Number(previousStats["타수"] || "0");
        if (!isNaN(prevDamage) && !isNaN(prevHits)) {
          previousTotalDamage = prevDamage * prevHits;
        }
      }

      const totalDamageDiff = getStatDiffText(totalDamage, previousTotalDamage);

      const baseDamageString = `${formattedDamage}${damageDiff} x ${numericHits}${hitsDiff}`;
      const totalDamageString = ` (총 ${formattedTotalDamage}${totalDamageDiff})`;

      return `${baseDamageString}${totalDamageString}`;
    }
    return `${formattedDamage}${damageDiff}`;
  };

  const enhancementDisplay = Number(enhancement) > 0 ? `+${enhancement}` : "+0";
  const formattedDamageValue = formatDamage();

  const getGradeClassName = (g) => {
    const gradeMap = {
      일반: "grade-common",
      고급: "grade-uncommon",
      희귀: "grade-rare",
      영웅: "grade-heroic",
      전설: "grade-legendary",
      필멸: "grade-mortal",
      보스: "grade-boss",
      기타: "grade-other",
      운명: "grade-destiny",
    };
    return gradeMap[g] || "grade-common";
  };

  return (
    <div
      className="weapon-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showDescription && isHovered && description && (
        <div className="description-tooltip">{description}</div>
      )}
      <div className={`card-top ${getGradeClassName(grade)}`}>
        <div className="image-placeholder">
           {imageSrc ? (
            <img src={imageSrc} alt={name} />
          ) : (
            <span>이미지</span>
          )}
        </div>
        <div className="weapon-name-section">
          <span className="weapon-name">{name}</span>
          <span className="enhancement-level">{enhancementDisplay}</span>
        </div>
      </div>
      <div className="card-bottom">
        <ul className="stats-list">
          {formattedDamageValue && (
            <li>
              <span className="stat-label">피해량</span>
              <span className="stat-value">{formattedDamageValue}</span>
            </li>
          )}
          {cooldown && cooldown !== "0" && (
            <li>
              <span className="stat-label">쿨타임</span>
              <span className="stat-value">
                {cooldown}초
                {getStatDiffText(cooldown, previousStats?.["쿨타임"])}
              </span>
            </li>
          )}
          {mana && mana !== "0" && (
            <li>
              <span className="stat-label">마나</span>
              <span className="stat-value">
                {Number(String(mana).replace(/,/g, "")).toLocaleString()}
                {getStatDiffText(mana, previousStats?.["마나"])}
              </span>
            </li>
          )}
          {note && (
            <li>
              <span className="stat-label">비고</span>
              <span className="stat-value">{note}</span>
            </li>
          )}
        </ul>
        {(dps || dpm || manaEfficiency || mps) && (
          <div className="derived-stats-container">
            {dps && (
              <div className="derived-stat-item">
                <span>DPS</span>
                <strong>{dps}</strong>
              </div>
            )}
            {dpm && (
              <div className="derived-stat-item">
                <span>DPM</span>
                <strong>{dpm}</strong>
              </div>
            )}
            {manaEfficiency && (
              <div className="derived-stat-item">
                <span>ME</span>
                <strong>{manaEfficiency}</strong>
              </div>
            )}
            {mps && (
              <div className="derived-stat-item">
                <span>MPS</span>
                <strong>{mps}</strong>
              </div>
            )}
          </div>
        )}
      </div>
      {globalEnhancement === "개별" && weaponData.length > 1 && (
        <div className="card-navigation">
          <button onClick={handlePrev} className="nav-arrow prev-arrow">
            ‹
          </button>
          <button onClick={handleNext} className="nav-arrow next-arrow">
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default WeaponCard;
