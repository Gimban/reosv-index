import React, { useState, useCallback, useMemo } from "react";
import EhpPlayerStatsBlock from "./ehp_calculator/EhpPlayerStatsBlock";
import EhpArmorBlock from "./ehp_calculator/EhpArmorBlock";
import EhpAccessoryStatsBlock from "./ehp_calculator/EhpAccessoryStatsBlock";
import EhpDivineShardBlock from "./ehp_calculator/EhpDivineShardBlock";
import EhpGuildBlock from "./ehp_calculator/EhpGuildBlock";
import EhpClassBlock from "./ehp_calculator/EhpClassBlock";
import EhpResultBlock from "./ehp_calculator/EhpResultBlock";
import "./DpsCalculator.css"; // 스타일은 DPS 계산기와 공유

function EffectiveHpCalculator({
  accessoryBaseData,
  accessoryPotentialOptionData,
  armorCostData,
}) {
  const [playerStats, setPlayerStats] = useState({ baseHp: 20, levelUpHp: 0 });
  const [armorStats, setArmorStats] = useState({ flatHp: 0 });
  const [accessoryStats, setAccessoryStats] = useState({ flatHp: 0, percentHp: 0, damageReduction: 0, hpStat: 0 });
  const [divineShardStats, setDivineShardStats] = useState({ flatHp: 0 });
  const [guildStats, setGuildStats] = useState({ hpStat: 0, damageReduction: 0 });
  const [classStats, setClassStats] = useState({ hpWeight: 0 });

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
      <EhpResultBlock
        playerStats={playerStats}
        armorStats={armorStats}
        accessoryStats={accessoryStats}
        divineShardStats={divineShardStats}
        guildStats={guildStats}
        classStats={classStats}
      />
    </div>
  );
}

export default EffectiveHpCalculator;
