import React, { useState, useEffect, useCallback, useMemo } from "react";
import AccessorySelectionModal from "../calculator/AccessorySelectionModal";
import AccessoryPotentialOptionModal from "../calculator/AccessoryPotentialOptionModal";
import "../calculator/AccessoryStatsBlock.css"; // DPS 계산기의 스타일 재사용

const parseNum = (val) => parseFloat(String(val || "0").replace(/,/g, ""));

// 이미지 동적 로딩
function importAll(r) {
  let images = {};
  r.keys().forEach((item) => {
    const key = item.substring(item.lastIndexOf("/") + 1, item.lastIndexOf("."));
    images[key] = r(item);
  });
  return images;
}
const accessoryImages = importAll(
  require.context("../../images/accessories", true, /\.png$/)
);

// EHP 계산에 유효한 스탯 목록
const EHP_USEFUL_STATS = new Set([
  "최대 체력 증가 +",
  "최대 체력 증가 %",
  "받는 데미지 감소 %",
  "체력 스탯 증가 +",
]);

const isUsefulStat = (statName) => EHP_USEFUL_STATS.has(statName);

// 스탯 이름과 상태 키 매핑
const STAT_MAP = {
  "최대 체력 증가 +": "flatHp",
  "최대 체력 증가 %": "percentHp",
  "받는 데미지 감소 %": "damageReduction",
  "체력 스탯 증가 +": "hpStat",
};

const POTENTIAL_OPTION_GRADES = ["없음", "일반", "고급", "희귀", "영웅"];
const GRADE_TO_COLUMN_MAP_POTENTIAL = {
  일반: "일반",
  고급: "고급",
  희귀: "희귀",
  영웅: "영웅",
};

const tempestBraceletData = {
  이름: "영원한 폭풍, 템페스트",
  "이미지 파일": "tempest_bracelet.png",
  옵션: [
    { name: "운명 등급 무기 데미지 증가 %", value: 10.5 },
    { name: "최종 데미지 스탯 증가 +", value: 4 },
    { name: "스킬 쿨타임 감소 %", value: 7 },
    { name: "최대 체력 증가 +", value: 350 },
  ],
};

function EhpAccessoryStatsBlock({ onStatsChange, accessoryBaseData, accessoryPotentialOptionData }) {
  const [uiMode, setUiMode] = useState("direct");
  const [directStats, setDirectStats] = useState({ flatHp: 0, percentHp: 0, damageReduction: 0, hpStat: 0 });

  // 아이템 선택 모드 상태
  const [selectedPendant, setSelectedPendant] = useState(null);
  const [selectedEarring, setSelectedEarring] = useState(null);
  const [selectedRing1, setSelectedRing1] = useState(null);
  const [selectedRing2, setSelectedRing2] = useState(null);
  const [isBraceletEnabled, setIsBraceletEnabled] = useState(false);

  const initialOptions = useMemo(
    () => ({ normal: 0, rare: 0, heroic: 0, legendary: 0 }),
    []
  );

  const [slotOptions, setSlotOptions] = useState({ pendant: { ...initialOptions }, earring: { ...initialOptions }, ring1: { ...initialOptions }, ring2: { ...initialOptions } });

  const [potentialOptions, setPotentialOptions] = useState({
    pendant: { grade: "없음", options: [null, null, null] },
    earring: { grade: "없음", options: [null, null, null] },
    ring1: { grade: "없음", options: [null, null, null] },
    ring2: { grade: "없음", options: [null, null, null] },
    bracelet: { grade: "없음", options: [null, null, null] },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isPotentialModalOpen, setIsPotentialModalOpen] = useState(false);
  const [editingPotentialSlot, setEditingPotentialSlot] = useState(null);

  // 아이템 선택 모드에서 계산된 스탯
  const itemStats = useMemo(() => {
    const newStats = { flatHp: 0, percentHp: 0, damageReduction: 0, hpStat: 0 };

    const slots = [
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

    // 1. 기본 장신구 옵션 처리
    slots.forEach(({ item, slotKey }) => {
      if (!item) return;
      const currentOptionValues = slotOptions[slotKey];
      Object.entries(optionTypes).forEach(([type, columnName]) => {
        const optionName = item[columnName];
        const statValue = currentOptionValues[type];
        const targetStatKey = STAT_MAP[optionName];
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

    // 2. 팔찌 옵션 처리
    if (isBraceletEnabled) {
      tempestBraceletData.옵션.forEach(opt => {
        const targetStatKey = STAT_MAP[opt.name];
        if (targetStatKey && opt.value > 0) {
          newStats[targetStatKey] += opt.value;
        }
      });
    }

    // 3. 잠재 옵션 처리
    Object.entries(potentialOptions).forEach(([slotKey, slotData]) => {
      const { grade, options } = slotData;
      // 팔찌가 아니면서, 선택된 아이템이 없으면 스킵
      const currentItem = slots.find(s => s.slotKey === slotKey)?.item;
      if (slotKey !== 'bracelet' && !currentItem) return;
      if (slotKey === "bracelet" && !isBraceletEnabled) return;
      if (grade === "없음") return;

      options.forEach((option) => {
        if (option) {
          const optionName = option["옵션"];
          const gradeColumn = GRADE_TO_COLUMN_MAP_POTENTIAL[grade];
          const statValue = parseNum(option[gradeColumn]);
          const targetStatKey = STAT_MAP[optionName];

          if (targetStatKey && statValue > 0) {
            newStats[targetStatKey] += statValue;
          }
        }
      });
    });

    return newStats;
  }, [selectedPendant, selectedEarring, selectedRing1, selectedRing2, isBraceletEnabled, potentialOptions, slotOptions]);

  useEffect(() => {
    const stats = uiMode === "direct" ? directStats : itemStats;
    onStatsChange(stats);
  }, [uiMode, directStats, itemStats, onStatsChange]);

  const handleDirectChange = (e) => {
    const { name, value } = e.target;
    setDirectStats(prev => ({ ...prev, [name]: parseNum(value) }));
  };

  // --- 모달 핸들러 ---
  const handleOpenModal = (slot) => { setEditingSlot(slot); setIsModalOpen(true); };
  const handleSelectAccessory = useCallback((item) => {
    switch (editingSlot) {
      case "pendant": setSelectedPendant(item); break;
      case "earring": setSelectedEarring(item); break;
      case "ring1": setSelectedRing1(item); break;
      case "ring2": setSelectedRing2(item); break;
      default: break;
    }
    // 아이템 변경 시 잠재옵션 초기화
    if (editingSlot) {
      setSlotOptions((prev) => ({
        ...prev,
        [editingSlot]: { ...initialOptions },
      }));
      setPotentialOptions(prev => ({ ...prev, [editingSlot]: { grade: "없음", options: [null, null, null] } }));
    }
    setIsModalOpen(false);
    setEditingSlot(null);
  }, [editingSlot, initialOptions]);

  const handleOpenPotentialModal = (slotKey, index) => { setEditingPotentialSlot({ slotKey, index }); setIsPotentialModalOpen(true); };
  const handleClosePotentialModal = useCallback(() => { setIsPotentialModalOpen(false); setEditingPotentialSlot(null); }, []);
  const handleSelectPotentialOption = useCallback((option) => {
    if (editingPotentialSlot) {
      const { slotKey, index } = editingPotentialSlot;
      setPotentialOptions(prev => {
        const newOptions = [...prev[slotKey].options];
        newOptions[index] = option;
        return { ...prev, [slotKey]: { ...prev[slotKey], options: newOptions } };
      });
    }
    handleClosePotentialModal();
  }, [editingPotentialSlot, handleClosePotentialModal]);

  const handlePotentialGradeChange = useCallback((slotKey, grade) => {
    setPotentialOptions(prev => ({ ...prev, [slotKey]: { ...prev[slotKey], grade: grade } }));
  }, []);

  // --- 렌더링 함수 ---
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
          <select value={grade} onChange={(e) => handlePotentialGradeChange(slotKey, e.target.value)}>
            {POTENTIAL_OPTION_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        {grade !== "없음" && (
          <div className="potential-options-body">
            {options.map((option, index) => {
              const statValue = option ? parseNum(option[GRADE_TO_COLUMN_MAP_POTENTIAL[grade]]) : 0;
              return (
                <div key={index} className="potential-option-row">
                  <button onClick={() => handleOpenPotentialModal(slotKey, index)} className={`select-potential-option-btn ${isUsefulStat(option?.["옵션"]) ? "useful-stat" : ""}`}>
                    {option ? option["옵션"] : "옵션 선택"}
                  </button>
                  {option && <span className="potential-option-value">+{statValue.toLocaleString()}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderItemSlot = (slotKey, item, onOpenModal) => {
    const imageFileName = item ? item["이미지 파일"]?.replace(".png", "") : "";    
    const imageSrc = accessoryImages[imageFileName];
    const displayName = item ? `${item["보석"] || ""} ${item["부위"] || ""}`.trim() : "선택";
    const optionTiers = {
      normal: "일반 옵션",
      rare: "고급 옵션",
      heroic: "희귀 옵션",
      legendary: "영웅 옵션",
    };

    return (
      <div className="accessory-slot">
        <button className="accessory-slot-btn" onClick={onOpenModal}>
          {imageSrc ? (<img src={imageSrc} alt={displayName} />) : (<div className="accessory-image-placeholder">이미지</div>)}
          <span className="accessory-slot-name">{displayName}</span>
        </button>
        {item && (
          <>
            <div className="accessory-options">
              {Object.entries(optionTiers).map(([tier, tierName]) => {
                const optionName = item[tierName];
                if (!optionName) return null;
                return (
                  <div key={tier} className="option-row">
                    <label
                      className={`option-label ${ isUsefulStat(optionName) ? "useful-stat" : "other-stat" }`}
                      title={optionName}
                    >
                      {optionName}
                    </label>
                    <input
                      type="number"
                      className="option-input"
                      value={slotOptions[slotKey][tier]}
                      onChange={(e) => handleOptionChange(slotKey, tier, e.target.value)}
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
    const imageFileName = tempestBraceletData["이미지 파일"]?.replace(".png", "") || "";
    const imageSrc = accessoryImages[imageFileName];

    return (
      <div className={`accessory-slot bracelet-slot ${!isBraceletEnabled ? "inactive" : ""}`}>
        <div className="accessory-slot-btn">
          {imageSrc ? <img src={imageSrc} alt={tempestBraceletData["이름"]} /> : <div className="accessory-image-placeholder">이미지</div>}
          <span className="accessory-slot-name">{tempestBraceletData["이름"]}</span>
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
          {tempestBraceletData.옵션.map((opt) => {
            const optionName = opt.name;
            const optionValue = opt.value;
            if (!optionName) return null;
            return (
              <div key={opt.name} className="option-row fixed">
                <span className={`option-label ${isUsefulStat(optionName) ? "useful-stat" : "other-stat"}`} title={optionName}>
                  {optionName}
                </span>
                <span className="option-value">+{optionValue.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
        {isBraceletEnabled && (
          <div className="potential-options">
            {renderPotentialOptionSlot("bracelet")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`calculator-block ${uiMode === "item" ? "wide-block" : ""}`}>
      <div className="accessory-block-header">
        <h2>장신구</h2>
        <div className="ui-mode-toggle radio-options">
          <label><input type="radio" name="ehp-acc-mode" value="direct" checked={uiMode === "direct"} onChange={(e) => setUiMode(e.target.value)} />직접 입력</label>
          <label><input type="radio" name="ehp-acc-mode" value="item" checked={uiMode === "item"} onChange={(e) => setUiMode(e.target.value)} />아이템 선택</label>
        </div>
      </div>
      <p style={{ fontSize: '0.8em', color: 'gray', marginTop: '-15px', marginBottom: '15px' }}>
        '받는 피해 감소 +' 는 +α 로, 현재 계산에 사용되지 않습니다.
      </p>

      {uiMode === "direct" ? (
        <div className="form-grid">
          <div className="form-group"><label>최대 체력 증가 +</label><input type="number" name="flatHp" value={directStats.flatHp} onChange={handleDirectChange} /></div>
          <div className="form-group"><label>최대 체력 증가 %</label><input type="number" name="percentHp" value={directStats.percentHp} onChange={handleDirectChange} /></div>
          <div className="form-group"><label>받는 피해 감소 %</label><input type="number" name="damageReduction" value={directStats.damageReduction} onChange={handleDirectChange} /></div>
          <div className="form-group"><label>최대 체력 스탯 증가 +</label><input type="number" name="hpStat" value={directStats.hpStat} onChange={handleDirectChange} /></div>
        </div>
      ) : (
        <div className="accessory-item-selection-grid">
          {renderItemSlot("pendant", selectedPendant, () => handleOpenModal("pendant"))}
          {renderItemSlot("earring", selectedEarring, () => handleOpenModal("earring"))}
          {renderBraceletSlot()}
          {renderItemSlot("ring1", selectedRing1, () => handleOpenModal("ring1"))}
          {renderItemSlot("ring2", selectedRing2, () => handleOpenModal("ring2"))}
        </div>
      )}

      {isModalOpen && (
        <AccessorySelectionModal
          accessoryData={accessoryBaseData}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectAccessory}
          slotType={editingSlot.replace(/\d/g, "")}
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

export default EhpAccessoryStatsBlock;
