// ============================================================
// Angel Beauty — Shared site behaviour (drawer nav, toast)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const closeBtn = document.getElementById('drawerClose');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle && drawer && overlay) {
    toggle.addEventListener('click', openDrawer);
    closeBtn && closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  }

  // Floating social menu
  const fab = document.getElementById('socialFab');
  if (fab) {
    const fabMain = fab.querySelector('.social-fab-main');
    fabMain.addEventListener('click', () => {
      const isOpen = fab.classList.toggle('open');
      fabMain.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (fab.classList.contains('open') && !fab.contains(e.target)) {
        fab.classList.remove('open');
        fabMain.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        fab.classList.remove('open');
        fabMain.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// Simple global toast utility, used by booking/portfolio/blog pages
function showToast(message, duration = 2600) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// Angel Beauty — Testimonials Infinite Marquee
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const marquee = document.querySelector(".marquee-wrap");
  const track = document.getElementById("quoteMarquee");

  if (!marquee || !track) return;

  // ----------------------------------------------------------
  // Original cards
  // ----------------------------------------------------------

  const originalCards = Array.from(track.children);

  if (!originalCards.length) return;


  // ----------------------------------------------------------
  // Duplicate original cards
  // ----------------------------------------------------------

  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);

    clone.setAttribute("aria-hidden", "true");

    track.appendChild(clone);
  });


  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  let position = 0;
  let loopWidth = 0;

  let isDragging = false;

  let startX = 0;
  let startPosition = 0;

  const speed = 0.6;


  // ----------------------------------------------------------
  // Calculate exact width of ONE complete set
  // ----------------------------------------------------------

  function calculateLoopWidth() {

    const firstCard = track.children[0];

    const secondSetFirstCard =
      track.children[originalCards.length];

    if (!firstCard || !secondSetFirstCard) {
      return;
    }

    const firstRect =
      firstCard.getBoundingClientRect();

    const secondRect =
      secondSetFirstCard.getBoundingClientRect();

    /*
     * چون marquee و track هر دو LTR هستند،
     * این فاصله دقیقاً عرض یک مجموعه کامل است.
     */

    loopWidth =
      secondRect.left - firstRect.left;
  }


  // ----------------------------------------------------------
  // Infinite loop
  // ----------------------------------------------------------

  function normalize() {

    if (loopWidth <= 0) {
      return;
    }

    /*
     * حرکت به سمت چپ
     */

    if (position <= -loopWidth) {
      position += loopWidth;
    }

    /*
     * اگر کاربر به سمت راست drag کرد
     */

    if (position > 0) {
      position -= loopWidth;
    }
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  function render() {

    track.style.transform =
      `translate3d(${position}px, 0, 0)`;
  }


  // ----------------------------------------------------------
  // Automatic movement
  // ----------------------------------------------------------

  function animate() {

    if (!isDragging) {

      position -= speed;

      normalize();

      render();
    }

    requestAnimationFrame(animate);
  }


  // ==========================================================
  // MOUSE DRAG
  // ==========================================================

  marquee.addEventListener("mousedown", (event) => {

    /*
     * جلوگیری از انتخاب شدن متن
     */

    event.preventDefault();

    isDragging = true;

    startX = event.clientX;

    startPosition = position;

    marquee.classList.add("dragging");
  });


  window.addEventListener("mousemove", (event) => {

    if (!isDragging) {
      return;
    }

    const delta =
      event.clientX - startX;

    position =
      startPosition + delta;

    normalize();

    render();
  });


  window.addEventListener("mouseup", () => {

    if (!isDragging) {
      return;
    }

    isDragging = false;

    marquee.classList.remove("dragging");
  });


  // ==========================================================
  // TOUCH / MOBILE
  // ==========================================================

  marquee.addEventListener(
    "touchstart",
    (event) => {

      isDragging = true;

      startX =
        event.touches[0].clientX;

      startPosition =
        position;
    },
    {
      passive: true
    }
  );


  marquee.addEventListener(
    "touchmove",
    (event) => {

      if (!isDragging) {
        return;
      }

      const delta =
        event.touches[0].clientX -
        startX;

      position =
        startPosition + delta;

      normalize();

      render();
    },
    {
      passive: true
    }
  );


  marquee.addEventListener(
    "touchend",
    () => {

      isDragging = false;
    }
  );


  // ==========================================================
  // RESIZE
  // ==========================================================

  window.addEventListener("resize", () => {

    calculateLoopWidth();

    normalize();

    render();
  });


  // ==========================================================
  // START
  // ==========================================================

  calculateLoopWidth();

  render();

  requestAnimationFrame(animate);

});