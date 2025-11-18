const elements = {
  loader: document.getElementById("loader"),
  frame: document.querySelector(".dynamic-frame"),
  plank: document.querySelector(".plank"),
  aimLine: document.querySelector(".aimLine"),
  ghost: document.querySelector(".ghost-ball"),
  logs: document.querySelector(".logs"),
  label_distance: document.getElementById("label_distance"),
  counter_weight: document.getElementById("counter_weight"),
  counter_angle: document.getElementById("counter_angle"),
  counter_rTorque: document.getElementById("counter_rTorque"),
  counter_lTorque: document.getElementById("counter_lTorque"),
  counter_rightWeight: document.getElementById("counter_rightWeight"),
  counter_leftWeight: document.getElementById("counter_leftWeight"),
  button_pause: document.getElementById("button_pause"),
  button_auto: document.getElementById("button_auto"),
  dropdown_colors: document.getElementById("dropdown_colors"),
};

const audios = {
  select: document.getElementById("audio_select"),
  reset: document.getElementById("audio_reset"),
  auto: document.getElementById("audio_auto"),
  fall: document.getElementById("audio_fall"),
};

const MAX_ANGLE = 30;
const DROP_OFFSET = 260;
let angleOffset = 0;
let wait = false;
let paused = false;
let auto = false;
let colors = [];
let ballOnMove = false;
let movingBall = null;
let fromCenter = 0;
let stopNextBall = false;

const themes = {
  Vibrant: [
    "#ff0000",
    "#ff8700",
    "#ffd300",
    "#deff0a",
    "#a1ff0a",
    "#0aff99",
    "#0aefff",
    "#147df5",
    "#580aff",
    "#be0aff",
  ],
  Sunrise: [
    "#f6992d",
    "#ed6a5a",
    "#a75a5a",
    "#60495a",
    "#ffc800",
    "#4c7680",
    "#38a3a5",
    "#7dba60",
    "#c2d11b",
  ],
  Pastel: [
    "#ffc3c3",
    "#fdddc4",
    "#faf6c5",
    "#c9fac5",
    "#c7f3e0",
    "#c5e8fa",
    "#d2d9fa",
    "#dec5fa",
    "#fac5f4",
  ],
  Raindrops: [
    "#f72585",
    "#b5179e",
    "#7209b7",
    "#560bad",
    "#480ca8",
    "#3a0ca3",
    "#3f37c9",
    "#4361ee",
    "#4895ef",
    "#4cc9f0",
  ],
  Delight: [
    "#ff61ab",
    "#ff6176",
    "#ff8161",
    "#ffb561",
    "#ffea62",
    "#dfff61",
    "#abff61",
    "#76ff61",
    "#61ff81",
    "#61ffb5",
  ],
};

let state = {
  angle: 0,
  ballSize: 0,
  ballColor: 0,
  rightTorque: 0,
  leftTorque: 0,
  rightWeight: 0,
  leftWeight: 0,
  lastDistance: 0,
  autoInit: null,
  theme: "Vibrant",
};

document.addEventListener("DOMContentLoaded", (event) => {
  loadLocalStorage();
  audios.auto.volume = 0.3;
  loader.classList.add("hidden");
});

function loadLocalStorage() {
  const objects = JSON.parse(localStorage.getItem("seesawObjects")) || {
    balls: [],
    logs: [],
  };
  const tempState = JSON.parse(localStorage.getItem("seesawState")) || {};

  if (!tempState || Object.keys(tempState).length === 0) {
    colors = [...themes[state.theme]];
    getNewBall();
    return;
  }
  state = tempState;
  colors = [...themes[state.theme]];
  elements.dropdown_colors.value = state.theme;
  setGhostBall();

  objects["balls"].forEach((obj) => {
    const ball = document.createElement("div");
    ball.className = "ball";
    const size = calcWidth(obj.size);
    ball.style.background = obj.background;
    ball.style.width = size + "px";
    ball.style.height = size + "px";
    ball.innerHTML = "<div class='title'>" + obj.size + "</div>";
    ball.style.left = obj.left;
    ball.style.top = "-" + size + "px";
    elements.plank.appendChild(ball);
  });
  objects["logs"].forEach((obj, i) => {
    elements.logs.innerHTML += `<div class="log ${i == 0 ? "active" : ""}">${
      obj.text
    }</div>`;
  });
  rotatePlank();
  updateCounters();
}

async function initSequence(e) {
  if (stopNextBall) {
    stopNextBall = false;
    return;
  }
  if (wait || paused || ballOnMove) return;
  wait = true;

  const rect = elements.frame.getBoundingClientRect();
  const x = e.clientX - rect.left;
  fromCenter = Math.trunc(x - rect.width / 2);
  state.lastDistance = fromCenter;
  if (fromCenter === 0) {
    wait = false;
    return;
  }
  if (fromCenter > 0) {
    state.rightTorque += state.ballSize * fromCenter;
    state.rightWeight += state.ballSize;
  } else {
    state.leftTorque += state.ballSize * -fromCenter;
    state.leftWeight += state.ballSize;
  }

  elements.counter_lTorque.innerText = state.leftTorque;
  elements.counter_rTorque.innerText = state.rightTorque;

  const angleRad = (state.angle * Math.PI) / 180;
  angleOffset =
    fromCenter * Math.sin(angleRad) + (20 - calcWidth(state.ballSize));
  spawnBall(x, fromCenter).then(() => {
    rotatePlank();
    updateState();
  });
}

function rotatePlank() {
  const raw = (state.rightTorque - state.leftTorque) / 10;
  const angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, raw));
  state.angle = angle;
  elements.plank.style.setProperty("--angle", `${angle}deg`);
}

function spawnBall(x, fromCenter) {
  return new Promise((resolve) => {
    const ball = document.createElement("div");
    ball.className = "ball";
    const size = calcWidth(state.ballSize);
    ball.style.background = state.ballColor;
    ball.style.width = size + "px";
    ball.style.height = size + "px";
    ball.style.left = x - size / 2 + "px";
    ball.style.top = -70 + "px";
    ball.dataset.size = state.ballSize;
    ball.dataset.distance = fromCenter;
    ball.innerHTML = "<div class='title'>" + state.ballSize + "</div>";
    elements.frame.appendChild(ball);
    playAudio(audios.fall, 0.7, 1.7);
    ball.offsetHeight;
    ball.style.top = DROP_OFFSET + angleOffset + "px";

    ball.addEventListener(
      "transitionend",
      () => {
        elements.plank.appendChild(ball);
        ball.style.left = x - size / 2 + "px";
        ball.style.top = "-" + size + "px";

        ball.addEventListener("mousedown", (e) => {
          if (paused || auto || ballOnMove) return;
          if (e.button !== 0) return;
          e.stopPropagation();
          startMoveBall(e, ball);
        });

        resolve();
      },
      { once: true }
    );
  });
}

function startMoveBall(e, ball) {
  if (ballOnMove) return;
  const frameRect = elements.frame.getBoundingClientRect();
  const size = ball.offsetWidth;

  let newLeft = e.clientX - frameRect.left - size / 2;
  newLeft = Math.max(0, Math.min(frameRect.width - size, newLeft));

  ball.style.left = newLeft + "px";

  movingBall = ball;
  ballOnMove = true;

  document.addEventListener("mousemove", moveBall);
  document.addEventListener("mouseup", stopMoveBall, { once: true });
}

function moveBall(e) {
  if (!movingBall) return;

  const frameRect = elements.frame.getBoundingClientRect();
  const size = movingBall.offsetWidth;

  let newLeft = e.clientX - frameRect.left - size / 2;
  newLeft = Math.max(0, Math.min(frameRect.width - size, newLeft));

  movingBall.style.left = newLeft + "px";
}

function stopMoveBall(e) {
  if (!movingBall) return;
  const frameRect = elements.frame.getBoundingClientRect();
  const size = movingBall.offsetWidth;
  const left = parseFloat(movingBall.style.left || 0);
  const centerX = left + size / 2;

  const newFromCenter = Math.trunc(centerX - frameRect.width / 2);
  const weight = parseInt(movingBall.dataset.size, 10);
  const prevDistance = parseInt(movingBall.dataset.distance, 10) || 0;

  if (prevDistance > 0) {
    state.rightTorque -= weight * prevDistance;
    state.rightWeight -= weight;
  } else if (prevDistance < 0) {
    state.leftTorque -= weight * -prevDistance;
    state.leftWeight -= weight;
  }

  if (newFromCenter > 0) {
    state.rightTorque += weight * newFromCenter;
    state.rightWeight += weight;
  } else if (newFromCenter < 0) {
    state.leftTorque += weight * -newFromCenter;
    state.leftWeight += weight;
  }

  movingBall.dataset.distance = newFromCenter;
  rotatePlank();
  updateCounters();
  document.removeEventListener("mousemove", moveBall);
  movingBall = null;
  ballOnMove = false;
  stopNextBall = true;
}

elements.frame.addEventListener("mousemove", (e) => {
  if (paused || auto || ballOnMove) return;
  const rect = elements.frame.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const fromCenter = Math.trunc(x - rect.width / 2);

  elements.label_distance.textContent = `${
    fromCenter == 0 ? "Center" : fromCenter > 0 ? "Right" : "Left"
  } ${Math.abs(fromCenter)}px`;
  elements.aimLine.style.transform = `translateX(${x}px)`;
  if (elements.aimLine.style.display !== "block")
    elements.aimLine.style.display = "block";
  if (elements.label_distance.style.display !== "block")
    elements.label_distance.style.display = "block";
});

elements.frame.addEventListener("mouseleave", () => {
  elements.aimLine.style.display = "none";
  elements.label_distance.style.display = "none";
});

function handlePause() {
  playAudio(audios.select, 1, 1);
  paused = !paused;
  if (paused) {
    elements.button_pause.textContent = "Resume";
    if (auto) {
      audios.auto.pause();
      audios.auto.currentTime = 0;
    }
  } else {
    elements.button_pause.textContent = "Pause";
    if (auto) {
      audios.auto.play();
    }
  }
}

function handleAuto() {
  audios.select.play();
  if (!paused) audios.auto.play();
  if (auto) {
    elements.button_auto.textContent = "Auto";
    auto = false;
    clearInterval(state.autoInit);
    audios.auto.pause();
    audios.auto.currentTime = 0;
    return;
  }
  auto = true;
  elements.button_auto.textContent = "Stop";
  const Interval = 1989;
  const rect = elements.frame.getBoundingClientRect();

  state.autoInit = setInterval(() => {
    const x = generateRandomNumber(0, rect.width);
    initSequence({ clientX: x + rect.left });
  }, Interval);
}

function handleReset() {
  audios.select.play();
  audios.reset.play();
  elements.plank.innerHTML = "";
  elements.logs.innerHTML = "";
  state.angle = 0;
  state.rightTorque = 0;
  state.leftTorque = 0;
  state.rightWeight = 0;
  state.leftWeight = 0;
  state.lastDistance = 0;

  updateCounters();
  rotatePlank();
  localStorage.removeItem("seesawState");
  localStorage.removeItem("seesawObjects");
}

function handleColorSet(set) {
  playAudio(audios.select, 1, 1);
  colors = [...themes[set]];
  state.theme = set;
  if (!auto) getNewBall();
}

function updateState() {
  document.querySelector(".log.active")?.classList.remove("active");
  const log = document.createElement("div");
  log.className = "log";
  log.classList.add("active");
  log.textContent = ` 📦 ${state.ballSize}kg dropped on the ${
    state.lastDistance > 0 ? "right" : "left"
  } side at ${Math.abs(state.lastDistance)}px from center.`;
  elements.logs.prepend(log);
  elements.logs.scrollTop = 0;
  updateCounters();
  getNewBall();
  wait = false;
  saveLocalStorage();
}

function updateCounters() {
  elements.counter_leftWeight.innerText = state.leftWeight + " kg";
  elements.counter_rightWeight.innerText = state.rightWeight + " kg";
  elements.counter_angle.innerText = Math.trunc(state.angle) + "°";
  elements.counter_lTorque.innerText = state.leftTorque + "N";
  elements.counter_rTorque.innerText = state.rightTorque + "N";
}

function getNewBall() {
  state.ballSize = generateRandomNumber(1, 11);
  state.ballColor = colors[generateRandomNumber(0, colors.length)];
  setGhostBall();
}

function setGhostBall() {
  elements.ghost.style.width = calcWidth(state.ballSize) + "px";
  elements.ghost.style.height = calcWidth(state.ballSize) + "px";
  elements.ghost.style.background = state.ballColor;
  elements.ghost.innerHTML = "<div class='title'>" + state.ballSize + "</div>";
  elements.ghost.style.setProperty("--size", `${calcWidth(state.ballSize)}px`);
  elements.counter_weight.innerText = state.ballSize + " kg";
}

function calcWidth(size) {
  return 20 + size * 5;
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function playAudio(audio, vol, speed) {
  audio.volume = vol;
  audio.playbackRate = speed;
  audio.play();
}

function saveLocalStorage() {
  const objects = { balls: [], logs: [] };
  document.querySelectorAll(".ball").forEach((obj) => {
    if (obj.classList.contains("ghost-ball")) return;
    const style = window.getComputedStyle(obj);
    objects["balls"].push({
      left: style.left,
      background: style.background,
      size: obj.querySelector(".title").textContent,
    });
  });
  document.querySelectorAll(".log").forEach((obj) => {
    objects["logs"].push({
      text: obj.innerText,
    });
  });
  const { autoInit, ...stateToSave } = state;
  localStorage.setItem("seesawState", JSON.stringify(stateToSave));
  localStorage.setItem("seesawObjects", JSON.stringify(objects));
}
