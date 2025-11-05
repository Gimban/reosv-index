import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import "./WeaponCard.css";

const SWIPE_THRESHOLD = 40;

function WeaponCard({
  weaponData,
  grade,
  showDescription,
  globalEnhancement,
  imageSrc,
  isMobileView = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    if (weaponData.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (globalEnhancement !== "개별") {
      const targetEnhancement = Number(globalEnhancement);
      const bestMatchIndex = weaponData.reduce(
        (bestIndex, weapon, index) => {
          const currentDiff = Math.abs(
            Number(weapon["강화 차수"]) - targetEnhancement
          );
          const bestDiff = Math.abs(
            Number(weaponData[bestIndex]["강화 차수"]) - targetEnhancement
          );
          return currentDiff < bestDiff ? index : bestIndex;
        },
        0
      );
      setCurrentIndex(bestMatchIndex);
    } else {
      // 현재 인덱스가 데이터 범위를 벗어나지 않도록 보정
      setCurrentIndex((prev) =>
        prev >= weaponData.length ? weaponData.length - 1 : prev
      );
    }
  }, [globalEnhancement, weaponData]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [weaponData]);

  const handlePrev = useCallback(() => {
    if (globalEnhancement !== "개별" || weaponData.length <= 1) return;
    setCurrentIndex((prev) =>
      prev === 0 ? weaponData.length - 1 : prev - 1
    );
  }, [globalEnhancement, weaponData.length]);

  const handleNext = useCallback(() => {
    if (globalEnhancement !== "개별" || weaponData.length <= 1) return;
    setCurrentIndex((prev) =>
      prev === weaponData.length - 1 ? 0 : prev + 1
    );
  }, [globalEnhancement, weaponData.length]);

  const handleTouchStart = (event) => {
    if (globalEnhancement !== "개별") return;
    touchStartX.current = event.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (event) => {
    if (globalEnhancement !== "개별" || touchStartX.current === null) return;
    touchDeltaX.current = event.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (globalEnhancement !== "개별" || touchStartX.current === null) return;
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleKeyDown = (event) => {
    if (globalEnhancement !== "개별") return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
  };

  const currentStats = weaponData[currentIndex];
  const previousStats = currentIndex > 0 ? weaponData[currentIndex - 1] : null;

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

    let dpsValue = null;
    let dpmValue = null;
    if (numericDamage > 0 && numericCooldown > 0) {
      const dpsRaw = totalDamage / numericCooldown;
      dpsValue = dpsRaw.toFixed(1);
      dpmValue = (dpsRaw * 60).toLocaleString(undefined, {
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
      dps: dpsValue,
      dpm: dpmValue,
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

    if (Number.isNaN(currentValue) || Number.isNaN(previousValue)) {
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
    if (!damage) return "";

    const numericDamage = Number(String(damage).replace(/,/g, ""));
    const numericHits = Number(hits || 1);
    const formattedDamage = numericDamage.toLocaleString();
    const damageDiff = getStatDiffText(damage, previousStats?.["피해량"]);

    if (numericHits > 1) {
      const totalDamage = numericDamage * numericHits;
      const formattedTotalDamage = totalDamage.toLocaleString();
      const hitsDiff = getStatDiffText(hits, previousStats?.["타수"]);
      const previousTotalDamage =
        previousStats && previousStats["피해량"] && previousStats["타수"]
          ? Number(String(previousStats["피해량"]).replace(/,/g, "")) *
            Number(previousStats["타수"] || 1)
          : null;

      const totalDamageDiff = getStatDiffText(totalDamage, previousTotalDamage);

      const baseDamageString = `${formattedDamage}${damageDiff} × ${numericHits}${hitsDiff}`;
      const totalDamageString = ` (총 ${formattedTotalDamage}${totalDamageDiff})`;

      return `${baseDamageString}${totalDamageString}`;
    }
    return `${formattedDamage}${damageDiff}`;
  };

  const enhancementDisplay = Number(enhancement) > 0 ? `+${enhancement}` : "+0";
  const formattedDamageValue = formatDamage();
  const canManualNavigate =
    globalEnhancement === "개별" && weaponData.length > 1;

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
    <article
      className={`weapon-card ${isMobileView ? "mobile" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <header className={`card-header ${getGradeClassName(grade)}`}>
        <div className="card-header-main">
          <div className="image-placeholder">
            {imageSrc ? (
              <img src={imageSrc} alt={name} />
            ) : (
              <span>이미지</span>
            )}
          </div>
          <div className="card-title">
            <span className="weapon-name">{name}</span>
            <span className="weapon-grade">{grade}</span>
          </div>
        </div>
        <div className="enhancement-summary">
          <span className="enhancement-level">{enhancementDisplay}</span>
          {weaponData.length > 1 && (
            <span className="enhancement-count">
              {currentIndex + 1} / {weaponData.length}
            </span>
          )}
        </div>
      </header>

      <section className="card-body">
        {showDescription && description && (
          <p className="weapon-description">{description}</p>
        )}

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
            <li className="note-item">
              <span className="stat-label">비고</span>
              <span className="stat-value">{note}</span>
            </li>
          )}
        </ul>
      </section>

      {(dps || dpm || manaEfficiency || mps) && (
        <section className="derived-stats-container">
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
        </section>
      )}

      {weaponData.length > 1 && (
        <footer
          className={`card-footer ${
            canManualNavigate ? "interactive" : "read-only"
          }`}
          onKeyDown={handleKeyDown}
          tabIndex={canManualNavigate ? 0 : undefined}
        >
          {canManualNavigate ? (
            <>
              <button
                type="button"
                className="nav-button"
                onClick={handlePrev}
                aria-label="이전 강화 단계"
              >
                이전
              </button>
              <div className="enhancement-indicator">
                <span>{enhancementDisplay}</span>
                <small>{currentIndex + 1} / {weaponData.length}</small>
              </div>
              <button
                type="button"
                className="nav-button"
                onClick={handleNext}
                aria-label="다음 강화 단계"
              >
                다음
              </button>
            </>
          ) : (
            <div className="enhancement-indicator">
              <span>{enhancementDisplay}</span>
              <small>일괄 +{globalEnhancement}</small>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}

export default WeaponCard;
