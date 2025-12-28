(() => {
  // ★ キャッシュ事故を避ける。更新したら文字列を変える
  const ASSET_VERSION = "2025-12-28-1";

  // ====== あなたのページ構成（表紙 → 001..020 → 裏表紙） ======
  const PAGES = [
    "assets/cover.webp",
    ...Array.from({length: 20}, (_, i) => `assets/pages/${String(i+1).padStart(3,"0")}.webp`),
    "assets/back.webp"
  ];

  // 裏表紙に文字を入れるなら「画像自体に焼き込み」推奨（雑誌感が壊れない）
  // どうしてもHTMLで載せたい場合は back.webp にロゴ/テキストを合成するのが一番安全。

  const $frame = document.getElementById("frame");
  const $pageImg = document.getElementById("pageImg");
  const $count = document.getElementById("count");

  const $turn = document.getElementById("turn");
  const $turnFront = document.getElementById("turnFront");
  const $turnBack  = document.getElementById("turnBack");

  const $missing = document.getElementById("missing");

  const $backBtn = document.getElementById("backBtn");
  const $prevBtn = document.getElementById("prevBtn");
  const $nextBtn = document.getElementById("nextBtn");

  let idx = 0;
  let isTurning = false;

  function withV(path){
    return `${path}?v=${encodeURIComponent(ASSET_VERSION)}`;
  }

  function setCount(){
    const a = String(idx + 1).padStart(2, "0");
    const b = String(PAGES.length).padStart(2, "0");
    $count.textContent = `${a} / ${b}`;
  }

  function showMissing(msg){
    $missing.style.display = "block";
    $missing.textContent = msg;
  }
  function hideMissing(){
    $missing.style.display = "none";
    $missing.textContent = "";
  }

  function setPageImage(i){
    const path = PAGES[i];
    $pageImg.src = withV(path);
    $pageImg.alt = `page ${i+1}`;
    setCount();
  }

  // Preload (軽くするため「次の数枚」だけ優先)
  function preloadAround(i){
    const targets = [i, i+1, i+2, i-1].filter(n => n>=0 && n<PAGES.length);
    for(const n of targets){
      const im = new Image();
      im.src = withV(PAGES[n]);
    }
  }

  // 初期表示
  function init(){
    setPageImage(idx);
    preloadAround(idx);

    $pageImg.addEventListener("error", () => {
      showMissing(`画像が見つかりません: ${PAGES[idx]}\n（ファイル名/場所/拡張子を確認）`);
    });
    $pageImg.addEventListener("load", () => hideMissing());
  }

  function turnTo(nextIdx){
    if(isTurning) return;
    if(nextIdx < 0 || nextIdx >= PAGES.length) return;

    isTurning = true;

    // 現在ページを「めくる面」に載せる
    const currentPath = PAGES[idx];
    const nextPath    = PAGES[nextIdx];

    $turnFront.src = withV(currentPath);
    // 「裏面」は雰囲気用：次ページを軽く暗くして入れる
    $turnBack.src  = withV(nextPath);

    // 先に next を本体に差し込む（めくり終わったら見えてる状態にする）
    $pageImg.src = withV(nextPath);

    // エラー監視（次ページ）
    hideMissing();
    $pageImg.onerror = () => {
      showMissing(`画像が見つかりません: ${nextPath}\n（ファイル名/場所/拡張子を確認）`);
    };

    // アニメ開始
    requestAnimationFrame(() => {
      $frame.classList.add("is-turning");
    });

    const onEnd = () => {
      $frame.classList.remove("is-turning");
      $turn.removeEventListener("transitionend", onEnd);

      idx = nextIdx;
      setCount();
      preloadAround(idx);
      isTurning = false;
    };

    $turn.addEventListener("transitionend", onEnd, { once: true });
  }

  function next(){ turnTo(idx + 1); }
  function prev(){ turnTo(idx - 1); }

  // Controls
  $nextBtn.addEventListener("click", next);
  $prevBtn.addEventListener("click", prev);
  $backBtn.addEventListener("click", () => { location.href = "/"; });

  // Tap on page: right half = next, left half = prev
  $frame.addEventListener("click", (e) => {
    if(isTurning) return;
    const rect = $frame.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if(x > rect.width * 0.52) next();
    else prev();
  });

  // Keyboard
  window.addEventListener("keydown", (e) => {
    if(e.key === "ArrowRight") next();
    if(e.key === "ArrowLeft") prev();
    if(e.key === "Escape") location.href = "/";
  });

  // Swipe (iPad Safari)
  let sx = 0, sy = 0, st = 0;
  $frame.addEventListener("pointerdown", (e) => {
    sx = e.clientX; sy = e.clientY; st = Date.now();
  }, { passive: true });

  $frame.addEventListener("pointerup", (e) => {
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    const dt = Date.now() - st;

    // 横スワイプのみ採用（縦スクロール誤爆を避ける）
    if(Math.abs(dx) < 40) return;
    if(Math.abs(dy) > Math.abs(dx) * 0.8) return;
    if(dt > 900) return;

    if(dx < 0) next(); else prev();
  }, { passive: true });

  init();
})();
