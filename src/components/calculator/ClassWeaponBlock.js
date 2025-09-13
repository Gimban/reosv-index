import React, { useState, useMemo, useEffect } from "react";
import "./ClassWeaponBlock.css";
import { calculateClassSkillStats } from "./calculationHelpers";

const SKILL_TYPES = ["좌클릭", "우클릭", "쉬프트 좌클릭", "쉬프트 우클릭"];

const getCssClassForClassName = (className) => {
  const classMap = {
    메이지: "class-mage",
    블레이드: "class-blade",
    워리어: "class-warrior",
    프로스트: "class-frost",
  };
  return classMap[className] || "";
};

function ClassWeaponBlock({
  classWeaponData,
  accessoryStats,
  totalStatDamageIncrease,
  onStatsChange,
}) {
  // 1. 데이터 가공
  const processedClassData = useMemo(() => {
    if (!classWeaponData || classWeaponData.length === 0) return {};
    const grouped = classWeaponData.reduce((acc, row) => {
      const className = row["클래스"];
      if (!className) return acc;
      if (!acc[className]) {
        acc[className] = {
          advancements: new Set(),
          enhancementsByAdv: {},
          data: [],
        };
      }
      const adv = row["전직 차수"];
      const enh = row["강화 차수"];
      acc[className].advancements.add(adv);
      if (!acc[className].enhancementsByAdv[adv]) {
        acc[className].enhancementsByAdv[adv] = new Set();
      }
      acc[className].enhancementsByAdv[adv].add(enh);
      acc[className].data.push(row);
      return acc;
    }, {});

    // Set을 정렬된 배열로 변환
    for (const className in grouped) {
      grouped[className].advancements = [
        ...grouped[className].advancements,
      ].sort((a, b) => Number(a) - Number(b));
      for (const adv in grouped[className].enhancementsByAdv) {
        grouped[className].enhancementsByAdv[adv] = [
          ...grouped[className].enhancementsByAdv[adv],
        ].sort((a, b) => Number(a) - Number(b));
      }
    }
    return grouped;
  }, [classWeaponData]);

  const classNames = useMemo(
    () => Object.keys(processedClassData),
    [processedClassData]
  );

  // 2. 선택 상태 관리
  const [selections, setSelections] = useState({});
  const [activeClass, setActiveClass] = useState(null);

  useEffect(() => {
    const initialSelections = {};
    for (const className of classNames) {
      initialSelections[className] = { advIndex: 0, enhIndex: 0 };
    }
    setSelections(initialSelections);
    if (classNames.length > 0) {
      // 첫 번째 클래스를 기본 활성 클래스로 설정
      setActiveClass((current) => current || classNames[0]);
    }
  }, [classNames]);

  // 3. 핸들러
  const handleSelectionChange = (className, type, direction) => {
    setSelections((prev) => {
      const current = prev[className];
      if (!current) return prev;

      const newSelections = { ...prev };
      const classInfo = processedClassData[className];

      if (type === "adv") {
        let newAdvIndex = current.advIndex + direction;
        if (newAdvIndex < 0) newAdvIndex = classInfo.advancements.length - 1;
        if (newAdvIndex >= classInfo.advancements.length) newAdvIndex = 0;
        newSelections[className] = { advIndex: newAdvIndex, enhIndex: 0 };
      } else if (type === "enh") {
        const currentAdv = classInfo.advancements[current.advIndex];
        const enhancements = classInfo.enhancementsByAdv[currentAdv];
        let newEnhIndex = current.enhIndex + direction;
        if (newEnhIndex < 0) newEnhIndex = enhancements.length - 1;
        if (newEnhIndex >= enhancements.length) newEnhIndex = 0;
        newSelections[className] = { ...current, enhIndex: newEnhIndex };
      }
      return newSelections;
    });
  };

  // 4. 계산 로직
  const totalCalculatedStats = useMemo(() => {
    let totalDps = 0;

    if (
      !accessoryStats ||
      totalStatDamageIncrease === null ||
      !activeClass ||
      !selections[activeClass]
    ) {
      return { totalDps: 0, totalDpm: 0 };
    }

    const className = activeClass;
    const selection = selections[className];
    const classInfo = processedClassData[className];
    const adv = classInfo.advancements[selection.advIndex];
    const enh = classInfo.enhancementsByAdv[adv]?.[selection.enhIndex];

    if (enh === undefined) return { totalDps: 0, totalDpm: 0 };

    const statRow = classInfo.data.find(
      (row) => row["전직 차수"] === adv && row["강화 차수"] === enh
    );

    if (!statRow) return { totalDps: 0, totalDpm: 0 };

    for (const skill of SKILL_TYPES) {
      const damage = statRow[`${skill} 피해량`];
      const cooldown = statRow[`${skill} 쿨타임`];
      if (damage && cooldown && Number(damage) > 0) {
        const { dps } = calculateClassSkillStats(
          damage,
          cooldown,
          accessoryStats,
          totalStatDamageIncrease,
          skill
        );
        totalDps += dps;
      }
    }
    return { totalDps, totalDpm: totalDps * 60 };
  }, [
    selections,
    processedClassData,
    accessoryStats,
    totalStatDamageIncrease,
    activeClass,
  ]);

  // 5. 부모 컴포넌트로 상태 전달
  useEffect(() => {
    onStatsChange(totalCalculatedStats);
  }, [totalCalculatedStats, onStatsChange]);

  const formatNumber = (num) =>
    (num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="calculator-block">
      <div className="class-block-header">
        <h2>클래스 무기</h2>
        <label className="class-none-option">
          <span>사용 안 함</span>
          <input
            type="radio"
            name="class-weapon-selection"
            checked={activeClass === null}
            onChange={() => setActiveClass(null)}
          />
        </label>
      </div>
      <div className="class-weapon-grid">
        {classNames.map((className) => {
          const selection = selections[className];
          const isActive = className === activeClass;
          if (!selection) return null;

          const classInfo = processedClassData[className];
          const adv = classInfo.advancements[selection.advIndex];
          const enh = classInfo.enhancementsByAdv[adv]?.[selection.enhIndex];
          const statRow =
            enh !== undefined
              ? classInfo.data.find(
                  (row) => row["전직 차수"] === adv && row["강화 차수"] === enh
                )
              : null;

          return (
            <div
              key={className}
              className={`class-weapon-card ${
                !isActive ? "inactive" : ""
              } ${getCssClassForClassName(className)}`}
            >
              <div className="class-card-header">
                <h3>{className}</h3>
                <input
                  type="radio"
                  name="class-weapon-selection"
                  checked={isActive}
                  onChange={() => setActiveClass(className)}
                />
              </div>

              <div className="class-selector-row">
                <div className="selector">
                  <button
                    onClick={() => handleSelectionChange(className, "adv", -1)}
                  >
                    ‹
                  </button>
                  <span>{adv}차</span>
                  <button
                    onClick={() => handleSelectionChange(className, "adv", 1)}
                  >
                    ›
                  </button>
                </div>
                <div className="selector">
                  <button
                    onClick={() => handleSelectionChange(className, "enh", -1)}
                  >
                    ‹
                  </button>
                  <span>+{enh}</span>
                  <button
                    onClick={() => handleSelectionChange(className, "enh", 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="class-skill-list">
                {statRow &&
                  SKILL_TYPES.map((skill) => {
                    const damage = statRow[`${skill} 피해량`];
                    const cooldown = statRow[`${skill} 쿨타임`];
                    if (!damage || damage === "0") return null;

                    const { dps } = calculateClassSkillStats(
                      damage,
                      cooldown,
                      accessoryStats,
                      totalStatDamageIncrease,
                      skill
                    );

                    return (
                      <div key={skill} className="skill-stat-item">
                        <span className="skill-name">{skill}</span>
                        <div className="skill-details">
                          <span>피해량: {damage}</span>
                          <span>쿨타임: {cooldown}초</span>
                          <span>DPS: {formatNumber(dps)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="class-weapon-total-result">
        <h4>클래스 무기 총합</h4>
        <div className="result-item">
          <span className="label">총 DPS</span>
          <span className="value">
            {formatNumber(totalCalculatedStats.totalDps)}
          </span>
        </div>
        <div className="result-item">
          <span className="label">총 DPM</span>
          <span className="value">
            {formatNumber(totalCalculatedStats.totalDpm)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClassWeaponBlock;
