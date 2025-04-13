const questions = [
  { text: "이마에 자주 기름이 돈다" },
  { text: "피부가 쉽게 붉어지거나 자극을 느낀다", tooltip: "외부 자극에 예민한 경우 피부톤 변화나 화끈거림이 동반될 수 있어요." },
  { text: "세안 후 얼굴이 땅기는 느낌이 든다" },
  { text: "새로운 화장품에 자극을 느낀 적이 있다", tooltip: "피부 타입과 성분 궁합이 맞지 않으면 가려움, 따가움 등이 생기기도 해요." },
  { text: "피부가 쉽게 가렵거나 따끔한 느낌이 든다", tooltip: "건조하거나 예민한 피부일수록 잔 자극에도 반응할 수 있어요." },
  { text: "턱이나 볼에 여드름이 자주 생긴다" },
  { text: "볼이나 턱 주변에 각질이 자주 일어난다" },
  { text: "오후쯤 되면 얼굴에 유분이 많이 올라온다" },
  { text: "입 주변이 특히 빨리 당긴다" },
  { text: "각질이 얇게 일어나거나 눈에 띄는 편이다", tooltip: "피부가 건조하면 각질층이 들뜨거나 하얗게 일어날 수 있어요." },
  { text: "코 주변이 쉽게 반짝인다" },
  { text: "화장이 자주 들뜨거나 각질이 일어난다" },
  { text: "피부가 자주 가렵거나 따가운 느낌이 든다" },
  { text: "스트레스를 받으면 피부에 트러블이 생긴다" },
  { text: "피부가 얇고, 혈관이 잘 보인다", tooltip: "피부 장벽이 약하거나 민감한 경우 피부 속 모세혈관이 비칠 수 있어요." },
  { text: "모공이 눈에 띄게 커 보이는 부분이 있다" },
  { text: "세안 후 아무것도 안 바르면 10분 안에 피부가 뻣뻣해진다" },
  { text: "피부에 갈라지는 느낌이 난 적이 있다" },
  { text: "여드름이 항상 나는 부위가 있다" },
  { text: "화장을 하면 유분 때문에 무너지는 편이다" },
  { text: "손톱으로 살짝만 긁어도 피부가 빨갛게 변한다", tooltip: "민감한 피부는 작은 자극에도 쉽게 붉어질 수 있어요." },
  { text: "생리 전후로 피부에 변화가 생긴다", tooltip: "호르몬 변화로 인해 트러블이 생기거나 예민해질 수 있어요." },
  { text: "마스크를 쓰면 턱, 볼 등에 트러블이 난다", tooltip: "마스크 내 습기와 마찰이 피부 트러블을 유발할 수 있어요." }
];

const container = document.getElementById("question-container");

questions.forEach(({ text, tooltip }, i) => {
  const qNum = i + 1;
  const fieldset = document.createElement("fieldset");

  const legend = document.createElement("legend");
  legend.textContent = `${qNum}. ${text}`;

  if (tooltip) {
    const tip = document.createElement("span");
    tip.textContent = " ?";
    tip.title = tooltip;
    tip.style.cursor = "pointer";
    tip.style.color = "#888";
    tip.style.marginLeft = "5px";
    legend.appendChild(tip);
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