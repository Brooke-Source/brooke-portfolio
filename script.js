const mainPath = document.getElementById("lightning-main");
const branches = document.querySelectorAll(".branch");

const pathLength = mainPath.getTotalLength();

function animateLightning() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = scrollTop / docHeight;

  // Draw main lightning
  const drawLength = pathLength * scrollPercent;
  mainPath.style.strokeDashoffset = pathLength - drawLength;

  // Trigger branches at scroll checkpoints
  const checkpoints = [0.08, 0.18, 0.28, 0.38, 0.48, 0.58];

  branches.forEach((branch, i) => {
    if (scrollPercent > checkpoints[i] && !branch.classList.contains("flash")) {
      branch.classList.add("flash");

      // Surge main lightning briefly
      mainPath.classList.add("surge");
      setTimeout(() => mainPath.classList.remove("surge"), 300);
    }
  });
}

window.addEventListener("scroll", animateLightning);
animateLightning();