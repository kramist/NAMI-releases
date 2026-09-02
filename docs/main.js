const header = document.querySelector("[data-header]");
const pointerField = document.querySelector("[data-pointer-field]");
const progress = document.querySelector("[data-scroll-progress]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const updateProgress = () => {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  progress.style.transform = `scaleX(${ratio})`;
};

updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress, { passive: true });

if (pointerField && !prefersReducedMotion) {
  let frame = 0;
  pointerField.addEventListener("pointermove", (event) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const bounds = pointerField.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      pointerField.style.setProperty("--pointer-x", `${x.toFixed(2)}%`);
      pointerField.style.setProperty("--pointer-y", `${y.toFixed(2)}%`);
      frame = 0;
    });
  });
}

const reveals = [...document.querySelectorAll(".reveal")];
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("has-motion");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7%" },
  );
  reveals.forEach((element) => revealObserver.observe(element));
} else {
  reveals.forEach((element) => element.classList.add("is-visible"));
}

const journeyStages = [...document.querySelectorAll("[data-journey-stage]")];
if (journeyStages.length && "IntersectionObserver" in window) {
  const journeyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { threshold: 0.62 },
  );
  journeyStages.forEach((stage) => journeyObserver.observe(stage));
}

const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const navTargets = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (navTargets.length && "IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const active = entries.find((entry) => entry.isIntersecting);
      if (!active) return;
      navLinks.forEach((link) => {
        const selected = link.getAttribute("href") === `#${active.target.id}`;
        link.classList.toggle("is-active", selected);
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { threshold: 0.2, rootMargin: "-25% 0px -60%" },
  );
  navTargets.forEach((section) => navObserver.observe(section));
}

if (document.documentElement.dataset.screenshotMode === "live") {
  document.querySelectorAll("img[data-live-src]").forEach((placeholder) => {
    const liveSource = placeholder.dataset.liveSrc;
    if (!liveSource) return;
    const candidate = new Image();
    candidate.onload = () => {
      placeholder.src = liveSource;
      placeholder.removeAttribute("data-live-src");
    };
    candidate.src = liveSource;
  });
}
