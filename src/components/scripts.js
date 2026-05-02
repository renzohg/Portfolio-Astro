/**
 * Scripts optimized for Portfolio-Astro
 * Consolidated and refactored for performance and minimal size.
 */

let initialized = false;
let carouselIntervals = [];

const q = (sel) => document.querySelector(sel);
const qa = (sel) => document.querySelectorAll(sel);

const initAll = () => {
  // 1. Copy Email Logic
  const copyBtn = q("#copy-btn"), emailInput = q("#email");
  if (copyBtn && emailInput) {
    const textSpan = copyBtn.querySelector("#copy");
    let copyTimeout;
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(emailInput.value).then(() => {
        if (copyTimeout) clearTimeout(copyTimeout);
        textSpan.textContent = copyBtn.dataset.copiedText || "Copied";
        copyTimeout = setTimeout(() => {
          const lang = localStorage.getItem("lang") || "en";
          const ui = window.uiTranslations;
          if (ui?.[lang]?.["copy"]) textSpan.textContent = ui[lang]["copy"];
        }, 2000);
      });
    };
  }

  // 2. Modals (using delegation for efficiency)
  if (!initialized) {
    document.addEventListener("click", (e) => {
      const modal = q("#imageModal"), img = q(".modalImage");
      if (e.target.matches(".certifications img") && modal && img) {
        img.src = e.target.src;
        modal.classList.add("visible");
      } else if (e.target.matches("#imageModal") || e.target.matches(".close") || e.target.closest(".close")) {
        modal?.classList.remove("visible");
      }
    });
  }

  // 3. Cursors
  const dot = q("[data-cursor-dot]"), outline = q("[data-cursor-outline]");
  if (dot && outline && !initialized) {
    window.addEventListener("mousemove", (e) => {
      const { clientX: x, clientY: y } = e;
      dot.style.left = `${x}px`; dot.style.top = `${y}px`;
      outline.animate({ left: `${x}px`, top: `${y}px` }, { duration: 200, fill: "forwards" });
    });
  }

  // Cursor hover effects (using delegation)
  if (!initialized) {
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest('a, button, .theme-input, .language-input, label, .image, .icon-arrow, .close, .dot')) {
        dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
        dot.style.opacity = '0.5';
      }
    });
    document.addEventListener("mouseout", (e) => {
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
      dot.style.opacity = '0.8';
    });
  }

  // 4. Carousels
  carouselIntervals.forEach(clearInterval);
  carouselIntervals = [];
  qa('.carousel').forEach(car => {
    const imgs = car.querySelectorAll('.carousel-images img'), dots = car.querySelectorAll('.dot');
    if (imgs.length <= 1) return;
    let idx = 0;
    const show = (i) => {
      imgs.forEach((img, j) => img.classList.toggle('active', i === j));
      dots.forEach((dot, j) => dot.classList.toggle('active', i === j));
      idx = i;
    };
    const next = () => show((idx + 1) % imgs.length);
    let itv = setInterval(next, 5000);
    carouselIntervals.push(itv);
    dots.forEach((d, i) => d.onclick = () => { clearInterval(itv); show(i); itv = setInterval(next, 5000); });
  });

  // 5. Show More
  const smBtn = q('#show-more-btn'), extra = q('#extra-projects');
  if (smBtn && extra) {
    smBtn.onclick = () => {
      const open = extra.classList.toggle("show");
      smBtn.classList.toggle("active", open);
      smBtn.querySelector('.show-more-text').textContent = open ? (smBtn.dataset.hideText || "Hide") : (smBtn.dataset.showText || "See more");
      if (open) initAll(); // Re-init carousels for new visible items
    };
  }

  initialized = true;
};

if (typeof document !== 'undefined') {
  ['DOMContentLoaded', 'astro:page-load'].forEach(ev => document.addEventListener(ev, initAll));
}
