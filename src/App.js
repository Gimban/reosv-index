import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import DataTable from "./components/DataTable"; // 새로 만든 컴포넌트를 불러옵니다.
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import WeaponCardView from "./components/WeaponCardView";
import DpsCalculator from "./components/DpsCalculator";
import "./App.css";

// 데이터를 불러올 CSV 링크
// Base URL에서 ID 부분을 추출합니다.
const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";

// 카테고리 이름과 GID를 매핑합니다.
const GID_MAP = {
  "특수 무기 스탯": "0",
  "클래스 무기 강화 비용": "882618671",
  "특수 무기 강화 비용": "2088796296",
  "방어구 강화 비용": "1463521558",
  "클래스 무기 스탯": "1281476028",
};

// GID를 사용하여 CSV URL을 생성하는 함수
const createCsvUrl = (gid) => {
  return `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${gid}`;
};

function App() {
  const [allData, setAllData] = useState({});
  const [currentCategory, setCurrentCategory] = useState("홈");
  const [theme, setTheme] = useState("dark"); // 'dark'를 기본값으로 설정

  useEffect(() => {
    async function fetchAllData() {
      const fetchedData = {};
      for (const category in GID_MAP) {
        const gid = GID_MAP[category];
        const url = createCsvUrl(gid); // 함수를 사용하여 URL 생성
        await new Promise((resolve) => {
          Papa.parse(url, {
            download: true,
            header: true,
            complete: (results) => {
              fetchedData[category] = results.data;
              resolve();
            },
          });
        });
      }
      setAllData(fetchedData);
    }
    fetchAllData();
  }, []);

  return (
    <div className={`App-container theme-${theme}`}>
      <Sidebar
        gidMap={GID_MAP}
        onSelectCategory={setCurrentCategory}
        theme={theme}
        setTheme={setTheme}
      />
      <div className="content-container">
        {currentCategory === "홈" ? (
          <Home />
        ) : currentCategory === "특수 무기 스탯" ? (
          <WeaponCardView data={allData[currentCategory] || []} />
        ) : currentCategory === "DPS/DPM 계산기" ? (
          <DpsCalculator
            weaponData={allData["특수 무기 스탯"] || []}
            classWeaponData={allData["클래스 무기 스탯"] || []}
          />
        ) : (
          <>
            <h1>{currentCategory} 데이터</h1>
            <DataTable data={allData[currentCategory] || []} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
