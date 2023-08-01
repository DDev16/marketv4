// ProgressBar.js
import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value, max }) => {
  const percentage = (value / max) * 100;
  const remaining = max - value;

  let barColor = '#4caf50'; // Default color: green
  if (percentage >= 90) {
    barColor = '#f44336'; // Red for 90% and above
  } else if (percentage >= 75) {
    barColor = '#ff9800'; // Orange for 75% and above
  } else if (percentage >= 50) {
    barColor = '#ffc107'; // Yellow for 50% and above
  }

  return (
    <div
      className="progress-bar-container"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: barColor }}>
        <div className="progress-label">{percentage.toFixed(2)}%</div>
      </div>
      <div className="progress-info">
        <span className="progress-info-text">Minted: {value}</span>
        <span className="progress-info-text">Remaining: {remaining}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
