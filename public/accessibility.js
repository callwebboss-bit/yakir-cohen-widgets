/*!
 * סרגל נגישות | אולפני יקיר כהן
 * v2.0 | Cloudflare Pages Edition
 * WCAG 2.1 AA — keyboard, focus-trap, aria-pressed, localStorage
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'ykp-a11y-v2';
  const defaults    = { fontSize: 100, highContrast: false, reduceMotion: false, spacing: false };
  let   settings    = Object.assign({}, defaults);

  /* ── HTML ── */
  const html = `
<button class="a11y-btn-floating" id="a11yOpenBtn"
        aria-label="פתח הגדרות נגישות"
        aria-haspopup="dialog"
        aria-controls="a11yOverlay">
  <span aria-hidden="true">♿</span>
</button>

<div class="a11y-overlay" id="a11yOverlay"
     role="dialog"
     aria-modal="true"
     aria-labelledby="a11yTitle"
     hidden>
  <div class="a11y-modal">
    <div class="a11y-modal-header">
      <h2 id="a11yTitle">🔧 הגדרות נגישות</h2>
      <button class="a11y-close" id="a11yCloseBtn" aria-label="סגור הגדרות נגישות">×</button>
    </div>

    <!-- גודל טקסט -->
    <div class="a11y-section">
      <label class="a11y-label" for="a11yFontSlider">📝 גודל טקסט</label>
      <div class="a11y-control">
        <span class="a11y-badge" id="a11yFontVal">100%</span>
      </div>
      <input type="range" min="80" max="150" value="100"
             class="a11y-slider" id="a11yFontSlider"
             aria-label="גודל גופן, אחוז">
    </div>

    <!-- ניגודיות גבוהה -->
    <div class="a11y-section">
      <span class="a11y-label">🌙 ניגודיות גבוהה</span>
      <div class="a11y-control">
        <button class="a11y-toggle" id="a11yContrastBtn" aria-pressed="false">הפעל</button>
      </div>
    </div>

    <!-- הקטנת אנימציות -->
    <div class="a11y-section">
      <span class="a11y-label">⏸️ הקטנת אנימציות</span>
      <div class="a11y-control">
        <button class="a11y-toggle" id="a11yMotionBtn" aria-pressed="false">הפעל</button>
      </div>
    </div>

    <!-- ריווח מוגבר -->
    <div class="a11y-section">
      <span class="a11y-label">📏 ריווח מוגבר</span>
      <div class="a11y-control">
        <button class="a11y-toggle" id="a11ySpacingBtn" aria-pressed="false">הפעל</button>
      </div>
    </div>

    <button class="a11y-reset" id="a11yResetBtn">🔄 איפוס הכל</button>
  </div>
</div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  /* ── רפרנסים ── */
  const overlay    = document.getElementById('a11yOverlay');
  const openBtn    = document.getElementById('a11yOpenBtn');
  const closeBtn   = document.getElementById('a11yCloseBtn');
  const fontSlider = document.getElementById('a11yFontSlider');
  const fontVal    = document.getElementById('a11yFontVal');
  const contrastBtn  = document.getElementById('a11yContrastBtn');
  const motionBtn    = document.getElementById('a11yMotionBtn');
  const spacingBtn   = document.getElementById('a11ySpacingBtn');
  const resetBtn     = document.getElementById('a11yResetBtn');

  /* ── לכידת פוקוס ── */
  let focusTrap = null;
  function trapFocus(el) {
    releaseFocus();
    const sel = 'a,button,input,[tabindex]:not([tabindex="-1"])';
    const focusable = () => [...el.querySelectorAll(sel)].filter(x => !x.disabled);

    focusTrap = e => {
      if (e.key !== 'Tab') return;
      const els = focusable();
      if (!els.length) return e.preventDefault();
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    el.addEventListener('keydown', focusTrap);
  }
  function releaseFocus() {
    if (focusTrap) { overlay.removeEventListener('keydown', focusTrap); focusTrap = null; }
  }

  /* ── פתיחה ── */
  function openModal() {
    overlay.hidden = false;
    overlay.classList.add('show');
    openBtn.setAttribute('aria-expanded', 'true');
    trapFocus(overlay);
    closeBtn.focus();
  }

  /* ── סגירה ── */
  function closeModal() {
    overlay.classList.remove('show');
    overlay.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    releaseFocus();
    openBtn.focus();
  }

  /* ── יישום הגדרות ── */
  function applySettings() {
    const body = document.body;
    const root = document.documentElement;

    /* גופן */
    root.style.fontSize = (settings.fontSize / 100) * 16 + 'px';
    fontSlider.value    = settings.fontSize;
    fontVal.textContent = settings.fontSize + '%';

    /* עזר לטוגל */
    function setToggle(btn, cls, active) {
      if (active) {
        body.classList.add(cls);
        btn.setAttribute('aria-pressed', 'true');
        btn.textContent = '✓ מופעל';
      } else {
        body.classList.remove(cls);
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = 'הפעל';
      }
    }

    setToggle(contrastBtn, 'a11y-high-contrast',   settings.highContrast);
    setToggle(motionBtn,   'a11y-reduce-motion',    settings.reduceMotion);
    setToggle(spacingBtn,  'a11y-spacing',          settings.spacing);
  }

  /* ── שמירה / טעינה ── */
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (_) {}
  }
  function load() {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) Object.assign(settings, JSON.parse(s));
    } catch (_) {}
    applySettings();
  }

  /* ── אירועים ── */
  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  /* סגירה בלחיצה מחוץ */
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  /* Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });

  fontSlider.addEventListener('input', e => {
    settings.fontSize = +e.target.value;
    applySettings(); save();
  });

  contrastBtn.addEventListener('click', () => {
    settings.highContrast = !settings.highContrast;
    applySettings(); save();
  });

  motionBtn.addEventListener('click', () => {
    settings.reduceMotion = !settings.reduceMotion;
    applySettings(); save();
  });

  spacingBtn.addEventListener('click', () => {
    settings.spacing = !settings.spacing;
    applySettings(); save();
  });

  resetBtn.addEventListener('click', () => {
    Object.assign(settings, defaults);
    applySettings(); save();
    closeModal();
  });

  /* ── טעינה ראשונית ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }

})();
