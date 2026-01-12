const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const levelEl = document.getElementById("level");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score"); // חדש: הצגת ניקוד בהאדר

// ---------- Game Config ----------
let numbers = [];
let expectedIndex = 0;
let timer = null;
let remainingTime = 0;
let gameActive = false;
let level = 1;
let score = 0;

const BASE_TIME = 10; // זמן התחלתי לשלב הראשון
const MIN_TIME = 2;   // זמן מינימום
const TIME_DECREASE = 0.5; // הפחתת זמן לכל שלב

// מאגר מספרים "יפים" - ניתן לשנות את הטווח
const NUMBER_POOL = [];
for (let i = -99; i <= 99; i++) {
  NUMBER_POOL.push(i);
}

// ---------- Utils ----------
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ---------- Start Game ----------
startBtn.addEventListener("click", () => {
  level = 1;
  score = 0;
  scoreEl.textContent = score;
  startLevel();
});

// ---------- Reset ----------
function resetGame() {
  board.innerHTML = "";
  numbers = [];
  expectedIndex = 0;
  clearInterval(timer);
  gameActive = false;
}

// ---------- Start Level ----------
function startLevel() {
  resetGame();

  // זמן התחלתי לפי שלב
  remainingTime = Math.max(MIN_TIME, BASE_TIME - (level - 1) * TIME_DECREASE);
  timeEl.textContent = remainingTime.toFixed(2) + "S";
  levelEl.textContent = level;

  generateNumbers();
  placeNumbers();
  startTimer();
  gameActive = true;
}

// ---------- Generate Numbers ----------
function generateNumbers() {
  const count = Math.min(8, 4 + level - 1); // עולה עם שלבים, עד 8 מספרים
  const set = new Set();

  while (set.size < count) {
    const idx = randomInt(0, NUMBER_POOL.length - 1);
    set.add(NUMBER_POOL[idx]);
  }

  const values = Array.from(set);
  const sorted = [...values].sort((a, b) => a - b);
  numbers = values.map(v => ({
    value: v,
    order: sorted.indexOf(v)
  }));

  numbers = shuffle(numbers); // רק למיקום אקראי בלוח
}

// ---------- Place Numbers ----------
function placeNumbers() {
  const rect = board.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const positions = [];

  numbers.forEach((num, i) => {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "number";
      el.textContent = num.value;
      el.dataset.order = num.order;
      el.style.background = pickColor(num.value);

      let x, y, safe = false;
      while (!safe) {
        const offsetX = randomInt(-120, 120);
        const offsetY = randomInt(-120, 120);
        x = centerX + offsetX - 30;
        y = centerY + offsetY - 30;
        safe = positions.every(p => Math.hypot(p.x - x, p.y - y) > 60);
      }
      positions.push({x, y});
      el.style.left = x + "px";
      el.style.top = y + "px";

      el.addEventListener("click", () => handleClick(el));

      board.appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      });
    }, i * 150);
  });
}

// ---------- Colors ----------
function pickColor(value) {
  if (value < 0) return "#ef4444";
  if (value === 0) return "#6b7280";
  return "#3b82f6";
}

// ---------- Handle Click ----------
function handleClick(el) {
  if (!gameActive) return;
  const order = Number(el.dataset.order);

  if (order === expectedIndex) {
    el.style.opacity = "0";
    el.style.transform = "scale(0.7)";
    setTimeout(() => el.remove(), 150);
    expectedIndex++;

    if (expectedIndex === numbers.length) {
      endLevel();
    }
  } else {
    endGame(false);
  }
}

// ---------- Timer ----------
function startTimer() {
  timer = setInterval(() => {
    if (!gameActive) return;
    remainingTime -= 0.05;
    if (remainingTime <= 0) {
      remainingTime = 0;
      endGame(false);
    }
    timeEl.textContent = remainingTime.toFixed(2) + "s";
  }, 50);
}

// ---------- End Level ----------
function endLevel() {
  gameActive = false;
  clearInterval(timer);

  // ניקוד נמוך יותר
  const points = Math.ceil(remainingTime * 10);
  score += points;
  scoreEl.textContent = score;

  showToast(`Level ${level} Complete! +${points} points`);

  level++;
  setTimeout(() => startLevel(), 1500);
}

// ---------- End Game ----------
function endGame(win = false) {
  gameActive = false;
  clearInterval(timer);
  showToast(win ? "You Won!" : "Game Over!");
  setTimeout(() => resetGame(), 1500);
}

// ---------- Toast ----------
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 1200);
}
