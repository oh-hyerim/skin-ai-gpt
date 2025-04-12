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
  
      // AI 결과만 표시
      document.getElementById("ai-result").textContent = data.result;
  
    } catch (error) {
      document.getElementById("ai-result").textContent = "AI 결과를 불러오는데 실패했어요.";
    }
  });