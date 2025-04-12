const choiceQuestions = [ 
    { question: "하루에 세안은 몇 번 하나요?", 
        choices: ["세안하지 않음", "1번", "2번", "3번", "4번 이상"] },
    { question: "보습제는 얼마나 자주 사용하나요?", 
        choices: ["매일 1회", "매일 2회 이상", "일주일에 몇 번", "거의 안 바름"] },
    { question: "자외선 차단제는 얼마나 자주 사용하나요?", 
        choices: ["매일 꼼꼼히 바름", "외출할 때만 바름", "가끔 잊고 안 바름", "거의 사용하지 않음"] },
    { question: "각질 제거는 얼마나 자주 하나요?", 
        choices: ["주 1회 이상 정기적으로", "피부 상태에 따라 가끔", "잘 하지 않음", "각질 제거 방법을 모르겠음"] },
    { question: "마스크팩은 어떻게 사용하나요?", 
        choices: ["매일 또는 거의 매일", "주 1~2회", "생각날 때만 함", "거의 안 함"] },
    { question: "피부 트러블이 생기면 어떻게 하나요?", 
        choices: ["전용 제품을 사용한다", "손으로 짠다", "피부과에 간다", "그냥 둔다"] },
    { question: "피부 열감이 느껴질 때 어떻게 하나요?", 
        choices: ["냉찜질이나 진정 제품 사용", "그냥 참는다", "찬물로 세안한다", "모른다"] },
    { question: "하루에 물은 얼마나 마시나요?", 
        choices: ["2L 이상", "1L 이상 2L 미만", "1L 미만", "거의 안 마심"] } 
    ];

const container = document.getElementById("choice-question-container");

choiceQuestions.forEach((item, i) => {
    const qNum = i + 1;
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = `${qNum}. ${item.question}`; // 여기가 핵심!
    fieldset.appendChild(legend);
  
    item.choices.forEach((choice, idx) => {
      const label = document.createElement("label");
      label.style.display = "block";
      
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `c${qNum}`;
      input.value = choice;
      if (idx === 0) input.required = true;
  
      label.appendChild(input);
      label.append(` ${choice}`);
      fieldset.appendChild(label);
    });
  
    container.appendChild(fieldset);
  });