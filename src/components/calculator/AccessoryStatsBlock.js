import React, { useState, useEffect, useCallback, useMemo } from "react";
import AccessorySelectionModal from "./AccessorySelectionModal";
import AccessoryPotentialOptionModal from "./AccessoryPotentialOptionModal";
import "./AccessoryStatsBlock.css";

// const parseStat = (val) => parseFloat(String(val || "0").replace(/,/g, ""));

// src/images/accessories 폴더와 하위 폴더의 모든 png 파일을 불러옵니다.
function importAll(r) {
  let images = {};
  r.keys().forEach((item) => {
    // './pendant/pendant_image.png' -> 'pendant_image'
    const key = item.substring(
      item.lastIndexOf("/") + 1,
      item.lastIndexOf(".")
    );
    images[key] = r(item);
  });
  return images;
}
const accessoryImages = importAll(
  require.context("../../images/accessories", true, /\.png$/)
);

// const PART_FOLDER_MAP = {
//   팬던트: "pendant",
//   귀걸이: "earring",
//   반지: "ring",
//   팔찌: "bracelet",
// };

const USEFUL_STATS = new Set([
  "클래스 기본 공격 데미지 증가 +",
  "클래스 스킬 데미지 증가 %",
  "특수 무기 데미지 증가 %",
  "일반&고급 등급 무기 데미지 증가 %",
  "희귀 등급 무기 데미지 증가 %",
  "영웅 등급 무기 데미지 증가 %",
  "전설 등급 무기 데미지 증가 %",
  "필멸 등급 무기 데미지 증가 %",
  "전설&필멸 등급 무기 데미지 증가 %",
  "운명 등급 무기 데미지 증가 %",
  "스킬 쿨타임 감소 %",
  "최종 데미지 스탯 증가 +",
  "체력 스탯 증가 +",
  "일반 몬스터 대상 데미지 증가 %",
  "보스 공격 시 대상 데미지 증가 %",
]);

const isUsefulStat = (statName) => USEFUL_STATS.has(statName);

const STAT_MAP = {
  "클래스 기본 공격 데미지 증가 +": "classBasicDmgInc",
  "클래스 스킬 데미지 증가 %": "classSkillDmgInc",
  "특수 무기 데미지 증가 %": "specialWeaponDmg",
  "일반&고급 등급 무기 데미지 증가 %": "gradeDmg.normalUncommon",
  "희귀 등급 무기 데미지 증가 %": "gradeDmg.rare",
  "영웅 등급 무기 데미지 증가 %": "gradeDmg.heroic",
  "전설 등급 무기 데미지 증가 %": "gradeDmg.legendary",
  "필멸 등급 무기 데미지 증가 %": "gradeDmg.mortal",
  "전설&필멸 등급 무기 데미지 증가 %": "gradeDmg.legendaryMortal",
  "운명 등급 무기 데미지 증가 %": "gradeDmg.destiny",
  "스킬 쿨타임 감소 %": "cooldownReduction",
  "최종 데미지 스탯 증가 +": "finalDmgStat",
  "체력 스탯 증가 +": "maxHpStat",
  "일반 몬스터 대상 데미지 증가 %": "normalMonsterDmg",
  "보스 공격 시 대상 데미지 증가 %": "bossMonsterDmg",
};

const tempestBraceletData = {
  이름: "영원한 폭풍, 템페스트",
  "이미지 파일": "tempest_bracelet.png",
  등급: "운명",
  옵션: [
    { name: "운명 등급 무기 데미지 증가 %", value: 10.5 },
    { name: "최종 데미지 스탯 증가 +", value: 4 },
    { name: "스킬 쿨타임 감소 %", value: 7 },
    { name: "최대 체력 증가 +", value: 350 },
  ],
};

const POTENTIAL_OPTION_GRADES = ["없음", "일반", "고급", "희귀", "영웅"];
const GRADE_TO_COLUMN_MAP_POTENTIAL = {
  일반: "일반",
  고급: "고급",
  희귀: "희귀",
  영웅: "영웅",
};

function AccessoryStatsBlock({
  onStatsChange,
  accessoryBaseData,
  accessoryPotentialOptionData,
}) {
  const [uiMode, setUiMode] = useState("direct");

  // --- States for 'direct' mode ---
  const [classBasicDmgInc, setClassBasicDmgInc] = useState(0);
  const [classSkillDmgInc, setClassSkillDmgInc] = useState(0);
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

  const [finalDmgStat, setFinalDmgStat] = useState(0);
  const [maxHpStat, setMaxHpStat] = useState(0);
  const [normalMonsterDmg, setNormalMonsterDmg] = useState(0);
  const [bossMonsterDmg, setBossMonsterDmg] = useState(0);

  // --- States for 'item' mode ---
  const [selectedPendant, setSelectedPendant] = useState(null);
  const [selectedEarring, setSelectedEarring] = useState(null);
  const [selectedRing1, setSelectedRing1] = useState(null);
  const [selectedRing2, setSelectedRing2] = useState(null);
  const [isBraceletEnabled, setIsBraceletEnabled] = useState(false);
  const initialOptions = useMemo(
    () => ({ normal: 0, rare: 0, heroic: 0, legendary: 0 }),
    []
  );

  const [slotOptions, setSlotOptions] = useState({
    pendant: { ...initialOptions },
    earring: { ...initialOptions },
    ring1: { ...initialOptions },
    ring2: { ...initialOptions },
  });

  const [potentialOptions, setPotentialOptions] = useState({
    pendant: { grade: "없음", options: [null, null, null] },
    earring: { grade: "없음", options: [null, null, null] },
    ring1: { grade: "없음", options: [null, null, null] },
    ring2: { grade: "없음", options: [null, null, null] },
    bracelet: { grade: "없음", options: [null, null, null] },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // 'pendant', 'earring', 'ring1', 'ring2'

  const [isPotentialModalOpen, setIsPotentialModalOpen] = useState(false);
  const [editingPotentialSlot, setEditingPotentialSlot] = useState(null); // { slotKey: 'pendant', index: 0 }

  // Calculate stats from selected items and update 'direct' mode states
  useEffect(() => {
    if (uiMode !== "item") return;

    const newStats = {
      classBasicDmgInc: 0,
      classSkillDmgInc: 0,
      specialWeaponDmg: 0,
      gradeDmg: {
        normalUncommon: 0,
        rare: 0,
        heroic: 0,
        legendary: 0,
        mortal: 0,
        legendaryMortal: 0,
        destiny: 0,
      },
      cooldownReduction: 0,
      finalDmgStat: 0,
      maxHpStat: 0,
      normalMonsterDmg: 0,
      bossMonsterDmg: 0,
    };

    // 1. Process Pendant, Earring, Rings with their customizable options
    const customizableSlots = [
      { item: selectedPendant, slotKey: "pendant" },
      { item: selectedEarring, slotKey: "earring" },
      { item: selectedRing1, slotKey: "ring1" },
      { item: selectedRing2, slotKey: "ring2" },
    ];

    const optionTypes = {
      normal: "일반 옵션",
      rare: "고급 옵션",
      heroic: "희귀 옵션",
      legendary: "영웅 옵션",
    };

    customizableSlots.forEach(({ item, slotKey }) => {
      if (!item) return;
      const currentOptionValues = slotOptions[slotKey];
      Object.entries(optionTypes).forEach(([type, columnName]) => {
        const statName = item[columnName];
        const statValue = currentOptionValues[type];
        const targetStatKey = STAT_MAP[statName];

        if (targetStatKey && statValue > 0) {
          if (targetStatKey.includes(".")) {
            const [parent, child] = targetStatKey.split(".");
            newStats[parent][child] += statValue;
          } else {
            newStats[targetStatKey] += statValue;
          }
        }
      });
    });

    // 2. Process Bracelet with its fixed stats
    if (isBraceletEnabled) {
      newStats.gradeDmg.destiny += 10.5;
      newStats.finalDmgStat += 4;
      newStats.cooldownReduction += 7;
      // "최대 체력 증가 +"는 데미지 계산에 포함되지 않는 스탯입니다.
    }

    // 3. Process Potential Options
    Object.entries(potentialOptions).forEach(([slotKey, slotData]) => {
      if (slotKey === "bracelet" && !isBraceletEnabled) {
        return; // 팔찌가 비활성화 상태이면 잠재 옵션을 계산에 포함하지 않음
      }
      const { grade, options } = slotData;
      if (grade === "없음") return;

      options.forEach((option) => {
        if (option) {
          const optionName = option["옵션"];
          const gradeColumn = GRADE_TO_COLUMN_MAP_POTENTIAL[grade];
          const statValue = parseFloat(
            String(option[gradeColumn] || "0").replace(/,/g, "")
          );
          const targetStatKey = STAT_MAP[optionName];

          if (targetStatKey && statValue > 0) {
            if (targetStatKey.includes(".")) {
              const [parent, child] = targetStatKey.split(".");
              newStats[parent][child] += statValue;
            } else {
              newStats[targetStatKey] += statValue;
            }
          }
        }
      });
    });

    // Update the direct input states
    setClassBasicDmgInc(newStats.classBasicDmgInc);
    setClassSkillDmgInc(newStats.classSkillDmgInc);
    setSpecialWeaponDmg(newStats.specialWeaponDmg);
    setGradeDmg(newStats.gradeDmg);
    setCooldownReduction(Math.min(40, newStats.cooldownReduction)); // Apply cap
    setFinalDmgStat(newStats.finalDmgStat);
    setMaxHpStat(newStats.maxHpStat);
    setNormalMonsterDmg(newStats.normalMonsterDmg);
    setBossMonsterDmg(newStats.bossMonsterDmg);
  }, [
    uiMode,
    selectedPendant,
    selectedEarring,
    selectedRing1,
    selectedRing2,
    isBraceletEnabled,
    slotOptions,
    potentialOptions,
  ]);

  // --- Handlers for 'direct' mode ---

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

  // Combine all stats and pass to parent (this useEffect is used by both modes)
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

  // --- Handlers for 'item' mode ---
  const handleOpenModal = (slot) => {
    setEditingSlot(slot);
    setIsModalOpen(true);
  };

  const handleSelectAccessory = useCallback(
    (item) => {
      switch (editingSlot) {
        case "pendant":
          setSelectedPendant(item);
          break;
        case "earring":
          setSelectedEarring(item);
          break;
        case "ring1":
          setSelectedRing1(item);
          break;
        case "ring2":
          setSelectedRing2(item);
          break;
        default:
          break;
      }
      // Reset options when selecting a new item or deselecting
      if (editingSlot) {
        setSlotOptions((prev) => ({
          ...prev,
          [editingSlot]: { ...initialOptions },
        }));
        // Also reset potential options for the slot
        setPotentialOptions((prev) => ({
          ...prev,
          [editingSlot]: { grade: "없음", options: [null, null, null] },
        }));
      }
      setIsModalOpen(false);
      setEditingSlot(null);
    },
    [editingSlot, initialOptions]
  );

  const handleOpenPotentialModal = (slotKey, index) => {
    setEditingPotentialSlot({ slotKey, index });
    setIsPotentialModalOpen(true);
  };

  const handleClosePotentialModal = useCallback(() => {
    setIsPotentialModalOpen(false);
    setEditingPotentialSlot(null);
  }, []);

  const handleSelectPotentialOption = useCallback(
    (option) => {
      if (editingPotentialSlot) {
        const { slotKey, index } = editingPotentialSlot;
        setPotentialOptions((prev) => {
          const newOptions = [...prev[slotKey].options];
          newOptions[index] = option;
          return {
            ...prev,
            [slotKey]: { ...prev[slotKey], options: newOptions },
          };
        });
      }
      handleClosePotentialModal();
    },
    [editingPotentialSlot, handleClosePotentialModal]
  );

  const handlePotentialGradeChange = useCallback((slotKey, grade) => {
    setPotentialOptions((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], grade: grade },
    }));
  }, []);

  // --- Render functions ---
  const handleOptionChange = useCallback((slotKey, optionType, value) => {
    setSlotOptions((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        [optionType]: parseFloat(value) || 0,
      },
    }));
  }, []);

  const renderPotentialOptionSlot = (slotKey) => {
    const slotData = potentialOptions[slotKey];
    const { grade, options } = slotData;

    return (
      <div className="potential-options">
        <div className="potential-options-header">
          <h4>잠재 옵션</h4>
          <select
            value={grade}
            onChange={(e) =>
              handlePotentialGradeChange(slotKey, e.target.value)
            }
          >
            {POTENTIAL_OPTION_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        {grade !== "없음" && (
          <div className="potential-options-body">
            {options.map((option, index) => {
              const statValue =
                option && grade !== "없음"
                  ? parseFloat(
                      String(
                        option[GRADE_TO_COLUMN_MAP_POTENTIAL[grade]] || "0"
                      ).replace(/,/g, "")
                    )
                  : 0;
              return (
                <div key={index} className="potential-option-row">
                  <button
                    onClick={() => handleOpenPotentialModal(slotKey, index)}
                    className={`select-potential-option-btn ${
                      isUsefulStat(option?.["옵션"]) ? "useful-stat" : ""
                    }`}
                  >
                    {option ? option["옵션"] : "옵션 선택"}
                  </button>
                  {option && (
                    <span className="potential-option-value">
                      +{statValue.toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderItemSlot = (slotKey, item, onOpenModal) => {
    const selectedItem = item;
    const imageFileName = selectedItem
      ? selectedItem["이미지 파일"]?.replace(".png", "")
      : "";
    const imageSrc = accessoryImages[imageFileName];
    const optionTiers = {
      normal: "일반 옵션",
      rare: "고급 옵션",
      heroic: "희귀 옵션",
      legendary: "영웅 옵션",
    };

    const displayName = selectedItem
      ? `${selectedItem["보석"] || ""} ${selectedItem["부위"] || ""}`.trim()
      : "선택";

    return (
      <div className="accessory-slot">
        <button className="accessory-slot-btn" onClick={onOpenModal}>
          {imageSrc ? (
            <img src={imageSrc} alt={displayName} />
          ) : (
            <div className="accessory-image-placeholder">이미지</div>
          )}
          <span className="accessory-slot-name">{displayName}</span>
        </button>
        {selectedItem && (
          <>
            <div className="accessory-options">
              {Object.entries(optionTiers).map(([tier, tierName]) => {
                const optionName = selectedItem[tierName];
                if (!optionName) return null;
                return (
                  <div key={tier} className="option-row">
                    <label
                      className={`option-label ${
                        isUsefulStat(optionName) ? "useful-stat" : "other-stat"
                      }`}
                      title={optionName}
                    >
                      {optionName}
                    </label>
                    <input
                      type="number"
                      className="option-input"
                      value={slotOptions[slotKey][tier]}
                      onChange={(e) =>
                        handleOptionChange(slotKey, tier, e.target.value)
                      }
                      min="0"
                    />
                  </div>
                );
              })}
            </div>
            {renderPotentialOptionSlot(slotKey)}
          </>
        )}
      </div>
    );
  };

  const renderBraceletSlot = () => {
    const imageFileName =
      tempestBraceletData["이미지 파일"]?.replace(".png", "") || "";
    const imageSrc = accessoryImages[imageFileName];

    return (
      <div
        className={`accessory-slot bracelet-slot grade-destiny ${
          !isBraceletEnabled ? "inactive" : ""
        }`}
      >
        <div className="accessory-slot-btn">
          {imageSrc ? (
            <img src={imageSrc} alt={tempestBraceletData["이름"]} />
          ) : (
            <div className="accessory-image-placeholder">이미지</div>
          )}
          <span className="accessory-slot-name">
            {tempestBraceletData["이름"]}
          </span>
        </div>
        <label className="enable-bracelet-label">
          <input
            type="checkbox"
            checked={isBraceletEnabled}
            onChange={(e) => setIsBraceletEnabled(e.target.checked)}
          />
          사용
        </label>

        <div className="accessory-options">
          {tempestBraceletData["옵션"].map((tier) => {
            const optionName = tier.name;
            const optionValue = tier.value;
            if (!optionName) return null;
            return (
              <div key={tier.name} className="option-row fixed">
                <span
                  className={`option-label ${
                    isUsefulStat(optionName) ? "useful-stat" : "other-stat"
                  }`}
                  title={optionName}
                >
                  {optionName}
                </span>
                <span className="option-value">{optionValue}</span>
              </div>
            );
          })}
        </div>
        {isBraceletEnabled && renderPotentialOptionSlot("bracelet")}
      </div>
    );
  };

  return (
    <div
      className={`calculator-block ${uiMode === "item" ? "wide-block" : ""}`}
    >
      <div className="accessory-block-header">
        <h2>장신구 스탯</h2>
        <div className="ui-mode-toggle">
          <label>
            <input
              type="radio"
              name="accessory-ui-mode"
              value="direct"
              checked={uiMode === "direct"}
              onChange={(e) => setUiMode(e.target.value)}
            />
            직접 입력
          </label>
          <label>
            <input
              type="radio"
              name="accessory-ui-mode"
              value="item"
              checked={uiMode === "item"}
              onChange={(e) => setUiMode(e.target.value)}
            />
            아이템 선택
          </label>
        </div>
      </div>

      {uiMode === "direct" ? (
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
      ) : (
        <div className="accessory-item-selection-grid">
          {renderItemSlot("pendant", selectedPendant, () =>
            handleOpenModal("pendant")
          )}
          {renderItemSlot("earring", selectedEarring, () =>
            handleOpenModal("earring")
          )}
          {renderBraceletSlot()}
          {renderItemSlot("ring1", selectedRing1, () =>
            handleOpenModal("ring1")
          )}
          {renderItemSlot("ring2", selectedRing2, () =>
            handleOpenModal("ring2")
          )}
        </div>
      )}

      {isModalOpen && (
        <AccessorySelectionModal
          accessoryData={accessoryBaseData}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectAccessory}
          slotType={editingSlot.replace(/\d/g, "")} // 'ring1' -> 'ring'
        />
      )}

      {isPotentialModalOpen && (
        <AccessoryPotentialOptionModal
          potentialOptionData={accessoryPotentialOptionData}
          onClose={handleClosePotentialModal}
          onSelect={handleSelectPotentialOption}
          isUsefulStat={isUsefulStat}
        />
      )}
    </div>
  );
}

export default AccessoryStatsBlock;
