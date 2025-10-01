import React, { useState, useCallback, useMemo } from "react";
import PlayerStatsBlock from "./calculator/PlayerStatsBlock";
import AccessoryStatsBlock from "./calculator/AccessoryStatsBlock";
import ClassWeaponBlock from "./calculator/ClassWeaponBlock";
import DivineShardBlock from "./calculator/DivineShardBlock";
import GuildBlock from "./calculator/GuildBlock";
import WeaponSelectionBlock from "./calculator/WeaponSelectionBlock";
import CalculationResultBlock from "./calculator/CalculationResultBlock";
import { calculateWeaponStats } from "./calculator/calculationHelpers";
import "./DpsCalculator.css";

// 계산 관련 상수 (추후 조정 가능)
const MAX_PLAYER_LEVEL = 100; // 플레이어 최대 레벨
const DAMAGE_PER_ATTACK_POINT = 0.65; // 공격력 1포인트당 데미지 증가량 (%)
const DAMAGE_PER_HEALTH_POINT = 0.4; // 체력 1포인트당 데미지 증가량 (%)
const EMPTY_WEAPON_STATS = { totalDamage: 0, cooldown: 0, dps: 0, dpm: 0 };

function DpsCalculator({
  weaponData,
  classWeaponData,
  accessoryBaseData,
  accessoryPotentialOptionData,
}) {
  const [playerStats, setPlayerStats] = useState(null);
  const [accessoryStats, setAccessoryStats] = useState(null);
  const [weaponStats, setWeaponStats] = useState(null);
  const [classWeaponStats, setClassWeaponStats] = useState(null);
  const [divineShardStats, setDivineShardStats] = useState(null);
  const [guildStats, setGuildStats] = useState(null);

  // 자식 컴포넌트의 스탯이 변경될 때마다 호출될 콜백 함수
  const handlePlayerStatsChange = useCallback((stats) => {
    setPlayerStats(stats);
  }, []);

  const handleAccessoryStatsChange = useCallback((stats) => {
    setAccessoryStats(stats);
  }, []);

  const handleWeaponStatsChange = useCallback((stats) => {
    setWeaponStats(stats);
  }, []);

  const handleClassWeaponStatsChange = useCallback((stats) => {
    setClassWeaponStats(stats);
  }, []);

  const handleDivineShardStatsChange = useCallback((stats) => {
    setDivineShardStats(stats);
  }, []);

  const handleGuildStatsChange = useCallback((stats) => {
    setGuildStats(stats);
  }, []);

  const totalStatDamageIncrease = useMemo(() => {
    if (!playerStats || !accessoryStats || !guildStats) return 0;

    const combinedAttackPoints =
      (playerStats.attackPoints || 0) +
      (accessoryStats.finalDmgStat || 0) +
      (guildStats.finalDmgStat || 0);
    const combinedHealthPoints =
      (playerStats.healthPoints || 0) +
      (accessoryStats.maxHpStat || 0) +
      (guildStats.maxHpStat || 0);

    // 플레이어 스탯(레벨)으로 인한 증가량 + 신력의 파편으로 인한 최종 데미지 증가량
    const playerLevelDamageIncrease =
      combinedAttackPoints * DAMAGE_PER_ATTACK_POINT +
      combinedHealthPoints * DAMAGE_PER_HEALTH_POINT;

    return playerLevelDamageIncrease + (divineShardStats?.finalDamage || 0);
  }, [playerStats, accessoryStats, divineShardStats, guildStats]);

  const allCalculations = useMemo(() => {
    const numDestinyWeapons = weaponStats?.destinySelections?.length || 0;
    const totalSlots = 8 + numDestinyWeapons;

    if (
      !playerStats ||
      !accessoryStats ||
      !weaponStats ||
      !classWeaponStats ||
      !divineShardStats ||
      !guildStats
    ) {
      return {
        perWeaponStats: Array(totalSlots).fill(EMPTY_WEAPON_STATS),
        finalResults: null,
      };
    }

    // 2. 각 무기별 스탯 계산
    const perWeaponStats = [];
    const dpsSources = [];
    let totalBaseDps = 0;
    let totalBaseDpm = 0;

    // 8개 일반 무기 슬롯
    weaponStats.selectedWeapons.forEach((weapon, index) => {
      const enhancement = weaponStats.enhancements[index];
      const calcs = calculateWeaponStats(
        weapon,
        enhancement,
        accessoryStats,
        totalStatDamageIncrease
      );
      perWeaponStats.push(calcs);
      if (calcs.dps > 0) {
        dpsSources.push({
          name: weapon ? weapon[0]["이름"] : `슬롯 ${index + 1}`,
          dps: calcs.dps,
        });
      }
      totalBaseDps += calcs.dps || 0;
      totalBaseDpm += calcs.dpm || 0;
    });

    // 운명 무기 슬롯들
    if (weaponStats.destinySelections) {
      weaponStats.destinySelections.forEach((selection) => {
        // 체크박스가 활성화된 무기만 계산에 포함합니다.
        const calcs = selection.enabled
          ? calculateWeaponStats(
              selection.weapon,
              selection.enhancement,
              accessoryStats,
              totalStatDamageIncrease
            )
          : EMPTY_WEAPON_STATS;

        perWeaponStats.push(calcs);
        if (calcs.dps > 0) {
          dpsSources.push({
            name: selection.weapon[0]["이름"],
            dps: calcs.dps,
          });
        }

        totalBaseDps += calcs.dps || 0;
        totalBaseDpm += calcs.dpm || 0;
      });
    }

    // 클래스 무기 DPS 추가
    if (classWeaponStats.totalDps > 0) {
      dpsSources.push({
        name: "클래스 무기",
        dps: classWeaponStats.totalDps,
      });
    }
    totalBaseDps += classWeaponStats.totalDps || 0;
    totalBaseDpm += classWeaponStats.totalDpm || 0;

    // 3. 몬스터 종류별 최종 결과 계산
    const finalResults = {
      normal: {
        totalBaseDps,
        totalBaseDpm,
        monsterDmg: accessoryStats.normalMonsterDmg || 0,
        finalDps:
          totalBaseDps * (1 + (accessoryStats.normalMonsterDmg || 0) / 100),
        finalDpm:
          totalBaseDpm * (1 + (accessoryStats.normalMonsterDmg || 0) / 100),
      },
      boss: {
        totalBaseDps,
        totalBaseDpm,
        monsterDmg: accessoryStats.bossMonsterDmg || 0,
        finalDps:
          totalBaseDps * (1 + (accessoryStats.bossMonsterDmg || 0) / 100),
        finalDpm:
          totalBaseDpm * (1 + (accessoryStats.bossMonsterDmg || 0) / 100),
      },
      dpsSources,
    };

    return { perWeaponStats, finalResults };
  }, [
    playerStats,
    accessoryStats,
    weaponStats,
    classWeaponStats,
    divineShardStats,
    guildStats,
    totalStatDamageIncrease,
  ]);

  return (
    <div className="dps-calculator-container">
      <h1>DPS/DPM 계산기</h1>
      <PlayerStatsBlock
        maxLevel={MAX_PLAYER_LEVEL}
        damagePerAttack={DAMAGE_PER_ATTACK_POINT}
        damagePerHealth={DAMAGE_PER_HEALTH_POINT}
        onStatsChange={handlePlayerStatsChange}
      />
      <AccessoryStatsBlock
        onStatsChange={handleAccessoryStatsChange}
        accessoryBaseData={accessoryBaseData}
        accessoryPotentialOptionData={accessoryPotentialOptionData}
      />
      <DivineShardBlock onStatsChange={handleDivineShardStatsChange} />
      <GuildBlock onStatsChange={handleGuildStatsChange} />
      <ClassWeaponBlock
        classWeaponData={classWeaponData}
        accessoryStats={accessoryStats}
        totalStatDamageIncrease={totalStatDamageIncrease}
        onStatsChange={handleClassWeaponStatsChange}
      />
      <WeaponSelectionBlock
        weaponData={weaponData}
        onStatsChange={handleWeaponStatsChange}
        calculatedStats={allCalculations.perWeaponStats}
      />
      <CalculationResultBlock results={allCalculations.finalResults} />
    </div>
  );
}

export default DpsCalculator;
