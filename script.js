(() => {
  const intro = document.getElementById("intro");
  const site = document.getElementById("site");
  const skipBtn = document.getElementById("skipIntro");
  const replayBtn = document.getElementById("replayIntro");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Play once per browser tab session. Add ?intro=1 to the URL to force it.
  const forceIntro = new URLSearchParams(window.location.search).has("intro");
  const alreadyPlayed = sessionStorage.getItem("introPlayed") === "true";

  function revealSiteInstantly() {
    intro.classList.add("is-done");
    site.classList.add("is-revealed");
    site.removeAttribute("inert");
  }

  function finishIntro() {
    intro.classList.add("is-exiting");
    site.classList.add("is-revealed");
    site.removeAttribute("inert");
    sessionStorage.setItem("introPlayed", "true");

    intro.addEventListener(
      "animationend",
      () => {
        intro.classList.add("is-done");
        site.focus?.();
      },
      { once: true }
    );
  }

  function playIntro() {
    intro.classList.remove("is-done", "is-exiting");
    site.classList.remove("is-revealed");
    site.setAttribute("inert", "");
    // force reflow so the animation restarts cleanly on replay
    void intro.offsetWidth;
    intro.classList.add("is-playing");

    // total sequence: the whole stage (rings + photo + text) rushes
    // in and lands decisively at 1.2s, then eight extra rings pop in
    // one after another moving outward until they reach the screen
    // edges (1.2s–2.75s), then a beat to hold before cutting through
    // to the site
    window.setTimeout(finishIntro, 3100);
  }

  if (prefersReducedMotion || (alreadyPlayed && !forceIntro)) {
    revealSiteInstantly();
  } else {
    playIntro();
  }

  skipBtn.addEventListener("click", () => {
    intro.classList.remove("is-playing");
    finishIntro();
  });

  replayBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    playIntro();
  });

  // scatter twinkling stars behind the header/hero area only — laid
  // out on a jittered grid (even coverage, still a bit random) and
  // measured at runtime to keep clear of the nav and hero text
  function renderStars() {
    const starfield = document.querySelector(".starfield");
    const headerWrap = document.querySelector(".header-wrap");
    if (!starfield || !headerWrap) return;

    starfield.innerHTML = "";

    const wrapRect = headerWrap.getBoundingClientRect();
    const buffer = 45; // tighter clearance so stars can spread nearer
    // the nav row and closer around the hero text

    // exclude the nav bar and each hero text line individually (not
    // the whole hero block) so stars can spread into the open space
    // to the left and above the text — the generous buffer is wide
    // enough to bridge the small gaps between adjacent text lines
    const exclusionRects = ["nav", "hero-eyebrow", "hero-name", "hero-tagline"]
      .map((cls) => document.querySelector(`.${cls}`))
      .filter(Boolean)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - wrapRect.left - buffer,
          right: r.right - wrapRect.left + buffer,
          top: r.top - wrapRect.top - buffer,
          bottom: r.bottom - wrapRect.top + buffer,
        };
      });

    function overlapsText(x, y) {
      return exclusionRects.some(
        (r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
      );
    }

    const colors = ["var(--navy)", "var(--marquee-red)", "var(--gold)"];
    const cols = 12;
    const rows = 10;
    const cellW = wrapRect.width / cols;
    const cellH = wrapRect.height / rows;
    let i = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // jitter within the cell so it's not a rigid grid
        const x = col * cellW + cellW * (0.25 + Math.random() * 0.5);
        const y = row * cellH + cellH * (0.25 + Math.random() * 0.5);

        if (overlapsText(x, y)) continue;

        const star = document.createElement("span");
        star.className = "star";
        const size = (Math.random() * 7 + 6).toFixed(1);
        star.style.left = `${x.toFixed(0)}px`;
        star.style.top = `${y.toFixed(0)}px`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.background = colors[i % colors.length];
        star.style.animationDelay = `${(Math.random() * 3.4).toFixed(2)}s`;
        starfield.appendChild(star);
        i++;
      }
    }
  }

  renderStars();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderStars, 200);
  });
})();