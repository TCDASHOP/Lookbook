/* assets/js/archive.js */
(() => {
  const $ = (sel) => document.querySelector(sel);

  const mount = $("#issues");
  const status = $("#status");

  function escapeHtml(s = "") {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cardTemplate(issue) {
    const label = escapeHtml(issue.label || "");
    const title = escapeHtml(issue.title || "");
    const subtitle = escapeHtml(issue.subtitle || "");
    const url = issue.url || "#";
    const openLabel = escapeHtml(issue.openLabel || "Open");
    const thumb = issue.coverThumb || "";
    const alt = escapeHtml(issue.coverAlt || `${label} ${title}`);

    const thumbHtml = thumb
      ? `<div class="card__thumb" aria-hidden="true">
           <img src="${thumb}" alt="${alt}" loading="lazy" decoding="async">
         </div>`
      : "";

    return `
      <article class="card">
        ${thumbHtml}
        <div class="card__body">
          <div class="card__meta">${label}</div>
          <h2 class="card__title">${title}</h2>
          <p class="card__sub">${subtitle}</p>
          <a class="card__open" href="${url}" aria-label="${label} ${title}">${openLabel}</a>
        </div>
      </article>
    `;
  }

  async function main() {
    try {
      status.textContent = "Loading…";

      const res = await fetch("/data/issues.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`issues.json fetch failed: ${res.status}`);

      const data = await res.json();
      const issues = Array.isArray(data.issues) ? data.issues : [];

      if (!issues.length) {
        status.textContent = "No issues yet.";
        mount.innerHTML = "";
        return;
      }

      mount.innerHTML = issues.map(cardTemplate).join("");
      status.textContent = "";
    } catch (err) {
      console.error(err);
      status.textContent = "Failed to load.";
      mount.innerHTML = `
        <div class="error">
          <div>Data load error</div>
          <code>${escapeHtml(err?.message || String(err))}</code>
        </div>
      `;
    }
  }

  main();
})();
