const imageInput = document.getElementById('image-input');
const imageBox = document.getElementById('image-box');
const uploadBox = document.querySelector('.upload-box');
const uploadedFileNames = new Set();

if (imageInput && imageBox && uploadBox) {
  imageInput.addEventListener('change', function () {
    const files = Array.from(this.files);

    files.forEach(file => {
      if (uploadedFileNames.has(file.name)) {
        alert(`이미 "${file.name}" 파일이 업로드되어 있습니다.`);
        return;
      }

      uploadedFileNames.add(file.name);

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
}   hidden.type = "hidden";
    hidden.name = key;
    hidden.value = value;
    form.appendChild(hidden);
  }
});
