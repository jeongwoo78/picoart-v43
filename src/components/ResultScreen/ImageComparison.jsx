// ImageComparison.jsx - Before/After 이미지 비교 컴포넌트
import React, { useState } from 'react';

const ImageComparison = ({ originalPhoto, resultImage }) => {
  const [viewMode, setViewMode] = useState('slider'); // 'slider', 'side-by-side', 'result-only'
  const [sliderPosition, setSliderPosition] = useState(50);

  // 슬라이더 모드
  const SliderView = () => {
    const handleSliderChange = (e) => {
      setSliderPosition(e.target.value);
    };

    return (
      <div className="slider-container">
        <div className="image-wrapper">
          <img 
            src={originalPhoto} 
            alt="Original"
            className="original-image"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          />
          <img 
            src={resultImage} 
            alt="Result"
            className="result-image"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          />
          <div 
            className="slider-line"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="slider-handle">
              <span>◀</span>
              <span>▶</span>
            </div>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className="slider-input"
        />
      </div>
    );
  };

  // 나란히 보기 모드
  const SideBySideView = () => (
    <div className="side-by-side">
      <div className="image-box">
        <h4>원본 사진</h4>
        <img src={originalPhoto} alt="Original" />
      </div>
      <div className="image-box">
        <h4>AI 작품</h4>
        <img src={resultImage} alt="Result" />
      </div>
    </div>
  );

  // 결과만 보기 모드
  const ResultOnlyView = () => (
    <div className="result-only">
      <img src={resultImage} alt="Result" />
    </div>
  );

  return (
    <div className="image-comparison">
      {/* 보기 모드 선택 버튼 */}
      <div className="view-mode-buttons">
        <button
          className={viewMode === 'slider' ? 'active' : ''}
          onClick={() => setViewMode('slider')}
        >
          슬라이더
        </button>
        <button
          className={viewMode === 'side-by-side' ? 'active' : ''}
          onClick={() => setViewMode('side-by-side')}
        >
          나란히
        </button>
        <button
          className={viewMode === 'result-only' ? 'active' : ''}
          onClick={() => setViewMode('result-only')}
        >
          결과만
        </button>
      </div>

      {/* 선택된 뷰 렌더링 */}
      <div className="comparison-view">
        {viewMode === 'slider' && <SliderView />}
        {viewMode === 'side-by-side' && <SideBySideView />}
        {viewMode === 'result-only' && <ResultOnlyView />}
      </div>
    </div>
  );
};

export default ImageComparison;
