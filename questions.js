const questions = [ 
  { text: "세안 후 피부가 땅기거나 건조함을 느낀적이 자주 있다."},
  { text: "피부가 갈라지거나 각질이 일어나는 경우가 자주 있다."},
  { text: "건조한 계절(겨울 등)에는 얼굴이 쉽게 붉어지거나 따가워진다."},
  { text: "스킨/토너만으로는 당김이 가라앉지 않는다."},
  { text: "에어컨, 히터 바람에 피부가 쉽게 건조해진다."},
  { text: "아무것도 바르지 않으면 10분 이내에 피부가 뻣뻣해진다."},
  { text: "피부 당김이 볼, 턱, 입 주변에서 더 심하게 느껴진다."},
  { text: "T존(이마, 코)에 유분이 자주 올라온다."},
  { text: "오후가 되면 얼굴이 번들거리거나 기름져 보인다."},
  { text: "화장이 유분기 때문에 무너지거나 들뜬다."},
  { text: "유분이 많아 모공이 눈에 띄는 부위가 있다."},
  { text: "코나 이마에 피지가 자주 쌓이거나 블랙헤드가 보인다."},
  { text: "세안 후 금방 유분이 다시 올라온다."},
  { text: "유분기가 심한 날은 트러블도 같이 생기는 경향이 있다."},
  { text: "새로운 화장품을 사용하면 자극이나 따가움이 느껴지는 경우가 있다.",
    tooltip: "사용 직후 바로 자극이나 따가움이 느껴지는 경우"},
  { text: "피부가 쉽게 붉어지거나 열감이 생긴다."},
  { text: "피부가 얇고 혈관이 비쳐보인다."},
  { text: "스트레스를 받거나 피곤하면 피부가 민감해진다."},
  { text: "햇빛에 노출되면 피부가 쉽게 붉어지고 화끈거린다."},
  { text: "물 세안 또는 클렌징 제품 사용시 피부가 따갑거나 붉어지는 일이 잦다."},
  { text: "화장품을 사용할 때 이유 없이 피부가 따갑거나 간지러운 경우가 있다."},
  { text: "얼굴을 살짝만 손톱으로 긁어도 붉은 자국이 오래 남거나 가려움이 동반된적이 있다."},
  { text: "같은 부위에 반복적으로 여드름이나 뾰루지가 생긴다."},
  { text: "트러블이 화농성이나 염증성으로 발전하는 경우가 있다."},
  { text: "스트레스나 수면 부족이 트러블에 영향을 준다."},
  { text: "여드름이 자국으로 오래 남거나 진정이 더딘 편이다.",
    tooltip: "자주 반복적으로 그런 경우"},
  { text: "생리 전후로 항상 같은 부위에 트러블이 생기거나 피부 상태가 악화되는 경향이 있다."},
  { text: "마스크를 일정시간 이상 착용했을 때 턱, 볼 등에 트러블에 생긴다.",
    tooltip: "하루 또는 이틀만 착용해도 트러블이 나는 경우"},
  { text: "T존이나 턱처럼 피지가 많은 부위에 여드름이 자주 생기며 염증으로 악화되기도 한다."},
  { text: "탄력이 부족하고 피부가 늘어져 보인다."},
  { text: "피부톤이 칙칙하고 윤기가 부족하다."},
  { text: "피부가 얇아 외부 자극(바람, 마찰, 온도 변화)에 금방 붉어지거나 따가운 반응을 보인다."},
  { text: "세안 후 수분 제품을 바로 바르지 않으면 피부가 거칠고 당기며 탄력이 떨어진 느낌이 든다."},
  { text: "피부에 자극이 생기면 쉽게 붉어지고, 진정되기까지 오랜 시간이 걸린다."},
  { text: "각질 제거 후 평소보다 피부가 쉽게 붉어지고 며칠간 진정되지 않은 적이 있다."},
  { text: "피부에 자극이 생기면 쉽게 붉어지고, 진정되기까지 오랜 시간이 걸린다."},
  { text: "웃거나 찡그리는 표정 뒤에 눈가나 입가의 잔주름이 바로 사라지지 않고 남아 있는 경우가 많다."}
 ];



const container = document.getElementById("question-container");

questions.forEach(({ text, tooltip }, i) => {
  const qNum = i + 1;
  const fieldset = document.createElement("fieldset");

const legend = document.createElement("legend");

const questionText = document.createElement("span");
questionText.textContent = `${qNum}. ${text}`;

legend.style.display = "flex";
legend.style.justifyContent = "space-between";
legend.style.alignItems = "center";

legend.appendChild(questionText);

if (tooltip) {
  const wrapper = document.createElement("span");
  wrapper.className = "tooltip-wrapper";

  const tipButton = document.createElement("button");
  tipButton.textContent = "?";
  tipButton.type = "button";
  tipButton.className = "tooltip-button";

  const tooltipBox = document.createElement("div");
  tooltipBox.className = "tooltip-box";
  tooltipBox.textContent = tooltip;
  tooltipBox.style.display = "none";

  tipButton.addEventListener("click", () => {
    tooltipBox.style.display = tooltipBox.style.display === "none" ? "block" : "none";
  });

  wrapper.appendChild(tipButton);
  wrapper.appendChild(tooltipBox);
  legend.appendChild(wrapper);
}

  fieldset.appendChild(legend);

  const labels = ["매우 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"];
  labels.forEach((labelText, idx) => {
    const label = document.createElement("label");
    label.style.display = "block";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `q${qNum}`;
    input.value = idx + 1;
    if (idx === 0) input.required = true;
    label.appendChild(input);
    label.append(` ${labelText}`);
    fieldset.appendChild(label);
  });

  container.appendChild(fieldset);
});
