import React, { useMemo } from "react";
import "./AccessorySelectionModal.css";

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

const PART_MAP = {
  pendant: "팬던트",
  earring: "귀걸이",
  ring: "반지",
};

function AccessorySelectionModal({
  accessoryData,
  onClose,
  onSelect,
  slotType, // 'pendant', 'earring', 'ring'
}) {
  const processedAccessories = useMemo(() => {
    if (!accessoryData || accessoryData.length === 0) {
      return [];
    }

    const targetPart = PART_MAP[slotType];
    if (!targetPart) return [];

    return accessoryData.filter((item) => item["부위"] === targetPart);
  }, [accessoryData, slotType]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{PART_MAP[slotType]} 선택</h2>
          <div className="modal-header-buttons">
            <button
              type="button"
              className="deselect-button"
              onClick={() => onSelect(null)}
            >
              선택 해제
            </button>
            <button onClick={onClose} className="close-button">
              &times;
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="accessory-list">
            {processedAccessories.map((accessory) => {
              const accessoryName = accessory["이름"];
              const displayName = `${accessory["보석"] || ""} ${
                accessory["부위"]
              }`.trim();
              const imageFileName =
                accessory["이미지 파일"]?.replace(".png", "") || "";
              const imageSrc = accessoryImages[imageFileName];

              return (
                <button
                  key={accessoryName}
                  className="accessory-item-button"
                  onClick={() => onSelect(accessory)}
                >
                  {imageSrc ? (
                    <img src={imageSrc} alt={displayName} />
                  ) : (
                    <div className="accessory-image-placeholder">이미지</div>
                  )}
                  <span>{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessorySelectionModal;
