// sdxlPromptOptimizer.js - SDXL Lightning 프롬프트 최적화
// FLUX와 다른 프롬프트 구조 필요

// SDXL은 더 간결하고 직접적인 프롬프트 선호
function optimizeForSDXL(originalPrompt, style) {
  let sdxlPrompt = originalPrompt;
  
  // 1. FLUX의 장황한 설명 제거
  sdxlPrompt = sdxlPrompt.replace(/CRITICAL:|NOT photographic|NOT photo-realistic/g, '');
  sdxlPrompt = sdxlPrompt.replace(/PRESERVE facial features.*?unified composition all figures together,?/g, '');
  
  // 2. SDXL 스타일 태그 추가 (더 효과적)
  const styleMap = {
    'impressionism': 'impressionist painting, loose brushstrokes, vibrant colors',
    'renaissance': 'renaissance painting, classical composition, sfumato technique',
    'baroque': 'baroque painting, dramatic lighting, chiaroscuro',
    'expressionism': 'expressionist painting, emotional distortion, bold colors',
    'fauvism': 'fauvist painting, wild colors, bold brushwork',
    'post-impressionism': 'post-impressionist painting, expressive color, visible brushstrokes',
    'rococo': 'rococo painting, pastel colors, ornate details',
    'neoclassical': 'neoclassical painting, idealized forms, balanced composition',
    'romantic': 'romantic painting, emotional intensity, dramatic nature',
    'realist': 'realist painting, everyday subjects, natural depiction'
  };
  
  // 3. 아티스트 강조 (SDXL은 아티스트 이름에 더 민감)
  if (sdxlPrompt.includes('in the style of')) {
    sdxlPrompt = sdxlPrompt.replace(/in the style of ([^,]+)/g, 'artwork by $1, $1 style, $1 painting technique');
  }
  
  // 4. 품질 태그 추가 (SDXL 특화)
  const qualityTags = ', masterpiece, best quality, highly detailed, professional artwork';
  if (!sdxlPrompt.includes('masterpiece')) {
    sdxlPrompt += qualityTags;
  }
  
  // 5. 부정 프롬프트 분리 (SDXL은 부정 프롬프트 별도 처리)
  const negativePrompt = 'photo, photorealistic, 3d render, cartoon, anime, sketches, worst quality, low quality, normal quality, lowres, watermark, signature';
  
  // 6. 동양화 특별 처리
  if (sdxlPrompt.includes('Korean') || sdxlPrompt.includes('Chinese') || sdxlPrompt.includes('Japanese')) {
    sdxlPrompt = optimizeOrientalForSDXL(sdxlPrompt);
  }
  
  // 7. 정리
  sdxlPrompt = sdxlPrompt.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
  
  return {
    prompt: sdxlPrompt,
    negative_prompt: negativePrompt
  };
}

// 동양화 SDXL 최적화
function optimizeOrientalForSDXL(prompt) {
  const orientalMap = {
    'Korean Minhwa': 'traditional Korean folk painting, minhwa style, vibrant colors on hanji paper',
    'Korean Pungsokdo': 'Korean genre painting, Kim Hong-do style, ink and light color on paper',
    'Korean Sansuhwa': 'Korean landscape painting, mountains and water, ink wash painting',
    'Chinese Gongbi': 'Chinese meticulous painting, gongbi style, detailed brushwork on silk',
    'Chinese Shanshui': 'Chinese landscape painting, mountains and rivers, ink wash',
    'Chinese Xieyi': 'Chinese freehand painting, expressive brushstrokes, minimal detail',
    'Japanese Ukiyo-e': 'Japanese woodblock print, ukiyo-e style, flat colors, black outlines',
    'Japanese Sumi-e': 'Japanese ink painting, minimalist, zen aesthetic',
    'Japanese Yamato-e': 'Japanese classical painting, yamato-e style, gold background'
  };
  
  for (const [original, optimized] of Object.entries(orientalMap)) {
    if (prompt.includes(original)) {
      prompt = prompt.replace(original, optimized);
    }
  }
  
  return prompt;
}

// 거장 스타일 SDXL 최적화
function optimizeMasterForSDXL(artistName) {
  const masterOptimization = {
    'Van Gogh': 'Vincent van Gogh painting, swirling brushstrokes, vibrant yellows and blues, thick impasto',
    'Klimt': 'Gustav Klimt painting, gold leaf, decorative patterns, art nouveau, symbolist',
    'Munch': 'Edvard Munch painting, expressionist, emotional distortion, wavy lines',
    'Matisse': 'Henri Matisse painting, fauvism, bold colors, decorative patterns, cut-out style',
    'Picasso': 'Pablo Picasso painting, cubist, geometric fragmentation, multiple viewpoints',
    'Dali': 'Salvador Dali painting, surrealist, melting objects, dreamlike, impossible perspectives'
  };
  
  return masterOptimization[artistName] || `painting by ${artistName}, ${artistName} style`;
}

// 메인 변환 함수
function convertFluxToSDXL(fluxPrompt, selectedStyle, aiSelectedArtist) {
  console.log('\n=== FLUX → SDXL CONVERSION ===');
  console.log('Original FLUX prompt length:', fluxPrompt.length);
  
  // 1. 기본 최적화
  let { prompt, negative_prompt } = optimizeForSDXL(fluxPrompt, selectedStyle);
  
  // 2. 아티스트 특별 처리
  if (aiSelectedArtist) {
    const artistOptimized = optimizeMasterForSDXL(aiSelectedArtist);
    if (artistOptimized) {
      // 기존 아티스트 참조 제거 후 새로운 것으로 교체
      prompt = prompt.replace(/artwork by [^,]+, [^,]+ style, [^,]+ painting technique/g, '');
      prompt = artistOptimized + ', ' + prompt;
    }
  }
  
  // 3. 길이 체크 (SDXL은 77 토큰 제한)
  // 대략 350자 이내로 제한
  if (prompt.length > 350) {
    console.log('⚠️ Prompt too long, truncating...');
    prompt = prompt.substring(0, 347) + '...';
  }
  
  console.log('Optimized SDXL prompt length:', prompt.length);
  console.log('================================\n');
  
  return {
    prompt,
    negative_prompt
  };
}

module.exports = {
  optimizeForSDXL,
  optimizeOrientalForSDXL,
  optimizeMasterForSDXL,
  convertFluxToSDXL
};
