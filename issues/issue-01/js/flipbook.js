(() => {
  const VERSION = "2025-12-28-1";
  const PAGES = [
    "assets/cover.webp",
    ...Array.from({length:20}, (_,i) => `assets/pages/${String(i+1).padStart(3,"0")}.webp`),
    "assets/back.webp"
  ];

  const $frame = document.getElementById("frame");
  const $pageImg = document.getElementById("pageImg");
  const $count = document.getElementById("count");
  const $turn = document.getElementById("turn");
  const $turnFront = document.getElementById("turnFront");
  const $turnBack = document.getElementById("turnBack");
  const $missing = document.getElementById("missing");
  const $prev = document.getElementById("prevBtn");
  const $next = document.getElementById("nextBtn");
  const $backHome = document.getElementById("backHome");

  let idx = 0;
  let busy = false;

  const withV = (p) => `${p}?v=${encodeURIComponent(VERSION)}`;

  const setCount = () => {
    const a = String(idx + 1).padStart(2,"0");
    const b = String(PAGES.length).padStart(2,"0");
    $count.textContent = `${a} / ${b}`;
  };

  const showMissing = (msg) => {
    $missing.style.display = "block";
    $missing.textContent = msg;
  };
  const hideMissing = () => {
    $missing.style.display = "none";
    $missing.textContent = "";
  };

  const preloadAround = (i) => {
    [i, i+1, i+2, i-1].filter(n => n>=0 && n<PAGES.length).forEach(n => {
      const im = new Image();
      im.src = withV(PAGES[n]);
    });
  };

  const setPage = (i) => {
    $pageImg.src = withV(PAGES[i]);
    $pageImg.alt = `page ${i+1}`;
    setCount();
    preloadAround(i);
  };

  const init = () => {
    setPage(idx);
    $pageImg.addEventListener("load", hideMissing);
    $pageImg.addEventListener("error", () => {
      showMissing(`画像が見つかりません: ${PAGES[idx]}\n（ファイル名/場所/拡張子/大文字小文字 を確認）`);
    });
  };

  const turnTo = (nextIdx) => {
    if(busy) return;
    if(nextIdx < 0 || nextIdx >= PAGES.length) return;
    busy = true;

    const cur = PAGES[idx];
    const nxt = PAGES[nextIdx];

    $turnFront.src = withV(cur);
    $turnBack.src = withV(nxt);

    $pageImg.src = withV(nxt);
    hideMissing();
    $pageImg.onerror = () => showMissing(`画像が見つかりません: ${nxt}\n（ファイル名/場所/拡張子/大文字小文字 を確認）`);

    requestAnimationFrame(() => $frame.classList.add("is-turning"));

    // iOS Safari can occasionally miss/batch transition events.
    // Make the end-state deterministic with a guarded finisher + timeout fallback.
    let finished = false;
    const finish = () => {
      if(finished) return;
      finished = true;

      $frame.classList.remove("is-turning");
      idx = nextIdx;
      setCount();
      preloadAround(idx);
      busy = false;
    };

    const onEnd = () => finish();
    $turn.addEventListener("transitionend", onEnd, { once:true });
    $turn.addEventListener("webkitTransitionEnd", onEnd, { once:true });
    setTimeout(finish, 750);
  };

  const next = () => turnTo(idx + 1);
  const prev = () => turnTo(idx - 1);

  $next.addEventListener("click", next);
  $prev.addEventListener("click", prev);

  $backHome.addEventListener("click", (e) => {
    e.preventDefault();
    const url = new URL("../../", location.href);
    const lang = new URL(location.href).searchParams.get("lang");
    if(lang) url.searchParams.set("lang", lang);
    location.href = url.toString();
  });

  $frame.addEventListener("click", (e) => {
    if(busy) return;
    const r = $frame.getBoundingClientRect();
    const x = e.clientX - r.left;
    if(x > r.width * 0.52) next(); else prev();
  });

  window.addEventListener("keydown", (e) => {
    if(e.key === "ArrowRight") next();
    if(e.key === "ArrowLeft") prev();
    if(e.key === "Escape") $backHome.click();
  });

  let sx=0, sy=0, st=0;
  $frame.addEventListener("pointerdown", (e) => { sx=e.clientX; sy=e.clientY; st=Date.now(); }, { passive:true });
  $frame.addEventListener("pointerup", (e) => {
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    const dt = Date.now() - st;
    if(Math.abs(dx) < 40) return;
    if(Math.abs(dy) > Math.abs(dx) * 0.8) return;
    if(dt > 900) return;
    if(dx < 0) next(); else prev();
  }, { passive:true });

  init();
})();
