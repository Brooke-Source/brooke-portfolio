const path = document.getElementById("lightning-path");
const pathLength = path.getTotalLength();

function animateLightning() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = scrollTop / docHeight;

  const drawLength = pathLength * scrollPercent;

  path.style.strokeDashoffset = pathLength - drawLength;
}

window.addEventListener("scroll", animateLightning);
animateLightning();