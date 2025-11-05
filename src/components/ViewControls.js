import React, { useState } from "react";

const SORT_OPTIONS = [
  { value: "기본", label: "기본" },
  { value: "총 피해량", label: "총 피해량" },
  { value: "DPS", label: "DPS" },
  { value: "마나 효율 (ME)", label: "마나 효율 (ME)" },
];

const ENHANCEMENT_LEVELS = Array.from({ length: 16 }, (_, level) => level);

function ViewControls({
  sortOption,
  setSortOption,
  sortEnhancement,
  setSortEnhancement,
  showDescription,
  setShowDescription,
  showUngrouped,
  setShowUngrouped,
  globalEnhancement,
  setGlobalEnhancement,
  hideDeleted,
  setHideDeleted,
  isMobile,
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleGlobalEnhancementChange = (value) => {
    if (value === "개별") {
      setGlobalEnhancement("개별");
      return;
    }
    setGlobalEnhancement(Number(value));
  };

  const renderControls = (closePanel) => (
    <div className="controls-content">
      <section className="controls-section">
        <h3>정렬</h3>
        <label className="control-field">
          <span>정렬 기준</span>
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="control-field">
          <span>정렬 강화 기준</span>
          <select
            value={sortEnhancement}
            onChange={(event) =>
              setSortEnhancement(Number(event.target.value))
            }
          >
            {ENHANCEMENT_LEVELS.map((level) => (
              <option key={level} value={level}>
                +{level}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="controls-section">
        <h3>강화 보기</h3>
        <label className="control-field">
          <span>카드 강화 일괄 변경</span>
          <select
            value={globalEnhancement}
            onChange={(event) =>
              handleGlobalEnhancementChange(event.target.value)
            }
          >
            <option value="개별">개별 설정</option>
            {ENHANCEMENT_LEVELS.map((level) => (
              <option key={level} value={level}>
                +{level}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="controls-section">
        <h3>표시 방식</h3>
        <div className="view-toggle-group" role="tablist" aria-label="보기 방식">
          <button
            type="button"
            role="tab"
            aria-selected={!showUngrouped}
            className={!showUngrouped ? "active" : ""}
            onClick={() => {
              setShowUngrouped(false);
              if (closePanel) closePanel();
            }}
          >
            등급별 보기
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={showUngrouped}
            className={showUngrouped ? "active" : ""}
            onClick={() => {
              setShowUngrouped(true);
              if (closePanel) closePanel();
            }}
          >
            전체 보기
          </button>
        </div>
        <label className="toggle-field">
          <input
            type="checkbox"
            checked={showDescription}
            onChange={(event) => setShowDescription(event.target.checked)}
          />
          설명 보기
        </label>
        <label className="toggle-field">
          <input
            type="checkbox"
            checked={hideDeleted}
            onChange={(event) => setHideDeleted(event.target.checked)}
          />
          삭제된 무기 숨기기
        </label>
      </section>

      {isMobile && (
        <div className="drawer-actions">
          <button type="button" onClick={closePanel}>
            완료
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="view-controls mobile">
        <div className="view-controls-bar">
          <h1>특수 무기 스탯</h1>
          <button
            type="button"
            className="open-controls"
            onClick={() => setIsPanelOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isPanelOpen}
          >
            보기 설정
          </button>
        </div>
        {isPanelOpen && (
          <div className="controls-drawer">
            <div
              className="drawer-backdrop"
              onClick={() => setIsPanelOpen(false)}
              role="presentation"
            />
            <div
              className="drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-label="보기 설정"
            >
              <header className="drawer-header">
                <h2>보기 설정</h2>
                <button
                  type="button"
                  className="close-drawer"
                  onClick={() => setIsPanelOpen(false)}
                  aria-label="설정 닫기"
                >
                  ×
                </button>
              </header>
              {renderControls(() => setIsPanelOpen(false))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="view-controls desktop">
      <div className="view-controls-bar">
        <h1>특수 무기 스탯</h1>
      </div>
      {renderControls()}
    </div>
  );
}

export default ViewControls;

