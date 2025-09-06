import React from "react";

function GradeFilterControls({
  sortedGrades,
  isAllMode,
  handleShowAllClick,
  gradeFilter,
  handleGradeFilterChange,
}) {
  return (
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
  );
}

export default GradeFilterControls;
