window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);

  // 값이 비어 있을 경우 기본값 설정
  const skinType = params.get("skinType") || "중성";
  const sensitive = params.get("sensitive") || "보통";
  const trouble = params.get("trouble") || "보통";
  const barrier = params.get("barrier") || "보통";

  // 루틴/제품 관련 파라미터 수집
  const routineParams = Array.from(params.entries()).filter(([key]) => key.startsWith("r"));
  const choiceParams = Array.from(params.entries()).filter(([key]) => key.startsWith("c"));
  const productParams = Array.from(params.entries()).filter(([key]) => key.includes("product"));

  // 요약 텍스트로 병합
  const routineSummary = routineParams.length
    ? routineParams.map(([key, val]) => `${key}: ${val}`).join(", ")
    : "응답 없음";

  const choiceSummary = choiceParams.length
    ? choiceParams.map(([key, val]) => `${key}: ${val}`).join(", ")
    : "응답 없음";

  const productSummary = productParams.length
    ? productParams.map(([key, val]) => `${key}: ${val}`).join(", ")
    : "응답 없음";

  // 확인용 콘솔 로그
  console.log("서버로 전송할 데이터:", {
    skinType,
    sensitive,
    trouble,
    barrier,
    routineSummary,
    choiceSummary,
    productSummary
  });

  try {
    const response = await fetch("/api/skinReport", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        skinType,
        sensitive,
        trouble,
        barrier,
        routineSummary,
        choiceSummary,
        productSummary
      }),
    });

    const data = await response.json();
    console.log("AI 응답 결과:", data);

    const content = data.result;
    const sections = content.split(/\n?\d\.\s/).slice(1); // 번호 기준 나누기

    sections.forEach((text, idx) => {
      const card = document.querySelector(`#card-${idx + 1} p`);
      if (card) card.textContent = text.trim();
    });
  } catch (err) {
    console.error("에러 발생:", err);
    document.querySelector("#ai-result-cards").innerHTML =
      "<p>AI 결과를 불러오지 못했습니다.</p>";
  }
});
