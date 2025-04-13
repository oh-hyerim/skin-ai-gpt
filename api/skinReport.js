import { OpenAI } from "openai";

export default async function handler(req, res) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const {
    skinType = "정보 없음",
    sensitive = "정보 없음",
    trouble = "정보 없음",
    barrier = "정보 없음",
    routineSummary = "정보 없음",
    choiceSummary = "정보 없음",
    productSummary = "정보 없음",
  } = req.body;

  const prompt = `
당신은 피부 전문가입니다.
다음은 한 사용자의 피부 정보입니다:

1. 피부 타입: ${skinType}
2. 민감도: ${sensitive}
3. 트러블 발생 정도: ${trouble}
4. 피부 장벽 및 탄력 상태: ${barrier}
5. 루틴 예/아니오 답변 요약: ${routineSummary}
6. 루틴 선택형 질문 요약: ${choiceSummary}
7. 현재 사용 중인 제품 목록: ${productSummary}

아래 항목에 따라 각각 250자 이상으로 분석 및 조언을 해주세요. 너무 일반적인 조언보다는, 위 사용자의 답변에 근거한 **개인 맞춤형** 분석을 해주세요.

번호와 제목을 반드시 포함해 주세요:

1. 피부 타입 분석  
→ 피부 타입 특성 설명 + 사용자의 타입에 맞는 스킨케어 방향 제시

2. 민감도 분석  
→ 민감도 수치에 따른 위험요인과 민감성 진정법, 회피 요인 조언

3. 트러블 경향  
→ 여드름, 뾰루지 등 트러블이 발생할 가능성 및 예방 루틴 제안

4. 피부 장벽 및 탄력  
→ 장벽이 약할 경우의 보습 루틴, 탄력 강화를 위한 성분이나 습관 조언

5. 전체 루틴 피드백  
→ 예/아니오 루틴 응답과 피부타입, 민감도 분석, 트러블 경향, 피부 장벽 및 탄력 기반, 누락된 관리나 잘못된 습관 분석

6. 현재 루틴에서 주의할 점  
→ 선택형 루틴 응답과 피부타입, 민감도 분석, 트러블 경향, 피부 장벽 및 탄력 기반, 자극 가능성 or 비효율적인 루틴 지적

7. 제품 사용 분석 및 추천  
→ 현재 제품 목록과 피부 타입, 민감도 분석, 트러블 경향, 피부 장벽 및 탄력 비교 후, 적절성 평가 + 추천 성분

사용자가 납득할 수 있는 신뢰 있는 조언을 피부 전문가처럼 친절하고 부드럽게 작성해 주세요.
단, 정보가 부족하거나 제품을 사용하지 않은 경우에도 '분석이 어렵다'는 말보다는, '현재 상태에서 유지해도 되는지 여부' 또는 '추천되는 개선 방향'을 알려주세요.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1800,
    });

    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI 호출 실패:", error);
    res.status(500).json({ error: "GPT 호출 실패" });
  }
}
