/* ===== ESTET DENT — interactions ===== */

/* ---------- sticky header ---------- */
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- mobile menu ---------- */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('is-open'));
nav.addEventListener('click', e => {
  if (e.target.classList.contains('nav__link')) nav.classList.remove('is-open');
});

/* ---------- before/after cases ---------- */
// Стилизованные SVG-иллюстрации улыбок. В боевой версии заменяются на фото пациентов.
function smileSVG(state) {
  const isBefore = state === 'before';
  const toothFill = isBefore ? '#ddc98f' : '#faf7ef';
  const toothEdge = isBefore ? '#b89f63' : '#d9d2c0';
  const skin = isBefore ? '#e0b49a' : '#e6bda3';
  const teeth = [];
  for (let i = 0; i < 8; i++) {
    const x = 62 + i * 35;
    const arc = Math.sin((i / 7) * Math.PI) * 12;
    const h = 46 + arc;
    // «до»: неровные, сколотые зубы
    const skew = isBefore ? (i % 3 === 0 ? 6 : i % 3 === 1 ? -4 : 0) : 0;
    const chip = isBefore && (i === 2 || i === 5) ? 10 : 0;
    teeth.push(
      `<rect x="${x}" y="${118 - arc / 2 + skew}" width="30" height="${h - chip}" rx="9" ` +
      `fill="${toothFill}" stroke="${toothEdge}" stroke-width="1.5"/>`
    );
    if (isBefore && i === 3) {
      teeth.push(`<circle cx="${x + 20}" cy="${138 + skew}" r="5" fill="#8a6f42" opacity=".7"/>`);
    }
  }
  return `
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <rect width="400" height="300" fill="${skin}"/>
    <rect width="400" height="300" fill="url(#g${state})" opacity=".35"/>
    <defs>
      <linearGradient id="g${state}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".5"/>
        <stop offset="1" stop-color="#7a4a33"/>
      </linearGradient>
    </defs>
    <path d="M30 150 Q200 ${isBefore ? 60 : 40} 370 150 Q200 ${isBefore ? 245 : 265} 30 150 Z"
      fill="#5e2f2a"/>
    <g>${teeth.join('')}</g>
    <path d="M30 150 Q200 ${isBefore ? 60 : 40} 370 150" fill="none" stroke="#b06a55" stroke-width="14" stroke-linecap="round"/>
    <path d="M30 150 Q200 ${isBefore ? 245 : 265} 370 150" fill="none" stroke="#a55f4c" stroke-width="16" stroke-linecap="round"/>
  </svg>`;
}

const cases = ['Реставрация зубов', 'Имплантация', 'Отбеливание', 'Виниры'];
const casesGrid = document.getElementById('casesGrid');
casesGrid.innerHTML = cases.map(title => `
  <article class="case">
    <div class="case__compare" style="--pos:50%">
      <div class="case__before">${smileSVG('before')}</div>
      <div class="case__after">${smileSVG('after')}</div>
      <span class="case__tag case__tag--before">До</span>
      <span class="case__tag case__tag--after">После</span>
      <div class="case__handle"></div>
    </div>
    <p class="case__caption">${title}</p>
  </article>
`).join('');

document.querySelectorAll('.case__compare').forEach(box => {
  const move = clientX => {
    const r = box.getBoundingClientRect();
    const pos = Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100));
    box.style.setProperty('--pos', pos + '%');
  };
  box.addEventListener('pointerdown', e => {
    box.setPointerCapture(e.pointerId);
    move(e.clientX);
    const onMove = ev => move(ev.clientX);
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerup', () => box.removeEventListener('pointermove', onMove), { once: true });
  });
});

/* ---------- phone mask ---------- */
const phone = document.getElementById('phoneInput');
phone.addEventListener('input', () => {
  let d = phone.value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let out = '+7';
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length >= 4) out += ') ' + d.slice(4, 7);
  if (d.length >= 7) out += '-' + d.slice(7, 9);
  if (d.length >= 9) out += '-' + d.slice(9, 11);
  phone.value = out;
});

/* ---------- booking form ---------- */
const form = document.getElementById('bookingForm');
const modal = document.getElementById('successModal');
const modalText = document.getElementById('modalText');

// дата по умолчанию — завтра
const dateInput = form.elements.date;
const tomorrow = new Date(Date.now() + 864e5);
dateInput.value = tomorrow.toISOString().slice(0, 10);
dateInput.min = new Date().toISOString().slice(0, 10);

form.addEventListener('submit', e => {
  e.preventDefault();
  const digits = phone.value.replace(/\D/g, '');
  phone.classList.toggle('is-error', digits.length !== 11);
  if (digits.length !== 11) { phone.focus(); return; }

  const data = Object.fromEntries(new FormData(form));
  const [y, m, day] = data.date.split('-');
  modalText.textContent =
    `${data.service} · ${day}.${m}.${y} в ${data.time}. Мы перезвоним на ${data.phone} в течение 15 минут.`;
  modal.hidden = false;
  form.reset();
  dateInput.value = tomorrow.toISOString().slice(0, 10);
});

modal.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) modal.hidden = true;
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') modal.hidden = true;
});

/* ---------- video button (демо) ---------- */
document.getElementById('videoBtn').addEventListener('click', () => {
  modalText.textContent = 'В боевой версии здесь открывается видеоролик о клинике.';
  modal.querySelector('.modal__title').textContent = 'Демо-режим';
  modal.hidden = false;
});

/* ---------- reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('is-visible');
      revealObserver.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ---------- animated counters ---------- */
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    countObserver.unobserve(en.target);
    const el = en.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.plus || '';
    const t0 = performance.now();
    const dur = 1400;
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat__num').forEach(el => countObserver.observe(el));
