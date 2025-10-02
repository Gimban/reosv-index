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
  "받는 피해 감소 %",
  "최대 체력 스탯 증가 +",
]);

const isUsefulStat = (statName) => EHP_USEFUL_STATS.has(statName);

// 스탯 이름과 상태 키 매핑
const STAT_MAP = {
  "최대 체력 증가 +": "flatHp",
  "최대 체력 증가 %": "percentHp",
  "받는 피해 감소 %": "damageReduction",
  "최대 체력 스탯 증가 +": "hpStat",
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
  const [selectedItems, setSelectedItems] = useState({ pendant: null, earring: null, ring1: null, ring2: null });
  const [isBraceletEnabled, setIsBraceletEnabled] = useState(false);
  const [potentialOptions, setPotentialOptions] = useState({
    pendant: { grade: "없음", options: [null, null, null] },
    earring: { grade: "없음", options: [null, null, null] },
    ring1: { grade: "없음", options: [null, null, null] },
    ring2: { grade: "없음", options: [null, null, null] },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isPotentialModalOpen, setIsPotentialModalOpen] = useState(false);
  const [editingPotentialSlot, setEditingPotentialSlot] = useState(null);

  // 아이템 선택 모드에서 계산된 스탯
  const itemStats = useMemo(() => {
    const newStats = { flatHp: 0, percentHp: 0, damageReduction: 0, hpStat: 0 };

    // 1. 기본 장신구 옵션 처리
    Object.entries(selectedItems).forEach(([slotKey, item]) => {
      if (!item) return;
      // 기본 옵션 (장신구 기본 옵션 시트)
      for (let i = 1; i <= 4; i++) {
        const optionName = item[`옵션${i}`];
        const optionValue = parseNum(item[`수치${i}`]);
        const targetStatKey = STAT_MAP[optionName];
        if (targetStatKey && optionValue > 0) {
          newStats[targetStatKey] += optionValue;
        }
      }
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

    // 2. 잠재 옵션 처리
    Object.entries(potentialOptions).forEach(([slotKey, slotData]) => {
      const { grade, options } = slotData;
      if (slotKey === "bracelet" && !isBraceletEnabled) return;
      if (grade === "없음" || !selectedItems[slotKey]) return;

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
  }, [selectedItems, isBraceletEnabled, potentialOptions]);

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
    if (editingSlot) {
      setSelectedItems(prev => ({ ...prev, [editingSlot]: item }));
      // 아이템 변경 시 잠재옵션 초기화
      setPotentialOptions(prev => ({ ...prev, [editingSlot]: { grade: "없음", options: [null, null, null] } }));
    }
    setIsModalOpen(false);
    setEditingSlot(null);
  }, [editingSlot]);

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
  const renderItemSlot = (slotKey, item, onOpenModal) => {
    const imageFileName = item ? item["이미지 파일"]?.replace(".png", "") : "";
    const imageSrc = accessoryImages[imageFileName];
    const displayName = item ? item["이름"] : "선택";

    return (
      <div className="accessory-slot">
        <button className="accessory-slot-btn" onClick={onOpenModal}>
          {imageSrc ? <img src={imageSrc} alt={displayName} /> : <div className="accessory-image-placeholder">이미지</div>}
          <span className="accessory-slot-name">{displayName}</span>
        </button>
        {item && (
          <>
            <div className="accessory-options">
              {[1, 2, 3, 4].map(i => {
                const optionName = item[`옵션${i}`];
                const optionValue = parseNum(item[`수치${i}`]);
                if (!optionName) return null;
                return (
                  <div key={i} className="option-row fixed">
                    <span className={`option-label ${isUsefulStat(optionName) ? "useful-stat" : "other-stat"}`} title={optionName}>{optionName}</span>
                    <span className="option-value">+{optionValue.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            {/* 잠재 옵션 렌더링 */}
            <div className="potential-options">
              <div className="potential-options-header">
                <h4>잠재 옵션</h4>
                <select value={potentialOptions[slotKey].grade} onChange={(e) => handlePotentialGradeChange(slotKey, e.target.value)}>
                  {POTENTIAL_OPTION_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              {potentialOptions[slotKey].grade !== "없음" && (
                <div className="potential-options-body">
                  {potentialOptions[slotKey].options.map((option, index) => {
                    const grade = potentialOptions[slotKey].grade;
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
        {isBraceletEnabled && renderItemSlot("bracelet", () => {})}
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
          {renderItemSlot("pendant", selectedItems.pendant, () => handleOpenModal("pendant"))}
          {renderItemSlot("earring", selectedItems.earring, () => handleOpenModal("earring"))}
          {renderBraceletSlot()}
          {renderItemSlot("ring1", selectedItems.ring1, () => handleOpenModal("ring1"))}
          {renderItemSlot("ring2", selectedItems.ring2, () => handleOpenModal("ring2"))}
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
