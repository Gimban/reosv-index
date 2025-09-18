import React from 'react';
import './DataTable.css';

function DataTable({ data }) {
  // 데이터가 로딩되지 않았을 때
  if (!data || data.length === 0) {
    return <p>데이터를 불러오는 중입니다...</p>;
  }

  // 데이터의 첫 번째 행을 사용하여 열 이름(헤더)을 추출
  const columns = Object.keys(data[0]);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;