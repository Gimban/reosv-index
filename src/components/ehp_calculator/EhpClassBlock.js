import React, { useState, useEffect, useMemo } from "react";

const CLASS_OPTIONS = {
  메이지: 0,
  블레이드: -5,
  워리어: 5,
  프로스트: 3,
};

const getCssClassForClassName = (className) => {
  const classMap = {
    메이지: "mage",
    블레이드: "blade",
    워리어: "warrior",
    프로스트: "frost",
  };
  return classMap[className] || "";
};

function EhpClassBlock({ onStatsChange }) {
  const [selectedClass, setSelectedClass] = useState("메이지");

  const calculatedStats = useMemo(() => {
    const hpWeight = CLASS_OPTIONS[selectedClass] || 0;
    return {
      hpWeight, // e.g., 5 for 5%
    };
  }, [selectedClass]);

  useEffect(() => {
    onStatsChange(calculatedStats);
  }, [calculatedStats, onStatsChange]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  return (
    <div className="calculator-block">
      <h2>클래스</h2>
      <div className="form-grid">
        <div className="class-selection-buttons">
          {Object.keys(CLASS_OPTIONS).map((className) => (
            <label
              key={className}
              className={`class-button class-${getCssClassForClassName(className)} ${
                selectedClass === className ? "active" : "" 
              }`}
            >
              <input
                type="radio"
                name="class-selection-ehp"
                value={className}
                checked={selectedClass === className}
                onChange={handleClassChange}
              />
              {className} ({CLASS_OPTIONS[className] > 0 ? "+" : ""}{CLASS_OPTIONS[className]}%)
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EhpClassBlock;
