  // ─── NAVIGATION ───
  let currentScreen = 'screen-splash';
  const history = ['screen-splash'];
  // Screens with a dark, scrollable hero — status bar gets a matching dark background + white text.
  // (screen-splash is handled separately below: white text, but no background — it never scrolls.)
  const darkScreens = ['screen-dashboard', 'screen-premium', 'screen-scan-instructions'];

  function navigate(targetId, direction) {
    if (targetId === currentScreen) return;

    // Leaving the camera stops the simulated AI guidance; arriving restarts it
    if (currentScreen === 'screen-scan-capture') stopCaptureGuidance();
    if (targetId === 'screen-scan-capture') setTimeout(runCaptureGuidance, 400);

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

  // Continue stays disabled until the current question has an answer
  function updateStepContinue(el) {
    const step = el.closest('.assessment-step');
    const btn = step && step.querySelector('.step-footer .btn-primary');
    if (btn) btn.disabled = !step.querySelector('.selected, .checked');
  }

  // ─── TRIMESTER SELECTION ───
  function selectTrimester(btn, num) {
    document.querySelectorAll('.tri-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateStepContinue(btn);
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
    updateStepContinue(item);
  }

  // ─── DENTAL OPTION ───
  function selectDental(btn) {
    document.querySelectorAll('.dental-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateStepContinue(btn);
  }

  // ─── FLOSS OPTION ───
  function selectFloss(btn) {
    document.querySelectorAll('.floss-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateStepContinue(btn);
  }

  // ─── NAUSEA OPTION ───
  function selectNausea(btn) {
    document.querySelectorAll('.nausea-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateStepContinue(btn);
  }

  // ─── BRUSH OPTION ───
  function selectBrush(btn) {
    document.querySelectorAll('.brush-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateStepContinue(btn);
  }

  // ─── ORAL HEALTH OPTION ───
  function selectOral(btn) {
    document.querySelectorAll('.oral-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateStepContinue(btn);
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

  // Capture screen is shared by both modes -- title, subtitle, CTA text,
  // and checklist visibility all differ between trial and demo.
  function updateCaptureCopy() {
    const isDemo = scanMode === 'demo';
    const title = document.getElementById('captureTitle');
    const subtitle = document.getElementById('captureSubtitle');
    if (title) title.textContent = 'Capture Your Smile';
    if (subtitle) subtitle.textContent = isDemo
      ? 'Try the photo diary with a sample photo.'
      : 'Position your teeth and gums inside the frame.';
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
    if (heading) heading.innerHTML = isDemo ? 'Sample Oral<br>Health Report' : 'Your Oral Health<br>Report';
  }

  function startTrialScan() {
    scanMode = 'trial';
    navigate('screen-scan-instructions', 'forward');
  }

  function beginDemo() {
    scanMode = 'demo';
    updateCaptureCopy();
    navigate('screen-scan-capture', 'forward');
  }

  function backFromResults() {
    navigate(scanMode === 'demo' ? 'screen-scan-capture' : 'screen-scan-instructions', 'back');
  }

  function backFromCapture() {
    navigate(scanMode === 'demo' ? 'screen-premium' : 'screen-photo-diary', 'back');
  }

  function enterCapture() {
    scanMode = 'trial';
    updateCaptureCopy();
    navigate('screen-scan-capture', 'forward');
  }

  // Simulated AI photo guidance: checks turn green one by one while the
  // hint banner coaches, then a 3-2-1 countdown takes the photo.
  const captureSteps = [
    { check: 1 },
    { check: 2, hint: 'Move a little closer' },
    { check: 3, hint: 'Tilt your head down slightly' },
    { check: 4, hint: 'Good light ✓' },
    { check: 5, hint: 'Hold still…' },
    { check: 6, hint: 'Perfect, hold still' }
  ];
  let captureTimers = [];

  function stopCaptureGuidance() {
    captureTimers.forEach(clearTimeout);
    captureTimers = [];
    const countdown = document.getElementById('captureCountdown');
    if (countdown) countdown.hidden = true;
  }

  function runCaptureGuidance() {
    stopCaptureGuidance();
    if (currentScreen !== 'screen-scan-capture') return;
    const hint = document.getElementById('captureHint');
    const countdown = document.getElementById('captureCountdown');
    for (let i = 1; i <= 6; i++) setCaptureCheck(i, false);
    hint.textContent = 'Pull your lips back a little more';

    const later = (ms, fn) => captureTimers.push(setTimeout(fn, ms));
    captureSteps.forEach((step, n) => {
      later(700 * (n + 1), () => {
        setCaptureCheck(step.check, true);
        if (step.hint) hint.textContent = step.hint;
      });
    });
    const countStart = 700 * captureSteps.length + 300;
    [3, 2, 1].forEach((num, n) => {
      later(countStart + n * 1000, () => {
        countdown.textContent = num;
        countdown.hidden = false;
      });
    });
    later(countStart + 3000, startScan);
  }

  function setCaptureCheck(i, done) {
    const item = document.getElementById('capture-check-' + i);
    const svg = document.querySelector('#capture-check-icon-' + i + ' svg');
    if (!item) return;
    item.classList.toggle('done', done);
    if (svg) svg.style.display = done ? 'block' : 'none';
  }

  // ─── SCAN ANALYSIS ───
  let analyzeTimer = null;

  function startScan() {
    // Today's photo joins the diary and the dashboard count
    const thumb = document.getElementById('diaryThumb18');
    if (thumb) thumb.hidden = false;
    const count = document.getElementById('photoCount');
    if (count) count.textContent = '5';
    navigate('screen-photo-saved', 'forward');
  }

  // ─── LESSON ───
  let lessonReturn = 'screen-dashboard';
  function openLesson(from) {
    lessonReturn = from;
    navigate('screen-lesson', 'forward');
  }

  // ─── WEEKLY CHECK-IN ───
  // State lives in memory only, so a refresh resets the demo.
  function checkinAnswer(key) {
    const sel = document.querySelector('.checkin-options[data-question="' + key + '"] .selected');
    return sel ? sel.textContent : null;
  }

  function selectCheckin(btn) {
    const group = btn.closest('.checkin-options');
    group.querySelectorAll('.checkin-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    if (group.dataset.question === 'checkup') {
      document.getElementById('checkupHint').hidden = btn.textContent !== 'Not yet';
    }
    const allAnswered = ['bleeding', 'sensitivity', 'brushing', 'checkup'].every(checkinAnswer);
    document.getElementById('saveCheckin').disabled = !allAnswered;
  }

  function saveCheckin() {
    const a = {
      bleeding: checkinAnswer('bleeding'),
      sensitivity: checkinAnswer('sensitivity'),
      brushing: checkinAnswer('brushing'),
      checkup: checkinAnswer('checkup')
    };
    document.getElementById('sumBleeding').textContent = a.bleeding;
    document.getElementById('sumSensitivity').textContent = a.sensitivity;
    document.getElementById('sumBrushing').textContent = a.brushing;
    document.getElementById('sumCheckup').textContent = a.checkup;

    document.getElementById('checkinLessonCard').hidden = a.bleeding === 'No';
    document.getElementById('checkinDentistLine').hidden = a.bleeding !== 'Often';
    document.getElementById('checkinReminderCard').hidden = a.checkup !== 'Not yet';

    document.getElementById('checkinStatus').textContent = 'Done';
    document.getElementById('checkinQaSub').textContent = 'Done ✓';
    navigate('screen-checkin-saved', 'forward');
  }

  function setReminder() {
    const btn = document.getElementById('remindBtn');
    btn.textContent = 'Reminder set ✓';
    btn.disabled = true;
    document.getElementById('remindNote').hidden = false;
  }

  // ─── SHARE WITH DENTIST ───
  let shareReturn = 'screen-photo-diary';

  function openShareSheet() {
    shareReturn = currentScreen;
    document.getElementById('shareSheet').hidden = false;
  }

  function closeShareSheet() {
    document.getElementById('shareSheet').hidden = true;
  }

  // The report only shows the sections left ticked in the sheet
  function createReport() {
    document.querySelectorAll('#shareSheet [data-section]').forEach(item => {
      const section = document.querySelector('#screen-share-report [data-report="' + item.dataset.section + '"]');
      if (section) section.hidden = !item.classList.contains('checked');
    });
    document.getElementById('reportNote').hidden = true;
    closeShareSheet();
    navigate('screen-share-report', 'forward');
  }

  // ─── PHOTO DIARY ───
  // The photo guide opens from the diary or the camera; Back returns there
  let guideReturn = 'screen-photo-diary';
  function openGuide(from) {
    guideReturn = from;
    navigate('screen-scan-instructions', 'forward');
  }

  const diaryPhotos = {
    18: { date: 'Oct 10', feel: ['Bleeding'], note: 'Gums bleed a little when flossing.' },
    17: { date: 'Oct 3', feel: ['Bleeding'], note: 'Gums bleed a little when flossing.' },
    16: { date: 'Sep 26', feel: ['All good'], note: '' },
    15: { date: 'Sep 19', feel: ['All good'], note: '' },
    14: { date: 'Sep 12', feel: ['All good'], note: '' }
  };

  function openPhoto(week) {
    const photo = diaryPhotos[week];
    document.getElementById('photoDetailTitle').textContent = photo.date + ' · Week ' + week;
    document.querySelectorAll('#feelChips .feel-chip').forEach(chip => {
      chip.setAttribute('aria-pressed', photo.feel.includes(chip.textContent) ? 'true' : 'false');
    });
    document.getElementById('photoNote').value = photo.note;
    navigate('screen-photo-detail', 'forward');
  }

  // "All good" and the symptom chips exclude each other
  function toggleFeel(chip) {
    const on = chip.getAttribute('aria-pressed') !== 'true';
    const chips = document.querySelectorAll('#feelChips .feel-chip');
    if (on) {
      chips.forEach(c => {
        const isAllGood = c.textContent === 'All good';
        if (chip.textContent === 'All good' ? !isAllGood : isAllGood) c.setAttribute('aria-pressed', 'false');
      });
    }
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
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
