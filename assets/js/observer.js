(() => {
  const looks = document.querySelectorAll('.look');

  if (!looks.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // 1回見えたら監視解除（軽量化）
          io.unobserve(entry.target);
        }
      }
    },
    {
      root: null,
      threshold: 0.22,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  looks.forEach((el) => io.observe(el));
})();
