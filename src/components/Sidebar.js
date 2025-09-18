import React, { useState } from "react";
import "./Sidebar.css";

function Sidebar({
  gidMap,
  onSelectCategory,
  currentCategory,
  parentCategory,
  theme,
  setTheme,
}) {
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);

  // GID_MAP을 기반으로 메뉴 구조를 동적으로 생성합니다.
  const menu = React.useMemo(() => {
    const menuStructure = {
      홈: {
        홈: "홈",
      },
      무기: {
        "클래스 무기 스탯": "클래스 무기 스탯",
        "클래스 무기 강화 비용": "클래스 무기 강화 비용",
        "특수 무기 스탯": "특수 무기 스탯",
      },
      방어구: {
        "방어구 강화 비용": "방어구 강화 비용",
      },
      계산기: {
        "DPS/DPM 계산기": "DPS/DPM 계산기",
        "강화 시뮬레이터": "강화 시뮬레이터",
      },
      "미가공 데이터": {},
    };

    for (const categoryName in gidMap) {
      menuStructure["미가공 데이터"][categoryName] = categoryName;
    }

    // 내용이 없는 카테고리는 숨깁니다.
    if (Object.keys(menuStructure["미가공 데이터"]).length === 0) {
      delete menuStructure["미가공 데이터"];
    }

    return menuStructure;
  }, [gidMap]); // currentCategory와 parentCategory는 메뉴 구조 생성에 영향을 주지 않으므로 deps에 불필요

  return (
    <div className="sidebar">
      <h2>목차</h2>
      <ul>
        {Object.keys(menu).map((mainCategory) => (
          <li
            key={mainCategory}
            className={mainCategory === "미가공 데이터" ? "collapsible" : ""}
          >
            <span
              className="main-category-title"
              onClick={() => {
                if (mainCategory === "미가공 데이터") {
                  setIsRawDataOpen(!isRawDataOpen);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span>{mainCategory}</span>
              {mainCategory === "미가공 데이터" && (
                <span className="collapse-icon">{isRawDataOpen ? "▼" : "▶"}</span>
              )}
            </span>
            {/* 하위 목차 렌더링 */}
            {Object.keys(menu[mainCategory]).length > 0 &&
              (mainCategory !== "미가공 데이터" || isRawDataOpen) && (
              <ul>
                {Object.keys(menu[mainCategory]).map((subCategory) => (
                  <li key={subCategory}>
                    <button
                      type="button"
                      className={`category-button ${
                        currentCategory === subCategory &&
                        (parentCategory === mainCategory || (mainCategory === '홈' && !parentCategory))
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        onSelectCategory(subCategory, mainCategory);
                      }}
                    >
                      {subCategory}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="theme-switcher">
        <span className="theme-switcher-title">테마</span>
        <div className="theme-options">
          <label>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={(e) => setTheme(e.target.value)}
            />
            라이트
          </label>
          <label>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={(e) => setTheme(e.target.value)}
            />
            다크
          </label>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
