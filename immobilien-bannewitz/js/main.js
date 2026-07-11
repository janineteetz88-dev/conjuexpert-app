(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile Nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if(navToggle && navLinks){
    navToggle.addEventListener('click', function(){
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Nav solidify + progress bar + hero parallax (rAF-gebündelt) ---------- */
  var nav = document.getElementById('siteNav');
  var prog = document.getElementById('progress');
  var heroMedia = document.getElementById('heroMedia');
  var heroContent = document.getElementById('heroContent');
  var hero = document.getElementById('hero');
  var ticking = false;

  function onScrollFrame(){
    var y = window.scrollY || 0;

    if(nav){ nav.classList.toggle('solid', y > window.innerHeight * 0.82); }

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if(prog){ prog.style.width = (docH > 0 ? (y / docH * 100) : 0) + '%'; }

    if(!reduced && hero && heroMedia){
      var h = hero.offsetHeight;
      var p = Math.max(0, Math.min(1, y / h));
      heroMedia.style.transform = 'translateY(' + (p * 120).toFixed(1) + 'px) scale(' + (1 + p * 0.06).toFixed(3) + ')';
      if(heroContent){
        heroContent.style.opacity = String(Math.max(0, 1 - p * 1.4));
        heroContent.style.transform = 'translateY(' + (-p * 40).toFixed(1) + 'px)';
      }
    }
    ticking = false;
  }
  function onScroll(){
    if(!ticking){ requestAnimationFrame(onScrollFrame); ticking = true; }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScrollFrame();

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en, i){
      if(en.isIntersecting){
        en.target.style.animationDelay = ((i % 4) * 0.08) + 's';
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, {threshold:0.14});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });

  /* ---------- Über-mich Tabs ---------- */
  var tabData = {
    ueber: 'Ich bin Janine Kreiser. Bannewitzerin sowie Immobilien- und Finanzmaklerin, mit einem feinen Gespür für Menschen und ihre Lebenssituationen. Was mich auszeichnet? Leidenschaft, Fokus und echte Aufmerksamkeit. Ich höre genau hin, stelle die richtigen Fragen und entwickle für Ihre Immobilie eine individuelle Vermarktungsstrategie – statt Fließbandabfertigung.',
    eigennutzer: 'Ich weiß, wie viel Herzblut in einem Zuhause steckt. Ob Einfamilienhaus oder Eigentumswohnung – es geht nicht nur um vier Wände, sondern um Erinnerungen und Gefühle. Genau deshalb begleite ich Sie mit Empathie, Fachwissen und einem klaren Plan. Ich kümmere mich um die Details, während Sie sich zurücklehnen. Denn Ihr Zuhause verdient den besten Käufer – und den finde ich.',
    investoren: 'Ob vermietete Eigentumswohnung oder Mehrfamilienhaus – ich sorge dafür, dass Ihre Immobilie das Maximum herausholt. Mit klarem Blick auf die Zahlen, meinem Netzwerk und dem Wissen, was wirklich zählt: von der Rendite über das Zusammentragen der wichtigen Unterlagen bis zur reibungslosen Übergabe.'
  };
  var ueberTabs = document.getElementById('ueberTabs');
  var ueberPanel = document.getElementById('tabpanel-ueber');
  if(ueberTabs && ueberPanel){
    var tabBtns = Array.prototype.slice.call(ueberTabs.querySelectorAll('.ueber-tab'));
    function activateTab(btn){
      tabBtns.forEach(function(b){
        var on = b === btn;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
      ueberPanel.textContent = tabData[btn.dataset.tab];
      btn.focus();
    }
    tabBtns.forEach(function(btn, i){
      btn.addEventListener('click', function(){ activateTab(btn); });
      btn.addEventListener('keydown', function(e){
        if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
          e.preventDefault();
          var next = e.key === 'ArrowRight' ? (i + 1) % tabBtns.length : (i - 1 + tabBtns.length) % tabBtns.length;
          activateTab(tabBtns[next]);
        }
      });
    });
  }

  /* ---------- Animierte Zähler (18 / 24h / 100% / 210) ---------- */
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var el = en.target;
      var to = parseFloat(el.dataset.to);
      var suf = (el.dataset.suffix || '').trim();
      if(reduced){ el.innerHTML = suf ? (to + '<span class="stat-unit">' + suf + '</span>') : String(to); cio.unobserve(el); return; }
      var t0 = performance.now(), dur = 1300;
      function tick(t){
        var p = Math.min(1, (t - t0) / dur);
        var n = Math.round(to * (1 - Math.pow(1 - p, 3)));
        el.innerHTML = suf ? (n + '<span class="stat-unit">' + suf + '</span>') : String(n);
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, {threshold:0.6});
  document.querySelectorAll('.stat-num').forEach(function(el){ cio.observe(el); });

  /* ---------- Portrait Tilt (nur Desktop, nicht bei reduced-motion) ---------- */
  var ueberMedia = document.getElementById('ueberMedia');
  if(ueberMedia && !reduced && !window.matchMedia('(max-width: 860px)').matches){
    if(ueberMedia.parentElement){ ueberMedia.parentElement.style.perspective = '1100px'; }
    ueberMedia.style.transition = 'transform .2s ease-out';
    window.addEventListener('mousemove', function(e){
      var b = ueberMedia.getBoundingClientRect();
      var dx = (e.clientX - (b.left + b.width / 2)) / (b.width / 2);
      var dy = (e.clientY - (b.top + b.height / 2)) / (b.height / 2);
      if(Math.abs(dx) > 2.4 || Math.abs(dy) > 2.4){ ueberMedia.style.transform = ''; return; }
      ueberMedia.style.transform = 'rotateY(' + (dx * 4).toFixed(2) + 'deg) rotateX(' + (-dy * 4).toFixed(2) + 'deg)';
    }, {passive:true});
  }

  /* ---------- Fragen-Akkordeon ---------- */
  var fragenGrid = document.getElementById('fragenGrid');
  if(fragenGrid){
    var frageCards = Array.prototype.slice.call(fragenGrid.querySelectorAll('.frage-card'));
    frageCards.forEach(function(card){
      var head = card.querySelector('.frage-head');
      head.addEventListener('click', function(){
        var willOpen = !card.classList.contains('open');
        frageCards.forEach(function(c){
          c.classList.remove('open');
          c.querySelector('.frage-head').setAttribute('aria-expanded', 'false');
        });
        if(willOpen){
          card.classList.add('open');
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- Hero video: force muted (Autoplay-Policy) ---------- */
  var hv = document.querySelector('.hero-media video');
  if(hv){
    hv.muted = true; hv.defaultMuted = true; hv.volume = 0; hv.setAttribute('muted','');
    var p = hv.play();
    if(p && p.catch){ p.catch(function(){}); }
  }
})();
