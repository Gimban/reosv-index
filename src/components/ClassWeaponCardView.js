import React, { useMemo, useState, useEffect } from "react";
import "./ClassWeaponCardView.css";

const SKILL_TYPES = ["좌클릭", "우클릭", "쉬프트 좌클릭", "쉬프트 우클릭"];

const getCssClassForClassName = (className) => {
  const classMap = {
    메이지: "mage",
    블레이드: "blade",
    워리어: "warrior",
    프로스트: "frost",
  };
  return classMap[className] || "";
};

function ClassWeaponCardView({ data }) {
  const [isGlobalMode, setIsGlobalMode] = useState(true);
  const [globalAdv, setGlobalAdv] = useState(1);
  const [globalEnh, setGlobalEnh] = useState(1);
  const [individualStates, setIndividualStates] = useState({});

  const classData = useMemo(() => {
    if (!data || data.length === 0) return {};
    const grouped = data.reduce((acc, row) => {
      const className = row["클래스"];
      if (!className) return acc;
      if (!acc[className]) {
        acc[className] = {
          advancements: new Set(),
          enhancementsByAdv: {},
          weapons: [],
        };
      }
      const adv = Number(row["전직 차수"]);
      const enh = Number(row["강화 차수"]);
      acc[className].advancements.add(adv);
      if (!acc[className].enhancementsByAdv[adv]) {
        acc[className].enhancementsByAdv[adv] = new Set();
      }
      acc[className].enhancementsByAdv[adv].add(enh);
      acc[className].weapons.push(row);
      return acc;
    }, {});

    for (const className in grouped) {
      grouped[className].advancements = [...grouped[className].advancements].sort(
        (a, b) => a - b
      );
      for (const adv in grouped[className].enhancementsByAdv) {
        grouped[className].enhancementsByAdv[adv] = [
          ...grouped[className].enhancementsByAdv[adv],
        ].sort((a, b) => a - b);
      }
    }
    return grouped;
  }, [data]);

  useEffect(() => {
    const initialStates = {};
    for (const className in classData) {
      initialStates[className] = { adv: 1, enh: 1 };
    }
    setIndividualStates(initialStates);
  }, [classData]);

  const handleGlobalChange = (type, direction) => {
    const allAdvancements = Object.values(classData).flatMap(
      (d) => d.advancements
    );
    const maxAdv = allAdvancements.length > 0 ? Math.max(...allAdvancements) : 0;

    if (type === "adv") {
        const minAdv = 1;
      setGlobalAdv((prev) => {
        const next = prev + direction;
        if (next < minAdv) return maxAdv;
        if (next > maxAdv) return minAdv;
        return next; 
      });
      setGlobalEnh(1); // 강화 차수 최소값을 1로 설정
    } else {
      // Find max enhancement for the current global advancement across all classes
      const maxEnhForCurrentAdv = Math.max(
        0,
        ...Object.values(classData)
          .filter((d) => d.enhancementsByAdv[globalAdv])
          .map((d) => Math.max(...d.enhancementsByAdv[globalAdv]))
      );

      const minEnh = 1;
      setGlobalEnh((prev) => {
        const next = prev + direction; // 강화 차수 최소값을 1로 설정
        if (next < minEnh) return maxEnhForCurrentAdv;
        if (next > maxEnhForCurrentAdv) return minEnh;
        return next;
      });
    }
  };

  const handleIndividualChange = (className, type, direction) => {
    setIndividualStates((prev) => {
      const current = prev[className];
      const newState = { ...current };
      const classInfo = classData[className];
      if (!classInfo) return prev;

      const maxAdv = classInfo.advancements[classInfo.advancements.length - 1];
      const minAdv = 1;

      if (type === "adv") {
        const nextAdv = current.adv + direction;
        if (nextAdv < minAdv) newState.adv = maxAdv;
        else if (nextAdv > maxAdv) newState.adv = minAdv;
        else newState.adv = nextAdv;
        newState.enh = 1; // 강화 차수 최소값을 1로 설정
      } else {
        const enhancements = classInfo.enhancementsByAdv[current.adv] || [1];
        const maxEnh = enhancements[enhancements.length - 1];
        const minEnh = 1;
        const nextEnh = current.enh + direction;
        if (nextEnh < minEnh) newState.enh = maxEnh;
        else if (nextEnh > maxEnh) newState.enh = minEnh;
        else newState.enh = nextEnh;
      }

      return { ...prev, [className]: newState };
    });
  };

  const classNames = Object.keys(classData);

  if (classNames.length === 0) {
    return <p>클래스 무기 데이터가 없습니다.</p>;
  }

  return (
    <div className="class-weapon-view">
      <div className="class-weapon-controls">
        <h2>클래스 무기 스탯</h2>
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={isGlobalMode}
              onChange={(e) => setIsGlobalMode(e.target.checked)}
            />
            일괄 변경
          </label>
        </div>
        {isGlobalMode && (
          <div className="global-controls">
            <div className="selector">
              <span>전직 차수:</span>
              <button onClick={() => handleGlobalChange("adv", -1)}>‹</button>
              <span>{globalAdv}차</span>
              <button onClick={() => handleGlobalChange("adv", 1)}>›</button>
            </div>
            <div className="selector">
              <span>강화 차수:</span>
              <button onClick={() => handleGlobalChange("enh", -1)}>‹</button>
              <span>+{globalEnh}</span>
              <button onClick={() => handleGlobalChange("enh", 1)}>›</button>
            </div>
          </div>
        )}
      </div>
      <div className="class-weapon-card-view-container">
        {classNames.map((className) => {
          const { adv, enh } = isGlobalMode
            ? { adv: globalAdv, enh: globalEnh }
            : individualStates[className] || { adv: 1, enh: 1 };

          const weaponStats = classData[className]?.weapons.find(
            (w) => Number(w["전직 차수"]) === adv && Number(w["강화 차수"]) === enh
          );

          let totalDps = 0;
          let totalDpm = 0;

          const skillStats = SKILL_TYPES.map((skill) => {
            const damage = Number(weaponStats?.[`${skill} 피해량`] || 0);
            const cooldown = Number(weaponStats?.[`${skill} 쿨타임`] || 0);
            if (!damage || !cooldown) return null;

            const dps = damage / cooldown;
            const dpm = dps * 60;
            totalDps += dps;
            totalDpm += dpm;

            return { skill, damage, cooldown, dps, dpm };
          }).filter(Boolean);

          return (
            <div
              key={className}
              className={`class-weapon-card class-${getCssClassForClassName(
                className
              )}`}
            >
              <div className="class-weapon-card-header">
                <h3>{className}</h3>
                {!isGlobalMode && (
                  <div className="individual-controls">
                    <div className="selector">
                      <button
                        onClick={() => handleIndividualChange(className, "adv", -1)}
                      >
                        ‹
                      </button>
                      <span>{adv}차</span>
                      <button
                        onClick={() => handleIndividualChange(className, "adv", 1)}
                      >
                        ›
                      </button>
                    </div>
                    <div className="selector">
                      <button
                        onClick={() => handleIndividualChange(className, "enh", -1)}
                      >
                        ‹
                      </button>
                      <span>+{enh}</span>
                      <button
                        onClick={() => handleIndividualChange(className, "enh", 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="class-weapon-card-body">
                {weaponStats ? (
                  <div className="skill-list">
                    {skillStats.map(({ skill, damage, cooldown, dps, dpm }) => (
                      <div key={skill} className="skill-item">
                        <strong>{skill}</strong>
                        <div className="skill-details">
                          <span>피해량: {damage.toLocaleString()}</span>
                          <span>쿨타임: {cooldown}초</span>
                          <span>DPS: {dps.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                          <span>DPM: {dpm.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-stats">해당 차수/강화 정보 없음</p>
                )}
              </div>
              <div className="class-weapon-card-footer">
                <div className="total-dps-dpm">
                  <strong>총합 DPS: </strong>
                  <span>{totalDps.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                </div>
                <div className="total-dps-dpm">
                  <strong>총합 DPM: </strong>
                  <span>{totalDpm.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClassWeaponCardView;
