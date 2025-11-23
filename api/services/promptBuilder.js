// promptBuilder.js - 프롬프트 생성 로직
// flux-transfer.js에서 분리된 프롬프트 빌딩 관련 함수들
// v43: SDXL Lightning 지원 추가

const { 
  isOrientalStyle, 
  getKoreanSpecialProcessing, 
  getOrientalArtEnforcement 
} = require('./orientalArt.js');

const {
  convertFluxToSDXL
} = require('./sdxlPromptOptimizer.js');

// 메인 프롬프트 빌더
export function buildArtistPrompt(basePrompt, selectedArtist, style) {
  let prompt = basePrompt;
  
  // 아티스트 정보 추가
  if (selectedArtist && selectedArtist !== 'Unknown Artist') {
    // 기존 아티스트 참조 제거
    prompt = prompt.replace(/in the style of [^,]+,?/g, '');
    prompt = prompt.replace(/painting by [^,]+,?/g, '');
    
    // 새 아티스트 추가
    if (!prompt.includes(selectedArtist)) {
      prompt = `${prompt}, in the style of ${selectedArtist}`;
    }
  }
  
  // 동양화 특별 처리
  const isOriental = isOrientalStyle(prompt);
  if (isOriental) {
    const koreanProcessing = getKoreanSpecialProcessing(prompt);
    if (koreanProcessing) {
      prompt += koreanProcessing.enforcement;
      console.log(`ℹ️ Korean ${koreanProcessing.type} mode applied`);
    } else {
      prompt += getOrientalArtEnforcement(true);
      console.log('ℹ️ Oriental art mode: with Japanese prohibition');
    }
  }
  
  // 회화 강화 추가
  prompt = addPaintingEnforcement(prompt, isOriental);
  
  return prompt;
}

// 회화 강화 텍스트 추가
export function addPaintingEnforcement(prompt, isOriental = false) {
  // 점묘법 체크
  const isPointillism = prompt.toLowerCase().includes('seurat') || 
                       prompt.toLowerCase().includes('signac') ||
                       prompt.toLowerCase().includes('pointillist');
  
  let paintingEnforcement;
  
  if (isPointillism) {
    // 점묘법: brushstrokes 제외
    paintingEnforcement = ', CRITICAL: NOT photographic NOT photo-realistic, PRESERVE facial features expressions and identity of people in photo, PRESERVE GENDER accurately (male stays male with masculine features, female stays female with feminine features), TRANSFORM modern clothing and accessories to period-appropriate historical costume and style, unified composition all figures together';
    console.log('ℹ️ Pointillism mode: without brushstrokes');
  } else if (isOriental) {
    // 동양화: 일본어 금지 강화
    paintingEnforcement = ', CRITICAL: NOT photographic NOT photo-realistic, fully oil painting with thick visible brushstrokes and canvas texture, PRESERVE facial features expressions and identity of people in photo, PRESERVE GENDER accurately (male stays male with masculine features, female stays female with feminine features), TRANSFORM modern clothing and accessories to period-appropriate historical costume and style, unified composition all figures together, 🚨 ABSOLUTELY NO Japanese text or elements';
  } else {
    // 일반 서양화
    paintingEnforcement = ', CRITICAL: NOT photographic NOT photo-realistic, fully oil painting with thick visible brushstrokes and canvas texture, PRESERVE facial features expressions and identity of people in photo, PRESERVE GENDER accurately (male stays male with masculine features, female stays female with feminine features), TRANSFORM modern clothing and accessories to period-appropriate historical costume and style, unified composition all figures together';
  }
  
  // 이미 회화 강조가 없는 경우에만 추가
  if (!prompt.toLowerCase().includes('preserve facial') && 
      !prompt.includes('brushstrokes') &&
      !prompt.toLowerCase().includes('not photographic')) {
    prompt += paintingEnforcement;
    console.log('✅ Added painting enforcement');
  }
  
  return prompt;
}

// 컨트롤 강도 결정
export function getControlStrength(prompt) {
  // 레오나르도 다빈치는 낮은 강도
  if (prompt.toLowerCase().includes('leonardo')) {
    console.log('🎨 Leonardo detected: control_strength = 0.65');
    return 0.65;
  }
  
  // 기본값
  return 0.80;
}

// 스타일별 프롬프트 템플릿
export const STYLE_TEMPLATES = {
  ancient_sculpture: 'Pure white marble classical Greek sculpture, {details}',
  ancient_mosaic: 'Roman mosaic with visible tesserae tiles and grout lines, {details}',
  medieval_byzantine: 'Byzantine icon painting with gold background, {details}',
  medieval_gothic: 'Gothic illuminated manuscript style, {details}',
  medieval_romanesque: 'Romanesque fresco mural painting, {details}',
  medieval_islamic: 'Islamic miniature painting with intricate details, {details}',
  renaissance: 'Renaissance oil painting, {details}',
  baroque: 'Baroque painting with dramatic chiaroscuro, {details}',
  rococo: 'Rococo painting with pastel colors and ornate details, {details}',
  neoclassical: 'Neoclassical painting with idealized forms, {details}',
  romantic: 'Romantic painting with emotional intensity, {details}',
  realist: 'Realist painting with everyday subjects, {details}',
  impressionist: 'Impressionist painting with visible brushstrokes and light effects, {details}',
  post_impressionist: 'Post-impressionist painting with expressive colors, {details}',
  fauvist: 'Fauvist painting with bold, non-naturalistic colors, {details}',
  expressionist: 'Expressionist painting with emotional distortion, {details}'
};

// 프롬프트 검증 및 정리
export function cleanupPrompt(prompt) {
  // 중복 제거
  prompt = prompt.replace(/,\s*,/g, ',');
  prompt = prompt.replace(/\s+/g, ' ');
  prompt = prompt.trim();
  
  // 끝에 마침표 추가
  if (!prompt.endsWith('.') && !prompt.endsWith('!')) {
    prompt += '.';
  }
  
  return prompt;
}

// 디버그 로깅
export function logPromptDetails(originalPrompt, finalPrompt, selectedArtist) {
  console.log('\n=== PROMPT BUILDING DETAILS ===');
  console.log('Original:', originalPrompt.substring(0, 100) + '...');
  console.log('Selected Artist:', selectedArtist);
  console.log('Final:', finalPrompt.substring(0, 100) + '...');
  console.log('================================\n');
}

module.exports = {
  buildArtistPrompt,
  addPaintingEnforcement,
  getControlStrength,
  STYLE_TEMPLATES,
  cleanupPrompt,
  logPromptDetails,
  convertFluxToSDXL  // SDXL 변환 함수 export
};
