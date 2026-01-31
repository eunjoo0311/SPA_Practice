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
      <div class="introduce">
        <h1>자기소개</h1>
        <div class="profile">
          <div class="profile-info">
            <h2>Hi there 👋</h2>
            <p>안녕하세요, 프론트엔드 개발자 이은주입니다.</p>
          </div>
        </div>
        <div class="section">
          <h3>기본 정보</h3>
          <ul>
            <li><strong>이름:</strong> 이은주</li>
            <li><strong>전화번호:</strong> 010-1111-1111</li>
            <li><strong>위치:</strong> 수원, 대한민국</li>
          </ul>
        </div>
        <div class="section">
          <h3>기술 스택</h3>
          <ul>
            <li>HTML / CSS / JavaScript</li>
            <li>React</li>
          </ul>
        </div>
        <div class="section">
          <h3>관심 분야</h3>
          <p>프론트엔드 개발, UI/UX 디자인, 웹 접근성</p>
        </div>
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
