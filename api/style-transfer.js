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

    console.log('🎨 SDXL img2img Transfer - v43');
    console.log('💰 Cost: $0.012 (70% savings vs FLUX)');
    console.log('⚡ Speed: 2-3 seconds');

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
      model_used: 'SDXL img2img',
      cost: 0.012,
      savings: '70% vs FLUX'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function callSDXL(image, prompt, negativePrompt) {
  return rateLimiter.addToQueue(async () => {
    // SDXL img2img - 최적 가격/성능 ($0.012)
    const response = await fetch(
      'https://api.replicate.com/v1/predictions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait=60'
        },
        body: JSON.stringify({
          version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',  // SDXL img2img
          input: {
            image: image,  // 입력 이미지
            prompt: prompt,
            negative_prompt: negativePrompt || "worst quality, low quality, normal quality",
            num_inference_steps: 20,
            guidance_scale: 7.5,
            prompt_strength: 0.8,  // 원본 이미지 유지 정도
            scheduler: "DPMSolverMultistep",
            num_outputs: 1,
            refine: "expert_ensemble_refiner",  // 품질 향상
            refine_steps: 10,
            apply_watermark: false
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SDXL API Error:', response.status, errorText);
      if (response.status === 429) {
        const errorData = JSON.parse(errorText);
        const error = new Error(errorData.detail || 'Rate limited');
        error.status = 429;
        error.retry_after = errorData.retry_after || 10;
        throw error;
      }
      throw new Error(`SDXL API error: ${response.status}`);
    }

    const data = await response.json();
    
    // 비동기 처리 대기
    if (data.status !== 'succeeded') {
      // prediction ID로 결과 대기
      const finalResult = await waitForResult(data.id);
      return finalResult;
    }
    
    return data;
  });
}

// Prediction 결과 대기
async function waitForResult(predictionId) {
  const maxAttempts = 60;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
        }
      }
    );
    
    const prediction = await response.json();
    
    if (prediction.status === 'succeeded') {
      return prediction;
    }
    
    if (prediction.status === 'failed') {
      throw new Error('Prediction failed');
    }
    
    attempts++;
  }
  
  throw new Error('Timeout waiting for result');
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
