// ✅ 1. 이미지 업로드 기능
const imageInput = document.getElementById('image-input');
const imageBox = document.getElementById('image-box');
const uploadBox = document.querySelector('.upload-box');

if (imageInput && imageBox && uploadBox) {
  imageInput.addEventListener('change', function () {
    const files = Array.from(this.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview';
        imageBox.insertBefore(img, uploadBox);
      };
      reader.readAsDataURL(file);
    });

    this.value = '';
  });
}

// ✅ 2. URL 파라미터 → form에 hidden input으로 추가
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const form = document.querySelector("form");
  if (!form) return;

  for (const [key, value] of params.entries()) {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = key;
    hidden.value = value;
    form.appendChild(hidden);
  }
});
