// Меню
const toggle = document.querySelector('.menu-toggle'), nav = document.querySelector('.nav');
function closeMenu() {
  if (!nav) return;
  nav.classList.remove('open');
  if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰'; }
}
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '×' : '☰';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', e => { if (!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu(); });
}

// Плавное появление блоков (без JS всё остаётся видимым)
const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }), { threshold: .08 })
  : null;
document.querySelectorAll('.reveal').forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// Если фото не загрузилось — показываем аккуратную заглушку с подписью
function markBroken(img) {
  const box = img.parentElement;
  if (!box) return;
  box.classList.add('broken');
  box.dataset.alt = img.alt || 'Фото';
}
document.querySelectorAll('img[src]').forEach(img => {
  if (img.complete && img.naturalWidth === 0) markBroken(img);
  else img.addEventListener('error', () => markBroken(img), { once: true });
});

// Просмотр фото в галерее
const items = Array.from(document.querySelectorAll('.gallery-item'));
if (items.length) {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<button class="lb-close" aria-label="Закрыть">×</button><button class="lb-prev" aria-label="Назад">‹</button><img alt=""><p></p><button class="lb-next" aria-label="Вперёд">›</button>';
  document.body.appendChild(box);
  const big = box.querySelector('img'), cap = box.querySelector('p');
  let current = 0, opener = null;
  const show = i => {
    current = (i + items.length) % items.length;
    const img = items[current].querySelector('img');
    big.src = img.currentSrc || img.src; big.alt = img.alt;
    cap.textContent = items[current].dataset.caption || '';
  };
  const open = i => { opener = items[i]; show(i); box.classList.add('open'); box.querySelector('.lb-close').focus(); };
  const close = () => { box.classList.remove('open'); if (opener) opener.focus(); };
  items.forEach((it, i) => {
    it.tabIndex = 0; it.setAttribute('role', 'button');
    it.setAttribute('aria-label', 'Открыть фото: ' + (it.dataset.caption || ''));
    it.addEventListener('click', () => open(i));
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

// Форма заявки -> WhatsApp
const phone = '77082192613';
document.querySelectorAll('.booking-form').forEach(form => {
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    dateInput.min = d.toISOString().slice(0, 10);
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim() || 'Не указано';
    const rawDate = fd.get('date');
    const date = rawDate
      ? new Date(rawDate + 'T00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
      : 'Обсудим в переписке';
    const time = fd.get('time') || 'Обсудим в переписке';
    const people = fd.get('people') || '2';
    const text = ['Здравствуйте! Хочу забронировать баню.', 'Имя: ' + name, 'Дата: ' + date,
      'Время: ' + time, 'Количество человек: ' + people, 'Подскажите, пожалуйста, свободно ли?'].join('\n');
    const url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
    const win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url; // если браузер заблокировал новое окно
  });
});
