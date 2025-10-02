import React, { useMemo } from "react";
import "./EhpResultBlock.css";

const formatNum = (num, digits = 0) =>
  (num || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

function EhpResultBlock({
  playerStats,
  armorStats,
  accessoryStats,
  divineShardStats,
  guildStats,
  classStats,
}) {
  const calculations = useMemo(() => {
    if (
      !playerStats || !armorStats || !accessoryStats ||
      !divineShardStats || !guildStats || !classStats
    ) {
      return null;
    }

    // 1. 모든 (+) 체력 합산
    const baseHp = playerStats.baseHp || 0;
    const levelUpHp = playerStats.levelUpHp || 0;
    const armorHp = armorStats.flatHp || 0;
    const accessoryFlatHp = accessoryStats.flatHp || 0;
    const divineShardHp = divineShardStats.flatHp || 0;

    // 2. 모든 체력 스탯 포인트로 얻는 체력 합산
    const accessoryHpStat = accessoryStats.hpStat || 0;
    const guildHpStat = guildStats.hpStat || 0;
    const accessoryHpFromStat = accessoryHpStat * 25;
    const guildHpFromStat = guildHpStat * 25;

    const totalFlatHp =
      levelUpHp + armorHp + accessoryFlatHp + divineShardHp;
    const hpFromStats =
      accessoryHpFromStat + guildHpFromStat;

    // 3. (%) 체력 및 클래스 가중치 적용
    const accessoryPercentHp = accessoryStats.percentHp || 0;
    const classHpWeight = classStats.hpWeight || 0;

    const pureHp =
      (baseHp + totalFlatHp + hpFromStats) *
      (1 + accessoryPercentHp / 100) *
      (1 + classHpWeight / 100);

    // 4. 받는 피해 감소(%) 합산 (최대 75%)
    const accessoryDmgRed = accessoryStats.damageReduction || 0;
    const guildDmgRed = guildStats.damageReduction || 0;
    const totalDmgRed = Math.min(75, accessoryDmgRed + guildDmgRed);

    // 5. 실질 체력 계산
    const effectiveHp = totalDmgRed < 100 ? pureHp / (1 - totalDmgRed / 100) : Infinity;

    return {
      baseHp,
      levelUpHp,
      armorHp,
      accessoryFlatHp,
      divineShardHp,
      accessoryHpFromStat,
      guildHpFromStat,
      accessoryPercentHp,
      classHpWeight,
      pureHp,
      totalDmgRed,
      effectiveHp,
    };
  }, [playerStats, armorStats, accessoryStats, divineShardStats, guildStats, classStats]);

  if (!calculations) {
    return null;
  }

  const {
    baseHp, levelUpHp, armorHp, accessoryFlatHp, divineShardHp,
    accessoryHpFromStat, guildHpFromStat,
    accessoryPercentHp, classHpWeight,
    pureHp,
    totalDmgRed, effectiveHp,
  } = calculations;

  return (
    <div className="calculator-block result-block ehp-result-block">
      <h2>최종 계산 결과</h2>
      <div className="result-section">
        <h3>
          순수 체력: <span>{formatNum(pureHp)}</span>
        </h3>
        <p className="formula">
          ( {formatNum(baseHp)}<sub>(기본)</sub>
          + {formatNum(levelUpHp)}<sub>(레벨)</sub> + {formatNum(armorHp)}<sub>(방어구)</sub> + {formatNum(accessoryFlatHp)}<sub>(장신구+n)</sub> + {formatNum(divineShardHp)}<sub>(샤드)</sub>
          + {formatNum(accessoryHpFromStat)}<sub>(장신구스탯)</sub> + {formatNum(guildHpFromStat)}<sub>(길드)</sub> )
          <br />
          &times; (1 + ({formatNum(accessoryPercentHp, 2)} / 100))<sub>(장신구%)</sub>
          &times; (1 + ({formatNum(classHpWeight, 2)} / 100))<sub>(클래스)</sub>
        </p>
      </div>
      <div className="result-section">
        <h3>
          실질 체력: <span>{isFinite(effectiveHp) ? formatNum(effectiveHp) : "∞"}</span>
        </h3>
        <p className="formula">
          {formatNum(pureHp)}<sub>(순수체력)</sub> / (1 - ({formatNum(totalDmgRed, 2)} / 100))<sub>(피해감소)</sub>
        </p>
      </div>
    </div>
  );
}

export default EhpResultBlock;