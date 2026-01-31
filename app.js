const app = document.querySelector("#app");

// 페이지 컴포넌트들
const pages = {
  "/": function () {
    return `
      <div>
        <h1>메인 페이지</h1>
      </div>
    `;
  },
  "/introduce": function () {
    return `
      <div>
        <h1>자기소개 페이지</h1>
      </div>
    `;
  },
  "/stopwatch": function () {
    return `
      <div>
        <h1>스톱워치 페이지</h1>
      </div>
    `;
  },
};

// 라우터
function router() {
  const hash = window.location.hash.slice(1) || "/";
  const page = pages[hash] || pages["/"];

  app.innerHTML = page();

  // 활성 메뉴 표시
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.route === hash) {
      link.classList.add("active");
    }
  });
}

// 이벤트 리스너
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
