import React from "react";
import "./Sidebar.css";

function Sidebar({ gidMap, onSelectCategory }) {
  // GID_MAP을 기반으로 메뉴 구조를 동적으로 생성합니다.
  const menu = React.useMemo(() => {
    const menuStructure = {
      홈: {
        홈: "홈",
      },
      계산기: {
        "DPS/DPM 계산기": "DPS/DPM 계산기",
      },
      무기: {},
      방어구: {},
      기타: {},
    };

    for (const categoryName in gidMap) {
      if (categoryName.includes("무기")) {
        menuStructure["무기"][categoryName] = categoryName;
      } else if (categoryName.includes("방어구")) {
        menuStructure["방어구"][categoryName] = categoryName;
      } else {
        menuStructure["기타"][categoryName] = categoryName;
      }
    }

    // 내용이 없는 카테고리는 숨깁니다.
    if (Object.keys(menuStructure["기타"]).length === 0) {
      delete menuStructure["기타"];
    }

    return menuStructure;
  }, [gidMap]);

  return (
    <div className="sidebar">
      <h2>목차</h2>
      <ul>
        {Object.keys(menu).map((mainCategory) => (
          <li key={mainCategory}>
            <span className="main-category-title">{mainCategory}</span>
            {/* 하위 목차 렌더링 */}
            {Object.keys(menu[mainCategory]).length > 0 && (
              <ul>
                {Object.keys(menu[mainCategory]).map((subCategory) => (
                  <li key={subCategory}>
                    <button
                      type="button"
                      className="category-button"
                      onClick={() => {
                        onSelectCategory(subCategory);
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
    </div>
  );
}

export default Sidebar;
