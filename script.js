const mainPath = document.getElementById("lightning-main");
const branches = document.querySelectorAll(".branch");

let pathLength = 0;
if (mainPath) {
  pathLength = mainPath.getTotalLength();
  // Use the actual path length so dasharray/offset match correctly
  mainPath.style.strokeDasharray = pathLength;
  mainPath.style.strokeDashoffset = pathLength;
} else {
  console.warn("Lightning path not found: #lightning-main");
}

function animateLightning() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

  // Draw main lightning (guard if element missing)
  if (mainPath && pathLength > 0) {
    const drawLength = pathLength * scrollPercent;
    mainPath.style.strokeDashoffset = pathLength - drawLength;
  }

  // Trigger branches at scroll checkpoints
  const checkpoints = [0.08, 0.18, 0.28, 0.38, 0.48, 0.58];

  branches.forEach((branch, i) => {
    if (scrollPercent > checkpoints[i] && !branch.classList.contains("flash")) {
      branch.classList.add("flash");

      // Surge main lightning briefly
      if (mainPath) {
        mainPath.classList.add("surge");
        setTimeout(() => mainPath.classList.remove("surge"), 300);
      }
    }
  });
}

window.addEventListener("scroll", animateLightning);
// Initialize on load
animateLightning();