(async function(){
  const mag = document.getElementById("mag");
  const uiCount = document.getElementById("uiCount");
  const uiLabel = document.getElementById("uiLabel");

  const res = await fetch("/data/issue-01.json", { cache: "no-store" });
  const data = await res.json();

  // 1) 表紙（固定）
  mag.appendChild(makeCover(data));

  // 2) 本文（LOOK 01-20）
  data.looks.forEach((l) => mag.appendChild(makeLookPage(l)));

  // 3) 裏表紙（固定）
  mag.appendChild(makeBack(data));

  // UI更新（現在のページ番号）
  const pages = Array.from(document.querySelectorAll(".page"));
  const total = pages.length;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const idx = Number(e.target.getAttribute("data-index"));
      uiCount.textContent = String(idx).padStart(2,"0") + " / " + String(total).padStart(2,"0");
      uiLabel.textContent = (idx === 1) ? `${data.title} — Issue ${data.issueNo}` :
                          (idx === total) ? `End of Issue ${data.issueNo}` :
                          `LOOK ${String(idx-1).padStart(2,"0")} · ${data.issueId.toUpperCase()}`;
    });
  }, { threshold: 0.55 });

  pages.forEach(p => io.observe(p));

  function makeCover(d){
    const s = section(1);
    const frame = div("frame cover");
    const txt = div("txt");
    const left = div("left");
    left.innerHTML = `
      <div class="brandline">SAIREN COLOR ARCHIVE</div>
      <h1>${escapeHtml(d.title)}</h1>
      <p class="meta">Issue ${escapeHtml(d.issueNo)}<br>${escapeHtml(d.year)}<br>Wearable art, archived as a magazine.<br>Minimal words. Maximum signal.</p>
    `;
    const right = div("right");
    right.textContent = d.year;
    txt.appendChild(left);
    txt.appendChild(right);
    frame.appendChild(txt);
    s.appendChild(frame);
    return s;
  }

  function makeLookPage(l){
    const idx = Number(l.no) + 1; // 表紙が1ページ目
    const s = section(idx);
    const frame = div("frame");
    const fig = div("figure");

    fig.innerHTML = `
      <picture>
        <source srcset="/${l.webp}" type="image/webp">
        <img src="/${l.jpg}" alt="${escapeHtml(l.alt)}" loading="lazy" decoding="async">
      </picture>
      <div class="caption">
        <span>LOOK ${escapeHtml(l.no)}</span>
        <span>${escapeHtml(l.label)}</span>
      </div>
    `;
    frame.appendChild(fig);
    s.appendChild(frame);
    return s;
  }

  function makeBack(d){
    const s = section(d.looks.length + 2);
    const frame = div("frame back");
    const end = div("end");
    end.innerHTML = `End of Issue ${escapeHtml(d.issueNo)}<small>SAIREN COLOR ARCHIVE</small>`;
    frame.appendChild(end);
    s.appendChild(frame);
    return s;
  }

  function section(i){
    const s = document.createElement("section");
    s.className = "page";
    s.setAttribute("data-index", String(i));
    return s;
  }
  function div(cls){
    const d = document.createElement("div");
    d.className = cls;
    return d;
  }
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }
})();
