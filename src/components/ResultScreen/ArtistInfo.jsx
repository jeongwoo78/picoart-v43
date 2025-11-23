// ArtistInfo.jsx - 화가 정보 및 교육 컨텐츠 표시
import React from 'react';

const ArtistInfo = ({ 
  selectedStyle, 
  aiSelectedArtist, 
  educationText, 
  isLoading 
}) => {
  // 제목 결정
  const getTitle = () => {
    if (selectedStyle.category === 'oriental') {
      return `${selectedStyle.name} 화풍으로 변환 완료`;
    }
    if (aiSelectedArtist) {
      return `${aiSelectedArtist} 화풍으로 변환 완료`;
    }
    return `${selectedStyle.name} 스타일로 변환 완료`;
  };

  return (
    <div className="artist-info">
      <h2 className="result-title">{getTitle()}</h2>
      
      {/* 교육 컨텐츠 */}
      <div className="education-section">
        {isLoading ? (
          <div className="loading-education">
            <div className="spinner-small" />
            <p>교육 컨텐츠 로딩 중...</p>
          </div>
        ) : educationText ? (
          <div className="education-text">
            <h3>🎨 작품 설명</h3>
            <p>{educationText}</p>
          </div>
        ) : null}
      </div>
      
      {/* 스타일 정보 */}
      {selectedStyle.description && (
        <div className="style-description">
          <p>{selectedStyle.description}</p>
        </div>
      )}
    </div>
  );
};

export default ArtistInfo;
