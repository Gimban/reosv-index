// Helper to find a specific weapon stat by enhancement level
export const findWeaponByEnhancement = (weaponGroup, enhancement) => {
  if (!weaponGroup || weaponGroup.length === 0) {
    return null;
  }
  const targetEnh = Number(enhancement);

  // 1. Find exact match
  const exactMatch = weaponGroup.find(
    (w) => Number(w["강화 차수"]) === targetEnh
  );
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Find best match for levels in between
  let bestMatch = weaponGroup[0];
  for (const weapon of weaponGroup) {
    const currentEnh = Number(weapon["강화 차수"]);
    if (currentEnh <= targetEnh) {
      bestMatch = weapon;
    } else {
      break; // Data is sorted, no need to look further
    }
  }
  return bestMatch;
};

// Helper to parse a numeric value from the CSV data
const parseNum = (value) => Number(String(value || "0").replace(/,/g, ""));

// Main calculation function for a single weapon
export const calculateWeaponStats = (
  weaponGroup,
  enhancement,
  accessoryStats,
  totalStatDamageIncrease
) => {
  if (!weaponGroup) {
    return { totalDamage: 0, cooldown: 0, dps: 0, dpm: 0 };
  }

  const weaponStat = findWeaponByEnhancement(weaponGroup, enhancement);
  if (!weaponStat) {
    return { totalDamage: 0, cooldown: 0, dps: 0, dpm: 0 };
  }

  const grade = weaponStat["등급"];
  const baseDamage = parseNum(weaponStat["피해량"]);
  const hits = parseNum(weaponStat["타수"]) || 1;
  const baseCooldown = parseNum(weaponStat["쿨타임"]);

  if (baseDamage === 0) {
    return { totalDamage: 0, cooldown: baseCooldown, dps: 0, dpm: 0 };
  }

  const totalBaseDamage = baseDamage * hits;

  // 1. Calculate Damage Multipliers
  let damageMultiplier = 1.0;
  if (grade !== "운명") {
    damageMultiplier += (accessoryStats.specialWeaponDmg || 0) / 100;
  }

  const { gradeDmg } = accessoryStats;
  if (grade === "일반" || grade === "고급")
    damageMultiplier += (gradeDmg.normalUncommon || 0) / 100;
  if (grade === "희귀") damageMultiplier += (gradeDmg.rare || 0) / 100;
  if (grade === "영웅") damageMultiplier += (gradeDmg.heroic || 0) / 100;
  if (grade === "전설")
    damageMultiplier +=
      ((gradeDmg.legendary || 0) + (gradeDmg.legendaryMortal || 0)) / 100;
  if (grade === "필멸")
    damageMultiplier +=
      ((gradeDmg.mortal || 0) + (gradeDmg.legendaryMortal || 0)) / 100;
  if (grade === "운명") damageMultiplier += (gradeDmg.destiny || 0) / 100;

  // 2. Calculate final damage (before monster-specific bonuses)
  const finalDamage =
    totalBaseDamage * (1 + totalStatDamageIncrease / 100) * damageMultiplier;

  // 3. Calculate final cooldown
  const finalCooldown =
    baseCooldown * (1 - (accessoryStats.cooldownReduction || 0) / 100);

  // 4. Calculate DPS and DPM
  const dps = finalCooldown > 0 ? finalDamage / finalCooldown : 0;
  const dpm = dps * 60;

  return { totalDamage: finalDamage, cooldown: finalCooldown, dps, dpm };
};

// Main calculation function for a single CLASS skill
export const calculateClassSkillStats = (
  baseDamage,
  baseCooldown,
  accessoryStats,
  totalStatDamageIncrease,
  skillType
) => {
  let parsedDamage = parseNum(baseDamage);
  const parsedCooldown = parseNum(baseCooldown);

  if (parsedDamage === 0 || parsedCooldown === 0) {
    return { totalDamage: 0, cooldown: parsedCooldown, dps: 0, dpm: 0 };
  }

  // '클래스 기본 공격 데미지 증가' (합연산) 적용
  if (skillType === "좌클릭") {
    parsedDamage += accessoryStats?.classBasicDmgInc || 0;
  }

  // 1. Calculate final damage
  // Class weapons are NOT affected by special/grade damage multipliers.
  // They are only affected by player stats (attack/health).
  let finalDamage = parsedDamage * (1 + totalStatDamageIncrease / 100);

  // '클래스 스킬 데미지 증가' (곱연산) 적용
  if (skillType !== "좌클릭") {
    finalDamage *= 1 + (accessoryStats?.classSkillDmgInc || 0) / 100;
  }

  // 2. Calculate final cooldown
  const finalCooldown =
    parsedCooldown * (1 - (accessoryStats?.cooldownReduction || 0) / 100);

  // 3. Calculate DPS and DPM
  const dps = finalCooldown > 0 ? finalDamage / finalCooldown : 0;
  const dpm = dps * 60;

  return { totalDamage: finalDamage, cooldown: finalCooldown, dps, dpm };
};
