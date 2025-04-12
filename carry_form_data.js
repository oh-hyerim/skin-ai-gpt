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