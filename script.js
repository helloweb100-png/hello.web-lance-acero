/* ==========================================================================
   LANCE INTERNACIONAL | Consorcio minero
   Comportamiento de la página

   Dependencias (autoalojadas en assets/vendor): Lenis (scroll suave) se
   carga con la página.
   GSAP + ScrollTrigger se cargan bajo demanda solo en pantallas
   anchas, para parallax y la barra del proceso. Si no cargan, la
   página sigue funcionando con IntersectionObserver y scroll nativo.

   Configuración editable: ver CONFIG.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- Configuración ---------- */
  const CONFIG = {
    // Número de WhatsApp en formato internacional, sin "+" ni espacios.
    // IMPORTANTE: reemplazar por el número móvil con WhatsApp de la empresa.
    whatsapp: '528666335420',
    // Segundos mínimos que se muestra la pantalla de carga.
    loaderMinMs: 2000,
  };

  /* ---------- Utilidades ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const wide = window.matchMedia('(min-width: 900px)');
  const NARROW = !wide.matches;
  const GSAP_SRC = 'assets/vendor/gsap.min.js';
  const ST_SRC = 'assets/vendor/ScrollTrigger.min.js';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const TAU = Math.PI * 2;
  const D2R = Math.PI / 180;

  let lenis = null;

  /* Motor de animación único: corre solo lo que está a la vista y pausa con la pestaña oculta */
  const Engine = (() => {
    const items = new Set();
    let raf = 0;
    let last = 0;
    function tick(t) {
      raf = 0;
      if (!items.size) return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      items.forEach((i) => {
        i.acc = (i.acc || 0) + dt;
        if (i.acc < (i.minDt || 0)) return; // límite de fotogramas por segundo
        i.frame(i.acc, t / 1000);
        i.acc = 0;
      });
      raf = requestAnimationFrame(tick);
    }
    function ensure() {
      if (!raf && items.size && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else ensure();
    });
    return {
      add(i) { items.add(i); ensure(); },
      remove(i) { items.delete(i); },
    };
  })();

  /* Activa un efecto solo cuando su contenedor está visible y la carga terminó */
  let gateOpen = false;
  const gated = [];
  function whenVisible(el, effect, onChange) {
    if (!el) return;
    let visible = false;
    const apply = () => (visible && gateOpen ? Engine.add(effect) : Engine.remove(effect));
    gated.push(apply);
    new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      apply();
      if (onChange) onChange(visible);
    }, { rootMargin: '120px 0px' }).observe(el);
  }
  function openGate() { gateOpen = true; gated.forEach((f) => f()); }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.async = false; // conserva el orden de ejecución entre scripts dinámicos
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }

  /* ==========================================================================
     1. PANTALLA DE CARGA
     ========================================================================== */
  function runLoader() {
    const el = $('#loader');
    if (!el) return Promise.resolve();

    const pctEl = $('[data-pct]', el);
    const statusEl = $('[data-status]', el);
    const bar = $('.loader__bar span', el);
    const ticksWrap = $('.loader__ticks', el);
    const TICKS = 48;
    const ticks = [];
    for (let i = 0; i < TICKS; i++) {
      const t = document.createElement('i');
      t.style.setProperty('--i', i);
      ticksWrap.appendChild(t);
      ticks.push(t);
    }

    const statuses = [
      [0, 'Inicializando'],
      [16, 'Cargando concesiones'],
      [36, 'Calibrando ensayos'],
      [58, 'Conectando con Corea y Japón'],
      [80, 'Preparando la experiencia'],
      [97, 'Listo'],
    ];

    const minMs = reduceMotion ? 500 : CONFIG.loaderMinMs;
    const t0 = performance.now();
    let real = 12;
    const setReal = (v) => { real = Math.max(real, v); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setReal(62));
    else setReal(62);
    if (document.readyState === 'complete') setReal(100);
    else window.addEventListener('load', () => setReal(100), { once: true });

    let shown = 0;
    let lit = -1;
    let statusIdx = -1;
    let finished = false;

    return new Promise((resolve) => {
      function render(p) {
        const v = Math.round(p);
        pctEl.textContent = v;
        bar.style.setProperty('--p', (p / 100).toFixed(4));
        const n = Math.floor((p / 100) * TICKS);
        if (n !== lit) {
          for (let i = 0; i < TICKS; i++) {
            ticks[i].classList.toggle('is-lit', i < n);
            ticks[i].classList.toggle('is-head', i === n);
          }
          lit = n;
        }
        let si = 0;
        for (let i = 0; i < statuses.length; i++) if (p >= statuses[i][0]) si = i;
        if (si !== statusIdx) { statusEl.textContent = statuses[si][1]; statusIdx = si; }
      }

      function finish() {
        if (finished) return;
        finished = true;
        render(100);
        el.classList.add('is-done');
        // Los paneles empiezan a abrirse a los 0.4 s: arrancamos el hero justo ahí
        setTimeout(resolve, reduceMotion ? 0 : 450);
        setTimeout(() => { el.classList.add('is-gone'); el.setAttribute('aria-hidden', 'true'); }, reduceMotion ? 50 : 1700);
      }

      function tick(now) {
        if (finished) return;
        const elapsed = now - t0;
        const timeP = Math.min(1, elapsed / minMs) * 100;
        const target = Math.min(real, timeP);
        shown += (target - shown) * 0.1;
        if (target - shown < 0.08) shown = target;
        render(shown);
        if (shown >= 99.9 && real >= 100 && elapsed >= minMs) { finish(); return; }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      setTimeout(finish, 9000); // seguro: nunca bloquear la página
    });
  }

  /* ==========================================================================
     2. SCROLL SUAVE (Lenis) Y ANCLAS
     ========================================================================== */
  function initSmoothScroll() {
    if (window.Lenis && !reduceMotion) {
      lenis = new window.Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.stop();
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToTarget(target) {
    if (!target) return;
    const offset = target.id === 'inicio' ? 0 : -76;
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.7 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
      history.pushState(null, '', hash);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ==========================================================================
     3. NAVEGACIÓN Y MENÚ MÓVIL
     ========================================================================== */
  const nav = $('#nav');
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  let menuOpen = false;

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) { root.style.overflow = 'hidden'; if (lenis) lenis.stop(); }
    else { root.style.overflow = ''; if (lenis && !root.classList.contains('is-loading')) lenis.start(); }
  }
  function closeMenu() { if (menuOpen) setMenu(false); }

  function initNav() {
    if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!menuOpen));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', (m) => { if (m.matches) closeMenu(); });

    // Estado "con scroll" mediante un centinela (sin listeners de scroll)
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:70px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => nav.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);

    // Ocultar al bajar, mostrar al subir (usa el evento de Lenis)
    if (lenis) {
      lenis.on('scroll', ({ scroll, direction }) => {
        if (menuOpen) return;
        if (scroll > 500 && direction === 1) nav.classList.add('is-hidden');
        else if (direction === -1 || scroll <= 500) nav.classList.remove('is-hidden');
      });
    }

    // Enlace de sección activa
    const links = $$('.nav__links a');
    const map = new Map();
    links.forEach((a) => {
      const sec = document.getElementById(a.getAttribute('href').slice(1));
      if (sec) map.set(sec, a);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const a = map.get(e.target);
        if (a && e.isIntersecting) { links.forEach((l) => l.classList.remove('is-current')); a.classList.add('is-current'); }
        if (e.target.id === 'inicio' && e.isIntersecting) links.forEach((l) => l.classList.remove('is-current'));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, sec) => io.observe(sec));
    const hero = $('#inicio');
    if (hero) io.observe(hero);
  }

  /* ==========================================================================
     4. TITULARES, REVELADO Y CONTADORES
     ========================================================================== */
  function splitWords(el) {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach((word, i, arr) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = 'w__in';
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  function initReveal() {
    $$('[data-split]').forEach(splitWords);
    const targets = $$('[data-reveal], [data-split], .compare__row');
    if (!('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        setTimeout(() => e.target.classList.add('is-settled'), 1600);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((t) => io.observe(t));
  }

  function formatNumber(v, dec) {
    return v.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function animateCount(el, to, dec = 0, dur = 1900) {
    if (reduceMotion) { el.textContent = formatNumber(to, dec); return; }
    const t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = formatNumber(to * eased, dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initCounters() {
    const els = $$('[data-count]');
    els.forEach((el) => { el.textContent = '0'; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        animateCount(el, parseFloat(el.dataset.count), parseInt(el.dataset.decimals || '0', 10));
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  /* ==========================================================================
     5. HERO: palabra rotatoria, globo, partículas
     ========================================================================== */
  function initCycle() {
    const wrap = $('[data-cycle]');
    if (!wrap || reduceMotion) return;
    const words = $$('.cycle__w', wrap);
    if (words.length < 2) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      const cur = words[i];
      i = (i + 1) % words.length;
      const next = words[i];
      cur.classList.remove('is-active');
      cur.classList.add('is-leaving');
      next.classList.add('is-active');
      setTimeout(() => cur.classList.remove('is-leaving'), 900);
    }, 2700);
  }

  /* Máscara de continentes 256x128 (Natural Earth, dominio público), 1 bit por celda */
  const LAND_B64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///33///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////////8AAAAAABgAAAAPAAAAAAAAAAAAAAAAAAGH//8/////+AAAP/AAAAAAAA+gAAAAAAAAAAAAAAAAMO7/8//////wAAAeQAAAAAAAADgAAAAAAAAAAAAAAB8Id5/A//////AAAAQAAAAA4AAAf8AAAAAAAAAAAAAAAf4y/4AA////8AAAAAAAADwAAP//4AAPsAAAAAAAAAB+AjO4QAA////gAAAAAAAA4AAP///cMAMAAAAAAAAAAH/+Pz/wAB///8AAAAAAAAHAHV/////8B/AAACAAfAAAI/8XP/4AH///4AAAAB4AAMB//////////+AAAAP//j/x/8+Hn8Af//+AAAAB/8AABj///////////5+wD///////j+cf4A///AAAAAf//mP//f////////////8H/////////wP8D//AAAAAH///f///////////////3x/////////+H+gP/gB/AAA/3+P////////////////CAf///////+cD8Af4ADwAAH+//////////////////4AP////////gADAA/AAAAAD/n//////////////////wA////////4APwAB8AAAAAf+f///////////////2/gAA/sP/////gAfmAAgAAAAA/4///////////////8OAAAAeAD/////AB/8AAAAAAMDPB/////////////+ABwAAABoAB/////gH/wAAAAAA4D8f/////////////gAfAAAA4AAD/////4f/wAAAAADgLB/////////////4AD4AAAAAAAX/////3//wAAAAB3A5//////////////8AHAAAAAAAAP/////P//gAAAAGef///////////////8AYAAAAAAAAf///////8AAAAAD7////////////////wBAAAAAAAAB///////uYAAAAAA////////////////9gAAAAAAAAAB///////DwAAAAAf////////////////0AAAAAAAAAAD//////8DgAAAAA////////////////+QAAAAAAAAAAP//////+AAAAAAB///9/8P/////////wAAAAAAAAAAB//////5gAAAAAAH/n/gfj/////////+OAAAAAAAAAAH//////AAAAAAAf+HP8AfH/////////h4AAAAAAAAAAf/////8AAAAAAA/wnP5x+P////////wGAAAAAAAAAAA//////AAAAAAAH8CE5//4///////++AYAAAAAAAAAAD/////4AAAAAAAfwARn//j///////wYBgAAAAAAAAAAH/////AAAAAAAA+CmGf/+P///////5wcAAAAAAAAAAAf////8AAAAAAAAn/AAF//////////DDwAAAAAAAAAAA/////gAAAAAAAH/8AAH/////////4J+AAAAAAAAAAAA////8AAAAAAAA//8AAf/////////wOAAAAAAAAAAAAB////AAAAAAAAH//4/L//////////gQAAAAAAAAAAAAG///8AAAAAAAAf//////////////+AAAAAAAAAAAAAAL/8AYAAAAAAAD//////8////////4AAAAAAAAAAAAAA3/gBgAAAAAAA/////9/5////////AAAAAAAAAAAAAAAv+ACAAAAAAAD/////z/x///////4AAAAAAAAAAAAAADf4ACAAAAAAAf/////v/kB//////oAAAAAAAAAAAAAAE/gBgAAAAAAD//////f/8B/////5gAAAAAAAAAAAAAAB+BDgAAAAAAP/////8//4H//f/8AAAAAAAAAAEAAAAAH4MDgAAAAAA//////7//AD/w/8gAAAAAAAAAAQAAAAAfxwA4AAAAAD//////n/4AP8B/mAAAAAAAAAAAAAAAAAP+AQAAAAAAP//////P/AA/gH/AGAAAAAAAAAAAAAAAAP9AAAAAAAA//////8/wAD8Af+AYAAAAAAAAAAAAAAAAD+AAAAAAAD//////78AAHgAf8BgAAAAAAAAAAAAAAAAD4AAAAAAAP///////AAAeAA/wDAAAAAAAAAAAAAAAAADgMAAAAAA///////hAAB4ACfACAAAAAAAAAAAAAAAAAGD+4AAAAB///////8AADgAI4CYAAAAAAAAAAAAAAAAAPv/gAAAAD///////wAAPAAhAAQAAAAAAAAAAAAAAAAAL//AAAAAH///////AAAEADAAHAAAAAAAAAAAAAAAAAAH/+AAAAAP//////4AAAQAGAMMAAAAAAAAAAAAAAAAAAf//gAAAAfg/////AAAAADcB4AAAAAAAAAAAAAAAAAAB///AAAAAAAf///8AAAAAGwPAAAAAAAAAAAAAAAAAAAP//8AAAAAAB////gAAAAAPB8AAAAAAAAAAAAAAAAAAB///wAAAAAAP///4AAAAAA8fzsAAAAAAAAAAAAAAAAAP///4AAAAAA////AAAAAABw/QGAAAAAAAAAAAAAAAAA////4AAAAAD///4AAAAAADj5gNwAAAAAAAAAAAAAAAB////+AAAAAH///gAAAAAAPBmG/4IAAAAAAAAAAAAAAP////8AAAAAP//8AAAAAAAYAUAfxgAAAAAAAAAAAAAA/////4AAAAAf//wAAAAAAAYAAE/ogAAAAAAAAAAAAAB/////wAAAAB///AAAAAAAA+AAD+AAAAAAAAAAAAAAAD////+AAAAAH//8AAAAAAAAATADMAgAAAAAAAAAAAAAP////wAAAAAP//4AAAAAAAAAAAAIAAAAAAAAAAAAAAAf///+AAAAAA///gAAAAAAAAAB4QAAAAAAAAAAAAAAAB////4AAAAAH//+DAAAAAAAAAPjAAAAAAAAAAAAAAAAD////gAAAAA///4MAAAAAAAAH+GAAAAAAAAAAAAAAAAH///8AAAAAD///jwAAAAAAAA/88AAAAAAAAAAAAAAAAH///wAAAAAP//4eAAAAAAAAH//wAAAgAAAAAAAAAAAAP///AAAAAAf//B4AAAAAAAA///gAAAAAAAAAAAAAAAA///4AAAAAB//4HgAAAAAAAf///ABAAAAAAAAAAAAAAD///gAAAAAD//gcAAAAAAAH///+AGAAAAAAAAAAAAAAP//8AAAAAAP//BwAAAAAAAf///8AAAAAAAAAAAAAAAA//+AAAAAAA//4HAAAAAAAB////wAAAAAAAAAAAAAAAH//wAAAAAAD//AAAAAAAAAH////gAAAAAAAAAAAAAAAf//AAAAAAAH/4AAAAAAAAAf///+AAAAAAAAAAAAAAAB//4AAAAAAAf/gAAAAAAAAB////4AAAAAAAAAAAAAAAH//AAAAAAAA/8AAAAAAAAAD////gAAAAAAAAAAAAAAAf/8AAAAAAAB/gAAAAAAAAAP///+AAAAAAAAAAAAAAAB//gAAAAAAAH8AAAAAAAAAA/gf/wAAAAAAAAAAAAAAAH/8AAAAAAAAYAAAAAAAAAADgA//AAAAAAAAAAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAf4AAQAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAB/gAAgAAAAAAAAAAAAP/AAAAAAAAAAAAAAAAAAAAAAABYAADgAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAHAADgAAAAAAAAAAAAfwAAAAAAAAAAAAAAAAAAAAAAAAYAAYAAAAAAAAAAAAB/AAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAA+BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAfgAACAf/j//4AAAAAAAAAAAAAAAAAwAAAAAAAAAAAAf//gP///////8AAAAAAAAAAAAAAAAfgAAAAAAAADAf////H/////////8AAAAAAAAAAAAAAH/AAAAAAUn///////5///////////4AAAAAAAAAB4AAe+AAAAAH/////////////////////wAAAAAACcgH////4AAAAD/////////////////////8AAAAA/////////+AAAAAf////////////////////+AAAAAP////////8AAAAH//////////////////////wAAAM/////////+AABwH///////////////////////wAAA4f////////gAAfgf//////////////////////8AAAACH////////8eD4D///////////////////////AAAAAH//////////4f/////////////////////////AAAAAf/////////////////////////////////////4AAD//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
  const MASK_W = 256;
  const MASK_H = 128;
  const maskBytes = (() => {
    try {
      const bin = atob(LAND_B64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    } catch (_) { return null; }
  })();
  function isLand(latDeg, lonDeg) {
    if (!maskBytes) return false;
    let x = Math.floor(((lonDeg + 180) / 360) * MASK_W);
    const y = clamp(Math.floor(((90 - latDeg) / 180) * MASK_H), 0, MASK_H - 1);
    x = ((x % MASK_W) + MASK_W) % MASK_W;
    const idx = y * MASK_W + x;
    return (maskBytes[idx >> 3] >> (7 - (idx & 7))) & 1;
  }

  const vec = (lat, lon) => {
    const la = lat * D2R;
    const lo = lon * D2R;
    return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
  };
  const angleBetween = (a, b) => Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));

  const CITIES = {
    mx: { name: 'Monclova', lat: 26.9, lon: -101.42, color: '#ff4b58' },
    kr: { name: 'Busan', lat: 35.18, lon: 129.07, color: '#ffffff' },
    jp: { name: 'Tokio', lat: 35.68, lon: 139.69, color: '#ffffff' },
  };
  const ROUTES = [['mx', 'kr'], ['mx', 'jp']];

  class Globe {
    constructor(canvas, reduced) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.reduced = reduced;
      this.minDt = NARROW ? 1 / 30 - 0.003 : 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, NARROW ? 1.5 : 2);
      this.lon0 = reduced ? -168 * D2R : CITIES.mx.lon * D2R;
      this.pitch = 22 * D2R;
      this.speed = 5.2 * D2R;
      this.dragging = false;
      this.dragVel = 0;
      this.lastX = 0;
      this.px = 0; this.py = 0; this.tx = 0; this.ty = 0; this.wpx = 0; this.wpy = 0;
      this.visual = canvas.closest('.hero__visual');
      this.buildPoints();
      this.buildGraticule();
      this.buildArcs();
      this.bind();
      this.resize();
      new ResizeObserver(() => { this.resize(); if (this.reduced) this.draw(0); }).observe(canvas.parentElement);
      if (reduced) this.draw(0);
    }

    buildPoints() {
      const N = NARROW ? 9500 : 22000;
      const ga = Math.PI * (3 - Math.sqrt(5));
      const mx = vec(CITIES.mx.lat, CITIES.mx.lon);
      const kr = vec(CITIES.kr.lat, CITIES.kr.lon);
      const jp = vec(CITIES.jp.lat, CITIES.jp.lon);
      const sinLat = [], cosLat = [], sinLon = [], cosLon = [], hot = [];
      for (let i = 0; i < N; i++) {
        const y = 1 - (2 * (i + 0.5)) / N;
        const lat = Math.asin(y);
        let lon = (i * ga) % TAU;
        if (lon > Math.PI) lon -= TAU;
        if (!isLand(lat / D2R, lon / D2R)) continue;
        const cl = Math.sqrt(1 - y * y);
        const v = [cl * Math.sin(lon), y, cl * Math.cos(lon)];
        sinLat.push(y); cosLat.push(cl); sinLon.push(Math.sin(lon)); cosLon.push(Math.cos(lon));
        const dMx = angleBetween(v, mx) / D2R;
        const dAsia = Math.min(angleBetween(v, kr), angleBetween(v, jp)) / D2R;
        hot.push(dMx < 7.5 ? 1 : dAsia < 3.2 ? 2 : 0);
      }
      this.n = sinLat.length;
      this.sinLat = Float32Array.from(sinLat);
      this.cosLat = Float32Array.from(cosLat);
      this.sinLon = Float32Array.from(sinLon);
      this.cosLon = Float32Array.from(cosLon);
      this.hot = Uint8Array.from(hot);
      // Cubos de profundidad: 6 normales, 6 rojos (concesiones), 6 blancos (Asia)
      this.B = 6;
      this.bx = Array.from({ length: this.B * 3 }, () => new Float32Array(this.n));
      this.by = Array.from({ length: this.B * 3 }, () => new Float32Array(this.n));
      this.cnt = new Int32Array(this.B * 3);
    }

    buildGraticule() {
      this.grat = [];
      for (let lon = -180; lon < 180; lon += 30) {
        const pts = [];
        for (let lat = -85; lat <= 85; lat += 5) pts.push(vec(lat, lon));
        this.grat.push(pts);
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts = [];
        for (let lon = -180; lon <= 180; lon += 6) pts.push(vec(lat, lon));
        this.grat.push(pts);
      }
    }

    buildArcs() {
      this.arcs = ROUTES.map(([a, b], idx) => {
        const A = vec(CITIES[a].lat, CITIES[a].lon);
        const Bv = vec(CITIES[b].lat, CITIES[b].lon);
        const om = angleBetween(A, Bv);
        const lift = 0.1 + 0.2 * (om / Math.PI);
        const n = 84;
        const pts = [];
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1);
          const s1 = Math.sin((1 - t) * om) / Math.sin(om);
          const s2 = Math.sin(t * om) / Math.sin(om);
          const r = 1 + lift * Math.sin(Math.PI * t);
          pts.push([(A[0] * s1 + Bv[0] * s2) * r, (A[1] * s1 + Bv[1] * s2) * r, (A[2] * s1 + Bv[2] * s2) * r]);
        }
        return { pts, offset: idx * 0.45 };
      });
      this.cities = Object.values(CITIES).map((c) => ({ ...c, v: vec(c.lat, c.lon) }));
    }

    bind() {
      const cv = this.cv;
      cv.addEventListener('pointerdown', (e) => {
        this.dragging = true;
        this.lastX = e.clientX;
        this.dragVel = 0;
        cv.setPointerCapture(e.pointerId);
      });
      cv.addEventListener('pointermove', (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.lastX;
        this.lastX = e.clientX;
        const rad = ((dx * this.dpr) / this.R) * 1.1;
        this.lon0 -= rad;
        this.dragVel = rad * 60;
        if (this.reduced) this.draw(0);
      });
      const end = (e) => { this.dragging = false; try { cv.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ } };
      cv.addEventListener('pointerup', end);
      cv.addEventListener('pointercancel', end);

      const hero = $('#inicio');
      if (hero && !coarsePointer) {
        hero.addEventListener('pointermove', (e) => {
          const r = hero.getBoundingClientRect();
          this.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
          this.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        }, { passive: true });
      }
    }

    resize() {
      const host = this.cv.parentElement;
      const w = Math.max(10, host.offsetWidth);
      const h = Math.max(10, host.offsetHeight);
      this.cv.width = Math.round(w * this.dpr);
      this.cv.height = Math.round(h * this.dpr);
      this.W = this.cv.width;
      this.H = this.cv.height;
      this.cx = this.W / 2;
      this.cy = this.H / 2;
      this.R = Math.min(this.W, this.H) * 0.385;
      const { ctx, cx, cy, R } = this;
      this.body = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.08, cx, cy, R);
      this.body.addColorStop(0, 'rgba(38, 80, 165, 0.62)');
      this.body.addColorStop(0.55, 'rgba(14, 34, 80, 0.8)');
      this.body.addColorStop(1, 'rgba(5, 13, 31, 0.96)');
      this.atmo = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.28);
      this.atmo.addColorStop(0, 'rgba(96, 146, 255, 0.34)');
      this.atmo.addColorStop(0.45, 'rgba(70, 120, 235, 0.1)');
      this.atmo.addColorStop(1, 'rgba(70, 120, 235, 0)');
      this.alphas = [0.1, 0.22, 0.38, 0.56, 0.78, 0.98];
      this.fills = this.alphas.map((a) => `rgba(190, 212, 255, ${a})`);
      this.fillsHot = this.alphas.map((a) => `rgba(255, 75, 88, ${Math.min(1, a + 0.1)})`);
      this.fillsAsia = this.alphas.map((a) => `rgba(255, 255, 255, ${Math.min(1, a + 0.05)})`);
    }

    frame(dt, t) {
      if (!this.reduced) {
        if (!this.dragging) this.dragVel *= Math.pow(0.05, dt);
        this.lon0 -= this.dragging ? 0 : (this.speed + this.dragVel) * dt;
        const pitchTarget = (22 - this.ty * 7) * D2R;
        this.pitch += (pitchTarget - this.pitch) * Math.min(1, dt * 3);
        this.px += (this.tx - this.px) * Math.min(1, dt * 3.5);
        this.py += (this.ty - this.py) * Math.min(1, dt * 3.5);
        // Solo escribir cuando cambia: evita invalidar el layout en cada fotograma
        if (this.visual && (Math.abs(this.px - this.wpx) > 0.002 || Math.abs(this.py - this.wpy) > 0.002)) {
          this.wpx = this.px; this.wpy = this.py;
          this.visual.style.setProperty('--px', this.px.toFixed(3));
          this.visual.style.setProperty('--py', this.py.toFixed(3));
        }
      }
      this.draw(t);
    }

    draw(t) {
      const { ctx, W, H, cx, cy, R, dpr, B, n } = this;
      const c0 = Math.cos(this.lon0); const s0 = Math.sin(this.lon0);
      const cp = Math.cos(this.pitch); const sp = Math.sin(this.pitch);
      ctx.clearRect(0, 0, W, H);

      // Atmósfera y cuerpo
      ctx.fillStyle = this.atmo;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, 0, TAU); ctx.fill();
      ctx.fillStyle = this.body;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

      // Retícula
      ctx.lineWidth = dpr * 0.8;
      ctx.strokeStyle = 'rgba(150, 185, 255, 0.1)';
      ctx.beginPath();
      for (const line of this.grat) {
        let pen = false;
        for (let i = 0; i < line.length; i++) {
          const v = line[i];
          const x = v[0] * c0 - v[2] * s0;
          const z1 = v[2] * c0 + v[0] * s0;
          const y = v[1] * cp - z1 * sp;
          const z = v[1] * sp + z1 * cp;
          if (z > 0) {
            const sx = cx + R * x; const sy = cy - R * y;
            if (!pen) { ctx.moveTo(sx, sy); pen = true; } else ctx.lineTo(sx, sy);
          } else pen = false;
        }
      }
      ctx.stroke();

      // Puntos de tierra, agrupados por profundidad
      this.cnt.fill(0);
      const { sinLat, cosLat, sinLon, cosLon, hot, bx, by, cnt } = this;
      for (let i = 0; i < n; i++) {
        const cl = cosLat[i];
        const X = cl * sinLon[i]; const Z = cl * cosLon[i];
        const x = X * c0 - Z * s0;
        const z1 = Z * c0 + X * s0;
        const z = sinLat[i] * sp + z1 * cp;
        if (z <= 0.02) continue;
        const y = sinLat[i] * cp - z1 * sp;
        let b = Math.min(B - 1, (z * B) | 0);
        if (hot[i] === 1) b += B; else if (hot[i] === 2) b += B * 2;
        const k = cnt[b]++;
        bx[b][k] = cx + R * x;
        by[b][k] = cy - R * y;
      }
      for (let b = 0; b < B * 3; b++) {
        const level = b % B;
        const group = (b / B) | 0;
        ctx.fillStyle = group === 0 ? this.fills[level] : group === 1 ? this.fillsHot[level] : this.fillsAsia[level];
        const s = dpr * (1 + ((level + 0.5) / B) * 1.15) * (group === 1 ? 1.25 : 1);
        const half = s / 2;
        const xs = bx[b]; const ys = by[b];
        for (let k = 0, m = cnt[b]; k < m; k++) ctx.fillRect(xs[k] - half, ys[k] - half, s, s);
      }

      // Arcos de exportación
      const proj = (v) => {
        const x = v[0] * c0 - v[2] * s0;
        const z1 = v[2] * c0 + v[0] * s0;
        const y = v[1] * cp - z1 * sp;
        const z = v[1] * sp + z1 * cp;
        return { x, y, z, sx: cx + R * x, sy: cy - R * y, vis: z > 0 || x * x + y * y > 1.05 };
      };
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const arc of this.arcs) {
        const P = arc.pts.map(proj);
        ctx.lineWidth = dpr * 1.1;
        ctx.strokeStyle = this.reduced ? 'rgba(255, 110, 120, 0.7)' : 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i < P.length; i++) {
          if (P[i].vis) { if (!pen) { ctx.moveTo(P[i].sx, P[i].sy); pen = true; } else ctx.lineTo(P[i].sx, P[i].sy); } else pen = false;
        }
        ctx.stroke();

        if (!this.reduced) {
          const tail = 0.3;
          const phase = ((t * 0.2 + arc.offset) % (1 + tail));
          const head = phase * (P.length - 1);
          const start = head - tail * (P.length - 1);
          for (let i = Math.max(0, Math.floor(start)); i < Math.min(P.length - 1, Math.ceil(head)); i++) {
            if (!P[i].vis || !P[i + 1].vis) continue;
            const a = clamp((i - start) / (head - start), 0, 1);
            ctx.strokeStyle = `rgba(255, 92, 104, ${(a * 0.95).toFixed(3)})`;
            ctx.lineWidth = dpr * (1 + a * 2);
            ctx.beginPath(); ctx.moveTo(P[i].sx, P[i].sy); ctx.lineTo(P[i + 1].sx, P[i + 1].sy); ctx.stroke();
          }
          const hi = Math.round(head);
          if (hi > 0 && hi < P.length && P[hi].vis) {
            const g = ctx.createRadialGradient(P[hi].sx, P[hi].sy, 0, P[hi].sx, P[hi].sy, dpr * 12);
            g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            g.addColorStop(0.25, 'rgba(255, 90, 102, 0.8)');
            g.addColorStop(1, 'rgba(255, 75, 88, 0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(P[hi].sx, P[hi].sy, dpr * 12, 0, TAU); ctx.fill();
          }
        }
      }

      // Marcadores de ciudades
      ctx.font = `500 ${11 * dpr}px "Geist Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'middle';
      this.cities.forEach((c, idx) => {
        const p = proj(c.v);
        if (p.z < 0.06) return;
        const fade = clamp((p.z - 0.06) * 3, 0, 1);
        const ph = this.reduced ? 0.2 : (t * 0.55 + idx * 0.33) % 1;
        ctx.strokeStyle = c.color;
        ctx.lineWidth = dpr * 1.4;
        ctx.globalAlpha = fade * (1 - ph) * 0.85;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, dpr * (5 + ph * 24), 0, TAU); ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, dpr * 3.4, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.fillText(c.name, p.sx + dpr * 11, p.sy - dpr * 9);
        ctx.globalAlpha = 1;
      });

      // Borde del globo
      ctx.strokeStyle = 'rgba(150, 190, 255, 0.4)';
      ctx.lineWidth = dpr * 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    }
  }

  class Particles {
    constructor(canvas, reduced) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.reduced = reduced;
      this.minDt = NARROW ? 1 / 30 - 0.003 : 0;
      this.dpr = NARROW ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      this.mx = -9999; this.my = -9999;
      this.resize();
      new ResizeObserver(() => { this.resize(); if (this.reduced) this.draw(); }).observe(canvas);
      const host = canvas.closest('.hero');
      if (host && !coarsePointer) {
        host.addEventListener('pointermove', (e) => {
          const r = canvas.getBoundingClientRect();
          this.mx = (e.clientX - r.left) * this.dpr;
          this.my = (e.clientY - r.top) * this.dpr;
        }, { passive: true });
        host.addEventListener('pointerleave', () => { this.mx = this.my = -9999; });
      }
      if (reduced) this.draw();
    }
    resize() {
      const cw = this.cv.clientWidth;
      const ch = this.cv.clientHeight;
      this.W = this.cv.width = Math.max(10, Math.round(cw * this.dpr));
      this.H = this.cv.height = Math.max(10, Math.round(ch * this.dpr));
      const count = NARROW ? clamp(Math.round((cw * ch) / 24000), 20, 40) : clamp(Math.round((cw * ch) / 16000), 28, 96);
      this.p = Array.from({ length: count }, () => ({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vx: (Math.random() - 0.5) * 10,
        vy: -(4 + Math.random() * 12),
        r: (0.6 + Math.random() * 1.6) * this.dpr,
        tw: Math.random() * TAU,
        hot: Math.random() < 0.12,
      }));
    }
    frame(dt, t) {
      const { W, H, dpr } = this;
      for (const q of this.p) {
        q.x += q.vx * dt * dpr;
        q.y += q.vy * dt * dpr;
        const dx = q.x - this.mx; const dy = q.y - this.my;
        const d2 = dx * dx + dy * dy; const rad = 150 * dpr;
        if (d2 < rad * rad) {
          const d = Math.sqrt(d2) || 1; const f = (1 - d / rad) * 60 * dt * dpr;
          q.x += (dx / d) * f; q.y += (dy / d) * f;
        }
        if (q.y < -10) { q.y = H + 10; q.x = Math.random() * W; }
        if (q.x < -10) q.x = W + 10; else if (q.x > W + 10) q.x = -10;
        q.tw += dt * 2;
      }
      this.draw(t);
    }
    draw() {
      const { ctx, W, H, dpr, p } = this;
      ctx.clearRect(0, 0, W, H);
      const link = 110 * dpr;
      ctx.lineWidth = dpr * 0.7;
      for (let i = 0; i < p.length; i++) {
        const a = p[i];
        for (let j = i + 1; j < p.length; j++) {
          const b = p[j];
          const dx = a.x - b.x; const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link * link) {
            ctx.strokeStyle = `rgba(150, 185, 255, ${((1 - Math.sqrt(d2) / link) * 0.16).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const q of p) {
        const a = 0.35 + 0.35 * Math.sin(q.tw);
        ctx.fillStyle = q.hot ? `rgba(255, 90, 102, ${a + 0.2})` : `rgba(190, 212, 255, ${a})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill();
      }
    }
  }

  /* Pausa las animaciones decorativas de las secciones que no están a la vista */
  function initFxPause() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-fx-off', !e.isIntersecting));
    }, { rootMargin: '200px 0px' });
    $$('main > section.section').forEach((sec) => io.observe(sec));
  }

  function initHeroFx() {
    const globeEl = $('#globe');
    const partEl = $('#particles');
    const hero = $('#inicio');
    if (globeEl) {
      const globe = new Globe(globeEl, reduceMotion);
      if (!reduceMotion) whenVisible(hero, globe, (v) => hero.classList.toggle('is-paused', !v));
    }
    if (partEl) {
      const parts = new Particles(partEl, reduceMotion);
      if (!reduceMotion) whenVisible(hero, parts);
    }
  }

  /* ==========================================================================
     6. EFECTOS DE PUNTERO: spotlight, tilt, magnético
     ========================================================================== */
  function initPointerFx() {
    if (coarsePointer || reduceMotion) return;

    $$('[data-spot]').forEach((el) => {
      let queued = false; let ev = null;
      el.addEventListener('pointermove', (e) => {
        ev = e;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${ev.clientX - r.left}px`);
          el.style.setProperty('--my', `${ev.clientY - r.top}px`);
          queued = false;
        });
      }, { passive: true });
    });

    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', `${(px * 12).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-py * 12).toFixed(2)}deg`);
      }, { passive: true });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${clamp(dx * 0.18, -9, 9)}px, ${clamp(dy * 0.28, -7, 7)}px)`;
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ==========================================================================
     7. GALERÍA ACORDEÓN (operación)
     ========================================================================== */
  function initAccordion() {
    const wrap = $('.acc');
    if (!wrap) return;
    const items = $$('.acc__item', wrap);
    let idx = 0;
    let userTouched = false;
    let hovering = false;

    const activate = (i) => {
      idx = i;
      items.forEach((it, k) => it.classList.toggle('is-active', k === i));
    };
    items.forEach((it, i) => {
      it.addEventListener('pointerenter', () => { hovering = true; if (!coarsePointer) { userTouched = true; activate(i); } });
      it.addEventListener('pointerleave', () => { hovering = false; });
      it.addEventListener('focus', () => { userTouched = true; activate(i); });
      it.addEventListener('click', () => { userTouched = true; activate(i); });
      it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); } });
    });

    // Rotación automática hasta que la persona interactúe
    if (reduceMotion) return;
    let timer = 0;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => { if (!userTouched && !hovering && !document.hidden) activate((idx + 1) % items.length); }, 4200);
    };
    const stop = () => { clearInterval(timer); timer = 0; };
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.4 }).observe(wrap);
  }

  /* ==========================================================================
     8. EXPLORADOR DE ENSAYOS
     ========================================================================== */
  const ELEMENTS = [
    ['Au', 'Oro'], ['Ag', 'Plata'], ['Pt', 'Platino'], ['Pd', 'Paladio'], ['Ir', 'Iridio'],
    ['Rh', 'Rodio'], ['Ru', 'Rutenio'], ['Os', 'Osmio'], ['Re', 'Renio'],
  ];
  const ASSAYS = {
    mulatos: {
      title: 'Mena directa, mina Mulatos (muestra SMP-1)', unit: 'oz/ton', dec: 1,
      values: { Au: 1.4, Ag: 2.5, Pt: 14.0, Pd: 2.8, Ir: 16.0, Rh: 4.4, Ru: 2.5, Os: 13.7, Re: 9.7 },
    },
    busan: {
      title: 'Lingote fundido, Busan, Corea del Sur (muestra SMP-3)', unit: 'oz/ton', dec: 1,
      values: { Au: 8.4, Ag: 'No detectado', Pt: 20.2, Pd: 5.0, Ir: 24.7, Rh: 5.7, Ru: 8.1, Os: 44.8, Re: 11.9 },
    },
    gavilan: {
      title: 'Concentrado 3, mina El Gavilán', unit: 'g/ton', dec: 2,
      values: { Au: 3.8, Ag: 230.0, Pt: 6.66, Pd: 5.83, Ir: 15.0, Rh: 39.98, Ru: 'No analizado', Os: 'No analizado', Re: 'No analizado' },
    },
  };

  function initAssays() {
    const tabsWrap = $('#assayTabs');
    const grid = $('#assayGrid');
    const panel = $('#assayPanel');
    if (!tabsWrap || !grid || !panel) return;
    const tabs = $$('.assay-tab', tabsWrap);
    const titleEl = $('[data-assay-title]');
    const unitEl = $('[data-assay-unit]');
    let current = 'mulatos';
    let seen = false;

    function render(id, animate) {
      const data = ASSAYS[id];
      current = id;
      titleEl.textContent = data.title;
      unitEl.textContent = data.unit;
      const nums = Object.values(data.values).filter((v) => typeof v === 'number');
      const max = Math.max(...nums);
      grid.classList.remove('is-on');
      grid.innerHTML = ELEMENTS.map(([sym, name]) => {
        const v = data.values[sym];
        const isNum = typeof v === 'number';
        return `<li class="assay-cell">
          <div class="assay-cell__top"><span class="assay-cell__sym">${sym}</span><span class="assay-cell__name">${name}</span></div>
          <p class="assay-cell__val${isNum ? '' : ' is-na'}" ${isNum ? `data-to="${v}"` : ''}>${isNum ? formatNumber(v, data.dec) : v}</p>
          <span class="assay-cell__bar" style="--w:${isNum ? (v / max).toFixed(3) : 0}"></span>
        </li>`;
      }).join('');
      if (animate) {
        $$('[data-to]', grid).forEach((el) => animateCount(el, parseFloat(el.dataset.to), data.dec, 1400));
        requestAnimationFrame(() => requestAnimationFrame(() => grid.classList.add('is-on')));
      } else {
        grid.classList.add('is-on');
      }
    }

    function select(id, focus) {
      tabs.forEach((t) => {
        const on = t.dataset.assay === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('is-active', on);
        if (on) { panel.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); }
      });
      render(id, true);
    }

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t.dataset.assay, false));
      t.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (e.key in keys) { e.preventDefault(); select(tabs[(i + keys[e.key] + tabs.length) % tabs.length].dataset.assay, true); }
        else if (e.key === 'Home') { e.preventDefault(); select(tabs[0].dataset.assay, true); }
        else if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1].dataset.assay, true); }
      });
    });

    render('mulatos', false);
    grid.classList.remove('is-on');
    new IntersectionObserver((entries, io) => {
      if (entries[0].isIntersecting && !seen) { seen = true; render(current, true); io.disconnect(); }
    }, { threshold: 0.35 }).observe(panel);
  }

  /* ==========================================================================
     9. PROCESO (escenario fijo + pasos)
     ========================================================================== */
  function initProcess() {
    const steps = $$('.step');
    const figs = $$('.stage__fig');
    const rail = $('.process__rail span');
    if (!steps.length) return;

    const setActive = (i) => {
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      figs.forEach((f) => f.classList.toggle('is-active', Number(f.dataset.step) === i));
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.step)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));

    if (rail && reduceMotion) rail.style.setProperty('--p', '1');
  }

  /* Riel de progreso del proceso (solo escritorio, necesita ScrollTrigger) */
  function initProcessRail() {
    const rail = $('.process__rail span');
    if (!rail) return;
    window.ScrollTrigger.create({
      trigger: '.process__steps',
      start: 'top 60%',
      end: 'bottom 60%',
      onUpdate: (self) => rail.style.setProperty('--p', Math.max(0.04, self.progress).toFixed(3)),
    });
  }

  /* ==========================================================================
     10. COMPARATIVA, FAQ
     ========================================================================== */
  function initBars() {
    $$('[data-bar]').forEach((el) => el.style.setProperty('--w', el.dataset.bar));
  }

  function initFaq() {
    $$('.faq__q').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq__item');
        const open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* ==========================================================================
     11. MOVIMIENTO DE SCROLL (parallax y hero, solo escritorio, GSAP bajo demanda)
     ========================================================================== */
  function initProgressFallback() {
    // Respaldo de la barra de progreso (solo si no hay scroll-timeline nativo)
    if (!lenis || CSS.supports('animation-timeline: scroll()')) return;
    const bar = $('.progress span');
    lenis.on('scroll', ({ progress }) => bar && bar.style.setProperty('--p', progress.toFixed(4)));
  }

  async function initDesktopMotion() {
    if (reduceMotion || !wide.matches) return;
    try {
      await Promise.all([loadScript(GSAP_SRC), loadScript(ST_SRC)]);
    } catch (_) {
      const rail = $('.process__rail span');
      if (rail) rail.style.setProperty('--p', '1');
      return; // sin GSAP la página funciona igual, solo sin parallax
    }
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    $$('[data-parallax]').forEach((el) => {
      const f = parseFloat(el.dataset.parallax) || 0.1;
      gsap.fromTo(el, { y: -f * 420 }, {
        y: f * 420,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    if (matchMedia('(min-width: 1100px)').matches) {
      gsap.to('.hero__copy', {
        yPercent: -10, opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: true },
      });
    }
    gsap.to('.globe', {
      scale: 0.9, yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    initProcessRail();
    ScrollTrigger.refresh();
  }

  /* ==========================================================================
     12. FORMULARIO A WHATSAPP
     ========================================================================== */
  function initForm() {
    const form = $('#leadForm');
    if (!form) return;
    const ok = $('#formOk');
    const btn = $('button[type="submit"]', form);
    const label = $('.btn__label', btn);
    const labelDefault = label.textContent;

    const fields = {
      nombre: { input: $('#f-name'), err: $('#e-name') },
      contacto: { input: $('#f-contact'), err: $('#e-contact') },
      mensaje: { input: $('#f-msg'), err: $('#e-msg') },
    };

    const validators = {
      nombre: (v) => (v.trim().length >= 3 ? '' : 'Escriba su nombre completo.'),
      contacto: (v) => {
        const s = v.trim();
        if (!s) return 'Indique un teléfono o un correo para responderle.';
        if (s.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? '' : 'Revise el formato del correo electrónico.';
        const digits = s.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15 ? '' : 'Escriba un teléfono de al menos 10 dígitos.';
      },
      mensaje: (v) => (v.length <= 800 ? '' : 'El mensaje es muy largo (máximo 800 caracteres).'),
    };

    function check(key) {
      const f = fields[key];
      const msg = validators[key](f.input.value);
      f.err.textContent = msg;
      f.input.closest('.field').classList.toggle('is-invalid', !!msg);
      f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    Object.keys(fields).forEach((k) => {
      fields[k].input.addEventListener('blur', () => check(k));
      fields[k].input.addEventListener('input', () => {
        if (fields[k].input.closest('.field').classList.contains('is-invalid')) check(k);
      });
    });

    function buildUrl() {
      const v = (id) => $(id).value.trim();
      const empresa = v('#f-company');
      const lines = [
        `Hola, soy ${v('#f-name')}${empresa ? ` de ${empresa}` : ''}.`,
        `Me interesa: ${$('#f-topic').value}.`,
      ];
      if (v('#f-msg')) lines.push(v('#f-msg'));
      lines.push(`Mi contacto: ${v('#f-contact')}.`);
      lines.push('(Mensaje enviado desde el sitio web de Lance Internacional)');
      return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const results = Object.keys(fields).map(check);
      if (results.includes(false)) {
        const firstBad = Object.keys(fields).find((k) => validators[k](fields[k].input.value));
        if (firstBad) fields[firstBad].input.focus();
        ok.hidden = true;
        return;
      }
      btn.disabled = true;
      label.textContent = 'Abriendo WhatsApp...';
      const url = buildUrl();
      setTimeout(() => {
        const w = window.open(url, '_blank', 'noopener');
        if (!w) window.location.href = url;
        ok.hidden = false;
        btn.disabled = false;
        label.textContent = labelDefault;
      }, reduceMotion ? 0 : 700);
    });

    const retry = $('#formRetry');
    if (retry) retry.addEventListener('click', (e) => { e.preventDefault(); form.requestSubmit(); });
  }

  /* ==========================================================================
     13. WHATSAPP FLOTANTE
     ========================================================================== */
  function initWhatsApp() {
    const wa = $('#wa');
    if (!wa) return;
    wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hola, me interesa conocer más sobre Lance Internacional.')}`;
    let shown = false;
    try { shown = sessionStorage.getItem('lance-wa-tip') === '1'; } catch (_) { /* noop */ }
    if (shown) return;
    setTimeout(() => {
      wa.classList.add('is-tip');
      try { sessionStorage.setItem('lance-wa-tip', '1'); } catch (_) { /* noop */ }
      setTimeout(() => wa.classList.remove('is-tip'), 5200);
    }, 8000);
  }

  /* ==========================================================================
     ARRANQUE
     ========================================================================== */
  function onReady() {
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
    if (lenis && !menuOpen) lenis.start();
    openGate();
    initReveal();
    initCounters();
    initProgressFallback();
    initDesktopMotion();
  }

  function boot() {
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    initSmoothScroll();
    initAnchors();
    initNav();
    initHeroFx();
    initFxPause();
    initCycle();
    initPointerFx();
    initAccordion();
    initAssays();
    initProcess();
    initBars();
    initFaq();
    initForm();
    initWhatsApp();

    runLoader().then(onReady);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
