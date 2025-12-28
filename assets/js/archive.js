/* assets/js/archive.js */
(() => {
  const elList = document.getElementById("issues");
  const elAlert = document.getElementById("alert");
  const elY = document.getElementById("y");
  if (elY) elY.textContent = String(new Date().getFullYear());

  // 1) 何が起きても真っ白にしない（フォールバック）
  const FALLBACK = {
    issues: [
      {
        id: "issue-01",
        issueNo: "01",
        year: "2026",
        title: "COLOR AS TIME",
        subtitle: "Wearable art, archived as a magazine.",
        href: "./issue-01/",
        // 表紙サムネ（ここが壊れてても落ちない）
        coverThumb: "./issue-01/assets/cover.webp",
        // 22=表紙+20ページ+裏表紙（あなたのイメージに合わせた既定値）
        pageCount: 22
      }
    ]
  };

  function showAlert(msg) {
    if (!elAlert) return;
    elAlert.style.display = "block";
    elAlert.textContent = msg;
  }

  // 2) JSONフェッチ：キャッシュ事故を潰しつつ、壊れてたら即フォールバック
  async function loadIssues() {
    const url = new URL("./data/issues.json", location.href);
    // キャッシュが古いJSONを掴む事故防止
    url.searchParams.set("v", String(Date.now()));

    try {
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      // JSONが1文字でも壊れてると落ちるので、ここで握りつぶしてフォールバック
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        showAlert("issues.json が JSON として読めません（カンマ/括弧/引用符/全角混入を確認）→ フォールバック表示中");
        return FALLBACK;
      }

      if (!data || !Array.isArray(data.issues)) {
        showAlert("issues.json の形式が違います（issues 配列が必要）→ フォールバック表示中");
        return FALLBACK;
      }

      return data;
    } catch (e) {
      showAlert("issues.json を読み込めません（パス/大文字小文字/配置場所/ネットワーク）→ フォールバック表示中");
      return FALLBACK;
    }
  }

  function safeText(v, alt = "") {
    return (typeof v === "string" && v.trim()) ? v : alt;
  }

  function makePlaceholderSVG() {
    // 画像が欠けても“雑誌カード”として成立するプレースホルダ
    return `data:image/svg+xml;charset=utf-8,` + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="rgba(255,255,255,.10)"/>
            <stop offset="1" stop-color="rgba(255,255,255,.02)"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="240" height="240" rx="28" fill="url(#g)"/>
        <rect x="62" y="56" width="116" height="148" rx="14" fill="rgba(0,0,0,.22)" stroke="rgba(255,255,255,.12)"/>
        <rect x="82" y="84" width="76" height="8" rx="4" fill="rgba(255,255,255,.22)"/>
        <rect x="82" y="104" width="62" height="8" rx="4" fill="rgba(255,255,255,.16)"/>
        <rect x="82" y="124" width="68" height="8" rx="4" fill="rgba(255,255,255,.12)"/>
      </svg>
    `);
  }

  function render(data) {
    elList.innerHTML = "";

    const issues = data.issues.slice().sort((a, b) => {
      // issueNo を数値比較（"01" "02" など）
      const na = parseInt(a.issueNo || "0", 10);
      const nb = parseInt(b.issueNo || "0", 10);
      return nb - na;
    });

    const placeholder = makePlaceholderSVG();

    for (const it of issues) {
      const issueNo = safeText(it.issueNo, "--");
      const title = safeText(it.title, "UNTITLED");
      const subtitle = safeText(it.subtitle, "");
      const year = safeText(it.year, "");
      const pageCount = Number.isFinite(Number(it.pageCount)) ? Number(it.pageCount) : 0;
      const href = safeText(it.href, "./");
      const cover = safeText(it.coverThumb, placeholder);

      const card = document.createElement("article");
      card.className = "card";

      card.innerHTML = `
        <div class="row">
          <div class="thumb">
            <img src="${cover}" alt="Issue ${issueNo} cover" loading="lazy" decoding="async" />
          </div>

          <div class="meta">
            <small>ISSUE ${issueNo}</small>
            <h2>${title}</h2>
            <p>${subtitle}</p>
          </div>

          <div class="right">
            <div class="pill">${[year, pageCount ? `${pageCount} pages` : ""].filter(Boolean).join(" ・ ")}</div>
            <a class="btn" href="${href}">Open</a>
          </div>
        </div>
      `;

      // 画像が404でも落とさない
      const img = card.querySelector("img");
      img.addEventListener("error", () => { img.src = placeholder; }, { once: true });

      elList.appendChild(card);
    }
  }

  // boot
  loadIssues().then(render);
})();
