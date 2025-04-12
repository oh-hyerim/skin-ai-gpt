import { OpenAI } from "openai";

export default async function handler(req, res) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { skinType, sensitive, trouble, barrier } = req.body;

  const prompt = `
다음은 한 사용자의 피부 정보입니다:

- 피부 타입: ${skinType}
- 민감도: ${sensitive}
- 트러블 발생 정도: ${trouble}
- 장벽/탄력 상태: ${barrier}

위 정보를 바탕으로 다음 항목을 포함한 피부 진단 리포트를 작성해주세요:

1. 피부 타입에 대한 설명  
2. 민감도 원인과 관리법  
3. 트러블에 대한 조언  
4. 장벽/탄력에 맞춘 관리법  
5. 전체적인 루틴 추천  
6. 현재 관리법이 잘 되고 있는지, 아니라면 그에 맞는 조언  
7. 현재 사용 중인 제품이 피부타입에 맞는지 여부와 추천 제품 설명  

피부 전문가처럼 친절하고 자세하게, 항목별로 구분해서 설명해주세요.  
너무 짧지 않게 500자 이상으로 작성해주세요.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 700,
    });

    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI 호출 실패:", error);
    res.status(500).json({ error: "GPT 호출 실패" });
  }
}
