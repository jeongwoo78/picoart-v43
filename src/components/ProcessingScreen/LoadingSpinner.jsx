// LoadingSpinner.jsx - 로딩 애니메이션 컴포넌트
import React from 'react';

const LoadingSpinner = ({ statusText }) => {
  return (
    <div className="loading-section">
      <div className="loading-animation">
        <div className="spinner" />
      </div>
      {statusText && (
        <div className="status-text">{statusText}</div>
      )}
    </div>
  );
};

export default LoadingSpinner;
