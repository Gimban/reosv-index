import React, { useMemo, useState } from 'react';
import { useResponsive } from '../context/ResponsiveContext';
import './DataTable.css';

function DataTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>Loading data...</p>;
  }

  const { isMobile } = useResponsive();
  const [mobileView, setMobileView] = useState('cards');
  const columns = useMemo(() => Object.keys(data[0] || {}), [data]);

  return (
    <div className={`table-container${isMobile ? ' mobile' : ''}`}>
      {isMobile && (
        <div className="table-mobile-toggle">
          <button
            type="button"
            className={`table-mobile-toggle__btn${mobileView === 'cards' ? ' active' : ''}`}
            onClick={() => setMobileView('cards')}
            aria-pressed={mobileView === 'cards'}
          >
            Card view
          </button>
          <button
            type="button"
            className={`table-mobile-toggle__btn${mobileView === 'table' ? ' active' : ''}`}
            onClick={() => setMobileView('table')}
            aria-pressed={mobileView === 'table'}
          >
            Table view
          </button>
        </div>
      )}

      {(!isMobile || mobileView === 'table') && (
        <div className="table-scroll" role="region" aria-live="polite">
          <table aria-label="Data table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`}>{row[column]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isMobile && mobileView === 'cards' && (
        <div className="table-card-list">
          {data.map((row, rowIndex) => (
            <article key={rowIndex} className="table-card">
              <header className="table-card__header">Row {rowIndex + 1}</header>
              <dl className="table-card__body">
                {columns.map((column) => (
                  <div key={column} className="table-card__item">
                    <dt>{column}</dt>
                    <dd>{row[column] !== undefined && row[column] !== null ? row[column] : '-'}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default DataTable;
