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

// 메인 핸들러 - FLUX Depth 사용
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

    console.log('🎨 FLUX Depth Dev Transfer - v43');
    console.log('💰 Cost: $0.04 (Premium Quality)');
    console.log('⚡ Speed: 5-7 seconds');
    console.log('🎯 Quality: 95% - Best Available');

    // 1. 이미지 분석
    const imageAnalysis = await analyzeImageForArtist(image);

    // 2. AI 아티스트 선택
    const guidelines = getStyleGuidelines(actualStyle);
    const artistSelection = await selectArtistWithAI(imageAnalysis, actualStyle, guidelines);

    // 3. 프롬프트 빌드
    let finalPrompt = buildArtistPrompt(actualPrompt, artistSelection.artist, actualStyle);
    finalPrompt = cleanupPrompt(finalPrompt);

    // 4. FLUX용 원본 프롬프트 사용 (SDXL 변환 제거)
    
    // 5. FLUX API 호출
    const response = await callFlux(image, finalPrompt, null);
    
    console.log('📸 SDXL Response:', response);
    
    // output URL 확인
    const outputUrl = response.output?.[0] || response.output || response.url;
    
    if (!outputUrl) {
      console.error('❌ No output URL in response:', response);
      throw new Error('No output URL received from SDXL');
    }

    res.status(200).json({
      ...response,
      output: outputUrl,
      url: outputUrl,
      selected_artist: artistSelection.artist,
      selection_method: artistSelection.method,
      model_used: 'FLUX Depth Dev',
      cost: 0.04,
      quality_score: 95
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function callFlux(image, prompt, negativePrompt) {
  return rateLimiter.addToQueue(async () => {
    // FLUX Depth Dev - 원본과 동일한 방식 사용
    console.log('🎨 Using FLUX Depth Dev - Quality First');
    
    const response = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-depth-dev/predictions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify({
          input: {
            control_image: image,
            prompt: prompt,
            num_inference_steps: 24,
            guidance: 12,
            control_strength: 0.80,
            output_format: 'jpg',
            output_quality: 90
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FLUX API Error:', response.status, errorText);
      if (response.status === 429) {
        const errorData = JSON.parse(errorText);
        const error = new Error(errorData.detail || 'Rate limited');
        error.status = 429;
        error.retry_after = errorData.retry_after || 10;
        throw error;
      }
      throw new Error(`FLUX API error: ${response.status}`);
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
