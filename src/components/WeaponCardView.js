import React, { useMemo, useState, useEffect } from "react";
import WeaponCard from "./WeaponCard";
import ViewControls from "./ViewControls";
import GradeFilterControls from "./GradeFilterControls";
import { useWeaponData } from "../hooks/useWeaponData";
import "./WeaponCardView.css";

function WeaponCardView({ data }) {
  // 상태 관리
  const [showDescription, setShowDescription] = useState(false);
  const [sortOption, setSortOption] = useState("기본");
  const [sortEnhancement, setSortEnhancement] = useState(0);
  const [globalEnhancement, setGlobalEnhancement] = useState("개별");
  const [gradeFilter, setGradeFilter] = useState({});

  // 데이터 처리 로직 (커스텀 훅)
  const { groupedWeapons, sortedGrades, sortedGroupedWeapons } = useWeaponData(
    data,
    sortOption,
    sortEnhancement
  );

  useEffect(() => {
    // 데이터 로드 시 등급 필터 상태 초기화
    if (sortedGrades.length > 0) {
      const initialFilter = sortedGrades.reduce((acc, grade) => {
        acc[grade] = false;
        return acc;
      }, {});
      setGradeFilter(initialFilter);
    }
  }, [sortedGrades]);

  // 등급 필터링 로직
  const isAllMode = useMemo(
    () => !Object.values(gradeFilter).some((v) => v),
    [gradeFilter]
  );

  const handleShowAllClick = () => {
    const resetFilter = Object.keys(gradeFilter).reduce((acc, grade) => {
      acc[grade] = false;
      return acc;
    }, {});
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
    return <p>특수 무기 스탯 데이터를 불러오는 중이거나 데이터가 없습니다.</p>;
  }

  return (
    <div className="weapon-card-view">
      <ViewControls
        sortOption={sortOption}
        setSortOption={setSortOption}
        sortEnhancement={sortEnhancement}
        setSortEnhancement={setSortEnhancement}
        showDescription={showDescription}
        setShowDescription={setShowDescription}
        globalEnhancement={globalEnhancement}
        setGlobalEnhancement={setGlobalEnhancement}
      />

      <GradeFilterControls
        sortedGrades={sortedGrades}
        isAllMode={isAllMode}
        handleShowAllClick={handleShowAllClick}
        gradeFilter={gradeFilter}
        handleGradeFilterChange={handleGradeFilterChange}
      />

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
                globalEnhancement={globalEnhancement}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default WeaponCardView;
