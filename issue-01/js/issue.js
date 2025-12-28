(async function(){
  const pagesEl = document.getElementById("pages");
  const curEl = document.getElementById("cur");
  const totalEl = document.getElementById("total");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const pad2 = (n) => String(n).padStart(2,"0");
  const dataUrl = (window.__ISSUE_DATA__ || "/data/issue-01.json") + "?v=20251228";

  let data;
  try{
    const res = await fetch(dataUrl, { cache:"no-store" });
    if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    data = await res.json();
  }catch(e){
    pagesEl.innerHTML = `<div class="error">読み込み失敗：<code>${dataUrl}</code><br><span class="muted">${String(e)}</span></div>`;
    return;
  }

  const pages = Array.isArray(data.pages) ? data.pages : [];
  if(!pages.length){
    pagesEl.innerHTML = `<div class="error">pages が空です：<code>${dataUrl}</code></div>`;
    return;
  }
  totalEl.textContent = pad2(pages.length);

  const frag = document.createDocumentFragment();
  pages.forEach((p, idx) => {
    const section = document.createElement("section");
    section.className = "page";
    section.dataset.index = String(idx);

    const frame = document.createElement("div");
    frame.className = "frame";

    const n = document.createElement("div");
    n.className = "pageno";
    n.textContent = pad2(idx+1);
    frame.appendChild(n);

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = p.src;
    img.alt = p.alt || `Page ${idx+1}`;

    img.addEventListener("error", () => {
      frame.innerHTML = `<div class="error">画像が読み込めません：<br><code>${p.src}</code><br><span class="muted">ファイル名の大小文字/パス/コミット漏れを確認</span></div>`;
    });

    frame.appendChild(img);
    section.appendChild(frame);
    frag.appendChild(section);
  });

  pagesEl.innerHTML = "";
  pagesEl.appendChild(frag);

  const sections = [...document.querySelectorAll(".page")];
  let currentIndex = 0;

  const io = new IntersectionObserver((entries) => {
    const v = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!v) return;
    currentIndex = Number(v.target.dataset.index || 0);
    curEl.textContent = pad2(currentIndex+1);
  }, { threshold:[0.55] });

  sections.forEach(s => io.observe(s));
  curEl.textContent = "01";

  const scrollToIndex = (i) => sections[i]?.scrollIntoView({ behavior:"smooth", block:"start" });
  prevBtn?.addEventListener("click", ()=>scrollToIndex(Math.max(0,currentIndex-1)));
  nextBtn?.addEventListener("click", ()=>scrollToIndex(Math.min(sections.length-1,currentIndex+1)));

  window.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft") scrollToIndex(Math.max(0, currentIndex-1));
    if(e.key === "ArrowRight") scrollToIndex(Math.min(sections.length-1, currentIndex+1));
  });
})();