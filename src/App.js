import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import DataTable from "./components/DataTable"; // 새로 만든 컴포넌트를 불러옵니다.
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import WeaponCardView from "./components/WeaponCardView";
import ClassWeaponCardView from "./components/ClassWeaponCardView";
import ClassEnhancementCalculator from "./components/ClassEnhancementCalculator";
import ArmorEnhancementCalculator from "./components/ArmorEnhancementCalculator";
import DpsCalculator from "./components/DpsCalculator";
import EnhancementSimulator from "./components/EnhancementSimulator";
import "./App.css";

// 데이터를 불러올 CSV 링크
// Base URL에서 ID 부분을 추출합니다.
const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";

// 카테고리 이름과 GID를 매핑합니다.
const GID_MAP = {
  "클래스 무기 스탯": "1281476028",
  "클래스 무기 강화 비용": "882618671",
  "특수 무기 스탯": "0",
  "특수 무기 확정 강화 비용": "2088796296",
  "특수 무기 확률 강화 비용": "665507476",
  "방어구 강화 비용": "1463521558",
  "장신구 기본 옵션": "1577464411",
  "장신구 잠재 옵션": "2032806807",
};

// GID를 사용하여 CSV URL을 생성하는 함수
const createCsvUrl = (gid) => {
  return `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${gid}`;
};

function App() {
  const [allData, setAllData] = useState({});
  const [currentCategory, setCurrentCategory] = useState("홈");
  const [parentCategory, setParentCategory] = useState(null); // 상위 카테고리 상태 추가
  const [theme, setTheme] = useState("dark"); // 'dark'를 기본값으로 설정
  const [enhancementHistory, setEnhancementHistory] = useState([]);
  const [enhancementLogs, setEnhancementLogs] = useState(() => {
    // 페이지 로드 시 localStorage에서 로그를 불러옵니다.
    const savedLogs = localStorage.getItem("enhancementLogs");
    return savedLogs
      ? JSON.parse(savedLogs)
      : {
          materials: { 골드: 0, "무형의 파편": 0, "정교한 강화석": 0 },
          consumedWeapons: {},
        };
  });

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

  // enhancementLogs가 변경될 때마다 localStorage에 저장합니다.
  useEffect(() => {
    localStorage.setItem("enhancementLogs", JSON.stringify(enhancementLogs));
  }, [enhancementLogs]);

  const handleSelectCategory = (category, parent) => {
    setCurrentCategory(category);
    setParentCategory(parent);
  };

  const renderContent = () => {
    // "미가공 데이터" 카테고리 하위 항목은 항상 DataTable을 보여줍니다.
    if (parentCategory === "미가공 데이터") {
      return (
        <>
          <h1>{currentCategory} 데이터</h1>
          <DataTable data={allData[currentCategory] || []} />
        </>
      );
    }

    // 그 외의 경우, currentCategory 이름에 따라 분기합니다.
    switch (currentCategory) {
      case "홈": // 홈은 parentCategory가 없으므로 여기에 남습니다.
        return <Home />;
      case "특수 무기 스탯":
        return <WeaponCardView data={allData[currentCategory] || []} />;
      case "클래스 무기 스탯":
        return (
          <div className="full-height-view">
            <ClassWeaponCardView data={allData[currentCategory] || []} />
          </div>
        );
      case "클래스 무기 강화 비용":
        return (
          <ClassEnhancementCalculator
            costData={allData[currentCategory] || []}
          />
        );
      case "방어구 강화 비용":
        return (
          <ArmorEnhancementCalculator
            costData={allData[currentCategory] || []}
          />
        );
      // 계산기 카테고리
      case "DPS/DPM 계산기":
        return (
          <DpsCalculator
            weaponData={allData["특수 무기 스탯"] || []}
            classWeaponData={allData["클래스 무기 스탯"] || []}
            accessoryBaseData={allData["장신구 기본 옵션"] || []}
            accessoryPotentialOptionData={allData["장신구 잠재 옵션"] || []}
          />
        );
      case "강화 시뮬레이터":
        return (
          <EnhancementSimulator
            weaponData={allData["특수 무기 스탯"] || []}
            guaranteedCostData={allData["특수 무기 확정 강화 비용"] || []}
            probabilisticCostData={allData["특수 무기 확률 강화 비용"] || []}
            logs={enhancementLogs}
            setLogs={setEnhancementLogs}
            history={enhancementHistory}
            setHistory={setEnhancementHistory}
          />
        );
      default:
        // 특정된 뷰가 없는 모든 항목은 기본 데이터 테이블을 보여줍니다.
        // (예: '미가공 데이터'에 있지만 아직 특별한 뷰가 없는 항목)
        return (
          <>
            <h1>{currentCategory} 데이터</h1>
            <DataTable data={allData[currentCategory] || []} />
          </>
        );
    }
  };

  return (
    <div className={`App-container theme-${theme}`}>
      <Sidebar
        gidMap={GID_MAP}
        onSelectCategory={handleSelectCategory}
        currentCategory={currentCategory}
        parentCategory={parentCategory}
        theme={theme}
        setTheme={setTheme}
      />
      <div className="content-container">{renderContent()}</div>
    </div>
  );
}

export default App;
