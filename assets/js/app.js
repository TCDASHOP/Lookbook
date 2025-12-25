(() => {
  const looks = Array.from(document.querySelectorAll(".look"));
  const currentEl = document.getElementById("current");
  const totalEl = document.getElementById("total");
  const cover = document.getElementById("cover");
  const counter = document.querySelector(".counter");

  if (totalEl) totalEl.textContent = String(looks.length).padStart(2, "0");

  // ===== COVER hide on scroll =====
  const updateCover = () => {
    if (!cover) return;
    const y = window.scrollY || 0;

    // 最初の少しだけCOVERを残し、スクロールで自然に退場
    const out = y > 40;
    cover.classList.toggle("is-out", out);

    // COVER表示中はカウンターを消す
    if (counter) counter.classList.toggle("is-hidden", !out);
  };

  updateCover();
  window.addEventListener("scroll", () => requestAnimationFrame(updateCover), { passive: true });

  // ===== IO: fade-in & counter =====
  const io = new IntersectionObserver(
    (entries) => {
      // 一番“見えてる”lookを採用
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

      // fade-in
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add("is-in");
      }

      // counter update
      if (visible && currentEl) {
        const idx = looks.indexOf(visible.target) + 1;
        currentEl.textContent = String(idx).padStart(2, "0");
      }
    },
    {
      root: null,
      threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
      rootMargin: "-10% 0px -30% 0px",
    }
  );

  looks.forEach(el => io.observe(el));
})();
