const routineQuestions = [ 
    "아침에도 세안을 한다",
    "아침에 클렌징폼이나 젤 등을 사용한다",
    "세안 시간은 평균 30초 이상이다",
    "미온수로 세안한다",
    "세안 후 바로 기초 제품을 바른다",
    "토너나 스킨을 바른다",
    "에센스나 세럼을 사용한다",
    "보습제 또는 수분크림을 사용한다",
    "자외선 차단제를 매일 바른다",
    "피부 고민에 따라 제품을 바꾸거나 추가한다",
    "손으로 제품을 바른다",
    "화장솜을 사용해서 바른다",
    "제품을 두드려서 흡수시킨다",
    "제품을 문질러서 흡수시킨다",
    "제품을 바를 때 충분한 흡수 시간을 준다",
    "피부에 열감이 느껴지면 별도로 진정시킨다",
    "주 1회 이상 각질 제거를 한다",
    "마스크팩을 주기적으로 사용한다",
    "흡연이나 음주를 한다",
    "하루에 물을 1L 이상 마신다"
];

const container = document.getElementById("routine-question-container");

routineQuestions.forEach((text, i) => {
  const qNum = i + 1;

  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = `${qNum}. ${text}`;
  fieldset.appendChild(legend);

  const yesLabel = document.createElement("label");
  const yesInput = document.createElement("input");
  yesInput.type = "radio";
  yesInput.name = `r${qNum}`;
  yesInput.value = "yes";
  yesInput.required = true;
  yesLabel.appendChild(yesInput);
  yesLabel.append(` 예`);

  const noLabel = document.createElement("label");
  const noInput = document.createElement("input");
  noInput.type = "radio";
  noInput.name = `r${qNum}`;
  noInput.value = "no";
  noLabel.appendChild(noInput);
  noLabel.append(` 아니오`);

  fieldset.appendChild(yesLabel);
  fieldset.appendChild(noLabel);

  container.appendChild(fieldset);
});