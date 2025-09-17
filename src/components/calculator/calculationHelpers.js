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
    return { totalDamage: 0, cooldown: 0, dps: 0, dpm: 0, formula: null };
  }

  const weaponStat = findWeaponByEnhancement(weaponGroup, enhancement);
  if (!weaponStat) {
    return { totalDamage: 0, cooldown: 0, dps: 0, dpm: 0, formula: null };
  }

  const grade = weaponStat["등급"];
  const baseDamage = parseNum(weaponStat["피해량"]);
  const hits = parseNum(weaponStat["타수"]) || 1;
  const baseCooldown = parseNum(weaponStat["쿨타임"]);

  if (baseDamage === 0) {
    return {
      totalDamage: 0,
      cooldown: baseCooldown,
      dps: 0,
      dpm: 0,
      formula: null,
    };
  }

  const totalBaseDamage = baseDamage * hits;
  const statAdjustedDamage =
    totalBaseDamage * (1 + totalStatDamageIncrease / 100);

  // 1. Calculate Damage Multipliers
  let damageMultiplier = 1.0;
  const specialWeaponDmg = accessoryStats.specialWeaponDmg || 0;
  if (grade !== "운명") {
    damageMultiplier += specialWeaponDmg / 100;
  }

  const { gradeDmg } = accessoryStats;
  let gradeDmgValue = 0;
  if (grade === "일반" || grade === "고급")
    gradeDmgValue = gradeDmg.normalUncommon || 0;
  if (grade === "희귀") gradeDmgValue = gradeDmg.rare || 0;
  if (grade === "영웅") gradeDmgValue = gradeDmg.heroic || 0;
  if (grade === "전설")
    gradeDmgValue = (gradeDmg.legendary || 0) + (gradeDmg.legendaryMortal || 0);
  if (grade === "필멸")
    gradeDmgValue = (gradeDmg.mortal || 0) + (gradeDmg.legendaryMortal || 0);
  if (grade === "운명") gradeDmgValue = gradeDmg.destiny || 0;

  damageMultiplier += gradeDmgValue / 100;

  // 2. Calculate final damage (before monster-specific bonuses)
  const finalDamage = statAdjustedDamage * damageMultiplier;

  // 3. Calculate final cooldown
  const finalCooldown =
    baseCooldown * (1 - (accessoryStats.cooldownReduction || 0) / 100);

  // 4. Calculate DPS and DPM
  const dps = finalCooldown > 0 ? finalDamage / finalCooldown : 0;
  const dpm = dps * 60;

  return {
    totalDamage: finalDamage,
    cooldown: finalCooldown,
    dps,
    dpm,
    formula: {
      grade,
      statAdjustedDamage,
      baseCooldown,
      specialWeaponDmg: grade !== "운명" ? specialWeaponDmg : 0,
      gradeDmg: gradeDmgValue,
      cooldownReduction: accessoryStats.cooldownReduction || 0,
    },
  };
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
    return {
      totalDamage: 0,
      cooldown: parsedCooldown,
      dps: 0,
      dpm: 0,
      formula: null,
    };
  }

  const classBasicDmgInc = accessoryStats?.classBasicDmgInc || 0;
  const classSkillDmgInc = accessoryStats?.classSkillDmgInc || 0;
  const cooldownReduction = accessoryStats?.cooldownReduction || 0;

  const statAdjustedBaseDamage =
    parsedDamage * (1 + totalStatDamageIncrease / 100);
  let statAdjustedBasicDmgInc = 0;

  // '클래스 기본 공격 데미지 증가' (합연산) 적용
  if (skillType === "좌클릭") {
    statAdjustedBasicDmgInc =
      classBasicDmgInc * (1 + totalStatDamageIncrease / 100);
  }

  // 1. Calculate final damage
  let finalDamage = statAdjustedBaseDamage;
  if (skillType === "좌클릭") {
    finalDamage += statAdjustedBasicDmgInc;
  }

  // '클래스 스킬 데미지 증가' (곱연산) 적용
  if (skillType !== "좌클릭") {
    finalDamage *= 1 + classSkillDmgInc / 100;
  }

  // 2. Calculate final cooldown
  const finalCooldown = parsedCooldown * (1 - cooldownReduction / 100);

  // 3. Calculate DPS and DPM
  const dps = finalCooldown > 0 ? finalDamage / finalCooldown : 0;
  const dpm = dps * 60;

  return {
    totalDamage: finalDamage,
    cooldown: finalCooldown,
    dps,
    dpm,
    formula: {
      statAdjustedBaseDamage,
      statAdjustedBasicDmgInc,
      baseCooldown: parsedCooldown,
      classSkillDmgInc: skillType !== "좌클릭" ? classSkillDmgInc : 0,
      cooldownReduction,
    },
  };
};
