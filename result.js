window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);

  const skinType = params.get("skinType");
  const sensitive = params.get("sensitive");
  const trouble = params.get("trouble");
  const barrier = params.get("barrier");

  const routineParams = Array.from(params.entries()).filter(([key]) => key.startsWith("r"));
  const choiceParams = Array.from(params.entries()).filter(([key]) => key.startsWith("c"));
  const productParams = Array.from(params.entries()).filter(([key]) => key.includes("product"));

  const routineSummary = routineParams.map(([key, val]) => `${key}: ${val}`).join(", ");
  const choiceSummary = choiceParams.map(([key, val]) => `${key}: ${val}`).join(", ");
  const productSummary = productParams.map(([key, val]) => `${key}: ${val}`).join(", ");

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
    console.log("서버 응답 데이터:", data);

    document.getElementById("ai-result").textContent =
      data.result || "AI 결과를 불러오지 못했어요.";

    // 카드에 내용 분배
    const content = data.result;
    const sections = content.split(/\n?\d\.\s/).slice(1); // '1. 제목' 형식 기준 분리

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
