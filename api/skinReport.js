import { OpenAI } from "openai";

export default async function handler(req, res) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const {
    skinType,
    sensitive,
    trouble,
    barrier,
    routineSummary,
    choiceSummary,
    productSummary
  } = req.body;

  const prompt = `
당신은 피부 전문가입니다.  
다음은 한 사용자의 피부 상태 및 루틴/제품 정보입니다.

- 피부 타입: ${skinType}
- 민감도: ${sensitive}
- 트러블 발생 정도: ${trouble}
- 장벽/탄력 상태: ${barrier}
- 루틴 예/아니오 응답: ${routineSummary}
- 루틴 선택형 응답: ${choiceSummary}
- 현재 사용하는 제품: ${productSummary}

다음 항목을 기준으로 각각 250~350자 정도의 분석과 조언을 주세요. 항목은 번호와 제목으로 구분해주세요.

1. 피부 타입 분석  
2. 민감도 분석  
3. 트러블 경향  
4. 피부 장벽 및 탄력  
5. 전체 루틴 피드백  
6. 현재 루틴에서 주의할 점  
7. 제품 사용 분석 및 추천

피부 전문가처럼 친절하고 신뢰가는 어조로 작성해주세요.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI 호출 실패:", error);
    res.status(500).json({ error: "GPT 호출 실패" });
  }
}
