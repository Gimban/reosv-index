import React, { useMemo } from "react";
import WeaponCard from "./WeaponCard";
import "./WeaponCardView.css";

function WeaponCardView({ data }) {
  const groupedWeapons = useMemo(() => {
    if (!data || data.length === 0) {
      return {};
    }

    // 1. '이름'으로 무기들을 그룹화합니다.
    const weaponsByName = data.reduce((acc, weapon) => {
      const name = weapon["이름"];
      if (!name) return acc; // 이름이 없는 데이터는 무시
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(weapon);
      // '강화 차수' (숫자)에 따라 정렬
      acc[name].sort((a, b) => Number(a["강화 차수"]) - Number(b["강화 차수"]));
      return acc;
    }, {});

    // 2. '등급'으로 다시 그룹화합니다.
    const weaponsByGrade = Object.values(weaponsByName).reduce(
      (acc, weaponGroup) => {
        // 0강화 기준으로 등급을 정합니다.
        const grade = weaponGroup[0]["등급"];
        if (!grade) return acc; // 등급이 없는 데이터는 무시
        if (!acc[grade]) {
          acc[grade] = [];
        }
        acc[grade].push(weaponGroup);
        return acc;
      },
      {}
    );

    return weaponsByGrade;
  }, [data]);

  if (Object.keys(groupedWeapons).length === 0) {
    return <p>특수 무기 스텟 데이터를 불러오는 중이거나 데이터가 없습니다.</p>;
  }

  // 등급 순서에 따라 정렬합니다.
  const gradeOrder = ["일반", "고급", "희귀", "영웅", "전설", "필멸"];
  const sortedGrades = Object.keys(groupedWeapons).sort((a, b) => {
    const indexA = gradeOrder.indexOf(a);
    const indexB = gradeOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="weapon-card-view">
      <h1>특수 무기 스텟</h1>
      {sortedGrades.map((grade) => (
        <section key={grade} className="grade-section">
          <h2>{grade}</h2>
          <div className="cards-container">
            {groupedWeapons[grade].map((weaponGroup) => (
              <WeaponCard
                key={weaponGroup[0]["이름"]}
                weaponData={weaponGroup}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default WeaponCardView;
