(() => {
  const $issues = document.getElementById("issues");
  if (!$issues) return;

  const escapeHTML = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const makeThumb = (issue) => {
    const wrap = document.createElement("div");
    wrap.className = "issueThumb";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = `${issue.issueLabel || issue.issueNo || issue.id || "ISSUE"} cover`;
    img.src = issue.coverThumb || "";

    img.onerror = () => {
      wrap.innerHTML = `<div class="thumbFallback">${escapeHTML(issue.issueLabel || issue.issueNo || "ISSUE")}</div>`;
    };

    // coverThumb が空の場合もフォールバック
    if (!img.src) {
      wrap.innerHTML = `<div class="thumbFallback">${escapeHTML(issue.issueLabel || issue.issueNo || "ISSUE")}</div>`;
      return wrap;
    }

    wrap.appendChild(img);
    return wrap;
  };

  const renderIssueCard = (issue) => {
    const a = document.createElement("a");
    a.className = "card";
    a.href = issue.href || "#";
    a.setAttribute("aria-label", `Open ${issue.issueLabel || issue.issueNo || issue.id || "issue"}`);

    const row = document.createElement("div");
    row.className = "issueCard";

    row.appendChild(makeThumb(issue));

    const meta = document.createElement("div");
    meta.className = "issueMeta";

    const topline = document.createElement("div");
    topline.className = "issueTopline";
    topline.textContent = issue.issueLabel || issue.issueNo || "ISSUE";

    const title = document.createElement("div");
    title.className = "issueTitle";
    title.textContent = issue.title || "Untitled";

    const desc = document.createElement("div");
    desc.className = "issueDesc";
    desc.textContent = issue.description || "";

    const action = document.createElement("div");
    action.className = "issueAction";
    action.innerHTML = `<span class="pill">Open</span>`;

    meta.appendChild(topline);
    meta.appendChild(title);
    if (issue.description) meta.appendChild(desc);
    meta.appendChild(action);

    row.appendChild(meta);
    a.appendChild(row);
    return a;
  };

  const loadIssues = async () => {
    // Cloudflare/GitHub Pages のキャッシュで古いJSONを掴むことがあるので no-store
    const res = await fetch("/data/issues.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`issues.json load failed: ${res.status}`);
    return await res.json();
  };

  (async () => {
    try {
      const data = await loadIssues();
      const issues = Array.isArray(data?.issues) ? data.issues : [];

      $issues.innerHTML = "";

      if (!issues.length) {
        $issues.innerHTML = `<div style="opacity:.7;font-size:14px;">No issues yet.</div>`;
        return;
      }

      // 新しい順（dateがある場合）
      issues.sort((a, b) => (String(b.date || "")).localeCompare(String(a.date || "")));

      for (const issue of issues) {
        $issues.appendChild(renderIssueCard(issue));
      }
    } catch (err) {
      console.error(err);
      $issues.innerHTML = `<div style="opacity:.7;font-size:14px;">Failed to load issues.</div>`;
    }
  })();
})();
