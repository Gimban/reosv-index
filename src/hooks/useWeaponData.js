import { useMemo } from "react";

// 정렬에 필요한 계산을 위한 헬퍼 함수
const getWeaponMetrics = (weapon) => {
  if (!weapon) return { totalDamage: 0, dps: 0, manaEfficiency: 0 };

  const numericDamage = Number(
    String(weapon["피해량"] || "0").replace(/,/g, "")
  );
  const numericHits = Number(weapon["타수"] || "1");
  const numericCooldown = Number(weapon["쿨타임"] || "0");
  const numericMana = Number(
    String(weapon["마나"] || "0").replace(/,/g, "")
  );

  const totalDamage = numericDamage * numericHits;
  const dps = numericCooldown > 0 ? totalDamage / numericCooldown : 0;
  const manaEfficiency = numericMana > 0 ? totalDamage / numericMana : 0;

  return { totalDamage, dps, manaEfficiency };
};

// 정렬 기준 강화 차수에 맞는 무기 데이터를 찾는 헬퍼 함수
const findWeaponForSort = (weaponGroup, targetEnhancement) => {
  if (!weaponGroup || weaponGroup.length === 0) {
    return null;
  }

  // 1. 정확한 강화 차수 검색
  const exactMatch = weaponGroup.find(
    (w) => Number(w["강화 차수"]) === targetEnhancement
  );
  if (exactMatch) {
    return exactMatch;
  }

  // 2. 사용자가 선택한 강화 차수가 무기의 최대/최소 범위를 벗어나는 경우
  const minEnhancement = Number(weaponGroup[0]["강화 차수"]);
  const maxEnhancement = Number(
    weaponGroup[weaponGroup.length - 1]["강화 차수"]
  );

  if (targetEnhancement > maxEnhancement) {
    return weaponGroup[weaponGroup.length - 1]; // 최대 강화 수치로 반환
  }

  if (targetEnhancement < minEnhancement) {
    return weaponGroup[0]; // 최소 강화 수치로 반환
  }

  // 3. 강화 단계 중간에 데이터가 없는 경우 (예: 0, 5, 10강만 있고 3강 선택)
  // 선택한 강화 단계보다 낮은 것 중 가장 가까운 것을 사용합니다.
  let bestMatch = weaponGroup[0];
  for (const weapon of weaponGroup) {
    const enhancementLevel = Number(weapon["강화 차수"]);
    if (enhancementLevel <= targetEnhancement) {
      bestMatch = weapon;
    } else {
      break; // 정렬되어 있으므로 더 이상 볼 필요 없음
    }
  }
  return bestMatch;
};

export function useWeaponData(data, sortOption, sortEnhancement) {
  const groupedWeapons = useMemo(() => {
    if (!data || data.length === 0) return {};

    const weaponsByName = data.reduce((acc, weapon) => {
      const name = weapon["이름"];
      if (!name) return acc;
      if (!acc[name]) acc[name] = [];
      acc[name].push(weapon);
      acc[name].sort((a, b) => Number(a["강화 차수"]) - Number(b["강화 차수"]));
      return acc;
    }, {});

    return Object.values(weaponsByName).reduce((acc, weaponGroup) => {
      const grade = weaponGroup[0]["등급"];
      if (!grade) return acc;
      if (!acc[grade]) acc[grade] = [];
      acc[grade].push(weaponGroup);
      return acc;
    }, {});
  }, [data]);

  const sortedGrades = useMemo(() => {
    const gradeOrder = [
      "일반",
      "고급",
      "희귀",
      "영웅",
      "전설",
      "필멸",
      "보스",
      "운명",
      "기타",
    ];
    return Object.keys(groupedWeapons).sort((a, b) => {
      const indexA = gradeOrder.indexOf(a);
      const indexB = gradeOrder.indexOf(b);
      const finalIndexA = indexA === -1 ? gradeOrder.length : indexA;
      const finalIndexB = indexB === -1 ? gradeOrder.length : indexB;
      return finalIndexA - finalIndexB;
    });
  }, [groupedWeapons]);

  const sortedGroupedWeapons = useMemo(() => {
    if (sortOption === "기본") return groupedWeapons;

    const sorted = {};
    for (const grade in groupedWeapons) {
      sorted[grade] = [...groupedWeapons[grade]].sort((groupA, groupB) => {
        const weaponA = findWeaponForSort(groupA, sortEnhancement);
        const weaponB = findWeaponForSort(groupB, sortEnhancement);
        const metricsA = getWeaponMetrics(weaponA);
        const metricsB = getWeaponMetrics(weaponB);

        if (sortOption === "총 피해량")
          return metricsB.totalDamage - metricsA.totalDamage;
        if (sortOption === "DPS") return metricsB.dps - metricsA.dps;
        if (sortOption === "마나 효율 (ME)")
          return metricsB.manaEfficiency - metricsA.manaEfficiency;
        return 0;
      });
    }
    return sorted;
  }, [groupedWeapons, sortOption, sortEnhancement]);

  const allWeaponsSorted = useMemo(() => {
    const allWeaponGroups = Object.values(groupedWeapons).flat();

    if (sortOption === "기본") {
      // 기본 정렬일 경우, 등급 순으로 정렬된 그룹을 그대로 합칩니다.
      return sortedGrades.flatMap(grade => sortedGroupedWeapons[grade] || []);
    }

    // '총 피해량' 또는 'DPS' 정렬
    return allWeaponGroups.sort((groupA, groupB) => {
      const weaponA = findWeaponForSort(groupA, sortEnhancement);
      const weaponB = findWeaponForSort(groupB, sortEnhancement);
      const metricsA = getWeaponMetrics(weaponA);
      const metricsB = getWeaponMetrics(weaponB);

      if (sortOption === "총 피해량") return metricsB.totalDamage - metricsA.totalDamage;
      if (sortOption === "DPS") return metricsB.dps - metricsA.dps;
      if (sortOption === "마나 효율 (ME)")
        return metricsB.manaEfficiency - metricsA.manaEfficiency;
      return 0;
    });
  }, [groupedWeapons, sortedGrades, sortedGroupedWeapons, sortOption, sortEnhancement]);

  return { groupedWeapons, sortedGrades, sortedGroupedWeapons, allWeaponsSorted };
}
