// EducationCard.jsx - 변환 중 교육 컨텐츠 표시 컴포넌트
import React from 'react';

const EducationCard = ({ content, isVisible }) => {
  if (!isVisible || !content) return null;

  // 아이콘 결정
  const getIcon = () => {
    if (content.title?.includes('거장')) return '🎨';
    if (content.title?.includes('동양')) return '🏛️';
    return '🎭';
  };

  return (
    <div className="education-content">
      <div className="education-header">
        <span className="education-icon">{getIcon()}</span>
        <h3>{content.title}</h3>
      </div>
      <div className="education-body">
        <p>{content.desc}</p>
        
        {/* 특징이 있는 경우 */}
        {content.characteristics && (
          <div className="characteristics">
            <h4>주요 특징:</h4>
            <ul>
              {content.characteristics.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 대표 작품이 있는 경우 */}
        {content.masterpieces && (
          <div className="masterpieces">
            <h4>대표 작품:</h4>
            <ul>
              {content.masterpieces.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationCard;
