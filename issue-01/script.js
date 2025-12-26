(() => {
  const pages = Array.from(document.querySelectorAll('.page'));
  const counter = document.querySelector('[data-counter]');
  const title = document.querySelector('[data-title]');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        const idx = pages.indexOf(e.target);
        if (idx >= 0 && counter) {
          counter.textContent =
            String(idx).padStart(2,'0') + ' / ' + String(pages.length).padStart(2,'0');
        }

        const cap = e.target.querySelector('figcaption span:last-child');
        if (cap && title) title.textContent = cap.textContent;
      }
    });
  }, { threshold: 0.25 });

  pages.forEach(p => io.observe(p));

  const enter = document.querySelector('[data-enter]');
  if (enter) {
    enter.addEventListener('click', (ev) => {
      const target = document.querySelector('[data-firstpage]');
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
})(); 
