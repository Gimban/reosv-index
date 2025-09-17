import React from "react";
import "./CalculationResultBlock.css";

function CalculationFormula({ title, result }) {
  if (!result) return null;

  const { totalBaseDps, totalBaseDpm, monsterDmg, finalDps, finalDpm } = result;

  return (
    <div className="formula-container">
      <h4>{title}</h4>
      <div className="formula-item">
        <span className="formula-label">DPS:</span>
        <span className="formula-expression">
          {totalBaseDps.toLocaleString(undefined, { maximumFractionDigits: 1 })} (기본) × (1 + {monsterDmg}%) = <strong>{finalDps.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
        </span>
      </div>
      <div className="formula-item">
        <span className="formula-label">DPM:</span>
        <span className="formula-expression">
          {totalBaseDpm.toLocaleString(undefined, { maximumFractionDigits: 1 })} (기본) × (1 + {monsterDmg}%) = <strong>{finalDpm.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
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
    </div>
  );
}

export default CalculationResultBlock;

