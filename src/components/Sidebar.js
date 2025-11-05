import React, { useState } from "react";
import "./Sidebar.css";
import hamburgerIcon from "../images/icon/hamburger-icon.svg";

function Sidebar({
  gidMap,
  onSelectCategory,
  currentCategory,
  parentCategory,
  theme,
  setTheme,
  isCollapsed,
  setIsCollapsed,
}) {
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);
  const sidebarRef = React.useRef(null);
  const touchDataRef = React.useRef({
    isTracking: false,
    isHorizontal: false,
    startX: 0,
    startY: 0,
    lastX: 0,
  });

  const isMobileViewport = React.useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(max-width: 767px)").matches;
  }, []);

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
        "실질 체력 계산기": "실질 체력 계산기",
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

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return () => {};
    }

    const EDGE_THRESHOLD = 30;
    const SWIPE_THRESHOLD = 60;
    touchDataRef.current.isTracking = false;
    touchDataRef.current.isHorizontal = false;

    const handleTouchStart = (event) => {
      if (!isMobileViewport()) {
        return;
      }

      const touch = event.touches[0];
      const sidebarElement = sidebarRef.current;
      const isTouchInsideSidebar =
        sidebarElement && sidebarElement.contains(event.target);

      if (isCollapsed) {
        if (touch.clientX > EDGE_THRESHOLD) {
          return;
        }
      } else if (!isTouchInsideSidebar) {
        return;
      }

      const touchData = touchDataRef.current;
      touchData.isTracking = true;
      touchData.isHorizontal = false;
      touchData.startX = touch.clientX;
      touchData.startY = touch.clientY;
      touchData.lastX = touch.clientX;
    };

    const handleTouchMove = (event) => {
      const touchData = touchDataRef.current;
      if (!touchData.isTracking) {
        return;
      }

      if (!isMobileViewport()) {
        touchData.isTracking = false;
        touchData.isHorizontal = false;
        return;
      }

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchData.startX;
      const deltaY = touch.clientY - touchData.startY;

      if (!touchData.isHorizontal) {
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 16) {
          touchData.isTracking = false;
          touchData.isHorizontal = false;
          return;
        }

        if (Math.abs(deltaX) > 16) {
          touchData.isHorizontal = true;
        }
      }

      touchData.lastX = touch.clientX;
    };

    const handleTouchEnd = () => {
      const touchData = touchDataRef.current;
      if (!touchData.isTracking) {
        return;
      }

      if (!isMobileViewport()) {
        touchData.isTracking = false;
        touchData.isHorizontal = false;
        return;
      }

      const deltaX = touchData.lastX - touchData.startX;

      if (touchData.isHorizontal) {
        if (isCollapsed && deltaX > SWIPE_THRESHOLD) {
          setIsCollapsed(false);
        } else if (!isCollapsed && deltaX < -SWIPE_THRESHOLD) {
          setIsCollapsed(true);
        }
      }

      touchData.isTracking = false;
      touchData.isHorizontal = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isCollapsed, isMobileViewport, setIsCollapsed]);

  return (
    <div
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
    >
      <div className="sidebar-header">
        {!isCollapsed && <h2>목차</h2>}
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          <img src={hamburgerIcon} alt="메뉴 토글" />
        </button>
      </div>
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
                        if (isMobileViewport()) {
                          setIsCollapsed(true);
                        }
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
