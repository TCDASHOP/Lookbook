(() => {
  const DATA = "/issue-01/data/pages.json";
  const book = document.getElementById("book");
  const count = document.getElementById("count");
  const err = document.getElementById("err");
  const tapZone = document.getElementById("tapZone");

  let pages = [];
  let current = 0; // 0 = 表紙(まだめくってない)

  const showError = (msg) => {
    err.style.display = "block";
    err.textContent = msg;
  };

  const updateCount = () => {
    const total = pages.length;
    const now = Math.min(current + 1, total);
    count.textContent = String(now).padStart(2, "0") + " / " + String(total).padStart(2, "0");
  };

  // 画像の事前読み（次/前の1枚だけ）
  const preload = (idx) => {
    if (idx < 0 || idx >= pages.length) return;
    const src = pages[idx]?.src;
    if (!src) return;
    const i = new Image();
    i.src = src;
  };

  const build = () => {
    book.innerHTML = "";

    const total = pages.length;

    // 下から積む：最後が一番下、最初（表紙）が一番上
    pages.forEach((p, i) => {
      const page = document.createElement("div");
      page.className = "page";
      page.dataset.index = String(i);
      page.style.zIndex = String(total - i);

      const img = document.createElement("img");
      img.loading = i <= 2 ? "eager" : "lazy";
      img.alt = p.id ? `page ${p.id}` : `page ${i + 1}`;
      img.src = p.src;

      img.onerror = () => showError(`画像が読み込めません：${p.src}`);

      page.appendChild(img);

      // 裏表紙だけ、下に締め情報＋ロゴを載せる（画像の上にうっすら）
      if (p.type === "back" && p.backMatter) {
        const overlay = document.createElement("div");
        overlay.className = "backOverlay";

        const block = document.createElement("div");
        block.className = "backBlock";

        const left = document.createElement("div");
        left.className = "backLeft";
        left.innerHTML = `
          <div>${p.backMatter.copyright || ""}</div>
          <div><a href="${p.backMatter.url || "#"}" target="_blank" rel="noopener">${p.backMatter.url || ""}</a></div>
          <div>SNS : ${p.backMatter.sns || ""}</div>
        `.trim();

        const logo = document.createElement("div");
        logo.className = "logo";
        const logoImg = document.createElement("img");
        logoImg.src = p.backMatter.logo || "";
        logoImg.alt = "logo";
        logoImg.onerror = () => { logo.style.display = "none"; };
        logo.appendChild(logoImg);

        block.appendChild(left);
        if (p.backMatter.logo) block.appendChild(logo);

        overlay.appendChild(block);
        page.appendChild(overlay);
      }

      book.appendChild(page);
    });

    current = 0;
    applyState();
  };

  const applyState = () => {
    // current枚分が “めくれた” 状態（= turned）
    const nodes = Array.from(book.querySelectorAll(".page"));
    nodes.forEach((n) => {
      const i = Number(n.dataset.index);
      if (i < current) n.classList.add("turned");
      else n.classList.remove("turned");
    });

    updateCount();
    preload(current + 1);
    preload(current - 1);
  };

  const next = () => {
    if (current >= pages.length) return;
    // 右側タップで 1枚めくる
    if (current < pages.length - 1) {
      current += 1;
      applyState();
    }
  };

  const prev = () => {
    if (current <= 0) return;
    current -= 1;
    applyState();
  };

  // タップ操作（左=戻る、右=次へ）
  tapZone.addEventListener("click", (e) => {
    const dir = e.target?.dataset?.dir;
    if (dir === "next") next();
    if (dir === "prev") prev();
  });

  // スワイプ（iPad/Safari）
  let sx = 0, sy = 0, st = 0;
  window.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    st = Date.now();
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    const dt = Date.now() - st;
    const ex = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : sx;
    const ey = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : sy;
    const dx = ex - sx;
    const dy = ey - sy;

    // 横スワイプだけ拾う
    if (Math.abs(dx) < 40) return;
    if (Math.abs(dy) > 80) return;
    if (dt > 900) return;

    if (dx < 0) next(); // 左へスワイプ＝次
    else prev();        // 右へスワイプ＝戻る
  }, { passive: true });

  // キーボード（PC確認用）
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  const load = async () => {
    try {
      const res = await fetch(DATA, { cache: "no-store" });
      if (!res.ok) return showError(`pages.json が取得できません（HTTP ${res.status}）`);

      const text = await res.text();
      let json;
      try { json = JSON.parse(text); }
      catch { return showError("pages.json が JSON として壊れています（カンマ/括弧/引用符）"); }

      if (!Array.isArray(json.pages)) return showError("pages.json に pages 配列がありません");

      pages = json.pages.map(p => ({
        id: String(p.id ?? ""),
        src: String(p.src ?? ""),
        type: String(p.type ?? ""),
        backMatter: p.backMatter || null
      })).filter(p => p.src);

      if (!pages.length) return showError("ページが0です（srcが空の可能性）");

      build();
    } catch (e) {
      showError("通信エラーで pages.json を読み込めませんでした");
    }
  };

  document.addEventListener("DOMContentLoaded", load, { once: true });
})();
