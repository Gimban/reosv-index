import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import DataTable from "./components/DataTable"; // 새로 만든 컴포넌트를 불러옵니다.
import "./App.css";

// 데이터를 불러올 CSV 링크
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI/export?format=csv&gid=0";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      complete: (results) => {
        setData(results.data);
      },
    });
  }, []);

  return (
    <div className="App-container"> {/* 전체 레이아웃을 감싸는 컨테이너 추가 */}
      <Sidebar />
      <div className="content-container"> {/* 실제 콘텐츠가 들어갈 영역 */}
        <h1>CSV 데이터 표</h1>
        <DataTable data={data} />
      </div>
    </div>
  );
}

export default App;
