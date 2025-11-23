// ShareButtons.jsx - 공유 및 다운로드 버튼 컴포넌트
import React from 'react';

const ShareButtons = ({ resultImage, onDownload, onShare }) => {
  
  // 이미지 다운로드
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `picoart-${Date.now()}.jpg`;
    link.click();
    if (onDownload) onDownload();
  };

  // 공유 기능
  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(resultImage);
        const blob = await response.blob();
        const file = new File([blob], 'picoart.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'PicoArt 작품',
          text: 'AI가 그린 나만의 예술 작품을 확인해보세요!',
          files: [file]
        });
        
        if (onShare) onShare();
      } catch (error) {
        console.log('공유 취소 또는 오류:', error);
      }
    } else {
      // Web Share API를 지원하지 않는 경우
      alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
    }
  };

  // 클립보드에 복사
  const handleCopyLink = () => {
    const text = '🎨 PicoArt로 만든 AI 아트를 확인해보세요!\nhttps://picoart.vercel.app';
    navigator.clipboard.writeText(text).then(() => {
      alert('링크가 복사되었습니다!');
    });
  };

  return (
    <div className="share-buttons">
      <button 
        className="btn-download"
        onClick={handleDownload}
      >
        <span className="icon">💾</span>
        다운로드
      </button>
      
      {navigator.share && (
        <button 
          className="btn-share"
          onClick={handleShare}
        >
          <span className="icon">📤</span>
          공유하기
        </button>
      )}
      
      <button 
        className="btn-copy"
        onClick={handleCopyLink}
      >
        <span className="icon">📋</span>
        링크 복사
      </button>
    </div>
  );
};

export default ShareButtons;
