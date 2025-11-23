#!/bin/bash
# deploy-to-vercel.sh - Vercel 배포 스크립트

echo "🚀 PicoArt v42 Vercel 배포 준비"
echo "================================"

# 1. 환경변수 체크
echo "📋 환경변수 체크..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local 파일이 없습니다!"
    echo "   .env.example을 복사해서 생성하세요:"
    echo "   cp .env.example .env.local"
    exit 1
fi

# 2. 빌드 테스트
echo "🔨 로컬 빌드 테스트..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패!"
    exit 1
fi

# 3. Git 상태 확인
echo "📝 Git 상태 확인..."
git status

# 4. 커밋
echo "💾 변경사항 커밋..."
git add .
git commit -m "v42: Refactoring complete - Ready for SDXL migration"

# 5. Vercel 배포
echo "🚀 Vercel 배포 시작..."
vercel --prod

echo ""
echo "✅ 배포 완료!"
echo ""
echo "📌 Vercel 대시보드에서 확인할 사항:"
echo "1. Environment Variables 설정:"
echo "   - REPLICATE_API_KEY"
echo "   - ANTHROPIC_API_KEY"
echo "2. Function Logs 확인"
echo "3. 배포 URL 테스트"
