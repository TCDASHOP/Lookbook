(async function () {
  const mount = document.getElementById("issues");
  const heroTitle = document.getElementById("heroTitle");
  const heroLead = document.getElementById("heroLead");
  if (!mount) return;

  const build = window.__BUILD__ || "1";
  const dataUrl = `/data/issues.json?v=${encodeURIComponent(build)}`;

  const safeText = (v) => (typeof v === "string" ? v : "");
  const esc = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const formatIssueNo = (id) => {
    // "issue-01" -> "01"
    const m = String(id || "").match(/(\d{1,3})$/);
    if (!m) return "--";
    return String(m[1]).padStart(2, "0");
  };

  let data;
  try {
    const res = await fetch(dataUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    data = await res.json();
  } catch (e) {
    mount.innerHTML = `
      <div class="error">
        読み込み失敗：<code>${esc(dataUrl)}</code><br>
        <span class="muted">${esc(String(e))}</span>
      </div>`;
    return;
  }

  // Hero（任意）
  if (heroTitle && safeText(data.heroTitle)) heroTitle.textContent = data.heroTitle;
  if (heroLead && safeText(data.heroLead)) heroLead.textContent = data.heroLead;

  const issues = Array.isArray(data.issues) ? data.issues : [];
  if (!issues.length) {
    mount.innerHTML = `<div class="error">issues が空です：<code>${esc(dataUrl)}</code></div>`;
    return;
  }

  // 並び順：issueNoがあればそれ優先、なければidの末尾数字
  issues.sort((a, b) => {
    const an = Number(a.issueNo ?? formatIssueNo(a.id));
    const bn = Number(b.issueNo ?? formatIssueNo(b.id));
    return an - bn;
  });

  const fallbackCover = safeText(data.fallbackCover) || "/assets/og/lookbook-og.jpg";

  mount.innerHTML = issues
    .map((i) => {
      const id = safeText(i.id) || "issue-??";
      const no = String(i.issueNo ?? formatIssueNo(id)).padStart(2, "0");
      const title = safeText(i.title) || "UNTITLED";
      const subtitle = safeText(i.subtitle) || "Open";
      const url = safeText(i.url) || `/${id}/`;
      const cover = safeText(i.cover) || fallbackCover;

      return `
<a class="card" href="${esc(url)}" aria-label="Open ${esc(title)}">
  <div class="card__cover" style="background-image:url('${esc(cover)}')"></div>
  <div class="card__body">
    <div class="card__kicker">ISSUE ${esc(no)}</div>
    <div class="card__title">${esc(title)}</div>
    <div class="card__meta">${esc(subtitle)}</div>
  </div>
</a>`;
    })
    .join("");
})();
