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

다음은 한 사용자의 피부 정보 및 루틴/제품 응답입니다:

- 피부 타입: ${skinType || "응답 없음"}
- 민감도: ${sensitive || "응답 없음"}
- 트러블 발생 정도: ${trouble || "응답 없음"}
- 장벽/탄력 상태: ${barrier || "응답 없음"}
- 루틴 예/아니오 응답: ${routineSummary}
- 루틴 선택형 응답: ${choiceSummary}
- 현재 사용하는 제품: ${productSummary}

아래 항목에 대해 전문가의 관점에서 정확하고 구체적으로 분석해 주세요:

1. **피부 타입 분석**  
→ 위의 "피부 타입" 항목을 기반으로 분석하며, 피부 관리가 잘 되어있는 경우라도 향/알코올 등 일반적인 리스크 요인 언급은 제외하고 실제 피부 상태만 반영해 주세요.

2. **민감도 분석**  
→ 민감성 수치가 높을 경우, 그에 따른 가능한 증상과 관리 팁을 알려주세요. 정보가 부족할 경우는 가능한 예측 기반으로 작성하되, 무조건적인 경고는 삼가 주세요.

3. **트러블 경향**  
→ 트러블 발생 정도를 기반으로 주요 원인을 분석하고, 예방을 위한 스킨케어 습관을 조언해 주세요.

4. **피부 장벽 및 탄력 상태**  
→ 장벽/탄력이 무너졌다면 그에 맞는 진정·보습 케어 방향을 구체적으로 제시해 주세요. “노화 예방이 중요하다” 같은 추상적 조언은 지양해 주세요.

5. **전체 루틴 피드백**  
→ 피부 타입, 민감도 분석, 트러블 경향, 피부 장벽 및 탄력을 기반으로 루틴에서 문제가 되는 부분이 있다면 구체적으로 짚어 주세요. 피부 타입과 충돌하는 부분이 있다면 예를 들어 설명해 주세요.

6. **현재 루틴에서 주의할 점**  
→ 예/아니오 및 선택형 응답과 피부 타입, 민감도 분석, 트러블 경향, 피부 장벽 및 탄력을 바탕으로 민감성/트러블/장벽에 부정적인 영향을 줄 수 있는 루틴이 있다면 구체적으로 알려 주세요.

7. **제품 사용 분석 및 추천**  
→ 입력된 제품 정보가 있다면, 성분을 유추하거나 이름을 기반으로 해당 피부 타입에 적절한지 분석해 주세요.  
→ 제품 입력이 없거나 부족하다면 단순히 “피부과 상담” 같은 말은 피하고, “수부지 피부에 적합한 토너는 ○○ 성분 기반이 좋습니다”와 같이 피부 타입별 성분 추천 중심으로 설명해 주세요.

**형식:**  
- 각 항목은 번호 + 제목으로 시작  
- 각 항목당 250~350자 사이  
- 전문가 상담 느낌의 신뢰감 있는 어조  
- 뻔하고 일반적인 문장은 제외하고, 실제 주어진 정보를 최대한 활용해 정밀하게 작성

결과는 바로 사용자에게 전달될 예정입니다.
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
