// index.jsx - ProcessingScreen 메인 컨테이너 (리팩토링 버전)
import React, { useEffect, useState } from 'react';
import { processStyleTransfer } from '../../utils/styleTransferAPI';
import { educationContent } from '../../data/educationContent';
import StageIndicator from './StageIndicator';
import EducationCard from './EducationCard';
import LoadingSpinner from './LoadingSpinner';
import styles from './ProcessingScreen.module.css';

// 헬퍼 함수
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ProcessingScreen = ({ photo, selectedStyle, onComplete }) => {
  const [stage, setStage] = useState(1);
  const [statusText, setStatusText] = useState('준비 중...');
  const [showEducation, setShowEducation] = useState(false);
  const [educationData, setEducationData] = useState(null);
  const [aiArtistInfo, setAiArtistInfo] = useState(null);

  useEffect(() => {
    processImage();
  }, []);

  // 교육 컨텐츠 가져오기
  const getEducationContent = () => {
    const category = selectedStyle.category;
    
    // 1. 사조 탭 → 사조 설명
    if (category !== 'masters' && category !== 'oriental') {
      return educationContent.movements[category];
    }
    
    // 2. 거장 탭 → 거장 소개
    if (category === 'masters') {
      const masterId = selectedStyle.id;
      const masterInfo = educationContent.masters[masterId];
      
      if (masterInfo) {
        return {
          title: masterInfo.title,
          desc: masterInfo.desc
        };
      }
    }
    
    // 3. 동양화 탭 → 동양화 설명
    if (category === 'oriental') {
      const orientalId = selectedStyle.id;
      return educationContent.oriental[orientalId];
    }
    
    return null;
  };

  // 이미지 처리 메인 함수
  const processImage = async () => {
    try {
      // Stage 1: 사진 업로드 확인
      setStage(1);
      setStatusText('사진 준비 중...');
      await sleep(800);

      // Stage 2: 교육 컨텐츠 표시 시작
      setStage(2);
      const eduContent = getEducationContent();
      if (eduContent) {
        setEducationData(eduContent);
        setStatusText(`${eduContent.title} 스타일 분석 중...`);
        setShowEducation(true);
        await sleep(1000);
      }

      // Stage 3: AI 변환
      setStage(3);
      setStatusText('AI가 사진을 분석하고 있습니다...');
      await sleep(500);
      
      setStatusText('AI가 최적의 화가를 선택하고 있습니다...');
      await sleep(500);

      // API 호출 (보안 개선: API 키 제거됨)
      const result = await processStyleTransfer(
        photo,
        selectedStyle,
        null,
        (progressText) => setStatusText(progressText)
      );

      if (!result.success) {
        throw new Error(result.error || 'Style transfer failed');
      }

      // AI 선택 정보 저장
      if (result.aiSelectedArtist) {
        setAiArtistInfo({
          artist: result.aiSelectedArtist,
          method: result.selectionMethod,
          details: result.selectionDetails
        });
        setStatusText(`${result.aiSelectedArtist} 화풍으로 변환 완료!`);
        await sleep(1000);
      }

      // Stage 4: Complete
      setStage(4);
      setShowEducation(false);
      setStatusText('완성되었습니다!');
      await sleep(500);

      // 완료 콜백
      onComplete(selectedStyle, result.resultUrl, result);

    } catch (error) {
      console.error('Processing error:', error);
      setStatusText(`오류: ${error.message || '다시 시도해주세요.'}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>🎨 AI가 그림을 그리고 있어요</h2>
        
        {/* 진행 단계 표시 */}
        <StageIndicator currentStage={stage} />
        
        {/* 로딩 스피너 & 상태 텍스트 */}
        <LoadingSpinner statusText={statusText} />
        
        {/* 교육 컨텐츠 */}
        <EducationCard 
          content={educationData} 
          isVisible={showEducation}
        />
        
        {/* AI 선택 정보 (디버그용) */}
        {aiArtistInfo && process.env.NODE_ENV === 'development' && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f0f0f0',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            <strong>AI Selection:</strong> {aiArtistInfo.artist}<br/>
            <strong>Method:</strong> {aiArtistInfo.method}<br/>
            <strong>Details:</strong> {aiArtistInfo.details}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingScreen;
