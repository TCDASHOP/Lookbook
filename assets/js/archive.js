(() => {
  const VERSION = "2025-12-28-1";
  const elList = document.getElementById("issues");
  const elAlert = document.getElementById("alert");
  const elY = document.getElementById("y");
  const elSub = document.getElementById("sub");
  const elTitle = document.getElementById("title");
  const elLead = document.getElementById("lead");

  if (elY) elY.textContent = String(new Date().getFullYear());

  function showAlert(msg){
    if(!elAlert) return;
    elAlert.style.display = "block";
    elAlert.textContent = msg;
  }
  function hideAlert(){
    if(!elAlert) return;
    elAlert.style.display = "none";
    elAlert.textContent = "";
  }

  function getLang(){
    const url = new URL(location.href);
    const fromQS = (url.searchParams.get("lang") || "").toLowerCase();
    const saved = (localStorage.getItem("sca_lang") || "").toLowerCase();
    const lang = fromQS || saved || "ja";
    const allowed = new Set(["ja","en","es","fr","ko","zh-hans"]);
    return allowed.has(lang) ? lang : "ja";
  }

  function setLang(lang){
    localStorage.setItem("sca_lang", lang);
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState({}, "", url.toString());
  }

  async function fetchJSON(path){
    const url = new URL(path, location.href);
    url.searchParams.set("v", VERSION);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.json();
  }

  function t(dict, lang, fallback=""){
    if(!dict) return fallback;
    if(typeof dict === "string") return dict;
    return dict[lang] || dict["ja"] || fallback;
  }

  function placeholder(){
    return `data:image/svg+xml;charset=utf-8,` + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="rgba(255,255,255,.10)"/>
            <stop offset="1" stop-color="rgba(255,255,255,.02)"/>
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="28" fill="url(#g)"/>
        <rect x="62" y="56" width="116" height="148" rx="14" fill="rgba(0,0,0,.22)" stroke="rgba(255,255,255,.12)"/>
        <rect x="82" y="84" width="76" height="8" rx="4" fill="rgba(255,255,255,.22)"/>
        <rect x="82" y="104" width="62" height="8" rx="4" fill="rgba(255,255,255,.16)"/>
        <rect x="82" y="124" width="68" height="8" rx="4" fill="rgba(255,255,255,.12)"/>
      </svg>
    `);
  }

  function wireLangUI(current){
    document.querySelectorAll(".langbtn").forEach(btn => {
      const l = btn.getAttribute("data-lang");
      btn.dataset.active = (l === current) ? "1" : "0";
      btn.addEventListener("click", () => {
        setLang(l);
        location.reload();
      }, { passive: true });
    });
  }

  function render(issues, i18n, lang){
    elList.innerHTML = "";
    const ph = placeholder();

    issues.forEach(it => {
      const issueNo = it.issueNo || "--";
      const title = t(it.title, lang, "UNTITLED");
      const subtitle = t(it.subtitle, lang, "");
      const year = it.year || "";
      const pageCount = Number.isFinite(Number(it.pageCount)) ? Number(it.pageCount) : 0;
      const href = it.href || "./";
      const cover = it.coverThumb || ph;

      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="row">
          <div class="thumb">
            <img src="${cover}?v=${VERSION}" alt="Issue ${issueNo} cover" loading="lazy" decoding="async">
          </div>
          <div class="meta">
            <small>ISSUE ${issueNo}</small>
            <h2>${title}</h2>
            <p>${subtitle}</p>
          </div>
          <div class="right">
            <div class="pill">${[year, pageCount ? `${pageCount} ${t(i18n.pages, lang, "pages")}` : ""].filter(Boolean).join(" ・ ")}</div>
            <a class="btn" href="${href}?lang=${encodeURIComponent(lang)}">${t(i18n.open, lang, "Open")}</a>
          </div>
        </div>
      `;
      const img = card.querySelector("img");
      img.addEventListener("error", () => { img.src = ph; }, { once:true });
      elList.appendChild(card);
    });
  }

  async function main(){
    const lang = getLang();
    wireLangUI(lang);

    try{
      const i18n = await fetchJSON("./assets/data/i18n.json");
      if(elSub) elSub.textContent = t(i18n.lookbookLabel, lang, "LOOKBOOK");
      if(elTitle) elTitle.textContent = t(i18n.headline, lang, "COLOR AS TIME");
      if(elLead) elLead.textContent = t(i18n.lead, lang, "");

      const data = await fetchJSON("./data/issues.json");
      if(!data || !Array.isArray(data.issues)) throw new Error("issues.json format");

      hideAlert();
      render(data.issues, i18n, lang);
    }catch(e){
      console.error(e);
      showAlert("issues.json / i18n.json の読み込みに失敗しました。\n・ファイル配置\n・JSONの構文\n・キャッシュ\nを確認してください。");
    }
  }

  main();
})();
