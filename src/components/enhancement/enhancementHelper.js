const parseNum = (val) => Number(String(val || "0").replace(/,/g, ""));

export function getEnhancementInfo(
  weaponGrade,
  nextLevel,
  guaranteedCostData,
  probabilisticCostData
) {
  const guaranteed = guaranteedCostData.find(
    (d) => d["등급"] === weaponGrade && parseNum(d["강화 차수"]) === nextLevel
  );
  const probabilistic = probabilisticCostData.find(
    (d) => d["등급"] === weaponGrade && parseNum(d["강화 차수"]) === nextLevel
  );
  return { guaranteed, probabilistic };
}

export function performEnhancement(
  type,
  enhancementInfo,
  probOptions,
  currentLevel,
  weapon
) {
  let result = { fromLevel: currentLevel };
  const { guaranteed, probabilistic } = enhancementInfo;
  const nextLevel = currentLevel + 1;

  if (type === "guaranteed" && guaranteed) {
    const costs = {
      골드: parseNum(guaranteed["골드"]),
      "무형의 파편": parseNum(guaranteed["무형의 파편"]),
      "정교한 강화석": parseNum(guaranteed["정교한 강화석"]),
    };
    result = {
      ...result,
      outcome: "성공 (확정)",
      newLevel: nextLevel,
      costs,
    };
  } else if (type === "probabilistic" && probabilistic) {
    let successChance = parseNum(probabilistic["성공 확률"]);
    let failureChance = parseNum(probabilistic["실패 확률"]);
    let downgradeChance = parseNum(probabilistic["하락 확률"]);

    const costs = {
      골드: parseNum(probabilistic["골드"]),
      "무형의 파편": parseNum(probabilistic["무형의 파편"]),
      "정교한 강화석": parseNum(probabilistic["정교한 강화석"]),
    };

    if (probOptions.downgradeProtection) {
      const halfSuccess = successChance / 2;
      failureChance += downgradeChance + halfSuccess;
      downgradeChance = 0;
      successChance = halfSuccess;
      costs["골드"] += parseNum(probabilistic["하락 방지 비용"]);
    }

    const rand = Math.random();
    let cumulativeChance = 0;

    cumulativeChance += successChance;
    if (rand < cumulativeChance) {
      result = { ...result, outcome: "성공", newLevel: nextLevel, costs };
    } else {
      cumulativeChance += failureChance;
      if (rand < cumulativeChance) {
        result = {
          ...result,
          outcome: "실패",
          newLevel: currentLevel,
          costs,
        };
      } else {
        cumulativeChance += downgradeChance;
        if (rand < cumulativeChance) {
          result = {
            ...result,
            outcome: "하락",
            newLevel: Math.max(0, currentLevel - 1),
            costs,
          };
        } else {
          // Reset
          if (probOptions.resetProtection) {
            costs["골드"] += parseNum(probabilistic["리셋 방지 비용"]);
            result = {
              ...result,
              outcome: "리셋 (방지됨)",
              newLevel: currentLevel,
              costs,
              consumedWeaponName: weapon[0]["이름"],
            };
          } else {
            result = { ...result, outcome: "리셋", newLevel: 0, costs };
          }
        }
      }
    }
  } else {
    // This case should be handled by the caller, but as a fallback:
    return null;
  }
  return result;
}
