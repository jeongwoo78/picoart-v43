// styleGuides.js - 미술사조별 스타일 가이드라인
// flux-transfer.js에서 분리된 스타일 가이드 함수들

// ========================================
// 사조별 화가 가이드라인 함수
// ========================================

// 고대 그리스-로마 (2가지 스타일)
export function getAncientGreekRomanGuidelines() {
  return `
Available Ancient Greek-Roman Styles (2가지):

⭐ STYLE 1: CLASSICAL SCULPTURE (고대 그리스-로마 조각)
   - For: PEOPLE-FOCUSED PHOTOS - people占 40% or more of composition
   - PRIORITY: Dynamic movement/action/sports (regardless of composition)
   - Examples: Sports action shots (any composition)
              Portrait close-ups (people dominant)
              Upper body shots (people 70%+)
              Group photos where people fill significant portion
              Any photo where human figures are main visual focus
   - Material: Pure white marble only (classical aesthetic)
   - Technique: Dynamic poses, visible pupils in eyes, sculptural curls
   - Polychromy: Marble includes subtle painted details (eyes, lips, clothing)
   - Background: Simple plain neutral background
   - Aesthetic: Classical Greek/Roman white marble sculpture

⭐ STYLE 2: ROMAN MOSAIC (로마 모자이크)
   - For: LANDSCAPE-FOCUSED PHOTOS - people占 less than 40% OR no people
   - Examples: Wide landscape shots with small distant people
              Nature scenes where scenery dominates
              Mountains, rivers, sky, trees as main subject
              People as small elements in large environment
              Flowers, plants, objects without people
   - Technique: Clearly visible tesserae tiles with distinct grout lines
   - Aesthetic: Roman floor/wall mosaic, jewel-tone colors

🎯 KEY DECISION RULE - COMPOSITION BASED:
1. Is there DYNAMIC ACTION/SPORTS? → SCULPTURE (priority!)
2. Do people占 40% or MORE of the photo? → SCULPTURE
3. Do people占 LESS than 40% (landscape dominant)? → MOSAIC
4. No people (flowers, nature, objects)? → MOSAIC

Examples:
- Volleyball game = SCULPTURE (dynamic action)
- Scuba diving portrait = SCULPTURE (people 45%)
- Couple close-up = SCULPTURE (people 80%)
- Mountain landscape with tiny hikers = MOSAIC (people 5%)
- Pure flower photo = MOSAIC (no people)`;
}

// 중세 미술 (4가지 스타일)
export function getMedievalGuidelines() {
  return `
⭐ Medieval Art (4 styles) RULES:

🎯 PORTRAIT/UPPER BODY (face clearly visible):
   → Mix Byzantine (30%) + Gothic (25%) + Romanesque (20%) + Islamic miniature (25%)
   → Islamic Miniature: Persian court painting, delicate figures, gold details
   → AVOID photorealistic rendering, maintain flat medieval aesthetic

🏞️ LANDSCAPE/ARCHITECTURE/FULL BODY (face not dominant):
   → AI chooses ONE from Byzantine/Gothic/Romanesque/Islamic geometric
   → Islamic Geometric: patterns, arabesques, tessellations (NO figures)
   → NO Islamic miniature for landscapes (miniature is people-only)`;
}

// 르네상스 (5명 화가 자동 선택)
export function getRenaissanceGuidelines() {
  return `
⭐ Renaissance Era (v46 남성 최적화):

🎯 MALE PORTRAITS/UPPER BODY:
   → 70% Titian focus (베네치아 초상화 전통)
   → Venetian golden glow, rich fabrics
   → Noble masculine presence

👥 FEMALE PORTRAITS/UPPER BODY:
   → 80% Leonardo da Vinci focus (모나리자 스푸마토)
   → Sfumato technique, mysterious smile
   → Ethereal feminine beauty

🏃 FULL BODY (any gender):
   → Michelangelo for males (heroic David-like)
   → Botticelli for females (Venus grace)
   → Raphael as balanced alternative

Available Artists:
- Leonardo da Vinci (female portraits)
- Michelangelo (male full body)
- Raphael (balance)
- Botticelli (female full body)
- Titian (male portraits)`;
}

// 바로크 (5명 화가 자동 선택)
export function getBaroqueGuidelines() {
  return `
⭐ Baroque Artists (AI selects based on image):
- Rembrandt: Dramatic lighting, deep shadows (best for portraits)
- Vermeer: Soft light, intimate scenes (best for indoor/domestic)
- Velázquez: Royal portraits, Spanish court
- Caravaggio: Extreme chiaroscuro, dramatic tension
- Rubens: Dynamic movement, rich colors`;
}

// 로코코 (2명 화가)
export function getRococoGuidelines() {
  return `
⭐ Rococo Artists (AI selects):
- Watteau: Pastoral elegance, soft pastels
- Fragonard: Playful romance, garden scenes`;
}

// 신고전주의/낭만주의/사실주의 (7명 화가, AI가 사조 선택)
export function getNeoclassicalRomanticismRealismGuidelines() {
  return `
⭐ 19th Century (AI selects movement & artist):

📐 Neoclassical (order, ideal beauty):
- David: Heroic, stoic, republican virtue
- Ingres: Perfect line, oriental themes

🌅 Romantic (emotion, nature):
- Turner: Atmospheric light, sublime nature
- Friedrich: Solitary figures in vast landscapes
- Delacroix: Exotic, passionate, oriental themes

👁️ Realist (everyday truth):
- Millet: Rural workers, peasant dignity
- Manet: Modern life, bold contrasts`;
}

// 인상주의 (4명 화가)
export function getImpressionismGuidelines() {
  return `
⭐ Impressionist Artists (AI selects):
- Monet: Light effects, water lilies, haystacks
- Renoir: Joyful gatherings, warm skin tones
- Degas: Ballet dancers, unusual angles
- Morisot: Feminine perspective, domestic scenes`;
}

// 후기 인상주의 (4명 화가)
export function getPostImpressionismGuidelines() {
  return `
⭐ Post-Impressionist Artists (AI selects):
- Van Gogh: Swirling brushstrokes, emotional intensity
- Gauguin: Flat colors, Tahitian themes
- Cézanne: Geometric forms, multiple viewpoints
- Seurat: Pointillist dots, scientific color`;
}

// 야수파 (3명 화가)
export function getFauvismGuidelines() {
  return `
⭐ Fauvist Artists (AI selects):
- Matisse: Bold colors, decorative patterns
- Derain: London bridges, vivid landscapes
- Vlaminck: Explosive brushwork, raw emotion`;
}

// 표현주의 (5명 화가)
export function getExpressionismGuidelines() {
  return `
⭐ Expressionist Artists (AI selects):
- Munch: Existential anxiety, The Scream
- Schiele: Twisted figures, raw sexuality
- Kirchner: Angular forms, urban alienation
- Nolde: Religious ecstasy, primitive power
- Marc: Spiritual animals, pure colors`;
}
// Export all functions
module.exports = {
  getAncientGreekRomanGuidelines,
  getMedievalGuidelines,
  getRenaissanceGuidelines,
  getBaroqueGuidelines,
  getRococoGuidelines,
  getNeoclassicalRomanticismRealismGuidelines,
  getImpressionismGuidelines,
  getPostImpressionismGuidelines,
  getFauvismGuidelines,
  getExpressionismGuidelines
};
