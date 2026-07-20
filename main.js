  // ─── NAVIGATION ───
  let currentScreen = 'screen-splash';
  const history = ['screen-splash'];
  // Screens with a dark, scrollable hero — status bar gets a matching dark background + white text.
  // (screen-splash is handled separately below: white text, but no background — it never scrolls.)
  const darkScreens = ['screen-dashboard', 'screen-premium', 'screen-scan-instructions'];

  function navigate(targetId, direction) {
    if (targetId === currentScreen) return;

    const current = document.getElementById(currentScreen);
    const target = document.getElementById(targetId);

    if (!target) return;

    // Update status bar based on screen
    const statusBar = document.getElementById('statusBar');
    if (darkScreens.includes(targetId)) {
      statusBar.style.color = 'white';
      statusBar.classList.add('status-bar--dark');
    } else {
      statusBar.style.color = '';
      statusBar.classList.remove('status-bar--dark');
    }

    // Animate
    const outClass = direction === 'forward' ? 'slide-out' : 'slide-back-out';
    const inClass = direction === 'forward' ? 'slide-in' : 'slide-back-in';

    current.classList.remove('active');
    current.classList.add(outClass);

    target.style.display = 'flex';
    target.classList.add(inClass);

    setTimeout(() => {
      current.classList.remove(outClass);
      current.style.display = '';

      target.classList.remove(inClass);
      target.classList.add('active');

      currentScreen = targetId;

      // Trigger ring animation on dashboard
      if (targetId === 'screen-dashboard') {
        const ring = target.querySelector('.score-ring-fill');
        if (ring) {
          ring.style.animation = 'none';
          ring.offsetHeight;
          ring.style.animation = '';
        }
      }
    }, 300);
  }

  // ─── ASSESSMENT STEPS ───
  let currentAssessStep = 1;

  function goAssessStep(step) {
    const currentEl = document.getElementById('astep-' + currentAssessStep);
    const targetEl = document.getElementById('astep-' + step);
    if (!currentEl || !targetEl) return;

    currentEl.classList.remove('active');
    targetEl.classList.add('active');
    currentAssessStep = step;

    const progress = (step / 7) * 100;
    document.getElementById('assessProgress').style.width = progress + '%';
  }

  // ─── TRIMESTER SELECTION ───
  function selectTrimester(btn, num) {
    document.querySelectorAll('.tri-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  // ─── SYMPTOM TOGGLE ───
  function toggleSymptom(item) {
    item.classList.toggle('checked');
    const check = item.querySelector('.symptom-check');
    if (item.classList.contains('checked')) {
      check.innerHTML = '<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
      check.innerHTML = '';
    }
  }

  // ─── DENTAL OPTION ───
  function selectDental(btn) {
    document.querySelectorAll('.dental-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  // ─── FLOSS OPTION ───
  function selectFloss(btn) {
    document.querySelectorAll('.floss-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  // ─── NAUSEA OPTION ───
  function selectNausea(btn) {
    document.querySelectorAll('.nausea-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  // ─── BRUSH OPTION ───
  function selectBrush(btn) {
    document.querySelectorAll('.brush-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  // ─── ORAL HEALTH OPTION ───
  function selectOral(btn) {
    document.querySelectorAll('.oral-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  // ─── FILTER PILLS ───
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      this.closest('.recs-filter').querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');

      const filter = this.dataset.filter;
      document.querySelectorAll('.rec-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });

  // ─── SCAN MODE (trial vs demo) ───
  let scanMode = 'trial';

  function updateCaptureCta() {
    const btn = document.getElementById('captureCta');
    if (btn) btn.textContent = scanMode === 'demo' ? 'Try Demo Scan' : 'Scan My Smile';
  }

  // Toggles analyzing/results copy between the real-scan and demo-scan wording.
  function applyScanMode() {
    const isDemo = scanMode === 'demo';

    const analyzingTitle = document.getElementById('analyzingTitle');
    if (analyzingTitle) analyzingTitle.textContent = isDemo ? 'Analyzing Demo Scan' : 'Analyzing Your Scan';

    const badge = document.getElementById('resultsDemoBadge');
    if (badge) badge.style.display = isDemo ? 'inline-flex' : 'none';

    const callout = document.getElementById('resultsDemoCallout');
    if (callout) callout.style.display = isDemo ? 'flex' : 'none';

    const heading = document.getElementById('resultsHeading');
    if (heading) heading.innerHTML = isDemo ? 'Sample Oral Health<br>Report' : 'Your Oral Health<br>Report';
  }

  function startTrialScan() {
    scanMode = 'trial';
    updateCaptureCta();
    navigate('screen-scan-instructions', 'forward');
  }

  function startDemoScan() {
    scanMode = 'demo';
    navigate('screen-scan-analyzing', 'forward');
    setTimeout(runAnalysis, 400);
  }

  function backFromResults() {
    navigate(scanMode === 'demo' ? 'screen-scan-teaser' : 'screen-scan-instructions', 'back');
  }

  function enterCapture() {
    navigate('screen-scan-capture', 'forward');
    setTimeout(runCaptureChecklist, 400);
  }

  function runCaptureChecklist() {
    for (let i = 1; i <= 5; i++) {
      const item = document.getElementById('capture-check-' + i);
      const icon = document.getElementById('capture-check-icon-' + i);
      if (!item) continue;
      item.classList.remove('done');
      const svg = icon.querySelector('svg');
      if (svg) svg.style.display = 'none';
    }
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => markCaptureCheck(i), 300 + (i - 1) * 260);
    }
  }

  function markCaptureCheck(i) {
    const item = document.getElementById('capture-check-' + i);
    const icon = document.getElementById('capture-check-icon-' + i);
    if (!item) return;
    item.classList.add('done');
    const svg = icon.querySelector('svg');
    if (svg) svg.style.display = 'block';
  }

  // ─── SCAN ANALYSIS ───
  let analyzeTimer = null;

  function startScan() {
    navigate('screen-scan-analyzing', 'forward');
    // Small delay so the screen transition completes first
    setTimeout(runAnalysis, 400);
  }

  function runAnalysis() {
    applyScanMode();

    // Reset all checklist items
    [1,2,3,4].forEach(i => {
      const item = document.getElementById('check-' + i);
      const icon = document.getElementById('check-icon-' + i);
      item.classList.remove('done');
      icon.querySelector('svg') && (icon.querySelector('svg').style.display = 'none');
      if (i === 4) {
        document.getElementById('check-spinner-4').textContent = '⏳';
      }
    });

    const ring = document.getElementById('analyzeRingFill');
    const pct  = document.getElementById('analyzePercent');
    const circumference = 440;
    let progress = 0;

    ring.style.strokeDashoffset = circumference;
    pct.textContent = '0%';

    if (analyzeTimer) clearInterval(analyzeTimer);

    analyzeTimer = setInterval(() => {
      progress += 1;
      ring.style.strokeDashoffset = circumference - (progress / 100) * circumference;
      pct.textContent = progress + '%';

      if (progress === 28) markDone(1);
      if (progress === 54) markDone(2);
      if (progress === 76) markDone(3);
      if (progress === 95) markDone(4);

      if (progress >= 100) {
        clearInterval(analyzeTimer);
        setTimeout(() => navigate('screen-scan-results', 'forward'), 700);
      }
    }, 40); // 40ms × 100 = 4 seconds total
  }

  function markDone(i) {
    const item = document.getElementById('check-' + i);
    const icon = document.getElementById('check-icon-' + i);
    item.classList.add('done');
    if (i === 4) {
      document.getElementById('check-spinner-4').textContent = '';
    }
    const svg = icon.querySelector('svg');
    if (svg) svg.style.display = 'block';
  }

  // ─── INIT STATUS BAR ───
  // Splash never scrolls, so it needs white text and a transparent background (its own gradient shows through)
  document.getElementById('statusBar').style.color = 'white';
  document.getElementById('statusBar').classList.add('status-bar--splash');

  // ─── SPLASH AUTO-ADVANCE (and tap-to-skip) ───
  let splashExited = false;
  function exitSplash() {
    if (splashExited) return;
    splashExited = true;
    const splash = document.getElementById('screen-splash');
    const welcome = document.getElementById('screen-welcome');
    splash.classList.add('exiting');
    setTimeout(() => {
      splash.classList.remove('active', 'exiting');
      welcome.classList.add('active');
      currentScreen = 'screen-welcome';
      document.getElementById('statusBar').style.color = '';
      document.getElementById('statusBar').classList.remove('status-bar--dark', 'status-bar--splash');
    }, 760);
  }
  setTimeout(exitSplash, 2600);

  // Update clock
  function updateTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    document.querySelector('.status-bar .time').textContent = h + ':' + m;
  }
  updateTime();
  setInterval(updateTime, 30000);
