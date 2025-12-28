(() => {
  // ★ ここを更新すると、iPad Safari の強キャッシュ事故を避けやすい
  const ASSET_VERSION = "2025-12-28-1";

  const $issues = document.getElementById("issues");
  const $error = document.getElementById("error");

  function showError(msg){
    $error.style.display = "block";
    $error.textContent = msg;
  }

  function esc(s){
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  async function load() {
    try{
      const res = await fetch(`/data/issues.json?v=${encodeURIComponent(ASSET_VERSION)}`, { cache: "no-store" });
      if(!res.ok) throw new Error(`issues.json を取得できません (HTTP ${res.status})`);

      // JSONパース事故をここで確実に拾う
      const data = await res.json();
      const list = Array.isArray(data?.issues) ? data.issues : null;
      if(!list || list.length === 0) throw new Error("issues.json の形式が不正です（{ issues: [...] } の形にしてください）");

      render(list);
    }catch(err){
      console.error(err);
      showError(`issues.json が JSON として読めません / 取得できません。いまの原因: ${err.message}`);
    }
  }

  function render(list){
    $issues.innerHTML = "";

    for(const it of list){
      const label = it.label || it.id || "ISSUE";
      const title = it.title || "";
      const tag   = it.tagline || "";
      const year  = it.year ? String(it.year) : "";
      const pages = it.pages ? String(it.pages) : "";
      const url   = it.url || "/";
      const thumb = it.thumb || it.cover || "";

      const card = document.createElement("article");
      card.className = "card";

      const thumbHtml = thumb
        ? `<img loading="lazy" decoding="async" src="${esc(thumb)}?v=${encodeURIComponent(ASSET_VERSION)}" alt="${esc(title)}">`
        : "";

      card.innerHTML = `
        <div class="thumb">${thumbHtml}</div>

        <div class="meta">
          <div class="label">${esc(label)}</div>
          <h2 class="title">${esc(title)}</h2>
          <div class="tag">${esc(tag)}</div>
          <div class="small">
            ${year ? `<span>${esc(year)}</span>` : ``}
            ${pages ? `<span>${esc(pages)} pages</span>` : ``}
          </div>
        </div>

        <div class="open">
          <a class="btn" href="${esc(url)}?v=${encodeURIComponent(ASSET_VERSION)}">Open</a>
        </div>
      `;

      $issues.appendChild(card);
    }
  }

  load();
})();
