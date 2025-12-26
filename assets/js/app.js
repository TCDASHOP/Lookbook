(() => {
  const pagesEl = document.getElementById("pages");
  const stateEl = document.getElementById("state");

  const currentEl = document.getElementById("current");
  const totalEl = document.getElementById("total");

  const statsEl = document.getElementById("stats");

  const issueNoEl = document.getElementById("issueNo");
  const issueYearEl = document.getElementById("issueYear");

  const pad2 = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");

  const setState = (msg) => {
    stateEl.textContent = msg;
    stateEl.style.display = msg ? "block" : "none";
  };

  const render = (items) => {
    totalEl.textContent = pad2(items.length);
    currentEl.textContent = pad2(items.length ? 1 : 0);

    pagesEl.innerHTML = items.map((it, i) => {
      const num = pad2(i + 1);
      const capL = `${it.year || ""}${it.month ? "." + pad2(it.month) : ""}`;
      const capR =
        `${it.category || ""}` +
        (Array.isArray(it.tags) && it.tags.length ? ` / ${it.tags.join(", ")}` : "");

      return `
        <section class="page" data-idx="${num}">
          <div class="page__inner">
            <div class="page__number">LOOK ${num}</div>

            <picture>
              <source srcset="${it.webp}" type="image/webp">
              <img src="${it.jpg}" alt="LOOK ${num}" loading="lazy" decoding="async">
            </picture>

            <div class="page__caption" aria-hidden="true">
              <span>${capL}</span>
              <span>${capR}</span>
            </div>
          </div>
        </section>
      `;
    }).join("");

    // Back cover stats
    const cats = new Set(items.map(x => x.category).filter(Boolean));
    const years = new Set(items.map(x => x.year).filter(Boolean));
    const latest = items[0];
    const updated = latest?.year ? `${latest.year}.${pad2(latest.month || 1)}` : "";

    statsEl.textContent =
      `Total Looks: ${items.length} / Categories: ${cats.size} / Years: ${years.size}` +
      (updated ? ` / Updated: ${updated}` : "");

    // Reveal
    const innerEls = Array.from(document.querySelectorAll(".page__inner"));
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-in"); });
    }, { threshold: 0.18 });
    innerEls.forEach(el => reveal.observe(el));

    // Counter
    const pageEls = Array.from(document.querySelectorAll(".page"));
    const counter = new IntersectionObserver((entries) => {
      const v = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (v) currentEl.textContent = v.target.dataset.idx;
    }, { threshold: 0.6 });

    pageEls.forEach(el => counter.observe(el));
  };

  const load = async () => {
    try {
      setState("Loading…");

      const res = await fetch("data/looks.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`looks.json load failed: ${res.status}`);

      const data = await res.json();

      // ===== COVER: year + issue no (from meta) =====
      const issue = data?.meta?.issue || { year: 2026, no: 1 };

      if (issueYearEl) issueYearEl.textContent = String(issue.year ?? 2026);
      if (issueNoEl) issueNoEl.textContent = `ISSUE ${pad3(issue.no ?? 1)}`;

      // ===== items =====
      const items = Array.isArray(data.items) ? data.items : [];

      // Keep your order if you want? -> We keep chronological newest first by year/month.
      items.sort((a, b) => {
        const A = (a.year || 0) * 100 + (a.month || 0);
        const B = (b.year || 0) * 100 + (b.month || 0);
        return B - A;
      });

      setState("");
      render(items);
    } catch (e) {
      console.error(e);
      setState("Could not load data/looks.json (check path & JSON).");
      totalEl.textContent = "00";
      currentEl.textContent = "00";
      pagesEl.innerHTML = "";
      statsEl.textContent = "";
    }
  };

  load();
})();
