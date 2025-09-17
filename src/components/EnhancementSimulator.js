import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import EnhancementWeaponSelectionModal from "./enhancement/EnhancementWeaponSelectionModal";
import EnhancementControls from "./enhancement/EnhancementControls";
import EnhancementLog from "./enhancement/EnhancementLog";
import AutoEnhancementControls from "./enhancement/AutoEnhancementControls";
import {
  getEnhancementInfo,
  performEnhancement as performEnhancementLogic,
} from "./enhancement/enhancementHelper";
import "./EnhancementSimulator.css";

const parseNum = (val) => Number(String(val || "0").replace(/,/g, ""));

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
  const [isAutoEnhancing, setIsAutoEnhancing] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [autoEnhanceStrategy, setAutoEnhanceStrategy] = useState(null);

  const autoEnhanceTimer = useRef(null);
  // This ref will hold all state and functions needed by the loop,
  // preventing stale closures and massive dependency arrays.
  const enhancementStateRef = useRef({});
  useEffect(() => {
    enhancementStateRef.current = {
      isAutoEnhancing,
      isAutoPaused,
      currentLevel,
      autoEnhanceStrategy,
      selectedWeapon,
      guaranteedCostData,
      probabilisticCostData,
      handleEnhancementAttempt,
      stopAutoEnhancement,
    };
  });

  const handleWeaponSelect = useCallback(
    (weaponGroup) => {
      setSelectedWeapon(weaponGroup);
      setCurrentLevel(0);
      setHistory([]);
      setIsModalOpen(false);
      stopAutoEnhancement(); // 무기 변경 시 자동 강화 중단
    },
    [setHistory] // eslint-disable-line react-hooks/exhaustive-deps,
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
      stopAutoEnhancement();
    }
  }, [setLogs, setHistory]); // eslint-disable-line react-hooks/exhaustive-deps,

  const handleResetEnhancement = useCallback(() => {
    if (
      window.confirm(
        "현재 무기의 강화를 0으로 초기화하시겠습니까? (누적 기록은 유지됩니다.)"
      )
    ) {
      setCurrentLevel(0);
      setHistory([]);
      stopAutoEnhancement();
    }
  }, [setHistory]); // eslint-disable-line react-hooks/exhaustive-deps,

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

      const historyEntry = {
        message: `[+${result.fromLevel} → +${result.newLevel}] ${result.outcome}`,
        outcome: result.outcome,
      };
      setHistory((prev) => [historyEntry, ...prev].slice(0, 20));
    },
    [setLogs, setHistory]
  );

  const getHistoryItemClass = (outcome) => {
    if (!outcome) return "";
    if (outcome.includes("성공")) {
      return "history-success";
    }
    if (outcome.includes("리셋 (방지됨)") || outcome.includes("실패")) {
      return "history-failure";
    }
    if (outcome.includes("하락")) {
      return "history-downgrade";
    }
    if (outcome.includes("리셋")) {
      return "history-reset";
    }
    return "";
  };

  const stopAutoEnhancement = useCallback(() => {
    setIsAutoEnhancing(false);
    setIsAutoPaused(false);
    setAutoEnhanceStrategy(null);
    if (autoEnhanceTimer.current) {
      clearTimeout(autoEnhanceTimer.current);
      autoEnhanceTimer.current = null;
    }
  }, []);

  const startAutoEnhancement = useCallback((strategy) => {
    setIsAutoEnhancing(true);
    setIsAutoPaused(false);
    setAutoEnhanceStrategy(strategy);
  }, []);

  const pauseAutoEnhancement = useCallback(() => {
    setIsAutoPaused((prev) => !prev);
  }, []);

  // The function that runs a single step of the auto-enhancement loop.
  // It's defined with useCallback but has no dependencies, as it reads everything from a ref.
  const runAutoEnhanceStep = useCallback(() => {
    const state = enhancementStateRef.current;

    if (
      !state.isAutoEnhancing ||
      state.isAutoPaused ||
      !state.autoEnhanceStrategy
    ) {
      return;
    }

    if (state.currentLevel >= state.autoEnhanceStrategy.targetLevel) {
      state.stopAutoEnhancement();
      return;
    }

    const nextLevel = state.currentLevel + 1;
    const weaponGrade = state.selectedWeapon[0]["등급"];
    const enhancementInfo = getEnhancementInfo(
      weaponGrade,
      nextLevel,
      state.guaranteedCostData,
      state.probabilisticCostData
    );

    let type;
    let options = { downgradeProtection: false, resetProtection: false };

    if (
      enhancementInfo.guaranteed &&
      state.autoEnhanceStrategy.guaranteedLevels.has(nextLevel)
    ) {
      type = "guaranteed";
    } else if (enhancementInfo.probabilistic) {
      type = "probabilistic";
    } else if (enhancementInfo.guaranteed) {
      type = "guaranteed";
    } else {
      alert("더 이상 강화할 수 없어 자동 강화를 중단합니다.");
      state.stopAutoEnhancement();
      return;
    }

    if (type === "probabilistic") {
      if (state.autoEnhanceStrategy.downgradeProtectLevels.has(nextLevel)) {
        options.downgradeProtection = true;
      }
      if (state.autoEnhanceStrategy.resetProtectLevels.has(nextLevel)) {
        options.resetProtection = true;
      }
    }

    const result = performEnhancementLogic(
      type,
      enhancementInfo,
      options,
      state.currentLevel,
      state.selectedWeapon
    );

    if (result) {
      state.handleEnhancementAttempt(result);
      // Schedule the next step. The state update from handleEnhancementAttempt
      // will be picked up in the next iteration via the ref.
      autoEnhanceTimer.current = setTimeout(runAutoEnhanceStep, 50);
    } else {
      alert("강화 정보가 없어 자동 강화를 중단합니다.");
      state.stopAutoEnhancement();
    }
  }, []);

  // This effect starts/stops/pauses the loop.
  useEffect(() => {
    if (isAutoEnhancing && !isAutoPaused) {
      // Start the timer only if it's not already running
      if (!autoEnhanceTimer.current) {
        autoEnhanceTimer.current = setTimeout(runAutoEnhanceStep, 50);
      }
    } else {
      // Clear timer if paused or stopped
      clearTimeout(autoEnhanceTimer.current);
      autoEnhanceTimer.current = null;
    }

    // Cleanup on unmount
    return () => {
      clearTimeout(autoEnhanceTimer.current);
      autoEnhanceTimer.current = null;
    };
  }, [isAutoEnhancing, isAutoPaused, runAutoEnhanceStep]);

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

  const maxEnhancementLevel = useMemo(() => {
    if (!selectedWeapon) return 0;
    const weaponGrade = selectedWeapon[0]["등급"];
    const levels = [...guaranteedCostData, ...probabilisticCostData]
      .filter((d) => d["등급"] === weaponGrade)
      .map((d) => parseNum(d["강화 차수"]));
    return levels.length > 0 ? Math.max(...levels) : 0;
  }, [selectedWeapon, guaranteedCostData, probabilisticCostData]);

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
              isAutoEnhancing={isAutoEnhancing}
            />
          ) : (
            <p className="guide-text">먼저 시뮬레이션할 무기를 선택해주세요.</p>
          )}

          {selectedWeapon && (
            <AutoEnhancementControls
              key={selectedWeapon[0]["이름"]}
              maxLevel={maxEnhancementLevel}
              onStart={startAutoEnhancement}
              onPause={pauseAutoEnhancement}
              onStop={stopAutoEnhancement}
              isAutoEnhancing={isAutoEnhancing}
              isAutoPaused={isAutoPaused}
              probabilisticCostData={probabilisticCostData}
              guaranteedCostData={guaranteedCostData}
              weaponGrade={weaponGrade}
            />
          )}
        </div>

        <div className="simulator-log-panel">
          <EnhancementLog logs={logs} onReset={handleResetLogs} />
          <div className="enhancement-history">
            <h3>최근 시도 기록 (최대 20개)</h3>
            <ul>
              {history.map((item, index) => (
                <li key={index} className={getHistoryItemClass(item.outcome)}>
                  {item.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EnhancementWeaponSelectionModal
          weaponData={weaponData}
          guaranteedCostData={guaranteedCostData}
          probabilisticCostData={probabilisticCostData}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleWeaponSelect}
        />
      )}
    </div>
  );
}

export default EnhancementSimulator;
