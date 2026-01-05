const mainPath = document.getElementById("lightning-main");
const branches = document.querySelectorAll(".branch");

// How long the branch flash CSS runs (ms). Keep synced with CSS `flashOn` duration.
const BRANCH_FLASH_MS = 420;

let pathLength = 0;
if (mainPath) {
  pathLength = mainPath.getTotalLength();
  // use the actual path length so dasharray/offset match correctly
  mainPath.style.strokeDasharray = pathLength;
  mainPath.style.strokeDashoffset = pathLength;
} else {
  console.warn("Lightning path not found: #lightning-main");
}

const checkpoints = [0.08, 0.18, 0.28, 0.38, 0.48, 0.58];

let autoplayActive = false;
let autoplayTriggered = [];

function resetBranchStates() {
  branches.forEach((b) => b.classList.remove("flash"));
  autoplayTriggered = Array.from(branches).map(() => false);
}

// --- Sparkle helpers ---
const svgEl = document.getElementById("lightning-svg");
const viewBox = { width: 400, height: 2000 };

function svgPointToPageCoords(pt) {
  if (!svgEl) return { x: pt.x, y: pt.y };
  const rect = svgEl.getBoundingClientRect();
  const x = rect.left + (pt.x / viewBox.width) * rect.width;
  const y = rect.top + (pt.y / viewBox.height) * rect.height;
  return { x, y };
}

function spawnSparks(count = 6, startLength = 0) {
  if (!mainPath || !svgEl) return;
  const container = document.querySelector('.lightning-container') || document.body;
  for (let i = 0; i < count; i++) {
    // choose a length a bit below the visible draw point so sparks fall down
    const minL = Math.min(pathLength, Math.max(0, startLength));
    const maxL = pathLength;
    const len = minL + Math.random() * (maxL - minL);
    const pt = mainPath.getPointAtLength(len);
    const page = svgPointToPageCoords(pt);

    const s = document.createElement('div');
    s.className = 'spark';
    s.style.left = `${page.x}px`;
    s.style.top = `${page.y}px`;
    // slight random timing to make it look organic
    s.style.animationDelay = `${Math.random() * 160}ms`;
    s.style.opacity = '0';
    container.appendChild(s);

    s.addEventListener('animationstart', () => (s.style.opacity = '1'), { once: true });
    s.addEventListener('animationend', () => s.remove(), { once: true });
  }
}


function animateLightning() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

  // Draw main lightning (guard if element missing)
  let drawLength = 0;
  if (mainPath && pathLength > 0) {
    drawLength = pathLength * scrollPercent;
    mainPath.style.strokeDashoffset = pathLength - drawLength;
  }

  // Trigger branches at scroll checkpoints
  branches.forEach((branch, i) => {
    if (scrollPercent > checkpoints[i] && !branch.classList.contains("flash")) {
      branch.classList.add("flash");
      // ensure the flash class is removed after the animation so the streaks disappear
      setTimeout(() => branch.classList.remove("flash"), BRANCH_FLASH_MS);
      autoplayTriggered[i] = true;

      // Surge main lightning briefly
      if (mainPath) {
        mainPath.classList.add("surge");
        spawnSparks(6, drawLength);
        setTimeout(() => mainPath.classList.remove("surge"), 300);
      }
    }
  });
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function startAutoplay({ duration = 1800, pause = 800, loop = true } = {}) {
  if (!mainPath || pathLength <= 0) return;
  if (autoplayActive) return;
  autoplayActive = true;
  resetBranchStates();

  let startTime = null;

  function step(ts) {
    if (!autoplayActive) return; // stop if user interacts
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(progress);

    // draw main path
    const drawLength = pathLength * eased;
    mainPath.style.strokeDashoffset = pathLength - drawLength;

    // trigger branches as progress passes checkpoints
    branches.forEach((branch, i) => {
      if (eased > checkpoints[i] && !autoplayTriggered[i]) {
        branch.classList.add("flash");
        setTimeout(() => branch.classList.remove("flash"), BRANCH_FLASH_MS);
        autoplayTriggered[i] = true;
        mainPath.classList.add("surge");
        spawnSparks(6, drawLength);
        setTimeout(() => mainPath.classList.remove("surge"), 300);
      }
    });

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // finish: hold then either loop or stop
      setTimeout(() => {
        // fade branches so next loop can flash again
        branches.forEach((b) => b.classList.remove("flash"));
        autoplayTriggered = Array.from(branches).map(() => false);
        startTime = null;
        if (loop && autoplayActive) requestAnimationFrame(step);
        else autoplayActive = false;
      }, pause);
    }
  }

  requestAnimationFrame(step);
}

function stopAutoplay() {
  autoplayActive = false;
}

// Start/stop logic: autoplay when page isn't tall enough to scroll
window.addEventListener("scroll", () => {
  // if user scrolls, stop autoplay so scroll-driven animation takes over
  if (autoplayActive) stopAutoplay();
  animateLightning();
});

// stop autoplay on direct user input (wheel/touch)
window.addEventListener("wheel", stopAutoplay, { passive: true });
window.addEventListener("touchstart", stopAutoplay, { passive: true });

// initialize
animateLightning();

const docHeight = document.body.scrollHeight - window.innerHeight;
// If there is effectively no scrollable area, autoplay the lightning
if (docHeight <= 0) {
  startAutoplay({ duration: 1600, pause: 900, loop: true });
}

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});