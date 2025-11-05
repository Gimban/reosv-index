import React, { useState, useCallback } from "react";
import { useResponsive } from "../context/ResponsiveContext";
import { useStepNavigation } from "../hooks/useStepNavigation";
import MobileStepper from "./common/MobileStepper";
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
  const { isMobile } = useResponsive();
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

  const steps = [
    {
      id: "player",
      title: "플레이어",
      render: () => <EhpPlayerStatsBlock onStatsChange={handlePlayerStatsChange} />,
    },
    {
      id: "armor",
      title: "방어구",
      render: () => (
        <EhpArmorBlock onStatsChange={handleArmorStatsChange} costData={armorCostData} />
      ),
    },
    {
      id: "accessory",
      title: "장신구",
      render: () => (
        <EhpAccessoryStatsBlock
          onStatsChange={handleAccessoryStatsChange}
          accessoryBaseData={accessoryBaseData}
          accessoryPotentialOptionData={accessoryPotentialOptionData}
        />
      ),
    },
    {
      id: "divine",
      title: "신력의 파편",
      render: () => <EhpDivineShardBlock onStatsChange={handleDivineShardStatsChange} />,
    },
    {
      id: "guild",
      title: "길드 효과",
      render: () => <EhpGuildBlock onStatsChange={handleGuildStatsChange} />,
    },
    {
      id: "class",
      title: "클래스 가중치",
      render: () => <EhpClassBlock onStatsChange={handleClassStatsChange} />,
    },
    {
      id: "results",
      title: "계산 결과",
      render: () => (
        <EhpResultBlock
          playerStats={playerStats}
          armorStats={armorStats}
          accessoryStats={accessoryStats}
          divineShardStats={divineShardStats}
          guildStats={guildStats}
          classStats={classStats}
        />
      ),
    },
  ];

  const stepCompletion = {
    player: Boolean(playerStats),
    armor: Boolean(armorStats),
    accessory: Boolean(accessoryStats),
    divine: Boolean(divineShardStats),
    guild: Boolean(guildStats),
    class: Boolean(classStats),
    results: true,
  };

  const {
    currentStep,
    goNext,
    goPrev,
    goToStep,
    isFirstStep,
    isLastStep,
  } = useStepNavigation(steps.length);

  return (
    <div className={`dps-calculator-container${isMobile ? " mobile" : ""}`}>
      <h1>실질 체력 계산기</h1>
      {isMobile ? (
        <MobileStepper
          steps={steps}
          currentStep={currentStep}
          goNext={goNext}
          goPrev={goPrev}
          goToStep={goToStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          stepCompletion={stepCompletion}
        />
      ) : (
        steps.map((step) => <React.Fragment key={step.id}>{step.render()}</React.Fragment>)
      )}
    </div>
  );
}

export default EffectiveHpCalculator;
