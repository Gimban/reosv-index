import React, { useState, useCallback, useMemo } from "react";
import EhpPlayerStatsBlock from "./ehp_calculator/EhpPlayerStatsBlock";
import EhpArmorBlock from "./ehp_calculator/EhpArmorBlock";
import EhpAccessoryStatsBlock from "./ehp_calculator/EhpAccessoryStatsBlock";
import EhpDivineShardBlock from "./ehp_calculator/EhpDivineShardBlock";
import EhpGuildBlock from "./ehp_calculator/EhpGuildBlock";
import EhpClassBlock from "./ehp_calculator/EhpClassBlock";
import "./DpsCalculator.css"; // 스타일은 DPS 계산기와 공유

function EffectiveHpCalculator({
  accessoryBaseData,
  accessoryPotentialOptionData,
  armorCostData,
}) {
  const [playerStats, setPlayerStats] = useState({ levelUpHp: 0, inputWarning: null });
  const [armorStats, setArmorStats] = useState(null);
  const [accessoryStats, setAccessoryStats] = useState(null);
  const [divineShardStats, setDivineShardStats] = useState(null);
  const [guildStats, setGuildStats] = useState(null);
  const [classStats, setClassStats] = useState(null);

  const handlePlayerStatsChange = useCallback((stats) => {
    setPlayerStats(stats);
  }, []);

  const handleArmorStatsChange = useCallback((stats) => {
    setArmorStats(stats);
  }, []);

  const handleAccessoryStatsChange = useCallback((stats) => {
    setAccessoryStats(stats);
  }, []);

  const handleDivineShardStatsChange = useCallback((stats) => {
    setDivineShardStats(stats);
  }, []);

  const handleGuildStatsChange = useCallback((stats) => {
    setGuildStats(stats);
  }, []);

  const handleClassStatsChange = useCallback((stats) => {
    setClassStats(stats);
  }, []);

  // TODO: 실질 체력 계산 로직 구현

  return (
    <div className="dps-calculator-container">
      <h1>실질 체력 계산기</h1>
      <EhpPlayerStatsBlock onStatsChange={handlePlayerStatsChange} />
      <EhpArmorBlock onStatsChange={handleArmorStatsChange} costData={armorCostData} />
      <EhpAccessoryStatsBlock
        onStatsChange={handleAccessoryStatsChange}
        accessoryBaseData={accessoryBaseData}
        accessoryPotentialOptionData={accessoryPotentialOptionData}
      />
      <EhpDivineShardBlock onStatsChange={handleDivineShardStatsChange} />
      <EhpGuildBlock onStatsChange={handleGuildStatsChange} />
      <EhpClassBlock onStatsChange={handleClassStatsChange} />
      {/* TODO: 계산 결과 표시 컴포넌트 추가 */}
    </div>
  );
}

export default EffectiveHpCalculator;
