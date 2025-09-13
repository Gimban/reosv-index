import React from "react";
import "./CalculationResultBlock.css";

function CalculationResultBlock({ results }) {
  const formatNumber = (num) =>
    (num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="calculator-block result-block">
      <h2>최종 계산 결과</h2>
      {!results ? (
        <p>스탯과 무기를 모두 입력해주세요.</p>
      ) : (
        <div className="result-grid">
          <div className="result-category">
            <h3>일반 몬스터</h3>
            <div className="result-item">
              <span className="label">총 DPS</span>
              <span className="value">{formatNumber(results.normal?.dps)}</span>
            </div>
            <div className="result-item">
              <span className="label">총 DPM</span>
              <span className="value">{formatNumber(results.normal?.dpm)}</span>
            </div>
          </div>
          <div className="result-category">
            <h3>보스 몬스터</h3>
            <div className="result-item">
              <span className="label">총 DPS</span>
              <span className="value">{formatNumber(results.boss?.dps)}</span>
            </div>
            <div className="result-item">
              <span className="label">총 DPM</span>
              <span className="value">{formatNumber(results.boss?.dpm)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculationResultBlock;
