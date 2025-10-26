// Inicializa o lightbox
const lightbox = GLightbox({
  selector: '.glightbox',
  touchNavigation: true,
  loop: true,
  zoomable: true,
});

// Fade-in das imagens com IntersectionObserver
const images = document.querySelectorAll('.gallery a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

images.forEach(img => observer.observe(img));
