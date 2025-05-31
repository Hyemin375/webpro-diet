const slides = document.getElementById('slides');
let index = 0;
const total = slides.children.length;

function showNextSlide() {
  index = (index + 1) % total;
  slides.style.transform = `translateX(-${index * 100}%)`;
}

setInterval(showNextSlide, 3000);
