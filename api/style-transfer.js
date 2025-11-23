// style-transfer.js - 통합 API (SDXL Lightning 전용)
// v43: 함수 개수 제한 해결을 위한 통합 버전

import { 
  selectArtistWithAI, 
  analyzeImageForArtist, 
  getArtistGuidelines 
} from './services/artistSelector.js';

import { 
  buildArtistPrompt, 
  getControlStrength, 
  cleanupPrompt,
  logPromptDetails
} from './services/promptBuilder.js';

import { convertFluxToSDXL } from './services/sdxlPromptOptimizer.js';
import * as styleGuides from './services/styleGuides.js';
import * as orientalArt from './services/orientalArt.js';
import { rateLimiter } from './services/rateLimiter.js';

// 메인 핸들러 - SDXL 기본
async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image, prompt: basePrompt, style, selectedStyle } = req.body;
    const actualStyle = style || selectedStyle; // 두 형식 모두 지원
    const actualPrompt = basePrompt || actualStyle?.prompt || actualStyle?.description;

    if (!image || !actualPrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🎨 SDXL Lightning Transfer - v43');
    console.log('💰 Cost: $0.011 (72% savings)');

    // 1. 이미지 분석
    const imageAnalysis = await analyzeImageForArtist(image);

    // 2. AI 아티스트 선택
    const guidelines = getStyleGuidelines(actualStyle);
    const artistSelection = await selectArtistWithAI(imageAnalysis, actualStyle, guidelines);

    // 3. 프롬프트 빌드
    let finalPrompt = buildArtistPrompt(actualPrompt, artistSelection.artist, actualStyle);
    finalPrompt = cleanupPrompt(finalPrompt);

    // 4. SDXL 최적화
    const { prompt: sdxlPrompt, negative_prompt } = convertFluxToSDXL(
      finalPrompt, actualStyle, artistSelection.artist
    );

    // 5. SDXL API 호출
    const response = await callSDXL(image, sdxlPrompt, negative_prompt);

    res.status(200).json({
      ...response,
      selected_artist: artistSelection.artist,
      selection_method: artistSelection.method,
      model_used: 'SDXL Lightning'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function callSDXL(image, prompt, negativePrompt) {
  return rateLimiter.addToQueue(async () => {
    const response = await fetch(
      'https://api.replicate.com/v1/models/bytedance/sdxl-lightning-4step/predictions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            negative_prompt: negativePrompt,
            image: image,
            num_inference_steps: 4,
            guidance_scale: 0,
            scheduler: "K_EULER",
            num_outputs: 1,
            output_format: "jpg",
            output_quality: 90
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        const errorData = JSON.parse(errorText);
        const error = new Error(errorData.detail || 'Rate limited');
        error.status = 429;
        error.retry_after = errorData.retry_after || 10;
        throw error;
      }
      throw new Error(`SDXL API error: ${response.status}`);
    }

    return await response.json();
  });
}

function getStyleGuidelines(style) {
  if (!style) return '';
  const era = (style.era || style.movement || style.category || '').toLowerCase();
  const guideMap = {
    'ancient': styleGuides.getAncientGreekRomanGuidelines,
    'medieval': styleGuides.getMedievalGuidelines,
    'renaissance': styleGuides.getRenaissanceGuidelines,
    'baroque': styleGuides.getBaroqueGuidelines,
    'impressionism': styleGuides.getImpressionismGuidelines,
    'korean': orientalArt.getKoreanArtGuidelines
  };
  return guideMap[era] ? guideMap[era]() : '';
}

export default handler;
