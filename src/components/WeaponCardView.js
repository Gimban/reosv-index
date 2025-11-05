import React, { useMemo, useState, useEffect } from "react";
import WeaponCard from "./WeaponCard";
import ViewControls from "./ViewControls";
import GradeFilterControls from "./GradeFilterControls";
import { useWeaponData } from "../hooks/useWeaponData";
import { useResponsive } from "../context/ResponsiveContext";
import "./WeaponCardView.css";

// src/images 폴더와 하위 폴더의 모든 png 파일을 불러옵니다.
function importAll(r) {
  let images = {};
  r.keys().forEach((item) => {
    // './subfolder/image.png' -> 'image'
    const key = item.substring(item.lastIndexOf("/") + 1, item.lastIndexOf("."));
    images[key] = r(item);
  });
  return images;
}
const weaponImages = importAll(require.context("../images", true, /\.png$/));

function WeaponCardView({ data }) {
  const { isMobile } = useResponsive();
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  // 상태 관리
  const [showDescription, setShowDescription] = useState(true);
  const [sortOption, setSortOption] = useState("기본");
  const [sortEnhancement, setSortEnhancement] = useState(0);
  const [globalEnhancement, setGlobalEnhancement] = useState("개별");
  const [gradeFilter, setGradeFilter] = useState({});
  const [showUngrouped, setShowUngrouped] = useState(false);
  const [hideDeleted, setHideDeleted] = useState(true);

  useEffect(() => {
    if (!isMobile && isControlsOpen) {
      setIsControlsOpen(false);
    }
  }, [isMobile, isControlsOpen]);

  // "삭제됨" 비고가 있는 무기를 필터링하는 로직
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!hideDeleted) return data;

    const deletedWeaponNames = new Set();
    data.forEach((weapon) => {
      if (weapon["비고"]?.includes("삭제됨")) {
        deletedWeaponNames.add(weapon["이름"]);
      }
    });

    return data.filter((weapon) => !deletedWeaponNames.has(weapon["이름"]));
  }, [data, hideDeleted]);

  // 데이터 처리 로직 (커스텀 훅)
  const {
    groupedWeapons,
    sortedGrades,
    sortedGroupedWeapons,
    allWeaponsSorted,
  } = useWeaponData(filteredData, sortOption, sortEnhancement);

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

  const allSortedWeapons = useMemo(() => {
    if (!showUngrouped) return [];
    // useWeaponData 훅에서 이미 모든 정렬 로직이 적용된 배열을 사용합니다.
    return allWeaponsSorted;
  }, [showUngrouped, allWeaponsSorted]);

  if (Object.keys(groupedWeapons).length === 0) {
    return <p>특수 무기 스탯 데이터를 불러오는 중이거나 데이터가 없습니다.</p>;
  }

  const controlsPanel = (
    <>
      <ViewControls
        sortOption={sortOption}
        setSortOption={setSortOption}
        sortEnhancement={sortEnhancement}
        setSortEnhancement={setSortEnhancement}
        showDescription={showDescription}
        setShowDescription={setShowDescription}
        showUngrouped={showUngrouped}
        setShowUngrouped={setShowUngrouped}
        globalEnhancement={globalEnhancement}
        setGlobalEnhancement={setGlobalEnhancement}
        hideDeleted={hideDeleted}
        setHideDeleted={setHideDeleted}
        isMobile={isMobile}
      />
      {!showUngrouped && (
        <GradeFilterControls
          sortedGrades={sortedGrades}
          isAllMode={isAllMode}
          handleShowAllClick={handleShowAllClick}
          gradeFilter={gradeFilter}
          handleGradeFilterChange={handleGradeFilterChange}
          isMobile={isMobile}
        />
      )}
    </>
  );

  return (
    <div className={`weapon-card-view${isMobile ? " mobile" : ""}`}>
      {isMobile ? (
        <>
          <div className="weapon-card-view__mobile-toolbar">
            <button
              type="button"
              className="weapon-card-view__toolbar-button"
              onClick={() => setIsControlsOpen(true)}
            >
              Filters & sorting
            </button>
            <button
              type="button"
              className="weapon-card-view__toolbar-button"
              onClick={() => setShowUngrouped((prev) => !prev)}
            >
              {showUngrouped ? "Group by grade" : "Show all"}
            </button>
          </div>
          {isControlsOpen && (
            <div
              className="weapon-card-view__controls-modal"
              onClick={() => setIsControlsOpen(false)}
            >
              <div
                className="weapon-card-view__controls-modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="weapon-card-view-controls-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="weapon-card-view__controls-modal-header">
                  <h2 id="weapon-card-view-controls-title">Filters & sorting</h2>
                  <button
                    type="button"
                    className="weapon-card-view__controls-close"
                    onClick={() => setIsControlsOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="weapon-card-view__controls-modal-body">
                  {controlsPanel}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        controlsPanel
      )}

      {showUngrouped ? (
        <div className={`cards-container ungrouped${isMobile ? " mobile-scroll" : ""}`}>
          {allSortedWeapons.map((weaponGroup) => (
            <WeaponCard
              key={weaponGroup[0]["?�름"]}
              weaponData={weaponGroup}
              grade={weaponGroup[0]["?�급"]}
              showDescription={showDescription}
              imageSrc={
                weaponImages[weaponGroup[0]["?��?지 ?�일"]?.replace(".png", "")]
              }
              globalEnhancement={globalEnhancement}
            />
          ))}
        </div>
      ) : (
        filteredGrades.map((grade) => (
          <section key={grade} className={`grade-section${isMobile ? " mobile" : ""}`}>
            <h2>{grade}</h2>
            <div className={`cards-container${isMobile ? " mobile-scroll" : ""}`}>
              {sortedGroupedWeapons[grade].map((weaponGroup) => (
                <WeaponCard
                  key={weaponGroup[0]["?�름"]}
                  weaponData={weaponGroup}
                  grade={grade}
                  showDescription={showDescription}
                  imageSrc={
                    weaponImages[weaponGroup[0]["?��?지 ?�일"]?.replace(".png", "")]
                  }
                  globalEnhancement={globalEnhancement}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );

export default WeaponCardView;
