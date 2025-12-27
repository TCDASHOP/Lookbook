(() => {
  const $mag = document.getElementById('magazine');
  const $pillIndex = document.getElementById('pillIndex');
  const $pillTitle = document.getElementById('pillTitle');
  const $btnPrev = document.getElementById('btnPrev');
  const $btnNext = document.getElementById('btnNext');

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function el(tag, className, html){
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function buildCover(data){
    const page = el('section', 'page');
    const card = el('div', 'card cover');
    const inner = el('div', 'cover-inner');

    const kicker = el('div', 'cover-kicker', (data.kicker || '').toUpperCase());
    const title = el('div', 'cover-title', data.title || 'Issue');
    const sub = el('p', 'cover-sub', data.subtitle || '');
    const meta = el('div', 'cover-meta');
    meta.appendChild(el('span', '', `Issue ${data.issue || ''}`));
    meta.appendChild(el('span', '', data.year || ''));
    meta.appendChild(el('span', '', 'Scroll is the binding.'));

    const foot = el('div', 'cover-foot', 'Images are the pages.');

    inner.appendChild(kicker);
    inner.appendChild(title);
    inner.appendChild(sub);
    inner.appendChild(meta);
    inner.appendChild(foot);

    card.appendChild(inner);
    page.appendChild(card);
    return page;
  }

  function buildLookPage(look, idx){
    const page = el('section', 'page');
    page.dataset.index = String(idx);

    const card = el('div', 'card');
    const frame = el('div', 'frame');
    const frameInner = el('div', 'frame-inner');

    const picture = document.createElement('picture');
    if (look.webp){
      const s = document.createElement('source');
      s.srcset = look.webp;
      s.type = 'image/webp';
      picture.appendChild(s);
    }
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = look.jpg || look.webp || '';
    img.alt = look.alt || look.code || `Look ${idx+1}`;

    // Determine orientation and set aspect-ratio class (NO CROP: object-fit is contain in CSS)
    img.addEventListener('load', () => {
      const w = img.naturalWidth || 1;
      const h = img.naturalHeight || 1;
      frameInner.classList.remove('portrait', 'square');
      if (Math.abs(w - h) < 40) frameInner.classList.add('square');
      else if (h > w) frameInner.classList.add('portrait');
    });

    picture.appendChild(img);
    frameInner.appendChild(picture);
    frame.appendChild(frameInner);

    const cap = el('div', 'caption');
    const left = el('div', 'left', look.code || `LOOK ${(idx+1).toString().padStart(2,'0')}`);
    const right = el('div', 'right', look.label || '');
    cap.appendChild(left);
    cap.appendChild(right);

    card.appendChild(frame);
    card.appendChild(cap);
    page.appendChild(card);
    return page;
  }

  function buildBackCover(data){
    const page = el('section', 'page');
    const card = el('div', 'card cover');
    const inner = el('div', 'cover-inner');

    const kicker = el('div', 'cover-kicker', (data.endText || 'End').toUpperCase());
    const title = el('div', 'cover-title', data.endBrand || 'SAIREN COLOR ARCHIVE');
    const sub = el('p', 'cover-sub', ' ');
    const meta = el('div', 'cover-meta');
    meta.appendChild(el('span', '', `Issue ${data.issue || ''}`));
    meta.appendChild(el('span', '', data.year || ''));
    meta.appendChild(el('span', '', '—'));

    inner.appendChild(kicker);
    inner.appendChild(title);
    inner.appendChild(sub);
    inner.appendChild(meta);

    card.appendChild(inner);
    page.appendChild(card);
    return page;
  }

  function getPages(){
    return Array.from($mag.querySelectorAll('.page'));
  }

  function getActiveIndex(){
    const pages = getPages();
    if (!pages.length) return 0;

    // Find nearest page top to viewport
    const top = window.scrollY;
    let best = 0;
    let bestDist = Infinity;
    pages.forEach((p, i) => {
      const y = p.getBoundingClientRect().top + window.scrollY;
      const d = Math.abs(y - top - 80);
      if (d < bestDist){ bestDist = d; best = i; }
    });
    return best;
  }

  function scrollToIndex(i){
    const pages = getPages();
    if (!pages.length) return;
    const idx = clamp(i, 0, pages.length - 1);
    pages[idx].scrollIntoView({behavior:'smooth', block:'start'});
  }

  function updatePills(){
    const pages = getPages();
    const idx = getActiveIndex();
    const total = Math.max(1, pages.length);
    $pillIndex.textContent = String(idx).padStart(2,'0') + ' / ' + String(total-1).padStart(2,'0');
  }

  async function init(){
    const res = await fetch('/data/issue-01.json', {cache:'no-store'});
    const data = await res.json();

    $mag.innerHTML = '';
    $pillTitle.textContent = `${data.title || 'Issue'} — Issue ${data.issue || ''}`;

    $mag.appendChild(buildCover(data));

    (data.looks || []).forEach((look, i) => {
      $mag.appendChild(buildLookPage(look, i+1));
    });

    $mag.appendChild(buildBackCover(data));

    // Buttons
    $btnPrev.addEventListener('click', () => scrollToIndex(getActiveIndex() - 1));
    $btnNext.addEventListener('click', () => scrollToIndex(getActiveIndex() + 1));

    // Keyboard (desktop)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') scrollToIndex(getActiveIndex() - 1);
      if (e.key === 'ArrowRight') scrollToIndex(getActiveIndex() + 1);
    });

    // Update pills on scroll
    let raf = 0;
    window.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updatePills);
    }, {passive:true});

    updatePills();
  }

  init().catch((err) => {
    console.error(err);
    $mag.innerHTML = '<div class="loading">Failed to load issue data.</div>';
  });
})();
