// assets/js/archive.js
(() => {
  const $list = document.getElementById("issuesList");
  const $err = document.getElementById("errorBox");
  const $year = document.getElementById("year");
  const $seriesTitle = document.getElementById("seriesTitle");
  const $seriesLead = document.getElementById("seriesLead");

  $year.textContent = String(new Date().getFullYear());

  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));

  const pad2 = (n) => String(n).padStart(2, "0");

  const showError = (msg) => {
    $err.style.display = "block";
    $err.innerHTML = escapeHtml(msg);
  };

  const coverFallbackSvg = () => {
    // 画像が無くてもカードが壊れない（白画面化しない）ためのフォールバック
    return `
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="10" y="8" width="44" height="48" rx="10" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.18)"/>
        <path d="M22 26h20M22 34h16" stroke="rgba(255,255,255,.30)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="24" cy="44" r="2" fill="rgba(255,255,255,.30)"/>
        <path d="M28 44h14" stroke="rgba(255,255,255,.30)" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `.trim();
  };

  const renderCard = (issue) => {
    const num = issue.issueNumber ?? issue.issue ?? "";
    const issueLabel = num !== "" ? `ISSUE ${pad2(num)}` : (issue.label ?? "ISSUE");
    const title = escapeHtml(issue.title ?? "");
    const desc = escapeHtml(issue.description ?? "");
    const href = issue.href ?? "#";
    const pages = issue.pageCount ? `${issue.pageCount} pages` : "";
    const date = issue.date ? escapeHtml(issue.date) : "";
    const hint = [date, pages].filter(Boolean).join(" · ");

    const card = document.createElement("article");
    card.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const imgSrc = issue.coverThumb ?? issue.cover ?? "";
    if (imgSrc) {
      const img = document.createElement("img");
      img.alt = `${issueLabel} ${issue.title ?? ""}`.trim();
      img.loading = "lazy";
      img.decoding = "async";
      img.src = imgSrc;

      img.onerror = () => {
        thumb.innerHTML = coverFallbackSvg();
      };

      thumb.appendChild(img);
    } else {
      thumb.innerHTML = coverFallbackSvg();
    }

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div class="issueLine">${escapeHtml(issueLabel)}</div>
      <div class="title">${title}</div>
      <div class="desc">${desc}</div>
      <div class="actions">
        <a class="btn" href="${escapeHtml(href)}" aria-label="Open ${title}">Open</a>
        <div class="hint" title="${escapeHtml(hint)}">${escapeHtml(hint)}</div>
      </div>
    `;

    card.appendChild(thumb);
    card.appendChild(meta);
    return card;
  };

  const safeJson = async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); } catch {
      throw new Error("issues.json が JSON として読めません（カンマ/括弧/引用符を確認）");
    }
  };

  const init = async () => {
    try {
      const url = `data/issues.json?ts=${Date.now()}`; // キャッシュで更新が反映されない事故対策
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`issues.json が取得できません（HTTP ${res.status}）`);

      const data = await safeJson(res);

      // 形式を許容： {issues:[...]} / [...] のどちらでもOK
      const issues = Array.isArray(data) ? data : (data.issues ?? []);
      if (!Array.isArray(issues) || issues.length === 0) {
        throw new Error("issues.json に issues がありません（空です）");
      }

      // シリーズ表記（任意）
      const series = data.series ?? null;
      if (series?.title) $seriesTitle.textContent = String(series.title);
      if (series?.lead) $seriesLead.textContent = String(series.lead);

      // 表示をクリアしてから描画
      $list.innerHTML = "";
      issues
        .slice()
        .sort((a, b) => (Number(a.issueNumber ?? 0) - Number(b.issueNumber ?? 0)))
        .forEach((issue) => $list.appendChild(renderCard(issue)));

    } catch (e) {
      console.error(e);
      showError(
        (e && e.message) ? e.message :
        "読み込みに失敗しました。issues.json / パス / 文字ミスを確認してください。"
      );
    }
  };

  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
