import React, { useState } from "react";
import "./WeaponCard.css";

function WeaponCard({ weaponData }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? weaponData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === weaponData.length - 1 ? 0 : prev + 1));
  };

  const currentStats = weaponData[currentIndex];
  // 1강 이상일 경우, 이전 강화 차수 데이터를 가져옵니다.
  const previousStats = currentIndex > 0 ? weaponData[currentIndex - 1] : null;
  if (!currentStats) return null;

  const {
    이름: name,
    "강화 차수": enhancement,
    피해량: damage,
    타수: hits,
    쿨타임: cooldown,
    마나: mana,
    비고: note,
  } = currentStats;

  /**
   * 현재 값과 이전 값을 비교하여 변화량을 텍스트로 반환합니다.
   * @param {string | number} current - 현재 값
   * @param {string | number | null | undefined} previous - 이전 값
   * @returns {string} '(+10)' 또는 '(-0.5)'와 같은 형식의 문자열
   */
  const getStatDiffText = (current, previous) => {
    // 이전 값이 없거나(0은 유효), 현재 값이 없으면 변화량을 표시하지 않습니다.
    if (previous === null || previous === undefined || !current) {
      return "";
    }

    const currentValue = Number(String(current).replace(/,/g, ""));
    const previousValue = Number(String(previous).replace(/,/g, ""));

    // 수치로 변환할 수 없는 값이면 변화량을 표시하지 않습니다.
    if (isNaN(currentValue) || isNaN(previousValue)) {
      return "";
    }

    const diff = currentValue - previousValue;

    // 변화가 없으면 표시하지 않습니다.
    if (diff === 0) {
      return "";
    }

    // 소수점 둘째 자리까지 반올림
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

  return (
    <div className="weapon-card">
      <div className="card-top">
        <div className="image-placeholder">
          <span>이미지</span>
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
      </div>
      {weaponData.length > 1 && (
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
