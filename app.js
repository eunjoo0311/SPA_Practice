const app = document.querySelector("#app");

// =========================
// 페이지 컴포넌트들
// =========================
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
      <div class="stopwatch">
        <h1>스톱워치</h1>
        <div class="time-display">
          <span id="minutes">00</span>:<span id="seconds">00</span>:<span id="milliseconds">00</span>
        </div>
        <div class="controls">
          <button id="startBtn">시작</button>
          <button id="resetBtn">리셋</button>
        </div>
      </div>
    `;
  },
};

/* =====================================================
   VERSION 1 — setInterval 방식
   ===================================================== */
/*
let stopwatchInterval = null;
let elapsedTime = 0;
let isRunning = false;

function initStopwatch_interval() {
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (!startBtn) return;

  updateDisplay();
  updateStartButton();

  startBtn.addEventListener("click", function () {
    if (isRunning) {
      clearInterval(stopwatchInterval);
      isRunning = false;
    } else {
      const startTime = Date.now() - elapsedTime;
      stopwatchInterval = setInterval(function () {
        elapsedTime = Date.now() - startTime;
        updateDisplay();
      }, 10);
      isRunning = true;
    }
    updateStartButton();
  });

  resetBtn.addEventListener("click", function () {
    clearInterval(stopwatchInterval);
    elapsedTime = 0;
    isRunning = false;
    updateDisplay();
    updateStartButton();
  });
}
*/

/* =====================================================
   VERSION 2 — requestAnimationFrame 방식 
   ===================================================== */
/*
let rafId = null;
let elapsedTime = 0;
let isRunning = false;
let startTime = 0;

function tick() {
  elapsedTime = Date.now() - startTime;
  updateDisplay();
  rafId = requestAnimationFrame(tick);
}

function initStopwatch_raf() {
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (!startBtn) return;

  updateDisplay();
  updateStartButton();

  startBtn.addEventListener("click", function () {
    if (isRunning) {
      cancelAnimationFrame(rafId);
      rafId = null;
      isRunning = false;
    } else {
      startTime = Date.now() - elapsedTime;
      rafId = requestAnimationFrame(tick);
      isRunning = true;
    }
    updateStartButton();
  });

  resetBtn.addEventListener("click", function () {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    elapsedTime = 0;
    isRunning = false;
    updateDisplay();
    updateStartButton();
  });
}
*/

/* =====================================================
   VERSION 3 — Web Worker 방식 (현재 사용)
   ===================================================== */

// 메인 스레드 상태
let elapsedTime = 0;
let isRunning = false;

// worker / UI raf
let worker = null;
let uiRafId = null;
let dirty = false;

function requestUiFlush() {
  if (uiRafId) return;
  uiRafId = requestAnimationFrame(() => {
    uiRafId = null;
    if (dirty) {
      updateDisplay();
      dirty = false;
    }
  });
}

function ensureWorker() {
  if (worker) return worker;

  worker = new Worker("./stopwatch.worker.js");

  worker.onmessage = (e) => {
    const msg = e.data;
    if (!msg) return;

    // 워커가 보내는 elapsedTime만 받는다
    if (
      msg.type === "TICK" ||
      msg.type === "STATE" ||
      msg.type === "STOPPED" ||
      msg.type === "RESET"
    ) {
      if (typeof msg.elapsedTime === "number") {
        elapsedTime = msg.elapsedTime;
      }
      if (typeof msg.running === "boolean") {
        isRunning = msg.running;
      }

      dirty = true;
      requestUiFlush();
      updateStartButton();
    }
  };

  worker.onerror = (err) => {
    console.error("Worker error:", err);
  };

  return worker;
}

function destroyWorker() {
  if (uiRafId) cancelAnimationFrame(uiRafId);
  uiRafId = null;
  dirty = false;

  if (worker) {
    worker.terminate();
    worker = null;
  }
}

function initStopwatch() {
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (!startBtn || !resetBtn) return;

  ensureWorker();

  // 페이지 진입 시 상태 동기화
  worker.postMessage({ type: "GET" });

  updateDisplay();
  updateStartButton();

  startBtn.addEventListener("click", function () {
    if (!worker) return;

    if (isRunning) {
      worker.postMessage({ type: "STOP" });
      isRunning = false;
    } else {
      worker.postMessage({ type: "START" });
      isRunning = true;
    }
    updateStartButton();
  });

  resetBtn.addEventListener("click", function () {
    if (!worker) return;

    worker.postMessage({ type: "RESET" });
    elapsedTime = 0;
    isRunning = false;

    updateDisplay();
    updateStartButton();
  });
}

/* =====================================================
   공통 UI 함수
   ===================================================== */

function updateDisplay() {
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");
  const milliseconds = document.getElementById("milliseconds");

  if (!minutes || !seconds || !milliseconds) return;

  const mins = Math.floor(elapsedTime / 60000);
  const secs = Math.floor((elapsedTime % 60000) / 1000);
  const ms = Math.floor((elapsedTime % 1000) / 10);

  minutes.textContent = String(mins).padStart(2, "0");
  seconds.textContent = String(secs).padStart(2, "0");
  milliseconds.textContent = String(ms).padStart(2, "0");
}

function updateStartButton() {
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.textContent = isRunning ? "정지" : "시작";
  }
}

/* =====================================================
   Router
   ===================================================== */

function router() {
  const hash = window.location.hash.slice(1) || "/";
  const page = pages[hash] || pages["/"];

  // 스톱워치 페이지가 아니면 워커 종료(누수 방지)
  if (hash !== "/stopwatch") {
    destroyWorker();
    elapsedTime = 0;
    isRunning = false;
  }

  app.innerHTML = page();

  // 활성 메뉴 표시
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.route === hash) {
      link.classList.add("active");
    }
  });

  if (hash === "/stopwatch") {
    initStopwatch();
  }
}

// 이벤트 리스너
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
