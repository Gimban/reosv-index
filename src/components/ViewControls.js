import React from "react";

function ViewControls({
  sortOption,
  setSortOption,
  sortEnhancement,
  setSortEnhancement,
  showDescription,
  setShowDescription,
  showUngrouped,
  setShowUngrouped,
  globalEnhancement,
  setGlobalEnhancement,
}) {
  return (
    <div className="view-controls">
      <h1>특수 무기 스탯</h1>
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
          <label htmlFor="global-enhancement-select">일괄 변경:</label>
          <select
            id="global-enhancement-select"
            value={globalEnhancement}
            onChange={(e) => {
              const value = e.target.value;
              setGlobalEnhancement(value === "개별" ? "개별" : Number(value));
            }}
          >
            <option value="개별">개별 설정</option>
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
      <div className="controls-group">
        <label>
          <input type="checkbox" checked={!showUngrouped} onChange={(e) => setShowUngrouped(!e.target.checked)} />
          등급별 보기
        </label>
      </div>
    </div>
  );
}

export default ViewControls;
