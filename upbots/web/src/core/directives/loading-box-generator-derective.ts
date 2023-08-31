import Vue from "vue";

// generate HTML with loading indicator inside
const loadingBoxGenerator = () => {
  const box = document.createElement("div");
  box.className = "page-preloader__inner absolute top-0 left-0 h-full w-full flex items-center justify-center z-210";
  box.innerHTML = `
    <div class="page-preloader__wrap relative">
      <div class="page-preloader__item absolute border-4 border-solid border-blue-cl-400 opacity-100 rounded-full"></div>
      <div class="page-preloader__item absolute border-4 border-solid border-blue-cl-400 opacity-100 rounded-full"></div>
    </div>
  `;

  return box;
};

Vue.directive("loading", {
  update(el, { value }) {
    // check for "position" property if already exist
    const position = window.getComputedStyle(el).position;
    if (position !== "relative") {
      el.style.position = "relative";
    }

    // loader node
    const existedLoader = el.querySelector(".page-preloader__inner");

    if (value) {
      if (existedLoader) return;

      const $loader = loadingBoxGenerator();
      el.append($loader);
    } else {
      if (!existedLoader) return;

      el.style.removeProperty("position");
      existedLoader.remove();
    }
  },
});
