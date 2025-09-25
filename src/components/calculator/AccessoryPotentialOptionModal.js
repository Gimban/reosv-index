import React, { useState, useMemo } from "react";
import "./AccessorySelectionModal.css"; // 스타일 재사용

function AccessoryPotentialOptionModal({
  potentialOptionData,
  onClose,
  onSelect,
  isUsefulStat,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    let allOptions = [
      ...new Set(potentialOptionData.map((row) => row["옵션"]).filter(Boolean)),
    ];

    // 유효 옵션을 우선으로, 그 다음 가나다 순으로 정렬합니다.
    allOptions.sort((a, b) => {
      const isAUseful = isUsefulStat(a);
      const isBUseful = isUsefulStat(b);

      if (isAUseful && !isBUseful) return -1; // a가 유효 옵션이면 앞으로
      if (!isAUseful && isBUseful) return 1; // b가 유효 옵션이면 앞으로

      return a.localeCompare(b); // 둘 다 유효/무효 옵션이면 가나다순
    });

    if (!searchTerm) {
      return allOptions;
    }
    return allOptions.filter((optionName) =>
      optionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [potentialOptionData, searchTerm, isUsefulStat]);

  const handleSelect = (optionName) => {
    const selectedOptionRow = potentialOptionData.find(
      (row) => row["옵션"] === optionName
    );
    if (selectedOptionRow) {
      onSelect(selectedOptionRow);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content potential-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>잠재 옵션 선택</h2>
          <button onClick={onClose} className="close-button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="potential-option-controls">
            <input
              type="text"
              placeholder="옵션 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="potential-option-search"
              autoFocus
            />
          </div>
          <div className="accessory-list">
            {filteredOptions.map((optionName) => (
              <button
                key={optionName}
                onClick={() => handleSelect(optionName)}
                className={`accessory-item-button potential-option-item ${
                  isUsefulStat(optionName) ? "useful-stat" : ""
                }`}
              >
                <span>{optionName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessoryPotentialOptionModal;
