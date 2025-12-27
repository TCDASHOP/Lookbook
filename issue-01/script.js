// Issue 01 UI helpers
(() => {
  const pages = Array.from(document.querySelectorAll('section.page'));
  const counterEl = document.querySelector('[data-counter]');
  const tagEl = document.querySelector('[data-tag]');

  const pad2 = (n) => String(n).padStart(2, '0');

  // Total pages: 20 looks + back cover (= pages.length)
  const total = pages.length;

  const setCounter = (currentIdx) => {
    if (!counterEl) return;
    const cur = Math.min(Math.max(currentIdx, 1), Math.max(total, 1));
    counterEl.textContent = `${pad2(cur)} / ${pad2(total)}`;
  };

  // sensible initial value (cover shown before any page intersects)
  setCounter(1);

  // Update tag + counter when a page becomes centered-ish in the viewport
  if (pages.length) {
    const io = new IntersectionObserver((entries) => {
      // pick the most visible page
      const best = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!best) return;

      const idx = pages.indexOf(best.target);
      if (idx === -1) return;

      // idx is 0-based for pages; display is 1-based
      setCounter(idx + 1);

      const label = best.target.getAttribute('aria-label');
      if (tagEl && label) {
        // "LOOK 01" / "End of Issue 01" etc. keep it minimal
        if (label.startsWith('LOOK ')) tagEl.textContent = label.replace('LOOK ', 'LOOK ') ;
      }
    }, { threshold: [0.2, 0.4, 0.6] });

    pages.forEach(p => io.observe(p));
  }

  // ENTER link: jump to first page list
  const enter = document.querySelector('[data-enter]');
  if (enter) {
    enter.addEventListener('click', (e) => {
      // allow default hash jump, but ensure focus
      const target = document.querySelector('#pages');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      e.preventDefault();
    });
  }
})();
