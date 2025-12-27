/* Issue renderer (Issue 01) */
(() => {
  const root = document.documentElement;
  const ISSUE_ID = root.dataset.issueId || "issue-01";
  const JSON_URL = root.dataset.issueJson || `/data/${ISSUE_ID}.json`;

  const pagesEl = document.getElementById("pages");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageIndicator = document.getElementById("pageIndicator");
  const issuePill = document.getElementById("issuePill");
  const toggleUiBtn = document.getElementById("toggleUiBtn");
  const scrollThumb = document.getElementById("scrollThumb");

  /** @type {Array<any>} */
  let pagesData = [];
  /** @type {HTMLElement[]} */
  let pageEls = [];
  let currentIndex = 0;

  const pad2 = (n) => String(n).padStart(2, "0");

  function safeText(v, fallback = "") {
    return (typeof v === "string" && v.trim().length) ? v.trim() : fallback;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function updateHud() {
    const total = pageEls.length || 1;
    pageIndicator.textContent = `${pad2(currentIndex + 1)} / ${pad2(total)}`;

    const page = pagesData[currentIndex] || {};
    const label = safeText(page.pill, safeText(page.title, "ISSUE-01"));
    issuePill.textContent = label.toUpperCase();
  }

  function scrollToIndex(idx, behavior = "smooth") {
    if (!pageEls.length) return;
    const clamped = Math.max(0, Math.min(pageEls.length - 1, idx));
    pageEls[clamped].scrollIntoView({ behavior, block: "start" });
  }

  function computeScrollThumb() {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - doc.clientHeight);
    const p = doc.scrollTop / maxScroll;
    const track = Math.max(1, window.innerHeight - 168 - 60); // track height - thumb height
    scrollThumb.style.transform = `translateY(${Math.round(p * track)}px)`;
  }

  function setActiveIndex(idx) {
    if (idx === currentIndex) return;
    currentIndex = idx;
    updateHud();
  }

  function observePages() {
    const thresholds = [0.25, 0.5, 0.65, 0.8];
    const io = new IntersectionObserver((entries) => {
      let best = null;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (!best) return;
      const idx = Number(best.target.dataset.index || "0");
      setActiveIndex(idx);
    }, { threshold: thresholds });

    pageEls.forEach((el) => io.observe(el));
  }

  function normalizeSrc(src) {
    return (src || "").trim();
  }

  function buildFallbacks(src) {
    const s = normalizeSrc(src);
    const out = [];
    if (!s) return out;

    const isAbs = /^https?:\/\//i.test(s);
    const hasLeadingSlash = s.startsWith("/");
    const hasIssuePrefix = s.startsWith("/issue-01/");

    out.push(s);

    if (!isAbs && !hasLeadingSlash) out.push("/" + s);

    if (!isAbs && !hasIssuePrefix) {
      const rel = hasLeadingSlash ? s.slice(1) : s;
      out.push("/issue-01/" + rel);
    }

    const m = s.match(/\.(webp|png|jpe?g)$/i);
    if (m) {
      const ext = m[1].toLowerCase();
      const base = s.slice(0, -ext.length - 1);
      const exts = ["webp", "jpg", "jpeg", "png"].filter(e => e !== ext);
      exts.forEach(e => out.push(base + "." + e));
    }

    return Array.from(new Set(out));
  }

  function attachImgWithFallback(frameInner, src, alt) {
    frameInner.classList.add("loading");

    const img = document.createElement("img");
    img.className = "look-img";
    img.alt = alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";

    const candidates = buildFallbacks(src);
    let i = 0;

    const tryNext = () => {
      if (i >= candidates.length) {
        frameInner.classList.remove("loading");
        const box = document.createElement("div");
        box.className = "error-box";
        box.innerHTML = `
          <div>
            <div>IMAGE NOT FOUND</div>
            <div class="code">${escapeHtml(src || "(empty src)")}</div>
          </div>`;
        frameInner.appendChild(box);
        return;
      }
      img.src = candidates[i++];
    };

    img.addEventListener("load", () => {
      frameInner.classList.remove("loading");
    });
    img.addEventListener("error", () => {
      tryNext();
    });

    frameInner.appendChild(img);
    tryNext();
  }

  function createCoverCard(siteName, pageTitle, pageSubtitle, badges) {
    const wrap = document.createElement("div");
    wrap.className = "cover-art";

    const title = safeText(pageTitle, "COLOR AS TIME");
    const sub = safeText(pageSubtitle, "Wearable art, archived as a magazine. Minimal words. Maximum signal.");
    const safeBadges = (Array.isArray(badges) ? badges : []).filter(Boolean).slice(0, 4);

    wrap.innerHTML = `
      <div class="cover-text">
        <div class="cover-sig">${escapeHtml(siteName)}</div>
        <div class="cover-title">${escapeHtml(title)}</div>
        <div class="cover-sub">${escapeHtml(sub)}</div>
        <div class="cover-foot">
          ${safeBadges.map(b => `<span>${escapeHtml(String(b))}</span>`).join("")}
          <span>sairencolorarchive</span>
        </div>
      </div>
    `;
    return wrap;
  }

  function createPage(page, idx, issue) {
    const kind = page.__kind || "look";
    const pageEl = document.createElement("section");
    pageEl.className = "page";
    pageEl.dataset.index = String(idx);

    const card = document.createElement("div");
    card.className = "card";

    // COVER / END (fixed design)
    if (kind === "cover" || kind === "end") {
      pageEl.classList.add("cover");

      const site = safeText(issue?.siteName, "SAIREN COLOR ARCHIVE");
      const issueLabel = safeText(issue?.issue, "Issue 01");
      const year = safeText(issue?.year, "2026");

      const title = safeText(page.title, safeText(issue?.title, "COLOR AS TIME"));
      const subtitle = safeText(page.subtitle, safeText(issue?.subtitle, "Wearable art, archived as a magazine. Minimal words. Maximum signal."));

      const badges = kind === "cover"
        ? [issueLabel, year, safeText(issue?.binding, "Scroll is the binding.")]
        : ["End of " + issueLabel, year, site];

      card.appendChild(createCoverCard(site, title, subtitle, badges));
      pageEl.appendChild(card);

      page.pill = kind === "cover" ? `COVER · ${ISSUE_ID}` : `END · ${ISSUE_ID}`;
      return pageEl;
    }

    // LOOK PAGE
    const lookNo = idx; // cover counted separately, so idx already includes it
    const label = safeText(page.label, safeText(page.id, `LOOK ${pad2(lookNo)}`));
    const kicker = safeText(page.kicker, `${label} · ${ISSUE_ID.toUpperCase()}`);
    const title = safeText(page.title, label);
    const subtitle = safeText(page.note, safeText(page.subtitle, ""));
    const right = safeText(page.product, safeText(page.right, ""));

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div class="meta-left">
        <div class="kicker">${escapeHtml(kicker)}</div>
        <div class="title">${escapeHtml(title)}</div>
        ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
      </div>
      <div class="meta-right">${escapeHtml(right)}</div>
    `;

    const frame = document.createElement("div");
    frame.className = "frame";
    const frameInner = document.createElement("div");
    frameInner.className = "frame-inner loading";

    const src = page.webp || page.jpg || page.image || page.src || "";
    const alt = safeText(page.alt, title);

    attachImgWithFallback(frameInner, src, alt);

    frame.appendChild(frameInner);

    const caption = document.createElement("div");
    caption.className = "caption";
    caption.innerHTML = `
      <div class="left">${escapeHtml(label)}</div>
      <div class="right">${escapeHtml(right)}</div>
    `;

    page.pill = `${label} · ${ISSUE_ID}`;

    card.appendChild(meta);
    card.appendChild(frame);
    card.appendChild(caption);

    pageEl.appendChild(card);
    return pageEl;
  }

  async function loadIssue() {
    try {
      const r = await fetch(JSON_URL, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const issue = await r.json();

      const list = [];
      if (issue.cover) list.push({ __kind: "cover", ...issue.cover });
      const looks = Array.isArray(issue.looks) ? issue.looks : [];
      looks.forEach((l) => list.push({ __kind: "look", ...l }));
      if (issue.end) list.push({ __kind: "end", ...issue.end });

      pagesData = list;

      if (!pagesData.length) {
        pagesEl.innerHTML = `<div class="noscript">No pages found in ${escapeHtml(JSON_URL)}</div>`;
        return;
      }

      pagesEl.innerHTML = "";
      pageEls = [];
      pagesData.forEach((p, idx) => {
        const el = createPage(p, idx, issue);
        pageEls.push(el);
        pagesEl.appendChild(el);
      });

      currentIndex = 0;
      updateHud();
      observePages();

      computeScrollThumb();
      window.addEventListener("scroll", computeScrollThumb, { passive: true });
      window.addEventListener("resize", computeScrollThumb);

      prevBtn.addEventListener("click", () => scrollToIndex(currentIndex - 1));
      nextBtn.addEventListener("click", () => scrollToIndex(currentIndex + 1));

      window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") scrollToIndex(currentIndex - 1);
        if (e.key === "ArrowRight") scrollToIndex(currentIndex + 1);
      });

      window.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaY) < 20) return;
        if (e.deltaY > 0) scrollToIndex(currentIndex + 1);
        else scrollToIndex(currentIndex - 1);
      }, { passive: true });

      toggleUiBtn.addEventListener("click", () => {
        document.body.classList.toggle("ui-hidden");
      });

    } catch (err) {
      pagesEl.innerHTML = `<div class="noscript">Failed to load issue data: ${escapeHtml(String(err))}<br>${escapeHtml(JSON_URL)}</div>`;
    }
  }

  loadIssue();
})();