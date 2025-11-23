// orientalArt.js - 동양화 처리 로직
// flux-transfer.js에서 분리된 동양화 관련 함수들

// 한국화 스타일 가이드
export function getKoreanArtGuidelines() {
  return `
🇰🇷 Korean Traditional Art Styles:

1️⃣ KOREAN MINHWA (조선 민화):
   - Folk painting on thick hanji paper
   - Vibrant primary colors
   - Thick black outlines
   - Naive, non-professional style
   - Common themes: tigers, magpies, lotus

2️⃣ KOREAN PUNGSOKDO (풍속도):
   - Kim Hong-do style genre painting
   - 70% black ink, 30% pale colors
   - Daily life scenes
   - Subtle earth tones
   - Elegant restraint

3️⃣ KOREAN SANSUHWA (산수화):
   - Mountain and water landscapes
   - Misty atmosphere
   - Minimal color, mostly ink
   - Empty space as element
   - Philosophical depth`;
}

// 중국화 스타일 가이드
export function getChineseArtGuidelines() {
  return `
🇨🇳 Chinese Traditional Art Styles:

1️⃣ CHINESE GONGBI (工笔):
   - Meticulous detail painting
   - Fine brushwork
   - Rich colors on silk
   - Court art tradition
   - Realistic figures/flowers

2️⃣ CHINESE SHANSHUI (山水):
   - Landscape ink painting
   - Monumental mountains
   - Rivers and mists
   - Philosophical space
   - Song dynasty tradition

3️⃣ CHINESE XIEYI (写意):
   - Expressive freehand style
   - Bold brushstrokes
   - Minimal detail
   - Captures spirit over form
   - Zen influence`;
}

// 일본화 스타일 가이드
export function getJapaneseArtGuidelines() {
  return `
🇯🇵 Japanese Traditional Art Styles:

1️⃣ JAPANESE UKIYO-E (浮世絵):
   - Woodblock print style
   - Flat color areas
   - Black outlines
   - Wave patterns
   - Edo period aesthetic

2️⃣ JAPANESE SUMI-E (墨絵):
   - Zen ink painting
   - Minimal brushstrokes
   - Empty space emphasis
   - Seasonal themes
   - Meditative quality

3️⃣ JAPANESE YAMATO-E (大和絵):
   - Classical court painting
   - Gold backgrounds
   - Seasonal narratives
   - Delicate colors
   - Heian period style`;
}

// 동양화 판별 함수
export function isOrientalStyle(promptText) {
  const orientalKeywords = [
    'korean', 'chinese', 'japanese',
    'minhwa', 'pungsokdo', 'sansuhwa',
    'gongbi', 'shanshui', 'xieyi',
    'ukiyo-e', 'sumi-e', 'yamato-e',
    '한국', '중국', '일본'
  ];
  
  const lowerPrompt = promptText.toLowerCase();
  return orientalKeywords.some(keyword => lowerPrompt.includes(keyword));
}

// 한국화 특별 처리
export function getKoreanSpecialProcessing(promptText) {
  const isKoreanMinhwa = promptText.includes('Korean Minhwa') || 
                         promptText.includes('Korean folk painting');
  const isKoreanPungsokdo = promptText.includes('Korean Pungsokdo') || 
                            promptText.includes('Kim Hong-do');
  
  if (isKoreanMinhwa) {
    return {
      type: 'minhwa',
      enforcement: ', CRITICAL: NOT photographic, Authentic Joseon folk painting on THICK ROUGH HANJI PAPER with PROMINENT FIBER TEXTURE throughout, UNEVEN PATCHY pigment absorption creating irregular color areas, genuinely FADED WEATHERED colors like 200-year museum piece, TREMBLING WOBBLY folk brushlines (amateur quality), thick black outlines but IRREGULAR, colors pooling in paper fibers, PRESERVE faces, PRESERVE GENDER, transform to Joseon costume, primitive naive artifact NOT digital NOT smooth, 🚨 NO Japanese'
    };
  }
  
  if (isKoreanPungsokdo) {
    return {
      type: 'pungsokdo',
      enforcement: ', CRITICAL: NOT photographic, Authentic Korean Pungsokdo on ROUGH TEXTURED HANJI with visible fibers, BLACK INK DOMINATES 70-80% (confident spontaneous brushwork), then MINIMAL PALE washes 20-30% ONLY, earth tones EXCLUSIVELY (pale brown grey-green faint ochre), NO bright NO saturated colors, Kim Hong-do elegant restraint, distinctly different from colorful Chinese gongbi, PRESERVE faces, PRESERVE GENDER, simple everyday hanbok, historical painting NOT illustration, 🚨 NO Japanese'
    };
  }
  
  return null;
}

// 일본 요소 제거 강화
export function enforceNoJapanese() {
  return '🚨 ABSOLUTELY NO Japanese hiragana (ひらがな) katakana (カタカナ) or ANY Japanese text, NO vertical Japanese writing, NO Japanese ukiyo-e style elements, REMOVE ALL Japanese visual elements, NO text NO characters on painting';
}

// 동양화 일반 처리
export function getOrientalArtEnforcement(isOriental) {
  if (!isOriental) return '';
  
  return `, CRITICAL: NOT photographic NOT photo-realistic, fully oil painting with thick visible brushstrokes and canvas texture, PRESERVE facial features expressions and identity of people in photo, PRESERVE GENDER accurately (male stays male with masculine features, female stays female with feminine features), TRANSFORM modern clothing and accessories to period-appropriate historical costume and style, unified composition all figures together, ${enforceNoJapanese()}, this is 100% PURE KOREAN or CHINESE TRADITIONAL ART not Japanese`;
}

module.exports = {
  getKoreanArtGuidelines,
  getChineseArtGuidelines,
  getJapaneseArtGuidelines,
  isOrientalStyle,
  getKoreanSpecialProcessing,
  enforceNoJapanese,
  getOrientalArtEnforcement
};
