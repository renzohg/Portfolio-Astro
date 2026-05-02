// Flag to prevent double initialization of global listeners
let globalListenersAdded = false;

function initCopyEmail() {
  const copyBtn = document.getElementById("copy-btn");
  const emailInput = document.getElementById("email");
  if (!copyBtn || !emailInput) return;

  const copyBtnSpan = copyBtn.querySelector("span");
  const copiedText = copyBtn.dataset.copiedText || "Copied";
  let restoreTimeout = null;

  copyBtn.onclick = function () {
    const textToCopy = emailInput.value;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        const originalText = copyBtnSpan.textContent;
        copyBtnSpan.textContent = copiedText;
        if (restoreTimeout) clearTimeout(restoreTimeout);
        restoreTimeout = setTimeout(function () {
          copyBtnSpan.textContent = originalText;
        }, 2000);
      })
      .catch(err => console.error("Error al copiar:", err));
  };
}

function initModals() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.querySelector(".modalImage");
  const closeBtn = document.querySelector(".close");
  if (!modal || !modalImg || !closeBtn) return;

  // Use delegation for modal trigger to avoid issues with dynamic content
  if (!globalListenersAdded) {
    document.addEventListener("click", function (e) {
      if (e.target.matches(".certifications img")) {
        modalImg.src = e.target.src;
        modal.classList.add("visible");
      }
    });
  }

  closeBtn.onclick = function (e) {
    e.stopPropagation();
    modal.classList.remove("visible");
  };

  modal.onclick = function (e) {
    if (e.target === modal) modal.classList.remove("visible");
  };
}

function initCursors() {
  const cursorDot = document.querySelector("[data-cursor-dot]");
  const cursorOutline = document.querySelector("[data-cursor-outline]");
  if (!cursorDot || !cursorOutline) return;

  if (!globalListenersAdded) {
    window.addEventListener("mousemove", function (e) {
      const posX = e.clientX;
      const posY = e.clientY;
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;
      cursorOutline.animate(
        { left: `${posX}px`, top: `${posY}px` },
        { duration: 200, fill: "forwards" }
      );
    });
  }

  const inputs = document.querySelectorAll('.theme-input, .language-input, a, .theme-option, label, #copy-btn, img.image, .fa-chevron-down, .close img');
  inputs.forEach(input => {
    input.onmouseenter = () => {
      cursorDot.style.width = '12px';
      cursorDot.style.height = '12px';
      cursorDot.style.backgroundColor = 'var(--color-texto)';
      cursorDot.style.opacity = '0.8';
    };
    input.onmouseleave = () => {
      cursorDot.style.width = '25px';
      cursorDot.style.height = '25px';
      cursorDot.style.backgroundColor = 'var(--color-texto)';
    };
  });
}

// Store intervals globally to clear them on re-init
let carouselIntervals = [];

function initCarousels() {
  // Clear any existing intervals
  carouselIntervals.forEach(clearInterval);
  carouselIntervals = [];

  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    const images = carousel.querySelectorAll('.carousel-images img');
    const dots = carousel.querySelectorAll('.dot');
    let currentIndex = 0;
    const interval = 5000;

    if (images.length <= 1) return;

    function showImage(index) {
      images.forEach(img => img.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      if (images[index]) images[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
      currentIndex = index;
    }

    function nextImage() {
      let nextIndex = (currentIndex + 1) % images.length;
      showImage(nextIndex);
    }

    let slideInterval = setInterval(nextImage, interval);
    carouselIntervals.push(slideInterval);

    dots.forEach((dot, index) => {
      dot.onclick = () => {
        clearInterval(slideInterval);
        showImage(index);
        // Remove old interval from tracking and start new one
        const intIndex = carouselIntervals.indexOf(slideInterval);
        if (intIndex > -1) carouselIntervals.splice(intIndex, 1);

        slideInterval = setInterval(nextImage, interval);
        carouselIntervals.push(slideInterval);
      };
    });
  });
}

function initShowMore() {
  const btn = document.getElementById('show-more-btn');
  const extraProjects = document.getElementById('extra-projects');
  if (!btn || !extraProjects) return;

  const textSpan = btn.querySelector('.show-more-text');
  const showText = btn.dataset.showText || 'Show more';
  const hideText = btn.dataset.hideText || 'Hide projects';

  btn.onclick = function () {
    const isOpen = extraProjects.classList.toggle('show');
    btn.classList.toggle('active', isOpen);
    if (textSpan) {
      textSpan.textContent = isOpen ? hideText : showText;
    }
    if (isOpen) {
      initCarousels();
    }
  };
}

function initAll() {
  initCopyEmail();
  initModals();
  initCursors();
  initCarousels();
  initShowMore();
  globalListenersAdded = true;
}

// Support for standard load and Astro View Transitions
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('astro:page-load', initAll);
}
