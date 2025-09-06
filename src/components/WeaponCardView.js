import React, { useMemo, useState, useEffect } from "react";
import WeaponCard from "./WeaponCard";
import "./WeaponCardView.css";

// 정렬에 필요한 계산을 위한 헬퍼 함수
const getWeaponMetrics = (weapon) => {
  if (!weapon) return { totalDamage: 0, dps: 0 };

  const numericDamage = Number(
    String(weapon["피해량"] || "0").replace(/,/g, "")
  );
  const numericHits = Number(weapon["타수"] || "1");
  const numericCooldown = Number(weapon["쿨타임"] || "0");

  const totalDamage = numericDamage * numericHits;
  const dps = numericCooldown > 0 ? totalDamage / numericCooldown : 0;

  return { totalDamage, dps };
};

// 정렬 기준 강화 차수에 맞는 무기 데이터를 찾는 헬퍼 함수
const findWeaponForSort = (weaponGroup, targetEnhancement) => {
  if (!weaponGroup || weaponGroup.length === 0) {
    return null;
  }

  // 1. 정확한 강화 차수 검색
  const exactMatch = weaponGroup.find(
    (w) => Number(w["강화 차수"]) === targetEnhancement
  );
  if (exactMatch) {
    return exactMatch;
  }

  // 2. 사용자가 선택한 강화 차수가 무기의 최대/최소 범위를 벗어나는 경우
  const minEnhancement = Number(weaponGroup[0]["강화 차수"]);
  const maxEnhancement = Number(
    weaponGroup[weaponGroup.length - 1]["강화 차수"]
  );

  if (targetEnhancement > maxEnhancement) {
    return weaponGroup[weaponGroup.length - 1]; // 최대 강화 수치로 반환
  }

  if (targetEnhancement < minEnhancement) {
    return weaponGroup[0]; // 최소 강화 수치로 반환
  }

  // 3. 강화 단계 중간에 데이터가 없는 경우 (예: 0, 5, 10강만 있고 3강 선택)
  // 선택한 강화 단계보다 낮은 것 중 가장 가까운 것을 사용합니다.
  let bestMatch = weaponGroup[0];
  for (const weapon of weaponGroup) {
    const enhancementLevel = Number(weapon["강화 차수"]);
    if (enhancementLevel <= targetEnhancement) {
      bestMatch = weapon;
    } else {
      break; // 정렬되어 있으므로 더 이상 볼 필요 없음
    }
  }
  return bestMatch;
};

function WeaponCardView({ data }) {
  const [showDescription, setShowDescription] = useState(false);
  const [sortOption, setSortOption] = useState("기본"); // '기본', '총 피해량', 'DPS'
  const [sortEnhancement, setSortEnhancement] = useState(0); // 정렬 기준 강화 차수
  const [gradeFilter, setGradeFilter] = useState({});

  const groupedWeapons = useMemo(() => {
    if (!data || data.length === 0) {
      return {};
    }

    // 1. '이름'으로 무기들을 그룹화합니다.
    const weaponsByName = data.reduce((acc, weapon) => {
      const name = weapon["이름"];
      if (!name) return acc; // 이름이 없는 데이터는 무시
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(weapon);
      // '강화 차수' (숫자)에 따라 정렬
      acc[name].sort((a, b) => Number(a["강화 차수"]) - Number(b["강화 차수"]));
      return acc;
    }, {});

    // 2. '등급'으로 다시 그룹화합니다.
    const weaponsByGrade = Object.values(weaponsByName).reduce(
      (acc, weaponGroup) => {
        // 0강화 기준으로 등급을 정합니다.
        const grade = weaponGroup[0]["등급"];
        if (!grade) return acc; // 등급이 없는 데이터는 무시
        if (!acc[grade]) {
          acc[grade] = [];
        }
        acc[grade].push(weaponGroup);
        return acc;
      },
      {}
    );

    return weaponsByGrade;
  }, [data]);

  // 등급 순서에 따라 정렬합니다.
  const sortedGrades = useMemo(() => {
    const gradeOrder = [
      "일반",
      "고급",
      "희귀",
      "영웅",
      "전설",
      "필멸",
      "보스",
      "기타",
      "운명",
    ];
    return Object.keys(groupedWeapons).sort((a, b) => {
      const indexA = gradeOrder.indexOf(a);
      const indexB = gradeOrder.indexOf(b);
      // gradeOrder에 없는 등급은 뒤로 보냅니다.
      const finalIndexA = indexA === -1 ? gradeOrder.length : indexA;
      const finalIndexB = indexB === -1 ? gradeOrder.length : indexB;
      return finalIndexA - finalIndexB;
    });
  }, [groupedWeapons]);

  useEffect(() => {
    // groupedWeapons가 변경될 때 gradeFilter 상태를 초기화합니다.
    const initialFilter = sortedGrades.reduce((acc, grade) => {
      acc[grade] = false;
      return acc;
    }, {});
    setGradeFilter(initialFilter);
  }, [sortedGrades]);

  const sortedGroupedWeapons = useMemo(() => {
    if (sortOption === "기본") {
      return groupedWeapons;
    }

    const sorted = {};
    for (const grade in groupedWeapons) {
      sorted[grade] = [...groupedWeapons[grade]].sort((groupA, groupB) => {
        // 정렬 기준 강화 차수에 맞는 무기 데이터를 가져옵니다.
        const weaponA = findWeaponForSort(groupA, sortEnhancement);
        const weaponB = findWeaponForSort(groupB, sortEnhancement);

        const metricsA = getWeaponMetrics(weaponA);
        const metricsB = getWeaponMetrics(weaponB);

        if (sortOption === "총 피해량") {
          return metricsB.totalDamage - metricsA.totalDamage; // 내림차순
        }

        if (sortOption === "DPS") {
          return metricsB.dps - metricsA.dps; // 내림차순
        }

        return 0;
      });
    }
    return sorted;
  }, [groupedWeapons, sortOption, sortEnhancement]);

  const isAllMode = useMemo(
    () => !Object.values(gradeFilter).some((v) => v),
    [gradeFilter]
  );

  const handleShowAllClick = () => {
    const resetFilter = {};
    Object.keys(gradeFilter).forEach((grade) => {
      resetFilter[grade] = false;
    });
    setGradeFilter(resetFilter);
  };

  const handleGradeFilterChange = (grade, isChecked) => {
    setGradeFilter((prevFilter) => ({
      ...prevFilter,
      [grade]: isChecked,
    }));
  };

  const filteredGrades = useMemo(() => {
    return isAllMode
      ? sortedGrades
      : sortedGrades.filter((grade) => gradeFilter[grade]);
  }, [isAllMode, gradeFilter, sortedGrades]);

  if (Object.keys(groupedWeapons).length === 0) {
    return <p>특수 무기 스텟 데이터를 불러오는 중이거나 데이터가 없습니다.</p>;
  }

  return (
    <div className="weapon-card-view">
      <div className="view-controls">
        <h1>특수 무기 스텟</h1>
        <div className="controls-group">
          <div className="sort-controls">
            <label htmlFor="sort-select">정렬:</label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="기본">기본</option>
              <option value="총 피해량">총 피해량</option>
              <option value="DPS">DPS</option>
            </select>
            <label htmlFor="enhancement-select">강화 기준:</label>
            <select
              id="enhancement-select"
              value={sortEnhancement}
              onChange={(e) => setSortEnhancement(Number(e.target.value))}
            >
              {[...Array(16).keys()].map((level) => (
                <option key={level} value={level}>
                  +{level}
                </option>
              ))}
            </select>
          </div>
          <label>
            <input
              type="checkbox"
              checked={showDescription}
              onChange={(e) => setShowDescription(e.target.checked)}
            />
            설명 보기
          </label>
        </div>
      </div>
      <div className="grade-filter-controls">
        <span className="filter-title">등급 필터:</span>
        <label className="radio-label">
          <input
            type="radio"
            name="grade-filter"
            checked={isAllMode}
            onChange={handleShowAllClick}
          />
          모두 보기
        </label>
        {sortedGrades.map((grade) => (
          <label key={grade} className="checkbox-label">
            <input
              type="checkbox"
              checked={gradeFilter[grade] || false}
              onChange={(e) => handleGradeFilterChange(grade, e.target.checked)}
            />
            {grade}
          </label>
        ))}
      </div>
      {filteredGrades.map((grade) => (
        <section key={grade} className="grade-section">
          <h2>{grade}</h2>
          <div className="cards-container">
            {sortedGroupedWeapons[grade].map((weaponGroup) => (
              <WeaponCard
                key={weaponGroup[0]["이름"]}
                weaponData={weaponGroup}
                grade={grade}
                showDescription={showDescription}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default WeaponCardView;
