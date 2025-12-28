(async function(){
  const mount = document.getElementById("issues");
  if(!mount) return;

  let data;
  try{
    const res = await fetch("/data/issues.json?v=20251228", { cache:"no-store" });
    if(!res.ok) throw new Error(res.status + " " + res.statusText);
    data = await res.json();
  }catch(e){
    mount.innerHTML = '<div class="loading">Failed to load issues.json</div>';
    return;
  }

  const issues = Array.isArray(data.issues) ? data.issues : [];
  if(!issues.length){
    mount.innerHTML = '<div class="loading">No issues found.</div>';
    return;
  }

  mount.innerHTML = issues.map(i => `
    <a class="card" href="${i.url}">
      <div class="card__kicker">${String(i.id || "").toUpperCase()}</div>
      <div class="card__title">${i.title || ""}</div>
      <div class="card__meta">Open</div>
    </a>
  `).join("");
})();