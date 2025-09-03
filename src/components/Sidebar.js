import React from 'react';
import './Sidebar.css';

function Sidebar() {
  const categories = [
    '무기',
    '방어구',
    '장신구',
    '소모품',
  ];

  return (
    <div className="sidebar">
      <h2>목차</h2>
      <ul>
        {categories.map((category, index) => (
          <li key={index}>
            <a href={`#${category.toLowerCase()}`}>{category}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;