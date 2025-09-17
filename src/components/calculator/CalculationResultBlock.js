import React, { useState } from "react";
import "./CalculationResultBlock.css";

const COLORS = [
  "#4e79a7",
  "#f28e2c",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc949",
  "#af7aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
  "#86bcb6",
  "#f1a253",
  "#e47a7b",
  "#a3d0cd",
  "#84b87c",
];

function DpsPieChart({ sources, totalDps }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (!sources || sources.length === 0 || totalDps === 0) {
    return null;
  }

  const chartData = sources
    .map((source, index) => ({
      ...source,
      percentage: (source.dps / totalDps) * 100,
      color: COLORS[index % COLORS.length],
    }))
    .filter((source) => source.percentage > 0.1) // 0.1% 미만은 차트에서 제외
    .sort((a, b) => b.dps - a.dps);

  if (chartData.length === 0) {
    return null;
  }

  const handleMouseMove = (e) => {
    setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const getCoordinatesForPercent = (percent) => {
    // 12시 방향에서 시작하도록 -90도 (PI/2) 조정
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    const radius = 50;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  };

  let cumulativePercentage = 0;
  const pieSlices = chartData.map((item) => {
    const [startX, startY] = getCoordinatesForPercent(
      cumulativePercentage / 100
    );
    cumulativePercentage += item.percentage;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercentage / 100);

    // 50%가 넘는 조각을 위한 플래그
    const largeArcFlag = item.percentage > 50 ? 1 : 0;

    const pathData = [
      `M 0 0`, // 중앙으로 이동
      `L ${startX} ${startY}`, // 호의 시작점으로 선 그리기
      `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`, // 호 그리기
      `Z`, // 경로 닫기 (중앙으로 돌아옴)
    ].join(" ");

    return { ...item, pathData };
  });

  return (
    <div className="dps-chart-container" onMouseMove={handleMouseMove}>
      <h4>DPS 기여도</h4>
      <div className="chart-and-legend">
        <div className="pie-chart-svg-container">
          <svg viewBox="-55 -55 110 110" width="150" height="150">
            {pieSlices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  transform:
                    hoveredSlice?.name === slice.name
                      ? "scale(1.05)"
                      : "scale(1)",
                  transformOrigin: "center center",
                  transition: "transform 0.1s ease-in-out",
                  cursor: "pointer",
                }}
              />
            ))}
          </svg>
        </div>

        {hoveredSlice && (
          <div
            className="pie-tooltip"
            style={{
              position: "fixed",
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              background: "rgba(0, 0, 0, 0.75)",
              color: "white",
              padding: "5px 10px",
              borderRadius: "4px",
              pointerEvents: "none",
              fontSize: "12px",
              zIndex: 1000,
            }}
          >
            {hoveredSlice.name}: {hoveredSlice.percentage.toFixed(1)}%
          </div>
        )}
        <div className="legend">
          {chartData.map((item, index) => (
            <div key={index} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: item.color }}
              ></span>
              <div className="legend-text">
                <span className="legend-name" title={item.name}>
                  {item.name}
                </span>{" "}
                <span className="legend-details">
                  {item.percentage.toFixed(1)}%{" "}
                  <span className="legend-dps-dpm">
                    (
                    {item.dps.toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}
                    {" / "}
                    {(item.dps * 60).toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}
                    )
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalculationFormula({ title, result }) {
  if (!result) return null;

  const { totalBaseDps, totalBaseDpm, monsterDmg, finalDps, finalDpm } = result;
  const monsterDmgLabel =
    title === "일반 몬스터"
      ? "일반 몬스터 대상 데미지 %"
      : "보스 몬스터 대상 데미지 %";

  return (
    <div className="formula-container">
      <h4>{title}</h4>
      <div className="formula-item">
        <span className="formula-label">DPS:</span>
        <span className="formula-expression">
          {totalBaseDps.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          (기본) × (100% + {monsterDmg}% ({monsterDmgLabel})) ={" "}
          <strong>
            {finalDps.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </strong>
        </span>
      </div>
      <div className="formula-item">
        <span className="formula-label">DPM:</span>
        <span className="formula-expression">
          {totalBaseDpm.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          (기본) × (100% + {monsterDmg}% ({monsterDmgLabel})) ={" "}
          <strong>
            {finalDpm.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </strong>
        </span>
      </div>
    </div>
  );
}

function CalculationResultBlock({ results }) {
  if (!results) {
    return (
      <div className="calculator-block result-block">
        <h2>최종 계산 결과</h2>
        <p>스탯과 무기를 모두 입력해주세요.</p>
      </div>
    );
  }

  return (
    <div className="calculator-block result-block">
      <h2>최종 계산 결과</h2>
      <div className="result-grid">
        <CalculationFormula title="일반 몬스터" result={results.normal} />
        <CalculationFormula title="보스 몬스터" result={results.boss} />
      </div>
      <DpsPieChart
        sources={results.dpsSources}
        totalDps={results.normal.totalBaseDps}
      />
    </div>
  );
}

export default CalculationResultBlock;
