const items = document.querySelectorAll('.look-item');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  {
    threshold: 0.4
  }
);

items.forEach(item => observer.observe(item));
