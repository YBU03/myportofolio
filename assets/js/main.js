/* ==========================================================================
   Yubuild — perilaku halaman
   --------------------------------------------------------------------------
   Disusun bernomor supaya gampang dicari:

     0. PENGATURAN (ubah nomor WhatsApp di sini)
     1. Navigasi, progres baca, scrollspy
     2. Reveal saat masuk layar
     3. Filter karya
     4. Modal detail karya
     5. Papan catatan — note digantung, bisa digeser
     6. Pesawat kertas yang terbang mengikuti gulir
     7. Formulir → WhatsApp
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     0. PENGATURAN
     ----------------------------------------------------------------------
     Ganti dua baris di bawah ini kalau nomornya berubah. Seluruh tautan
     WhatsApp di halaman (navigasi, tombol paket, footer, tombol mengambang)
     ikut menyesuaikan otomatis.
     ====================================================================== */

  var PENGATURAN = {
    waNumber:  '628577421890',     // format internasional, tanpa tanda + dan tanpa spasi
    waDisplay: '0857-7421-890',    // tampilan nomor di halaman
    pesanUmum: 'Halo Yubuild, saya mau tanya soal pembuatan website.'
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* --- Terapkan nomor WhatsApp ke seluruh tautan ------------------------ */
  $$('[data-wa]').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var teks = href.indexOf('text=') > -1 ? href.split('text=')[1] : encodeURIComponent(PENGATURAN.pesanUmum);
    a.setAttribute('href', 'https://wa.me/' + PENGATURAN.waNumber + '?text=' + teks);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });
  var waNumberEl = $('#waNumber');
  if (waNumberEl) waNumberEl.textContent = PENGATURAN.waDisplay;
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ======================================================================
     1. NAVIGASI, PROGRES BACA, SCROLLSPY
     ====================================================================== */

  var nav      = $('#nav');
  var readBar  = $('#readBar');
  var fab      = $('#fab');
  var toggle   = $('#navToggle');
  var navLinks = $('#navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Buka menu' : 'Tutup menu');
      navLinks.classList.toggle('is-open', !open);
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var spyTargets = $$('.nav-links a[href^="#"]').map(function (a) {
    return { link: a, sec: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (t) { return t.sec; });

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;

    if (readBar) readBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-stuck', y > 8);
    if (fab) fab.classList.toggle('is-in', y > window.innerHeight * 0.6);

    var aktif = null;
    spyTargets.forEach(function (t) {
      if (t.sec.getBoundingClientRect().top <= 140) aktif = t;
    });
    spyTargets.forEach(function (t) {
      t.link.classList.toggle('is-active', t === aktif);
    });

    flightTick();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { layoutNotes(); onScroll(); });

  /* ======================================================================
     2. REVEAL SAAT MASUK LAYAR
     ====================================================================== */

  var reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = reveals.indexOf(en.target) % 4;
        en.target.style.transitionDelay = (i * 70) + 'ms';
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ======================================================================
     3. FILTER KARYA
     ====================================================================== */

  var chips = $$('.chip');
  var items = $$('.work-item');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      items.forEach(function (item) {
        var cocok = filter === 'all' || item.dataset.kind === filter;
        item.hidden = !cocok;
      });
    });
  });

  /* ======================================================================
     4. MODAL DETAIL KARYA
     ====================================================================== */

  var modal       = $('#modal');
  var modalCard   = $('#modalCard');
  var modalImg    = $('#modalImg');
  var modalKind   = $('#modalKind');
  var modalTitle  = $('#modalTitle');
  var modalText   = $('#modalText');
  var modalMeta   = $('#modalMeta');
  var modalThumbs = $('#modalThumbs');
  var modalWa     = $('#modalWa');
  var lastFocus   = null;

  function bukaModal(item) {
    var detail = $('.work-detail', item);
    var judul  = $('h3', item).textContent.trim();
    var shots  = JSON.parse(detail.getAttribute('data-shots') || '[]');
    var tags   = $$('.work-tags span', item).map(function (s) { return s.textContent; });

    modalTitle.textContent = judul;
    modalKind.textContent  = detail.getAttribute('data-kind-label') || '';
    modalText.innerHTML    = detail.innerHTML;

    modalMeta.innerHTML =
      '<div><dt>Jenis pekerjaan</dt><dd>' + (detail.getAttribute('data-kind-label') || '-') + '</dd></div>' +
      '<div><dt>Dibangun dengan</dt><dd>' + tags.join(' · ') + '</dd></div>' +
      '<div><dt>Tampilan</dt><dd>Rapi di HP sampai layar besar</dd></div>' +
      '<div><dt>Status</dt><dd>Selesai &amp; bisa didemokan</dd></div>';

    modalThumbs.innerHTML = '';
    shots.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-current', String(i === 0));
      b.setAttribute('aria-label', 'Tangkapan layar ' + (i + 1) + ' dari ' + judul);
      b.innerHTML = '<img src="assets/img/karya/' + s.src + '" alt="" loading="lazy">';
      b.addEventListener('click', function () {
        modalImg.src = 'assets/img/karya/' + s.src;
        modalImg.alt = s.alt || '';
        $$('button', modalThumbs).forEach(function (o) { o.setAttribute('aria-current', String(o === b)); });
      });
      modalThumbs.appendChild(b);
    });
    modalThumbs.hidden = shots.length < 2;

    if (shots[0]) {
      modalImg.src = 'assets/img/karya/' + shots[0].src;
      modalImg.alt = shots[0].alt || '';
    }

    modalWa.setAttribute('href', 'https://wa.me/' + PENGATURAN.waNumber + '?text=' +
      encodeURIComponent('Halo Yubuild, saya lihat karya "' + judul + '" di website Anda. Saya mau yang seperti itu untuk usaha saya.'));

    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modalCard.scrollTop = 0;
    $('#modalClose').focus();
  }

  function tutupModal() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (item) {
    $('.work', item).addEventListener('click', function () { bukaModal(item); });
  });

  if (modal) {
    $('#modalClose').addEventListener('click', tutupModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) tutupModal(); });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') tutupModal();
      if (e.key === 'Tab') {
        var f = $$('a[href], button, [tabindex]:not([tabindex="-1"])', modalCard)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ======================================================================
     5. PAPAN CATATAN — kertas note digantung pada tali, bisa digeser
     ----------------------------------------------------------------------
     Tiap note diperlakukan sebagai bandul sederhana:

         percepatan = -(g / panjang) · sin(sudut) − redaman · kecepatan

     Saat digeser, sudutnya mengikuti jari/kursor. Saat dilepas, note
     mengayun lalu berhenti sendiri karena redaman.
     ====================================================================== */

  var board     = $('#catatan');
  var notesWrap = $('#notes');
  var ropeSvg   = board ? $('.board-rope', board) : null;
  var ropePath  = ropeSvg ? ropeSvg.querySelector('path:not(.shadow)') : null;
  var notes     = notesWrap ? $$('.note', notesWrap) : [];
  var noteState = [];

  /* Tinggi tali pada posisi x tertentu, dibaca dari lengkungan SVG-nya
     supaya jepitan benar-benar menempel di talinya. */
  function ropeY(xBoard) {
    if (!ropePath || !ropeSvg) return 0;
    var rRect = ropeSvg.getBoundingClientRect();
    var bRect = board.getBoundingClientRect();
    var xr = ((xBoard - (rRect.left - bRect.left)) / rRect.width) * 1200;   // ke satuan viewBox
    xr = clamp(xr, 0, 1200);

    // Cari titik pada path yang x-nya paling dekat (pencarian biner sederhana)
    var len = ropePath.getTotalLength();
    var lo = 0, hi = len, mid, p;
    for (var i = 0; i < 18; i++) {
      mid = (lo + hi) / 2;
      p = ropePath.getPointAtLength(mid);
      if (p.x < xr) lo = mid; else hi = mid;
    }
    p = ropePath.getPointAtLength((lo + hi) / 2);
    return (rRect.top - bRect.top) + p.y * (rRect.height / 60);
  }

  function layoutNotes() {
    if (!notesWrap || !notes.length) return;
    var bRect = board.getBoundingClientRect();
    var nRect = notesWrap.getBoundingClientRect();
    var offsetY = nRect.top - bRect.top;

    notes.forEach(function (el, i) {
      var xPct = parseFloat(el.dataset.x || '50');
      // Jaga supaya note tidak pernah terpotong di tepi wadahnya
      var batas = ((el.offsetWidth / 2) + 10) / nRect.width * 100;
      xPct = clamp(xPct, batas, 100 - batas);
      el.style.left = xPct + '%';
      var xBoard = (nRect.left - bRect.left) + (xPct / 100) * nRect.width;
      var y = ropeY(xBoard) - offsetY + 4;
      el.style.top = Math.round(y) + 'px';
      if (noteState[i]) noteState[i].height = el.offsetHeight;
    });
  }

  if (notes.length) {
    notes.forEach(function (el, i) {
      el.style.zIndex = String(5 + i);
      noteState.push({
        el: el,
        angle: (i % 2 ? 1 : -1) * (1.6 + (i % 3) * 0.9) * Math.PI / 180,  // miring sedikit, biar tidak kaku
        vel: 0,
        length: 120 + (i % 4) * 26,   // panjang bandul semu: makin panjang, makin lambat ayunannya
        drag: false,
        height: 180
      });
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'group');
    });

    layoutNotes();
    window.addEventListener('load', layoutNotes);

    /* --- Geser dengan jari atau tetikus -------------------------------- */
    notes.forEach(function (el, i) {
      var st = noteState[i];
      var lastX = 0, lastT = 0;

      el.addEventListener('pointerdown', function (e) {
        st.drag = true;
        el.classList.add('is-drag');
        el.setPointerCapture(e.pointerId);
        lastX = e.clientX;
        lastT = performance.now();
        e.preventDefault();
      });

      el.addEventListener('pointermove', function (e) {
        if (!st.drag) return;
        var r = el.getBoundingClientRect();
        var pivotX = r.left + r.width / 2;      // jepitan ada di tengah atas
        var pivotY = r.top - 6;
        var dx = e.clientX - pivotX;
        var dy = Math.max(30, e.clientY - pivotY);
        var target = clamp(Math.atan2(dx, dy), -1.15, 1.15);

        var now = performance.now();
        var dt = Math.max(16, now - lastT);
        st.vel = ((target - st.angle) / dt) * 16;   // simpan kecepatan terakhir untuk efek lempar
        st.angle = target;
        lastX = e.clientX;
        lastT = now;
      });

      function lepas(e) {
        if (!st.drag) return;
        st.drag = false;
        el.classList.remove('is-drag');
        try { el.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      el.addEventListener('pointerup', lepas);
      el.addEventListener('pointercancel', lepas);

      /* Bisa juga digeser lewat papan ketik — untuk pengguna yang tidak memakai tetikus */
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft')  { st.vel -= 0.05; e.preventDefault(); }
        if (e.key === 'ArrowRight') { st.vel += 0.05; e.preventDefault(); }
      });
    });

    /* --- Loop fisika --------------------------------------------------- */
    var lastFrame = performance.now();
    var lastScrollY = window.scrollY;

    function stepNotes(now) {
      var dt = Math.min(0.032, (now - lastFrame) / 1000);
      lastFrame = now;

      // Gulir cepat = angin: notenya ikut terayun sedikit
      var dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      var angin = clamp(dy * 0.00035, -0.06, 0.06);

      for (var i = 0; i < noteState.length; i++) {
        var st = noteState[i];
        if (!st.drag) {
          var a = -(9.81 * 3 / (st.length / 100)) * Math.sin(st.angle) - 1.15 * st.vel;
          st.vel += a * dt;
          st.vel += angin * (1 + (i % 3) * 0.25);
          st.angle += st.vel * dt;
          if (Math.abs(st.angle) < 0.0009 && Math.abs(st.vel) < 0.0025) { st.angle = 0; st.vel = 0; }
        }
        st.el.style.transform = 'translateX(-50%) rotate(' + (st.angle * 180 / Math.PI).toFixed(2) + 'deg)';
      }
      requestAnimationFrame(stepNotes);
    }

    if (reduceMotion) {
      noteState.forEach(function (st) {
        st.el.style.transform = 'translateX(-50%) rotate(' + (st.angle * 180 / Math.PI).toFixed(2) + 'deg)';
      });
    } else {
      requestAnimationFrame(stepNotes);
    }
  }

  /* ======================================================================
     6. PESAWAT KERTAS YANG TERBANG MENGIKUTI GULIR
     ----------------------------------------------------------------------
     Pesawatnya bergerak di sepanjang lengkungan #flightPath. Jejaknya
     digambar bertahap dengan mengubah stroke-dasharray.
     ====================================================================== */

  var karya       = $('#karya');
  var flightSvg   = $('#flight');
  var flightPath  = $('#flightPath');
  var flightPlane = $('#flightPlane');
  var drawnPath   = null;
  var pathLen     = 0;

  if (karya && flightPath && flightPlane) {
    drawnPath = flightPath.cloneNode(false);
    drawnPath.removeAttribute('id');
    drawnPath.setAttribute('class', 'trail trail-drawn');
    flightPath.parentNode.appendChild(drawnPath);
    pathLen = flightPath.getTotalLength();
  }

  function flightTick() {
    if (!karya || !flightPath || !flightPlane || !flightSvg) return;

    var rect = karya.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp((vh - rect.top) / (vh + rect.height), 0, 1);

    // Jejak digambar mengikuti kemajuan gulir
    if (drawnPath) drawnPath.setAttribute('stroke-dasharray', (p * pathLen) + ' ' + pathLen);

    var svgRect = flightSvg.getBoundingClientRect();
    var sx = svgRect.width / 1000, sy = svgRect.height / 1400;   // viewBox 1000 × 1400, skala bebas

    var here  = flightPath.getPointAtLength(clamp(p, 0, 1) * pathLen);
    var ahead = flightPath.getPointAtLength(clamp(p + 0.012, 0, 1) * pathLen);

    var x = here.x * sx, y = here.y * sy;
    var ax = ahead.x * sx, ay = ahead.y * sy;
    var sudut = Math.atan2(ay - y, ax - x) * 180 / Math.PI;

    flightPlane.style.opacity = p > 0.02 && p < 0.99 ? '1' : '0';
    flightPlane.style.transform =
      'translate(' + (x - 32) + 'px,' + (y - 32) + 'px) rotate(' + sudut.toFixed(1) + 'deg)';
  }

  /* ======================================================================
     7. FORMULIR → WHATSAPP
     ====================================================================== */

  var form = $('#waForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nama  = form.nama.value.trim();
      var usaha = form.usaha.value.trim();
      var butuh = form.butuh.value;
      var pesan = form.pesan.value.trim();

      if (!nama) { form.nama.focus(); form.nama.style.borderColor = '#c0392b'; return; }

      var baris = [
        'Halo Yubuild, saya ' + nama + '.',
        usaha ? 'Usaha saya: ' + usaha + '.' : '',
        'Yang saya butuhkan: ' + butuh + '.',
        pesan ? '\nCerita singkat:\n' + pesan : '',
        '\nMohon info langkah selanjutnya. Terima kasih.'
      ].filter(Boolean).join('\n');

      window.open('https://wa.me/' + PENGATURAN.waNumber + '?text=' + encodeURIComponent(baris), '_blank', 'noopener');
    });

    form.nama.addEventListener('input', function () { form.nama.style.borderColor = ''; });
  }

  /* Jalankan sekali saat halaman dibuka */
  onScroll();
  window.addEventListener('load', function () { layoutNotes(); flightTick(); });
})();
