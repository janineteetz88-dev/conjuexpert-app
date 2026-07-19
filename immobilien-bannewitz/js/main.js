(function(){
  'use strict';
  // Access Key von web3forms.com (kostenlos, siehe README) — ohne diesen
  // Key verschickt das Kontaktformular keine E-Mails.
  var WEB3FORMS_ACCESS_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';
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

  /* ---------- Quiz / Selbsttest ---------- */
  var quizData = [
    { q: 'Ein Interessent will bar aus dem Kofferraum zahlen. Sie…', opts: [
      { t: '…prüfen Bonität und Herkunft – Geldwäsche lässt grüßen.', p: 0 },
      { t: '…googeln erst mal „ist das eigentlich erlaubt?".', p: 1 },
      { t: '…nehmen das Geld, Weihnachten ist gerettet.', p: 2 } ] },
    { q: 'Was ist Ihre Immobilie wert?', opts: [
      { t: 'Kommt auf Lage, Zustand, Mietvertrag & 20 andere Dinge an.', p: 0 },
      { t: 'So viel wie das Nachbarhaus. Ungefähr. Glaube ich.', p: 1 },
      { t: 'Genau das, was mir das Online-Portal versprochen hat.', p: 2 } ] },
    { q: 'Der Energieausweis liegt bei Ihnen…', opts: [
      { t: '…griffbereit, aktuell und im richtigen Typ.', p: 0 },
      { t: '…irgendwo. Vermutlich. In einem Ordner. Glaube ich.', p: 1 },
      { t: 'Ein… was? Klingt nach Stromrechnung.', p: 2 } ] },
    { q: 'Ihre Inserats-Fotos entstehen…', opts: [
      { t: '…aufgeräumt, bei Tageslicht, mit gutem Blick fürs Motiv.', p: 0 },
      { t: '…schnell mit dem Handy, Wäscheständer inklusive.', p: 1 },
      { t: '…im Hochformat, Finger halb auf der Linse, Katze im Bild.', p: 2 } ] },
    { q: 'Zeit für Anrufe, Besichtigungen und Nachfassen haben Sie…', opts: [
      { t: 'Wochenweise frei und Nerven aus Stahl.', p: 0 },
      { t: 'Zwischen Job, Familie, Hobby und Schlafen… weniger.', p: 1 },
      { t: 'Ich gehe schon jetzt nicht mehr ans Telefon.', p: 2 } ] },
    { q: 'Am Telefon fragt jemand nach dem Baujahr. Sie…', opts: [
      { t: '…nennen es aus dem Kopf, samt Sanierungsjahren.', p: 0 },
      { t: '…rufen kurz „Schaaatz, wann war das nochmal?" durchs Haus.', p: 1 },
      { t: '…sagen „so ungefähr alt halt" und hoffen auf das Beste.', p: 2 } ] },
    { q: 'Ein „Interessent" will unbedingt allein durchs leere Haus. Sie…', opts: [
      { t: '…begleiten grundsätzlich und prüfen vorab, wer da kommt.', p: 0 },
      { t: '…finden das etwas komisch, sagen aber trotzdem ja.', p: 1 },
      { t: '…drücken ihm den Schlüssel in die Hand. Wird schon passen.', p: 2 } ] },
    { q: 'Verhandeln ist für Sie…', opts: [
      { t: '…Handwerk: Argumente, Ruhe, klare Schmerzgrenze.', p: 0 },
      { t: '…okay, solange niemand böse guckt.', p: 1 },
      { t: '…Horror. Beim ersten „zu teuer" knicke ich ein.', p: 2 } ] },
    { q: 'Nach dem Verkauf zeigt sich Feuchtigkeit im Keller. Sie…', opts: [
      { t: '…haben alles dokumentiert und offen aufgeklärt – entspannt.', p: 0 },
      { t: '…hoffen, dass „hab ich nicht gewusst" reicht.', p: 1 },
      { t: 'Haftung? Nach dem Verkauf ist das doch dessen Problem, oder?', p: 2 } ] },
    { q: 'Beim Notartermin sind Sie…', opts: [
      { t: '…bestens vorbereitet, alle Unterlagen komplett.', p: 0 },
      { t: '…ist da nicht der Makler dabei? Also… oh.', p: 1 },
      { t: 'Notar? Reicht nicht ein Handschlag unter Ehrenleuten?', p: 2 } ] }
  ];

  var pannenList = [
    'Der Preis wird nach Bauchgefühl festgelegt – 20 % zu hoch.',
    'Der Preis wird aus Angst zu niedrig angesetzt – Geld verschenkt.',
    'Die Portal-Sofortbewertung wird für bare Münze genommen.',
    'Das Nachbarhaus als Maßstab – ganz andere Lage, ganz anderer Zustand.',
    'Monatelang kein Verkauf, weil der Preis nie hinterfragt wurde.',
    'Der Preis wird gesenkt, sobald der Erste „zu teuer" sagt.',
    'Verhandlungsspielraum vergessen einzupreisen.',
    'Emotionaler Wert wird mit Marktwert verwechselt.',
    'Sanierungsstau wird schöngerechnet statt eingepreist.',
    'Die Grundsteuer-/Bodenrichtwert-Logik wird komplett übersehen.',
    'Das Exposé besteht aus drei Sätzen und einer Handynummer.',
    'Die Überschrift lautet „Haus zu verkaufen" – und sonst nichts.',
    'Fotos im Hochformat, dunkel, mit Finger auf der Linse.',
    'Der Wäscheständer steht auf jedem zweiten Bild.',
    'Die Katze sitzt formatfüllend im besten Motiv.',
    'Unaufgeräumt fotografiert – Chaos schreckt Käufer ab.',
    'Nur Innenräume, kein einziges Foto von außen.',
    'Grundriss fehlt – Interessenten können sich nichts vorstellen.',
    'Quadratmeter aus dem Gedächtnis angegeben – falsch.',
    'Wohn- und Nutzfläche werden munter verwechselt.',
    'Das Baujahr wird „so ungefähr" geschätzt.',
    'Der Energieausweis fehlt – Bußgeld bis 10.000 €.',
    'Falscher Typ Energieausweis (Bedarf statt Verbrauch) besorgt.',
    'Pflichtangaben im Inserat vergessen – Abmahnung droht.',
    'Das Inserat läuft nur auf einer einzigen Plattform.',
    'Keine Reichweite, weil das Netzwerk fehlt.',
    'Der beste Verkaufszeitpunkt wird verpasst.',
    'Rechtschreibfehler im Exposé wirken unseriös.',
    'Highlights der Immobilie werden gar nicht erwähnt.',
    'Die Zielgruppe ist unklar – Ansprache trifft niemanden.',
    'Das Telefon klingelt zur Unzeit – im Meeting, beim Abendessen.',
    'Anfragen bleiben tagelang liegen – Interessent ist längst weg.',
    'Jede Besichtigung frisst einen halben Urlaubstag.',
    'Fünf Termine an einem Samstag – und keiner erscheint.',
    'Besichtigungstourismus: Nachbarn wollen nur mal gucken.',
    'Keine Vorqualifizierung – Zeit mit Nicht-Käufern verbrannt.',
    'Bonität wird nie geprüft – der „Käufer" kann gar nicht zahlen.',
    'Ein Fremder geht allein durchs leere Haus.',
    'Wertgegenstände liegen während der Besichtigung offen herum.',
    'Die eigene Adresse steht ungeschützt im Netz.',
    'Trickbetrüger nutzen die Besichtigung zum Auskundschaften.',
    'Der „Investor" zahlt bar aus dem Kofferraum – Geldwäsche-Alarm.',
    'Ein Reservierungs-„Anzahlungs"-Trick zieht Geld aus der Tasche.',
    'Gefälschte Finanzierungsbestätigung wird nicht erkannt.',
    'Verhandlung eskaliert emotional – die Fronten verhärten.',
    'Beim ersten Gegenangebot wird sofort eingeknickt.',
    'Es gibt keine klare Schmerzgrenze – am Ende zu billig verkauft.',
    'Mehrere Interessenten, aber kein sauberes Bieterverfahren.',
    'Mündliche Zusagen ohne jede Absicherung.',
    'Der Käufer springt kurz vor Notar ab – von vorn.',
    'Grundbuchauszug wurde nie besorgt.',
    'Altlasten oder Baulasten sind unbekannt.',
    'Wegerechte und Dienstbarkeiten werden übersehen.',
    'Teilungserklärung bei der Eigentumswohnung fehlt.',
    'Protokolle der Eigentümerversammlung: Fehlanzeige.',
    'Hausgeldabrechnungen der letzten Jahre nicht auffindbar.',
    'Instandhaltungsrücklage wird falsch dargestellt.',
    'Denkmalschutz-Auflagen sind gar nicht bekannt.',
    'Erschließungsbeiträge tauchen plötzlich als Kostenfalle auf.',
    'Offene Baugenehmigungen oder Schwarzbauten fliegen auf.',
    'Mängel werden verschwiegen – arglistige Täuschung, Haftung.',
    'Feuchter Keller wird „übersehen" – der Käufer klagt.',
    'Zusicherungen im Gespräch werden später zur Haftungsfalle.',
    'Der Kaufvertrag wird nicht vorab geprüft.',
    'Fristen und Zahlungsmodalitäten sind unklar geregelt.',
    'Auflassungsvormerkung? Nie gehört.',
    'Die Fälligkeit des Kaufpreises ist schlecht abgesichert.',
    'Verkauft wird an den, der zuerst „ja" sagt – nicht an den Besten.',
    'Spekulationssteuer wird zu spät bedacht – teuer.',
    'Die Zehn-Jahres-Frist wird um wenige Wochen verpasst.',
    'Vorfälligkeitsentschädigung der Bank überrascht eiskalt.',
    'Steuerliche Folgen bei geerbten Immobilien ignoriert.',
    'Erbengemeinschaft ist sich uneins – Verkauf blockiert.',
    'Vollmachten fehlen, wenn mehrere Eigentümer verkaufen.',
    'Ein Miteigentümer wird schlicht vergessen einzubinden.',
    'Der laufende Mietvertrag wird beim Preis nicht berücksichtigt.',
    'Mieter werden vor vollendete Tatsachen gestellt – Ärger.',
    'Vorkaufsrecht des Mieters übersehen.',
    'Kündigung wegen Eigenbedarfs falsch aufgesetzt.',
    'Betriebskostenabrechnung gegenüber Mietern läuft schief.',
    'Kaution und deren Übergang werden nicht geregelt.',
    'Die Übergabe erfolgt vor der Kaufpreiszahlung – riskant.',
    'Zählerstände werden bei der Übergabe nicht abgelesen.',
    'Es gibt kein Übergabeprotokoll – Streit ist programmiert.',
    'Schlüssel werden zu früh oder unvollständig übergeben.',
    'Die Hausverwaltung wird nie über den Eigentümerwechsel informiert.',
    'Versicherungen laufen ungewollt weiter oder fallen weg.',
    'Restmüll, Sperrmüll, Öltank – niemand fühlt sich zuständig.',
    'Der emotionale Abschied lähmt jede Entscheidung.',
    'Kritik am eigenen Zuhause wird persönlich genommen.',
    'Familienstreit über Preis und Zeitpunkt eskaliert.',
    'Aus Bequemlichkeit wird unter Wert an Bekannte verkauft.',
    'Ein einziger Interessent – und dadurch jede Verhandlungsmacht verloren.',
    'Zu langes Zögern: Der Markt dreht, die Zinsen steigen.',
    'Doppelte Belastung, weil das neue Objekt schon gekauft ist.',
    'Der Verkauf zieht sich über ein Jahr – Nerven am Ende.',
    'Widerrufs- und Formvorschriften werden missachtet.',
    'Datenschutz bei Interessentendaten wird ignoriert.',
    'Am Ende landet die Immobilie doch beim Makler – nur ein Jahr später und billiger.',
    'Und der Klassiker: Man unterschätzt, wie viel Nerven das alles wirklich kostet.'
  ];

  var quizState = { index: 0, answers: [] };
  var quizActiveEl = document.getElementById('quizActive');
  var quizResultEl = document.getElementById('quizResult');
  if(quizActiveEl && quizResultEl){
    var qProgLabel = document.getElementById('quizProgressLabel');
    var qProgFill = document.getElementById('quizProgressFill');
    var qQuestion = document.getElementById('quizQuestion');
    var qOpts = document.getElementById('quizOpts');

    function renderQuizQuestion(){
      var q = quizData[quizState.index];
      qProgLabel.textContent = 'Frage ' + (quizState.index + 1) + ' / ' + quizData.length;
      qProgFill.style.width = (quizState.index / quizData.length * 100) + '%';
      qQuestion.textContent = q.q;
      qOpts.innerHTML = '';
      q.opts.forEach(function(o){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'q-opt';
        btn.textContent = o.t;
        btn.addEventListener('click', function(){ pickQuizAnswer(o.p); });
        qOpts.appendChild(btn);
      });
    }

    function pickQuizAnswer(points){
      quizState.answers.push(points);
      quizState.index++;
      if(quizState.index >= quizData.length){
        showQuizResult();
      } else {
        renderQuizQuestion();
      }
    }

    function showQuizResult(){
      quizActiveEl.hidden = true;
      quizResultEl.hidden = false;
      var score = quizState.answers.reduce(function(a,b){ return a+b; }, 0);
      var max = quizData.length * 2;
      document.getElementById('quizScoreText').textContent = score + ' / ' + max;

      var label, sub, verdict;
      if(score >= 14){
        label = 'Zeit, dass wir reden.';
        sub = 'Am besten, bevor der Kofferraum-Käufer klingelt.';
        verdict = 'Okay, das war jetzt streckenweise mutig. Bevor der nächste „Käufer" mit dem Kofferraum vorfährt: Lassen Sie uns lieber vorher sprechen, als hinterher aufräumen. Versprochen: kein Vortrag, nur ein ehrliches, kostenfreies Gespräch.';
      } else if(score >= 7){
        label = 'Ein paar Lücken – gut zu wissen.';
        sub = 'Gemeinsam wird der Verkauf entspannt und sicher.';
        verdict = 'Ganz ehrlich? Sie sind auf einem guten Weg, aber ein paar Stolpersteine hätten Sie sich lieber erspart. Genau dafür bin ich da – damit aus „hätte, wäre, wenn" ein entspannter, sicherer Verkauf wird. Lassen Sie uns kurz über Ihre Situation sprechen.';
      } else {
        label = 'Sie sind erstaunlich fit.';
        sub = 'Trotzdem: den Rücken freihalten lassen schadet nie.';
        verdict = 'Respekt – Sie kennen sich richtig gut aus, das sieht man. Trotzdem lassen selbst die Fittesten sich beim Verkauf gern den Rücken freihalten, gerade bei Verhandlung und den Feinheiten im Kaufvertrag. Melden Sie sich gern für eine zweite Meinung – ganz unverbindlich.';
      }
      document.getElementById('quizScoreLabel').textContent = label;
      document.getElementById('quizScoreSub').textContent = sub;
      document.getElementById('quizVerdict').textContent = verdict;
    }

    var quizResetBtn = document.getElementById('quizResetBtn');
    if(quizResetBtn){
      quizResetBtn.addEventListener('click', function(){
        quizState = { index: 0, answers: [] };
        quizResultEl.hidden = true;
        quizActiveEl.hidden = false;
        renderQuizQuestion();
      });
    }
    renderQuizQuestion();
  }

  /* ---------- Pannen-Liste (toggle + Inhalte) ---------- */
  var pannenToggle = document.getElementById('pannenToggle');
  var pannenPanel = document.getElementById('pannenPanel');
  var pannenListEl = document.getElementById('pannenList');
  if(pannenToggle && pannenPanel && pannenListEl){
    var pannenTitle = document.getElementById('pannenTitle');
    if(pannenTitle){ pannenTitle.textContent = pannenList.length + ' ' + pannenTitle.textContent; }
    pannenList.forEach(function(text, i){
      var item = document.createElement('div');
      item.className = 'pannen-item';
      var n = document.createElement('span'); n.className = 'n'; n.textContent = (i+1);
      var t = document.createElement('span'); t.className = 't'; t.textContent = text;
      item.appendChild(n); item.appendChild(t);
      pannenListEl.appendChild(item);
    });
    pannenToggle.addEventListener('click', function(){
      var open = pannenPanel.hidden;
      pannenPanel.hidden = !open;
      pannenToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Ablauf: Drag-Scroll + Pfeile + Fortschrittsbalken ---------- */
  var track = document.getElementById('stepsTrack');
  if(track){
    var down = false, sx = 0, sl = 0, moved = false;
    function abStart(x){ down = true; moved = false; sx = x; sl = track.scrollLeft; track.classList.add('drag'); }
    function abMove(x){ if(!down) return; var d = x - sx; if(Math.abs(d) > 4) moved = true; track.scrollLeft = sl - d; }
    function abEnd(){ down = false; track.classList.remove('drag'); }
    track.addEventListener('pointerdown', function(e){ abStart(e.clientX); });
    track.addEventListener('pointermove', function(e){ abMove(e.clientX); });
    track.addEventListener('pointerup', abEnd);
    track.addEventListener('pointerleave', abEnd);
    track.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);

    var abThumb = document.getElementById('abThumb');
    function updThumb(){
      if(!abThumb) return;
      var sw = track.scrollWidth, cw = track.clientWidth;
      var vis = Math.max(0.12, cw / sw);
      abThumb.style.width = (vis * 100) + '%';
      var maxScroll = sw - cw;
      var p = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
      abThumb.style.left = (p * (100 - vis * 100)) + '%';
    }
    track.addEventListener('scroll', updThumb, {passive:true});
    updThumb();

    function scrollAb(dir){
      var card = track.querySelector('.step');
      var step = card ? card.getBoundingClientRect().width + 22 : 340;
      track.scrollBy({ left: dir * step, behavior: 'smooth' });
    }
    var abPrev = document.getElementById('abPrev');
    var abNext = document.getElementById('abNext');
    if(abPrev) abPrev.addEventListener('click', function(){ scrollAb(-1); });
    if(abNext) abNext.addEventListener('click', function(){ scrollAb(1); });
  }

  /* ---------- Hero video: force muted (Autoplay-Policy) ---------- */
  var hv = document.querySelector('.hero-media video');
  if(hv){
    hv.muted = true; hv.defaultMuted = true; hv.volume = 0; hv.setAttribute('muted','');
    var p = hv.play();
    if(p && p.catch){ p.catch(function(){}); }
  }

  /* ---------- Netzwerk-Akkordeon ---------- */
  document.querySelectorAll('.netzwerk-head[aria-expanded]').forEach(function(head){
    var detail = document.getElementById(head.getAttribute('aria-controls'));
    head.addEventListener('click', function(){
      var open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', open ? 'false' : 'true');
      if(detail) detail.hidden = open;
    });
  });

  /* ---------- Kontakt-Formular (Terminbuchung), generisch für Kontakt-1 & Kontakt-2 ---------- */
  var kfQuestions = [
    { key: 'art', q: 'Um welche Immobilie geht es?', opts: ['Einfamilienhaus', 'Eigentumswohnung', 'Mehrfamilienhaus', 'Grundstück'] },
    { key: 'ort', q: 'Wo liegt Ihre Immobilie?', opts: ['Bannewitz', 'Freital', 'Dresden', 'Kreischa'], free: true, placeholder: 'Anderer Ort – hier eingeben' },
    { key: 'flaeche', q: 'Wie groß ist die Wohn-/Grundfläche?', opts: [], free: true, placeholder: 'Fläche in m² eingeben' },
    { key: 'zustand', q: 'In welchem Zustand ist sie?', opts: ['Neuwertig', 'Gepflegt', 'Renovierungsbedürftig'] },
    { key: 'nutzung', q: 'Wie wird sie aktuell genutzt?', opts: ['Selbst genutzt', 'Vermietet', 'Steht leer'] },
    { key: 'zeit', q: 'Wann möchten Sie verkaufen?', opts: ['So bald wie möglich', 'In 3–6 Monaten', 'Erst mal nur Orientierung'] }
  ];
  var kfTimes = ['12:00', '12:15', '12:30', '12:45', '13:00'];
  var kfDayNames = ['So','Mo','Di','Mi','Do','Fr','Sa'];

  function buildKfDayList(){
    var out = [], d = new Date(), n = 0;
    while(out.length < 5 && n < 14){
      d.setDate(d.getDate() + 1); n++;
      var wd = d.getDay();
      if(wd >= 1 && wd <= 5){
        out.push({ label: kfDayNames[wd], date: d.getDate() + '.' + (d.getMonth() + 1) + '.', key: kfDayNames[wd] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.' });
      }
    }
    return out;
  }

  function initKontaktForm(root){
    var askingEl = root.querySelector('[data-kf-asking]');
    var bookingEl = root.querySelector('[data-kf-booking]');
    var bookedEl = root.querySelector('[data-kf-booked]');
    var progLabel = root.querySelector('[data-kf-progress-label]');
    var progFill = root.querySelector('[data-kf-progress-fill]');
    var backBtn = root.querySelector('[data-kf-back]');
    var questionEl = root.querySelector('[data-kf-question]');
    var optsEl = root.querySelector('[data-kf-opts]');
    var freeRow = root.querySelector('[data-kf-free-row]');
    var freeInput = root.querySelector('[data-kf-free-input]');
    var freeSubmit = root.querySelector('[data-kf-free-submit]');
    var nameInput = root.querySelector('[data-kf-name]');
    var contactInput = root.querySelector('[data-kf-contact]');
    var dayListEl = root.querySelector('[data-kf-day-list]');
    var timeListEl = root.querySelector('[data-kf-time-list]');
    var submitBtn = root.querySelector('[data-kf-submit]');
    var resetBtn = root.querySelector('[data-kf-reset]');
    var honeypot = root.querySelector('[data-kf-honeypot]');
    var errorEl = root.querySelector('[data-kf-error]');
    var sourceLabel = root.dataset.kf === '2' ? 'Kontakt-2' : 'Kontakt-1';

    var state = { step: 0, answers: {}, day: '', time: '' };

    function renderQuestion(){
      var q = kfQuestions[state.step];
      progLabel.textContent = 'Frage ' + (state.step + 1) + ' / ' + kfQuestions.length;
      progFill.style.width = (state.step / kfQuestions.length * 100) + '%';
      questionEl.textContent = q.q;
      backBtn.hidden = state.step === 0;

      optsEl.innerHTML = '';
      q.opts.forEach(function(opt){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kf-opt';
        btn.textContent = opt;
        btn.addEventListener('click', function(){ pick(q.key, opt); });
        optsEl.appendChild(btn);
      });

      if(q.free){
        freeRow.hidden = false;
        freeInput.value = '';
        freeInput.placeholder = q.placeholder || 'Eigene Angabe';
      } else {
        freeRow.hidden = true;
      }
    }

    function pick(key, val){
      state.answers[key] = val;
      state.step++;
      if(state.step >= kfQuestions.length){
        showBooking();
      } else {
        renderQuestion();
      }
    }

    function back(){
      if(state.step === 0) return;
      state.step--;
      renderQuestion();
    }

    function showBooking(){
      askingEl.hidden = true;
      bookingEl.hidden = false;
      bookedEl.hidden = true;
      renderDayList();
      renderTimeList();
      validate();
    }

    function renderDayList(){
      dayListEl.innerHTML = '';
      buildKfDayList().forEach(function(d){
        var el = document.createElement('div');
        el.className = 'kf-slot' + (d.key === state.day ? ' active' : '');
        el.innerHTML = '<div class="d">' + d.label + '</div><div class="s">' + d.date + '</div>';
        el.addEventListener('click', function(){ state.day = d.key; renderDayList(); validate(); });
        dayListEl.appendChild(el);
      });
    }

    function renderTimeList(){
      timeListEl.innerHTML = '';
      kfTimes.forEach(function(t){
        var el = document.createElement('div');
        el.className = 'kf-slot time' + (t === state.time ? ' active' : '');
        el.textContent = t;
        el.addEventListener('click', function(){ state.time = t; renderTimeList(); validate(); });
        timeListEl.appendChild(el);
      });
    }

    function validate(){
      var ok = !!(state.day && state.time && nameInput.value.trim() && contactInput.value.trim());
      submitBtn.disabled = !ok;
    }

    function reset(){
      state = { step: 0, answers: {}, day: '', time: '' };
      nameInput.value = '';
      contactInput.value = '';
      if(errorEl) errorEl.hidden = true;
      bookedEl.hidden = true;
      bookingEl.hidden = true;
      askingEl.hidden = false;
      renderQuestion();
    }

    function submitBooking(){
      if(!(state.day && state.time)) return;
      if(errorEl) errorEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      // Honeypot: Bots, die das versteckte Feld ausfüllen, bekommen eine
      // stille Fake-Bestätigung, ohne dass irgendwas verschickt wird.
      if(honeypot && honeypot.value){
        bookingEl.hidden = true;
        bookedEl.hidden = false;
        submitBtn.classList.remove('loading');
        return;
      }

      var payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'Neue Terminanfrage über immobilien-bannewitz.de',
        from_name: 'immobilien-bannewitz.de',
        Objektart: state.answers.art || '',
        Ort: state.answers.ort || '',
        'Wohn-/Grundfläche': state.answers.flaeche || '',
        Zustand: state.answers.zustand || '',
        Nutzung: state.answers.nutzung || '',
        Verkaufszeitpunkt: state.answers.zeit || '',
        Wunschtag: state.day,
        Wunschuhrzeit: state.time,
        Name: nameInput.value.trim(),
        'Telefon/E-Mail': contactInput.value.trim(),
        source: sourceLabel
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(res){
        if(!res.ok) throw new Error('request_failed');
        return res.json();
      }).then(function(data){
        if(!data || !data.success) throw new Error('response_not_ok');
        bookingEl.hidden = true;
        bookedEl.hidden = false;
      }).catch(function(){
        if(errorEl) errorEl.hidden = false;
        submitBtn.disabled = false;
      }).finally(function(){
        submitBtn.classList.remove('loading');
      });
    }

    backBtn.addEventListener('click', back);
    freeSubmit.addEventListener('click', function(){
      var v = freeInput.value.trim();
      if(v) pick(kfQuestions[state.step].key, v);
    });
    freeInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); freeSubmit.click(); }
    });
    nameInput.addEventListener('input', validate);
    contactInput.addEventListener('input', validate);
    submitBtn.addEventListener('click', submitBooking);
    resetBtn.addEventListener('click', reset);

    renderQuestion();
  }

  document.querySelectorAll('[data-kf]').forEach(function(root){ initKontaktForm(root); });
})();
