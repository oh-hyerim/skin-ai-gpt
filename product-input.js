const products = [ { label: "스킨 / 토너", name: "toner" }, { label: "에센스 / 세럼", name: "essence" }, { label: "크림 / 수분크림", name: "cream" }, { label: "자외선 차단제", name: "sunscreen" } ];

const container = document.getElementById("product-container");

products.forEach(({ label, name }) => { const group = document.createElement("div"); group.className = "product-group"; group.dataset.type = name;

const title = document.createElement("label"); title.textContent = label; group.appendChild(title);

const wrapper = document.createElement("div"); wrapper.className = "input-wrapper";

const createInputPair = () => { const pair = document.createElement("div"); pair.className = "input-pair";

const brandInput = document.createElement("input"); brandInput.type = "text"; brandInput.name = `${name}_brand[]`; brandInput.placeholder = "브랜드명"; const productInput = document.createElement("input"); productInput.type = "text"; productInput.name = `${name}_product[]`; productInput.placeholder = "제품명"; const removeBtn = document.createElement("button"); removeBtn.type = "button"; removeBtn.textContent = "-"; removeBtn.className = "remove-button"; removeBtn.addEventListener("click", () => { wrapper.removeChild(pair); }); pair.appendChild(brandInput); pair.appendChild(productInput); pair.appendChild(removeBtn); return pair; 

};

const firstPair = createInputPair(); wrapper.appendChild(firstPair);

const addBtn = document.createElement("button"); addBtn.type = "button"; addBtn.className = "add-button"; addBtn.textContent = "+"; addBtn.addEventListener("click", () => { const newPair = createInputPair(); wrapper.insertBefore(newPair, addBtn); });

wrapper.appendChild(addBtn); group.appendChild(wrapper); container.appendChild(group); });

