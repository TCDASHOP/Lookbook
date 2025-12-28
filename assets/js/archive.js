(() => {
  const $ = (sel) => document.querySelector(sel);

  const esc = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const fmtIssue = (n) => String(n ?? "").padStart(2, "0");

  async function load() {
    const mount = $("#issues");
    if (!mount) return;

    mount.innerHTML = `<div class="loading">Loading…</div>`;

    let data;
    try {
      // 相対パスにして、GitHub Pages / 独自ドメイン / ローカル全部で崩れにくくする
      const res = await fetch("./data/issues.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`issues.json fetch failed: ${res.status}`);
      data = await res.json();
    } catch (e) {
      console.error(e);
      mount.innerHTML =
        `<div class="error">Failed to load archive data.</div>`;
      return;
    }

    const issues = Array.isArray(data.issues) ? data.issues.slice() : [];

    // 新しい順（dateが無いものは最後）
    issues.sort((a, b) => {
      const da = Date.parse(a?.date || "");
      const db = Date.parse(b?.date || "");
      if (Number.isNaN(da) && Number.isNaN(db)) return 0;
      if (Number.isNaN(da)) return 1;
      if (Number.isNaN(db)) return -1;
      return db - da;
    });

    const cards = issues
      .filter((it) => (it?.status || "published") !== "hidden")
      .map((it) => {
        const href = it?.href || `./${esc(it?.id)}/`;
        const cover = it?.cover || "";
        const issueNo = fmtIssue(it?.issueNo);
        const title = esc(it?.title || it?.id || "Untitled");
        const subtitle = esc(it?.subtitle || "");
        const meta = issueNo ? `ISSUE ${issueNo}` : "ISSUE";

        return `
<a class="issueCard" href="${href}" aria-label="Open ${title}">
  <div class="issueThumb" aria-hidden="true">
    ${cover ? `<img src="${cover}" alt="" loading="lazy" decoding="async">` : `<div class="issueThumbFallback"></div>`}
  </div>
  <div class="issueBody">
    <div class="issueMeta">${esc(meta)}</div>
    <div class="issueTitle">${title}</div>
    ${subtitle ? `<div class="issueSub">${subtitle}</div>` : ``}
    <div class="issueCta">Open</div>
  </div>
</a>
`.trim();
      })
      .join("\n");

    mount.innerHTML = cards || `<div class="empty">No issues yet.</div>`;
  }

  document.addEventListener("DOMContentLoaded", load);
})();
