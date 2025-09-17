import React from "react";
import "./EnhancementLog.css";

function EnhancementLog({ logs, onReset }) {
  const { materials, consumedWeapons } = logs;

  const hasMaterials = Object.values(materials).some((amount) => amount > 0);
  const hasConsumedWeapons = Object.keys(consumedWeapons).length > 0;

  return (
    <div className="enhancement-log">
      <h3>누적 사용 재화</h3>
      {hasMaterials ? (
        <ul>
          {Object.entries(materials).map(
            ([name, amount]) =>
              amount > 0 && (
                <li key={name}>
                  <span className="log-name">{name}:</span>
                  <span className="log-amount">{amount.toLocaleString()}</span>
                </li>
              )
          )}
        </ul>
      ) : (
        <p className="no-log-text">아직 사용한 재화가 없습니다.</p>
      )}

      <h3>누적 소모 무기 (리셋 방지)</h3>
      {hasConsumedWeapons ? (
        <ul>
          {Object.entries(consumedWeapons).map(
            ([name, amount]) =>
              amount > 0 && (
                <li key={name}>
                  <span className="log-name">{name} +0:</span>
                  <span className="log-amount">
                    {amount.toLocaleString()}개
                  </span>
                </li>
              )
          )}
        </ul>
      ) : (
        <p className="no-log-text">아직 소모된 무기가 없습니다.</p>
      )}
      <button onClick={onReset} className="reset-log-button">
        기록 초기화
      </button>
    </div>
  );
}

export default EnhancementLog;
