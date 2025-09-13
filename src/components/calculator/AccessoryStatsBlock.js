import React, { useState, useEffect, useCallback } from "react";
import "./AccessoryStatsBlock.css";

function AccessoryStatsBlock({ onStatsChange }) {
  const [classBasicDmgInc, setClassBasicDmgInc] = useState(0);
  const [classSkillDmgInc, setClassSkillDmgInc] = useState(0);
  // Section 1 states
  const [specialWeaponDmg, setSpecialWeaponDmg] = useState(0);
  const [gradeDmg, setGradeDmg] = useState({
    normalUncommon: 0,
    rare: 0,
    heroic: 0,
    legendary: 0,
    mortal: 0,
    legendaryMortal: 0,
    destiny: 0,
  });
  const [cooldownReduction, setCooldownReduction] = useState(0);

  // Section 2 states
  const [finalDmgStat, setFinalDmgStat] = useState(0);
  const [maxHpStat, setMaxHpStat] = useState(0);
  const [normalMonsterDmg, setNormalMonsterDmg] = useState(0);
  const [bossMonsterDmg, setBossMonsterDmg] = useState(0);

  // Handler for simple numeric inputs
  const handleNumericChange = useCallback(
    (setter) => (e) => {
      setter(parseFloat(e.target.value) || 0);
    },
    []
  );

  // Handler for grade damage
  const handleGradeDmgChange = useCallback(
    (grade) => (e) => {
      const value = parseFloat(e.target.value) || 0;
      setGradeDmg((prev) => ({ ...prev, [grade]: value }));
    },
    []
  );

  // Handler for cooldown reduction with clamp
  const handleCooldownReductionChange = useCallback((e) => {
    let value = parseFloat(e.target.value) || 0;
    const clampedValue = Math.max(0, Math.min(40, value));
    setCooldownReduction(clampedValue);
  }, []);

  // Combine all stats and pass to parent
  useEffect(() => {
    const stats = {
      classBasicDmgInc,
      classSkillDmgInc,
      specialWeaponDmg,
      gradeDmg,
      cooldownReduction,
      finalDmgStat,
      maxHpStat,
      normalMonsterDmg,
      bossMonsterDmg,
    };
    onStatsChange(stats);
  }, [
    classBasicDmgInc,
    classSkillDmgInc,
    specialWeaponDmg,
    gradeDmg,
    cooldownReduction,
    finalDmgStat,
    maxHpStat,
    normalMonsterDmg,
    bossMonsterDmg,
    onStatsChange,
  ]);

  return (
    <div className="calculator-block">
      <h2>장신구 스탯</h2>
      <div className="form-grid accessory-grid">
        <fieldset className="accessory-fieldset">
          <legend>데미지 및 쿨타임</legend>
          <div className="form-group">
            <label htmlFor="class-basic-dmg-inc">
              클래스 기본 공격 데미지 증가
            </label>
            <input
              type="number"
              id="class-basic-dmg-inc"
              value={classBasicDmgInc}
              onChange={handleNumericChange(setClassBasicDmgInc)}
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="class-skill-dmg-inc">
              클래스 스킬 데미지 증가 (%)
            </label>
            <input
              type="number"
              id="class-skill-dmg-inc"
              value={classSkillDmgInc}
              onChange={handleNumericChange(setClassSkillDmgInc)}
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="special-weapon-dmg">
              특수 무기 데미지 증가 (%)
            </label>
            <input
              type="number"
              id="special-weapon-dmg"
              value={specialWeaponDmg}
              onChange={handleNumericChange(setSpecialWeaponDmg)}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>등급별 무기 데미지 증가 (%)</label>
            <div className="sub-options">
              <label>
                일반&고급:
                <input
                  type="number"
                  value={gradeDmg.normalUncommon}
                  onChange={handleGradeDmgChange("normalUncommon")}
                  min="0"
                />
              </label>
              <label>
                희귀:
                <input
                  type="number"
                  value={gradeDmg.rare}
                  onChange={handleGradeDmgChange("rare")}
                  min="0"
                />
              </label>
              <label>
                영웅:
                <input
                  type="number"
                  value={gradeDmg.heroic}
                  onChange={handleGradeDmgChange("heroic")}
                  min="0"
                />
              </label>
              <label>
                전설:
                <input
                  type="number"
                  value={gradeDmg.legendary}
                  onChange={handleGradeDmgChange("legendary")}
                  min="0"
                />
              </label>
              <label>
                필멸:
                <input
                  type="number"
                  value={gradeDmg.mortal}
                  onChange={handleGradeDmgChange("mortal")}
                  min="0"
                />
              </label>
              <label>
                전설&필멸:
                <input
                  type="number"
                  value={gradeDmg.legendaryMortal}
                  onChange={handleGradeDmgChange("legendaryMortal")}
                  min="0"
                />
              </label>
              <label>
                운명:
                <input
                  type="number"
                  value={gradeDmg.destiny}
                  onChange={handleGradeDmgChange("destiny")}
                  min="0"
                />
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="cooldown-reduction">
              스킬 쿨타임 감소 (최대 40%)
            </label>
            <input
              type="number"
              id="cooldown-reduction"
              value={cooldownReduction}
              onChange={handleCooldownReductionChange}
              min="0"
              max="40"
            />
          </div>
        </fieldset>

        <fieldset className="accessory-fieldset">
          <legend>기타 스탯 및 피해량</legend>
          <div className="form-group">
            <label htmlFor="final-dmg-stat">최종 데미지 스탯 증가</label>
            <input
              type="number"
              id="final-dmg-stat"
              value={finalDmgStat}
              onChange={handleNumericChange(setFinalDmgStat)}
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="max-hp-stat">최대 체력 스탯 증가</label>
            <input
              type="number"
              id="max-hp-stat"
              value={maxHpStat}
              onChange={handleNumericChange(setMaxHpStat)}
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="normal-monster-dmg">
              일반 몬스터 대상 피해량 증가 (%)
            </label>
            <input
              type="number"
              id="normal-monster-dmg"
              value={normalMonsterDmg}
              onChange={handleNumericChange(setNormalMonsterDmg)}
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="boss-monster-dmg">
              보스 몬스터 대상 피해량 증가 (%)
            </label>
            <input
              type="number"
              id="boss-monster-dmg"
              value={bossMonsterDmg}
              onChange={handleNumericChange(setBossMonsterDmg)}
              min="0"
            />
          </div>
        </fieldset>
      </div>
    </div>
  );
}

export default AccessoryStatsBlock;
