// artistSelector.js - AI 화가 선택 로직
// flux-transfer.js에서 분리된 화가 선택 관련 함수들

const Anthropic = require('@anthropic-ai/sdk');

// Anthropic 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI 화가 선택 함수
export async function selectArtistWithAI(imageAnalysis, style, guidelines) {
  try {
    // 거장 스타일인 경우 바로 반환
    if (style.type === 'master') {
      const masterArtist = style.prompt.match(/in the style of ([^,]+)/)?.[1];
      if (masterArtist) {
        console.log(`✅ Master style detected: ${masterArtist}`);
        return {
          artist: masterArtist,
          method: 'direct',
          details: `Master artist directly selected: ${masterArtist}`
        };
      }
    }

    // 동양화 스타일인 경우
    if (style.type === 'oriental') {
      const orientalStyle = style.prompt.match(/(Korean|Chinese|Japanese) ([^,]+)/);
      if (orientalStyle) {
        console.log(`✅ Oriental style detected: ${orientalStyle[0]}`);
        return {
          artist: orientalStyle[0],
          method: 'oriental',
          details: `Oriental art style: ${orientalStyle[0]}`
        };
      }
    }

    // AI 선택이 필요한 경우
    const prompt = `
Based on this image analysis:
${imageAnalysis}

Select the SINGLE MOST APPROPRIATE artist from these options:
${guidelines}

CRITICAL RULES:
1. Choose ONE artist only
2. Consider the subject matter, mood, and composition
3. Match artist's typical themes with the image content
4. For portraits, consider gender and age appropriateness
5. For landscapes, consider the scene type and atmosphere

Response format (JSON only):
{
  "selected_artist": "Artist Name",
  "reason": "Brief explanation"
}`;

    console.log('🤖 Requesting AI artist selection...');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      temperature: 0.3,
      system: "You are an art history expert. Select the most appropriate artist based on image analysis. Respond with JSON only.",
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text.trim();
    console.log('🎨 AI Response:', responseText);

    // JSON 파싱 시도
    let selectedData;
    try {
      // JSON 블록 추출 (```json 형식 처리)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        selectedData = JSON.parse(jsonMatch[0]);
      } else {
        selectedData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      // 텍스트에서 아티스트 이름 추출 시도
      const artistMatch = responseText.match(/"selected_artist":\s*"([^"]+)"/);
      if (artistMatch) {
        selectedData = {
          selected_artist: artistMatch[1],
          reason: 'Extracted from response'
        };
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    return {
      artist: selectedData.selected_artist,
      method: 'ai-selection',
      details: selectedData.reason || 'AI selected based on image analysis'
    };

  } catch (error) {
    console.error('❌ Artist selection error:', error);
    
    // 폴백: 스타일의 기본 아티스트 반환
    const fallbackArtist = extractFallbackArtist(style.prompt);
    return {
      artist: fallbackArtist,
      method: 'fallback',
      details: 'Error in AI selection, using fallback'
    };
  }
}

// 폴백 아티스트 추출
function extractFallbackArtist(prompt) {
  // 프롬프트에서 첫 번째 아티스트 이름 추출
  const artistPatterns = [
    /in the style of ([A-Z][a-z]+ ?[A-Z]?[a-z]*)/,
    /([A-Z][a-z]+ ?[A-Z]?[a-z]*)'s style/,
    /painting by ([A-Z][a-z]+ ?[A-Z]?[a-z]*)/
  ];

  for (const pattern of artistPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return 'Unknown Artist';
}

// 이미지 분석 함수
export async function analyzeImageForArtist(imageBase64) {
  try {
    const prompt = `Analyze this image for art style selection. Focus on:
1. Main subject (people, landscape, object)
2. Composition (close-up, full body, wide shot)
3. Mood and atmosphere
4. Gender and age of subjects if people are present
5. Indoor/outdoor setting
6. Time period suggested by clothing/setting

Provide a brief, factual analysis in 2-3 sentences.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      temperature: 0.2,
      system: "You are an image analysis expert. Provide concise, factual descriptions.",
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64.split(',')[1]
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    });

    return message.content[0].text.trim();
    
  } catch (error) {
    console.error('❌ Image analysis error:', error);
    return 'Image analysis failed - using default selection';
  }
}

// 스타일별 아티스트 가이드라인 생성
export function getArtistGuidelines(style) {
  // 각 스타일에 따른 아티스트 선택 가이드라인 반환
  const styleGuideMap = {
    'ancient': 'Greek/Roman classical artists',
    'medieval': 'Byzantine, Gothic, Romanesque, Islamic artists',
    'renaissance': 'Leonardo, Michelangelo, Raphael, Botticelli, Titian',
    'baroque': 'Rembrandt, Vermeer, Velázquez, Caravaggio, Rubens',
    'rococo': 'Watteau, Fragonard',
    'neoclassical': 'David, Ingres, Turner, Friedrich, Delacroix, Millet, Manet',
    'impressionism': 'Monet, Renoir, Degas, Morisot',
    'post-impressionism': 'Van Gogh, Gauguin, Cézanne, Seurat',
    'fauvism': 'Matisse, Derain, Vlaminck',
    'expressionism': 'Munch, Schiele, Kirchner, Nolde, Marc'
  };

  // style.era 또는 style.movement로 가이드라인 찾기
  const era = style.era || style.movement || 'unknown';
  return styleGuideMap[era.toLowerCase()] || 'Various artists';
}

module.exports = {
  selectArtistWithAI,
  analyzeImageForArtist,
  getArtistGuidelines
};
