import Vue from "vue";

export const lazyLoad = {
  inserted: (el: any) => {
    function loadImage() {
      const imageElement: any = Array.from(el.children).find((el: any) => el.nodeName === "IMG");
      if (imageElement) {
        imageElement.addEventListener("load", () => {
          setTimeout(() => el.classList.add("loaded"), 100);
        });
        // eslint-disable-next-line no-console
        imageElement.addEventListener("error", () => console.log("error"));
        imageElement.src = imageElement.dataset.url;
      }
    }

    function handleIntersect(entries: any, observer: any) {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.unobserve(el);
        }
      });
    }

    function createObserver() {
      const options: any = { root: null, threshold: "0" };
      const observer = new IntersectionObserver(handleIntersect, options);
      observer.observe(el);
    }
    if (window.IntersectionObserver) {
      createObserver();
    } else {
      loadImage();
    }
  },
};

Vue.directive("lazyload", lazyLoad);
