let startEpoch = 0; // Date.now() 기준 시작 시각
let elapsed = 0; // 누적 경과 시간(ms)
let timerId = null;
let running = false;

// 워커 내부 틱 주기 (ms)
// 10ms로 해도 되고, 화면은 60fps라 16ms로 해도 충분함
const INTERVAL = 10;

function postTick() {
  // running일 때만 계산
  const now = Date.now();
  const currentElapsed = elapsed + (now - startEpoch);
  postMessage({ type: "TICK", elapsedTime: currentElapsed });
}

function start() {
  if (running) return;
  running = true;
  startEpoch = Date.now();
  timerId = setInterval(postTick, INTERVAL);
}

function stop() {
  if (!running) return;
  running = false;
  clearInterval(timerId);
  timerId = null;

  // 멈춘 시점까지 누적 확정
  elapsed = elapsed + (Date.now() - startEpoch);

  postMessage({ type: "STOPPED", elapsedTime: elapsed });
}

function reset() {
  running = false;
  clearInterval(timerId);
  timerId = null;

  startEpoch = 0;
  elapsed = 0;

  postMessage({ type: "RESET", elapsedTime: 0 });
}

onmessage = (e) => {
  const { type } = e.data || {};
  if (type === "START") start();
  if (type === "STOP") stop();
  if (type === "RESET") reset();
  if (type === "GET") {
    // 현재 상태 요청
    const current = running ? elapsed + (Date.now() - startEpoch) : elapsed;
    postMessage({ type: "STATE", elapsedTime: current, running });
  }
};
