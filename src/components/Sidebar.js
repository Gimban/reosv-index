import React from 'react';
import './Sidebar.css';

function Sidebar({ onSelectCategory }) {
  // App.js의 GID_MAP과 유사한 구조를 사용하거나 props로 받을 수 있습니다.
  // 여기서는 예시로 구조를 정의합니다.
  const menu = {
    '무기': {
      '클래스 무기 강화 비용': '클래스 무기 강화 비용',
      '특수 무기 스텟': '특수 무기 스텟',
      '특수 무기 강화 비용': '특수 무기 강화 비용'
    },
    '방어구': {
      '방어구 강화 비용': '방어구 강화 비용'
    }
  };

  const mainCategories = Object.keys(menu);

  return (
    <div className="sidebar">
      <h2>목차</h2>
      <ul>
        {mainCategories.map((category, index) => (
          <li key={index}>
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // 최상위 카테고리는 클릭해도 동작하지 않게 하거나,
                // 첫 번째 하위 카테고리를 선택하게 할 수 있습니다.
                const firstSubCategory = Object.keys(menu[category])[0];
                if (firstSubCategory) {
                  onSelectCategory(firstSubCategory);
                }
              }}
            >
              {category}
            </a>
            {/* 하위 목차 렌더링 */}
            {Object.keys(menu[category]).length > 0 && (
              <ul>
                {Object.keys(menu[category]).map((subCategory, subIndex) => (
                  <li key={subIndex}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        // 하위 목차 클릭 시 상위 컴포넌트에 알림
                        onSelectCategory(menu[category][subCategory]);
                      }}
                    >
                      {subCategory}
                    </a>
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