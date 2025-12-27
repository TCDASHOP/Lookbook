(async function(){
  const base = window.__ISSUE_BASE__ || "";
  const pagesEl = document.getElementById("pages");
  const curEl = document.getElementById("cur");
  const totalEl = document.getElementById("total");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  function pad2(n){ return String(n).padStart(2,"0"); }

  let data;
  try{
    const res = await fetch(`${base}/issue.json`, { cache: "no-store" });
    if(!res.ok) throw new Error(`issue.json fetch failed: ${res.status}`);
    data = await res.json();
  }catch(e){
    pagesEl.innerHTML = `
      <div style="padding:92px 18px;opacity:.85;font-size:13px;line-height:1.7">
        読み込み失敗：issue.json が取得できません。<br/>
        <span style="opacity:.7">${String(e)}</span><br/><br/>
        まず確認：<br/>
        ・${base}/issue.json が実在するか<br/>
        ・JSON内の画像パスと実ファイル名が一致しているか（大小文字含む）
      </div>
    `;
    return;
  }

  const pages = Array.isArray(data.pages) ? data.pages : [];
  totalEl.textContent = pad2(pages.length);

  // DOM生成
  const frag = document.createDocumentFragment();
  pages.forEach((p, idx) => {
    const section = document.createElement("section");
    section.className = "page";
    section.dataset.index = String(idx);

    const frame = document.createElement("div");
    frame.className = "frame";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = p.src;
    img.alt = p.alt || `Page ${idx+1}`;

    // 画像が404のとき可視化（真っ白事故防止）
    img.addEventListener("error", () => {
      frame.innerHTML = `
        <div style="padding:18px; font-size:12px; line-height:1.6; opacity:.85">
          画像が読み込めません：<br/>
          <span style="opacity:.7">${p.src}</span><br/><br/>
          ・ファイル名（大小文字）<br/>
          ・パスの先頭スラッシュ有無<br/>
          ・GitHubにコミット済みか<br/>
          を確認
        </div>
      `;
    });

    frame.appendChild(img);
    section.appendChild(frame);
    frag.appendChild(section);
  });
  pagesEl.appendChild(frag);

  // 現在ページ表示（IntersectionObserver）
  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if(!visible) return;
    const i = Number(visible.target.dataset.index || 0);
    curEl.textContent = pad2(i+1);
    currentIndex = i;
  }, { threshold: [0.55] });

  const sections = [...document.querySelectorAll(".page")];
  sections.forEach(s => io.observe(s));

  // Prev/Next（ボタン）
  let currentIndex = 0;
  function scrollToIndex(i){
    const t = sections[i];
    if(!t) return;
    t.scrollIntoView({ behavior:"smooth", block:"start" });
  }
  prevBtn?.addEventListener("click", () => scrollToIndex(Math.max(0, currentIndex-1)));
  nextBtn?.addEventListener("click", () => scrollToIndex(Math.min(sections.length-1, currentIndex+1)));

  // キーボード（PC）
  window.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft") scrollToIndex(Math.max(0, currentIndex-1));
    if(e.key === "ArrowRight") scrollToIndex(Math.min(sections.length-1, currentIndex+1));
  });
})();
