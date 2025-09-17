import React, { useState, useCallback } from "react";
import EnhancementWeaponSelectionModal from "./enhancement/EnhancementWeaponSelectionModal";
import EnhancementControls from "./enhancement/EnhancementControls";
import EnhancementLog from "./enhancement/EnhancementLog";
import "./EnhancementSimulator.css";

function EnhancementSimulator({
  weaponData,
  guaranteedCostData,
  probabilisticCostData,
  logs,
  setLogs,
  history,
  setHistory,
}) {
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWeaponSelect = useCallback(
    (weaponGroup) => {
      setSelectedWeapon(weaponGroup);
      setCurrentLevel(0);
      setHistory([]);
      setIsModalOpen(false);
    },
    [setHistory]
  );

  const handleResetLogs = useCallback(() => {
    const confirmReset = window.confirm(
      "정말로 모든 강화 기록을 초기화하시겠습니까?"
    );
    if (confirmReset) {
      setLogs({
        materials: { 골드: 0, "무형의 파편": 0, "정교한 강화석": 0 },
        consumedWeapons: {},
      });
      setHistory([]);
    }
  }, [setLogs, setHistory]);

  const handleResetEnhancement = useCallback(() => {
    if (
      window.confirm(
        "현재 무기의 강화를 0으로 초기화하시겠습니까? (누적 기록은 유지됩니다.)"
      )
    ) {
      setCurrentLevel(0);
      setHistory([]);
    }
  }, [setHistory]);

  const handleEnhancementAttempt = useCallback(
    (result) => {
      // result: { outcome, fromLevel, newLevel, costs, consumedWeaponName }
      setCurrentLevel(result.newLevel);

      setLogs((prevLogs) => {
        const newMaterials = { ...prevLogs.materials };
        for (const material in result.costs) {
          if (result.costs[material] > 0) {
            newMaterials[material] =
              (newMaterials[material] || 0) + result.costs[material];
          }
        }

        const newConsumedWeapons = { ...prevLogs.consumedWeapons };
        if (result.consumedWeaponName) {
          newConsumedWeapons[result.consumedWeaponName] =
            (newConsumedWeapons[result.consumedWeaponName] || 0) + 1;
        }

        return {
          materials: newMaterials,
          consumedWeapons: newConsumedWeapons,
        };
      });

      const historyMessage = `[+${result.fromLevel} → +${result.newLevel}] ${result.outcome}`;
      setHistory((prev) => [historyMessage, ...prev].slice(0, 20));
    },
    [setLogs, setHistory]
  );

  const weaponGrade = selectedWeapon ? selectedWeapon[0]["등급"] : null;
  const gradeClass =
    {
      일반: "grade-common",
      고급: "grade-uncommon",
      희귀: "grade-rare",
      영웅: "grade-heroic",
      전설: "grade-legendary",
      필멸: "grade-mortal",
    }[weaponGrade] || "";

  return (
    <div className="enhancement-simulator">
      <h1>강화 시뮬레이터</h1>
      <div className="simulator-main-layout">
        <div className="simulator-controls-panel">
          <div className="weapon-selection-area">
            <button
              className={`select-weapon-btn ${gradeClass}`}
              onClick={() => setIsModalOpen(true)}
            >
              {selectedWeapon ? selectedWeapon[0]["이름"] : "무기 선택"}
            </button>
            {selectedWeapon && (
              <div className="current-weapon-display">
                <div>
                  <h2 className={gradeClass}>{selectedWeapon[0]["이름"]}</h2>
                  <p className="current-level-text">
                    현재 강화: <span>+{currentLevel}</span>
                  </p>
                </div>
                <button
                  onClick={handleResetEnhancement}
                  className="reset-enhancement-btn"
                >
                  강화 초기화
                </button>
              </div>
            )}
          </div>

          {selectedWeapon ? (
            <EnhancementControls
              key={selectedWeapon[0]["이름"]} // 무기 변경 시 컨트롤러 리셋
              weapon={selectedWeapon}
              currentLevel={currentLevel}
              guaranteedCostData={guaranteedCostData}
              probabilisticCostData={probabilisticCostData}
              onEnhance={handleEnhancementAttempt}
            />
          ) : (
            <p className="guide-text">먼저 시뮬레이션할 무기를 선택해주세요.</p>
          )}
        </div>

        <div className="simulator-log-panel">
          <EnhancementLog logs={logs} onReset={handleResetLogs} />
          <div className="enhancement-history">
            <h3>최근 시도 기록 (최대 20개)</h3>
            <ul>
              {history.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EnhancementWeaponSelectionModal
          weaponData={weaponData}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleWeaponSelect}
        />
      )}
    </div>
  );
}

export default EnhancementSimulator;
