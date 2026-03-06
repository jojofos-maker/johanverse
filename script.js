const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card, .section-head, .hero-copy').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});
