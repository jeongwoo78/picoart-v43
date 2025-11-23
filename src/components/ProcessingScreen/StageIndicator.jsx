// StageIndicator.jsx - 변환 진행 단계 표시 컴포넌트
import React from 'react';

const StageIndicator = ({ currentStage }) => {
  const stages = [
    { number: 1, label: '사진 업로드' },
    { number: 2, label: '스타일 분석' },
    { number: 3, label: 'AI 변환' },
    { number: 4, label: '완료' }
  ];

  return (
    <div className="stage-indicator">
      {stages.map(stage => (
        <div 
          key={stage.number}
          className={`stage ${
            currentStage === stage.number ? 'active' : 
            currentStage > stage.number ? 'complete' : ''
          }`}
        >
          <div className="stage-number">{stage.number}</div>
          <div className="stage-label">{stage.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StageIndicator;
