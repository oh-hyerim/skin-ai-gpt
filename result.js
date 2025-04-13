window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const skinType = params.get("skinType");
  const sensitive = params.get("sensitive");
  const trouble = params.get("trouble");
  const barrier = params.get("barrier");

  try {
    const response = await fetch("/api/skinReport", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skinType, sensitive, trouble, barrier }),
    });

    const data = await response.json();
    const content = data.result;

    // 항목별로 파싱
    const sections = content.split(/\n?\d\.\s/).slice(1); // 숫자. 제목 기준으로 분리

    sections.forEach((text, idx) => {
      const card = document.querySelector(`#card-${idx + 1} p`);
      if (card) card.textContent = text.trim();
    });
  } catch (err) {
    document.querySelector("#ai-result-cards").innerHTML = "<p>AI 결과를 불러오지 못했습니다.</p>";
  }
});
