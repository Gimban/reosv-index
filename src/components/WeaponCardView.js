import React, { useMemo, useState, useEffect } from "react";
import WeaponCard from "./WeaponCard";
import ViewControls from "./ViewControls";
import GradeFilterControls from "./GradeFilterControls";
import { useWeaponData } from "../hooks/useWeaponData";
import "./WeaponCardView.css";

// src/images 폴더와 하위 폴더의 모든 png 파일을 불러옵니다.
function importAll(r) {
  const images = {};
  r.keys().forEach((item) => {
    // './subfolder/image.png' -> 'image'
    const key = item.substring(item.lastIndexOf("/") + 1, item.lastIndexOf("."));
    images[key] = r(item);
  });
  return images;
}
const weaponImages = importAll(require.context("../images", true, /\.png$/));

const MOBILE_UNGROUPED_PAGE_SIZE = 8;

function useMediaQuery(query) {
  const getMatch = () => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const updateMatch = (event) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", updateMatch);
    } else {
      mediaQueryList.addListener(updateMatch);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", updateMatch);
      } else {
        mediaQueryList.removeListener(updateMatch);
      }
    };
  }, [query]);

  return matches;
}

function WeaponCardView({ data }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 상태 관리
  const [showDescription, setShowDescription] = useState(true);
  const [sortOption, setSortOption] = useState("기본");
  const [sortEnhancement, setSortEnhancement] = useState(0);
  const [globalEnhancement, setGlobalEnhancement] = useState("개별");
  const [gradeFilter, setGradeFilter] = useState({});
  const [showUngrouped, setShowUngrouped] = useState(false);
  const [hideDeleted, setHideDeleted] = useState(true);
  const [activeGrade, setActiveGrade] = useState(null);
  const [ungroupedPage, setUngroupedPage] = useState(0);

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
  const { groupedWeapons, sortedGrades, getSortedWeaponsForGrades, getUngroupedWeapons } =
    useWeaponData(filteredData, {
      sortOption,
      sortEnhancement,
      includeUngrouped: showUngrouped,
    });

  useEffect(() => {
    if (sortedGrades.length === 0) return;

    setGradeFilter((prev = {}) => {
      const next = sortedGrades.reduce((acc, grade) => {
        acc[grade] = prev[grade] ?? false;
        return acc;
      }, {});

      const prevKeys = Object.keys(prev);
      const hasShapeChanged =
        prevKeys.length !== sortedGrades.length ||
        prevKeys.some((key) => !sortedGrades.includes(key));

      return hasShapeChanged ? next : prev;
    });
  }, [sortedGrades]);

  // 등급 필터링 로직
  const isAllMode = useMemo(
    () => !Object.values(gradeFilter).some((value) => value),
    [gradeFilter]
  );

  const filteredGrades = useMemo(() => {
    return isAllMode
      ? sortedGrades
      : sortedGrades.filter((grade) => gradeFilter[grade]);
  }, [isAllMode, gradeFilter, sortedGrades]);

  const resolvedActiveGrade = useMemo(() => {
    if (!isMobile || showUngrouped) return null;
    if (!filteredGrades.length) return null;
    if (activeGrade && filteredGrades.includes(activeGrade)) {
      return activeGrade;
    }
    return filteredGrades[0];
  }, [isMobile, showUngrouped, filteredGrades, activeGrade]);

  useEffect(() => {
    if (!isMobile || showUngrouped) return;
    if (!filteredGrades.length) {
      setActiveGrade(null);
      return;
    }
    setActiveGrade((prev) =>
      prev && filteredGrades.includes(prev) ? prev : filteredGrades[0]
    );
  }, [isMobile, showUngrouped, filteredGrades]);

  useEffect(() => {
    setUngroupedPage(0);
  }, [showUngrouped, sortOption, sortEnhancement, hideDeleted, filteredData.length]);

  const gradesToRequest = useMemo(() => {
    if (showUngrouped) return [];
    if (isMobile) {
      return resolvedActiveGrade ? [resolvedActiveGrade] : [];
    }
    return filteredGrades;
  }, [showUngrouped, isMobile, resolvedActiveGrade, filteredGrades]);

  const sortedGradeMap = useMemo(
    () => getSortedWeaponsForGrades(gradesToRequest),
    [getSortedWeaponsForGrades, gradesToRequest]
  );

  const allSortedWeapons = useMemo(() => {
    if (!showUngrouped) return [];
    return getUngroupedWeapons();
  }, [showUngrouped, getUngroupedWeapons]);

  const mobileUngroupedPages = useMemo(() => {
    if (!showUngrouped || !isMobile) return [];
    if (!allSortedWeapons.length) return [[]];

    const pages = [];
    for (let index = 0; index < allSortedWeapons.length; index += MOBILE_UNGROUPED_PAGE_SIZE) {
      pages.push(
        allSortedWeapons.slice(index, index + MOBILE_UNGROUPED_PAGE_SIZE)
      );
    }
    return pages;
  }, [showUngrouped, isMobile, allSortedWeapons]);

  useEffect(() => {
    if (!isMobile) return;
    if (ungroupedPage >= mobileUngroupedPages.length) {
      setUngroupedPage(0);
    }
  }, [isMobile, mobileUngroupedPages, ungroupedPage]);

  const visibleUngroupedWeapons = useMemo(() => {
    if (!showUngrouped) return [];
    if (!isMobile) return allSortedWeapons;
    return mobileUngroupedPages[ungroupedPage] || [];
  }, [showUngrouped, isMobile, allSortedWeapons, mobileUngroupedPages, ungroupedPage]);

  const handleShowAllClick = () => {
    setGradeFilter((prev) =>
      Object.keys(prev).reduce((acc, grade) => {
        acc[grade] = false;
        return acc;
      }, {})
    );
  };

  const handleGradeFilterChange = (grade, isChecked) => {
    setGradeFilter((prevFilter) => ({
      ...prevFilter,
      [grade]: isChecked,
    }));
  };

  if (Object.keys(groupedWeapons).length === 0) {
    return <p>특수 무기 스탯 데이터를 불러오는 중이거나 데이터가 없습니다.</p>;
  }

  return (
    <div className={`weapon-card-view ${isMobile ? "is-mobile" : "is-desktop"}`}>
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

      {!showUngrouped && filteredGrades.length > 0 && (
        <GradeFilterControls
          sortedGrades={sortedGrades}
          isAllMode={isAllMode}
          handleShowAllClick={handleShowAllClick}
          gradeFilter={gradeFilter}
          handleGradeFilterChange={handleGradeFilterChange}
        />
      )}

      {showUngrouped ? (
        <>
          <div className={`cards-container ungrouped ${isMobile ? "mobile" : ""}`}>
            {visibleUngroupedWeapons.map((weaponGroup) => (
              <WeaponCard
                key={`${weaponGroup[0]["이름"]}-${weaponGroup[0]["강화 차수"]}`}
                weaponData={weaponGroup}
                grade={weaponGroup[0]["등급"]}
                showDescription={showDescription}
                imageSrc={
                  weaponImages[
                    weaponGroup[0]["이미지 파일"]?.replace(".png", "")
                  ]
                }
                globalEnhancement={globalEnhancement}
                isMobileView={isMobile}
              />
            ))}
          </div>
          {isMobile && mobileUngroupedPages.length > 1 && (
            <div className="mobile-pagination">
              <button
                type="button"
                onClick={() => setUngroupedPage((prev) => Math.max(prev - 1, 0))}
                disabled={ungroupedPage === 0}
              >
                이전
              </button>
              <span>
                {ungroupedPage + 1} / {mobileUngroupedPages.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setUngroupedPage((prev) =>
                    Math.min(prev + 1, mobileUngroupedPages.length - 1)
                  )
                }
                disabled={ungroupedPage === mobileUngroupedPages.length - 1}
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : isMobile ? (
        <div className="mobile-grade-browser">
          <div className="grade-tab-list" role="tablist" aria-label="무기 등급 선택">
            {filteredGrades.map((grade) => (
              <button
                key={grade}
                type="button"
                role="tab"
                aria-selected={resolvedActiveGrade === grade}
                className={`grade-tab ${
                  resolvedActiveGrade === grade ? "active" : ""
                }`}
                onClick={() => setActiveGrade(grade)}
              >
                {grade}
              </button>
            ))}
          </div>
          <div className="mobile-grade-panel">
            {resolvedActiveGrade ? (
              <div className="cards-container">
                {(sortedGradeMap[resolvedActiveGrade] || []).map((weaponGroup) => (
                  <WeaponCard
                    key={`${resolvedActiveGrade}-${weaponGroup[0]["이름"]}-${weaponGroup[0]["강화 차수"]}`}
                    weaponData={weaponGroup}
                    grade={resolvedActiveGrade}
                    showDescription={showDescription}
                    imageSrc={
                      weaponImages[
                        weaponGroup[0]["이미지 파일"]?.replace(".png", "")
                      ]
                    }
                    globalEnhancement={globalEnhancement}
                    isMobileView={isMobile}
                  />
                ))}
              </div>
            ) : (
              <p className="empty-state">표시할 등급이 없습니다.</p>
            )}
          </div>
        </div>
      ) : (
        filteredGrades.map((grade) => {
          const gradeGroups = sortedGradeMap[grade] || [];
          return (
            <section key={grade} className="grade-section">
              <h2>{grade}</h2>
              <div className="cards-container">
                {gradeGroups.map((weaponGroup) => (
                  <WeaponCard
                    key={`${grade}-${weaponGroup[0]["이름"]}-${weaponGroup[0]["강화 차수"]}`}
                    weaponData={weaponGroup}
                    grade={grade}
                    showDescription={showDescription}
                    imageSrc={
                      weaponImages[
                        weaponGroup[0]["이미지 파일"]?.replace(".png", "")
                      ]
                    }
                    globalEnhancement={globalEnhancement}
                    isMobileView={isMobile}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

export default WeaponCardView;

