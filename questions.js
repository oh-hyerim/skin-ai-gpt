const questions = [
        "이마에 자주 기름이 돈다",
        "피부가 쉽게 붉어지거나 자극을 느낀다",
        "세안 후 얼굴이 땅기는 느낌이 든다",
        "새로운 화장품에 자극을 느낀 적이 있다",
        "피부가 쉽게 가렵거나 따끔한 느낌이 든다",
        "턱이나 볼에 여드름이 자주 생긴다",
        "볼이나 턱 주변에 각질이 자주 일어난다",
        "오후쯤 되면 얼굴에 유분이 많이 올라온다",
        "입 주변이 특히 빨리 당긴다",
        "각질이 얇게 일어나거나 눈에 띄는 편이다",
        "코 주변이 쉽게 반짝인다",
        "화장이 자주 들뜨거나 각질이 일어난다",
        "피부가 자주 가렵거나 따가운 느낌이 든다",
        "스트레스를 받으면 피부에 트러블이 생긴다",
        "피부가 얇고, 혈관이 잘 보인다",
        "모공이 눈에 띄게 커 보이는 부분이 있다",
        "세안 후 아무것도 안 바르면 10분 안에 피부가 뻣뻣해진다",
        "피부에 갈라지는 느낌이 난 적이 있다",
        "여드름이 항상 나는 부위가 있다",
        "화장을 하면 유분 때문에 무너지는 편이다",
        "손톱으로 살짝만 긁어도 피부가 빨갛게 변한다",
        "생리 전후로 피부에 변화가 생긴다",
        "마스크를 쓰면 턱, 볼 등에 트러블이 난다",
        "화장 전에 각질이 들뜨지 않게 하기 위해 따로 케어를 한다",
        "기초 제품을 여러 번 덧발라야 건조함이 사라진다",
        "건조한 환경(에어컨, 히터 등)에서 피부가 거칠어진다",
        "모공이 축 처져 보인다",
        "여드름이 화농성으로 발전하는 경우가 있다",
        "손으로 자주 만지는 곳에 여드름이 난다",
        "건조함 때문에 피부 표면이 트거나 갈라진 적이 있다",
        "피지 분비가 많은 부위에서 뾰루지가 잘 생긴다",
        "피부에 열감이 생기면 민감하게 반응한다",
        "피부가 쉽게 붉어지고 홍조가 자주 나타난다",
        "기초 제품을 바른 후에도 각질이 올라온다",
        "유분이 많은 날은 트러블도 같이 생긴다",
        "화장 후 시간이 지나면 유분으로 인해 무너진다",
        "햇빛에 오래 노출되면 화끈거리거나 예민해진다",
        "날씨나 환경 변화에 따라 피부 반응이 심하다",
        "건조해서 급하게 스킨이나 크림을 바른 적이 있다",
        "화장품을 바르면 따갑거나 간지러운 경우가 있다",
        "피부가 뻣뻣하고 표면이 거칠게 느껴진다",
        "스트레스나 피로가 쌓이면 피부 톤이 칙칙해진다",
        "턱, 이마, 콧망울 등 특정 부위에만 뾰루지가 집중된다",
        "화장을 하면 주로 볼 주변에서 뜨거나 갈라진다",
        "세안 후 피부가 당기면서도 T존에는 유분이 올라온다"
      ];
      
      const container = document.getElementById("question-container");

      questions.forEach((text, i) => {
        const qNum = i + 1;
      
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = `${qNum}. ${text}`;
        fieldset.appendChild(legend);
      
        const labels = ["매우 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"];
        labels.forEach((labelText, idx) => {
          const label = document.createElement("label");
          label.style.display = "block"; // 라벨 줄바꿈!
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
      