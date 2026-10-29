// Navigation, hero video and attribution capture. No dependencies.
(function () {
  'use strict';

  // ----- Services dropdown (click/tap/keyboard; hover on fine pointers) -----
  document.querySelectorAll('.menu-toggle').forEach(function (btn) {
    var li = btn.closest('.has-menu');
    var menu = document.getElementById(btn.getAttribute('aria-controls'));
    function set(open) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    var hoverOpened = false;
    btn.addEventListener('click', function () {
      // A click right after hover-open keeps it open instead of snapping it shut.
      if (hoverOpened) { hoverOpened = false; set(true); return; }
      set(btn.getAttribute('aria-expanded') !== 'true');
    });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
      if (e.key === 'ArrowDown' && document.activeElement === btn) { e.preventDefault(); set(true); var a = menu.querySelector('a'); if (a) a.focus(); }
    });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) set(false); });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var t;
      li.addEventListener('mouseenter', function () { clearTimeout(t); if (btn.getAttribute('aria-expanded') !== 'true') hoverOpened = true; set(true); });
      li.addEventListener('mouseleave', function () { hoverOpened = false; t = setTimeout(function () { set(false); }, 160); });
    }
    document.addEventListener('click', function (e) { if (!li.contains(e.target)) set(false); });
  });

  // ----- Mobile menu -----
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.getElementById('mobile-nav');
  if (toggle && mobile) {
    function setMobile(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobile.hidden = !open;
      toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Menu';
    }
    toggle.addEventListener('click', function () { setMobile(mobile.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mobile.hidden) { setMobile(false); toggle.focus(); } });
    mobile.addEventListener('click', function (e) { if (e.target.closest('a')) setMobile(false); });
    window.matchMedia('(min-width: 921px)').addEventListener('change', function (m) { if (m.matches) setMobile(false); });
  }

  // ----- Hero video: poster first, never a broken source, reduced motion respected -----
  var video = document.querySelector('[data-hero-video]');
  var pauseBtn = document.querySelector('[data-hero-pause]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (video && !reduce.matches) {
    var userPaused = false;
    var visible = true;
    var hide = function () { video.remove(); if (pauseBtn) pauseBtn.remove(); };
    // Only give up when the last <source> fails (earlier ones may just be unsupported); the still stays visible.
    var sources = video.querySelectorAll('source');
    if (sources.length) sources[sources.length - 1].addEventListener('error', hide);
    var play = function () { if (!userPaused && visible) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } };
    video.addEventListener('playing', function () { if (pauseBtn) pauseBtn.hidden = false; });
    // Phones must play the chip-centred mobile crop. <source media> is only evaluated once at load (and isn't
    // honoured everywhere), so pick the file for the current width ourselves, and again on resize/rotation.
    var phone = window.matchMedia('(max-width: 720px)');
    var pick = function () {
      var want = null;
      for (var i = 0; i < sources.length; i++) {
        var s = sources[i];
        if (s.type !== 'video/mp4' && !video.canPlayType(s.type)) continue;
        var isMobileSrc = s.getAttribute('media') === '(max-width: 720px)';
        if (isMobileSrc === phone.matches) { want = s.getAttribute('src'); break; }
      }
      if (!want || (video.currentSrc && video.currentSrc.indexOf(want) !== -1)) return;
      video.src = want;
      play();
    };
    pick();
    video.addEventListener('loadedmetadata', pick, { once: true });
    if (phone.addEventListener) phone.addEventListener('change', pick);
    // The <video> autoplays from markup; this covers browsers that only start when asked.
    // If the device refuses (e.g. iOS Low Power Mode) the first-frame poster simply stays.
    play();
    video.addEventListener('canplay', play, { once: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) play(); else video.pause();
      }, { threshold: 0.05 }).observe(video);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) video.pause(); else play(); });
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        pauseBtn.querySelector('[data-label]').textContent = userPaused ? 'Play background video' : 'Pause background video';
        if (userPaused) video.pause(); else play();
      });
    }
  } else if (video) {
    video.remove();
    if (pauseBtn) pauseBtn.remove();
  }

  // ----- Attribution: keep first-touch UTM params for this tab session -----
  try {
    var params = new URLSearchParams(location.search);
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    var found = {};
    keys.forEach(function (k) { if (params.get(k)) found[k] = params.get(k).slice(0, 200); });
    if (Object.keys(found).length && !sessionStorage.getItem('iw_attr')) {
      found.landing = location.pathname;
      found.referrer = document.referrer ? document.referrer.slice(0, 300) : '';
      sessionStorage.setItem('iw_attr', JSON.stringify(found));
    } else if (!sessionStorage.getItem('iw_attr')) {
      sessionStorage.setItem('iw_attr', JSON.stringify({ landing: location.pathname, referrer: document.referrer ? document.referrer.slice(0, 300) : '' }));
    }
  } catch (e) { /* storage unavailable: attribution is optional */ }

  // ----- Cross-page anchors (e.g. /#demo from another page) -----
  // The browser's own jump to the anchor would animate (html has scroll-behavior: smooth) and race the
  // re-alignment below, landing off-target. So for anchor landings: no smooth scroll until we've aligned once
  // after load + fonts (which can shift layout), then smooth scrolling is restored for in-page links.
  if (location.hash.length > 1) {
    var rootStyle = document.documentElement.style;
    rootStyle.scrollBehavior = 'auto';
    var settle = function () {
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) {
        var off = parseFloat(getComputedStyle(t).scrollMarginTop) || 0;
        var top = t.getBoundingClientRect().top;
        if (Math.abs(top - off) > 4) window.scrollTo(0, window.scrollY + top - off);
      }
      setTimeout(function () { rootStyle.scrollBehavior = ''; }, 50);
    };
    window.addEventListener('load', function () {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle); else settle();
    }, { once: true });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
