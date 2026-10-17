/**
 * PORTFOLIO INTERACTIVITY SCRIPT
 * Project: Ivan - Personal Portfolio (Project 1, AI Basics)
 * Stack: Pure Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initCustomCursor();
  initNavigation();
  initBoxingTimer();
  initAudioPlayer();
  initFashionFilter();
  initFashionModal();
  initContactTerminal();
});

/* ==========================================================================
   1. Live Kyiv Clock
   ========================================================================== */
function initLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    // Use Europe/Kiev timezone
    const options = {
      timeZone: 'Europe/Kyiv',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    try {
      const timeStr = new Intl.DateTimeFormat('uk-UA', options).format(now);
      clockEl.textContent = `${timeStr} KYIV`;
    } catch {
      clockEl.textContent = `${now.toTimeString().slice(0, 8)} KYIV`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. Custom Fluid Cursor
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const follower = document.querySelector('.cursor-follower');
  if (!dot || !follower) return;

  let mouseX = -100;
  let mouseY = -100;
  let followerX = -100;
  let followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderFollower);
  }
  requestAnimationFrame(renderFollower);

  const interactiveElements = document.querySelectorAll('a, button, input, textarea, .track-item-card, .brand-card, .esports-card');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ==========================================================================
   3. Navigation, Scroll Spy & Mobile Menu
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  // Header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggleBtn.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section scroll spy
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));
}

/* ==========================================================================
   4. Boxing Round Timer Component (Web Audio Bell)
   ========================================================================== */
function initBoxingTimer() {
  const display = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('timerStartBtn');
  const resetBtn = document.getElementById('timerResetBtn');
  const statusBadge = document.getElementById('timerStatusBadge');
  if (!display || !startBtn || !resetBtn) return;

  const ROUND_SECONDS = 180; // 3 minutes standard round
  let timeLeft = ROUND_SECONDS;
  let timerInterval = null;
  let isRunning = false;

  // Web Audio Context for boxing bell
  let audioCtx = null;
  function playBoxingBell() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(840, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {
      // AudioContext fallback
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateDisplay() {
    display.textContent = formatTime(timeLeft);
  }

  function tick() {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timerInterval);
      isRunning = false;
      startBtn.textContent = 'СТАРТ';
      if (statusBadge) statusBadge.textContent = 'РАУНД ЗАВЕРШЕНО';
      playBoxingBell();
    }
  }

  startBtn.addEventListener('click', () => {
    if (!isRunning) {
      isRunning = true;
      startBtn.textContent = 'ПАУЗА';
      if (statusBadge) statusBadge.textContent = 'РАУНД 1 // В ДІЇ';
      playBoxingBell();
      timerInterval = setInterval(tick, 1000);
    } else {
      isRunning = false;
      startBtn.textContent = 'ПРОДОВЖИТИ';
      if (statusBadge) statusBadge.textContent = 'ПАУЗА';
      clearInterval(timerInterval);
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = ROUND_SECONDS;
    updateDisplay();
    startBtn.textContent = 'СТАРТ';
    if (statusBadge) statusBadge.textContent = 'ГОТОВНІСТЬ ДО РАУНДУ';
  });
}

/* ==========================================================================
   5. Underground Hip-Hop Audio Player (Web Audio Ambient Synthesizer)
   ========================================================================== */
function initAudioPlayer() {
  const tracks = [
    {
      id: 0,
      artist: 'fakemink',
      title: 'night blooming jasmine',
      genre: 'Underground Hip-Hop / Ambient',
      duration: 154, // 2:34
      tag: '#fakemink #underground'
    },
    {
      id: 1,
      artist: 'PureSnow',
      title: 'I Wanna Be Honest',
      genre: 'Raw Hip-Hop / Melodic Phonk',
      duration: 135, // 2:15
      tag: '#puresnow #honest'
    },
    {
      id: 2,
      artist: 'twentythree',
      title: 'Queen St.',
      genre: 'Dark Underground / Lo-Fi Trap',
      duration: 170, // 2:50
      tag: '#twentythree #queenst'
    }
  ];

  let currentTrackIdx = 0;
  let isPlaying = false;
  let currentTime = 0;
  let playInterval = null;

  // DOM elements
  const playerCard = document.querySelector('.audio-player-card');
  const playBtn = document.getElementById('playMainBtn');
  const prevBtn = document.getElementById('prevTrackBtn');
  const nextBtn = document.getElementById('nextTrackBtn');
  const titleEl = document.getElementById('currentTrackTitle');
  const artistEl = document.getElementById('currentTrackArtist');
  const statusTagEl = document.getElementById('currentTrackTag');
  const currentTimeEl = document.getElementById('trackCurrentTime');
  const totalTimeEl = document.getElementById('trackTotalTime');
  const scrubberFill = document.getElementById('scrubberFill');
  const scrubberTrack = document.getElementById('scrubberTrack');
  const cassetteReel = document.querySelector('.cassette-reel-box');
  const playlistItems = document.querySelectorAll('.track-item-card');
  const volumeSlider = document.getElementById('volumeSlider');

  // Web Audio Ambient Synthesizer
  let synthAudioCtx = null;
  let masterGain = null;
  let padOsc1 = null;
  let padOsc2 = null;

  function initSynthAudio() {
    if (synthAudioCtx) return;
    try {
      synthAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = synthAudioCtx.createGain();
      const currentVol = volumeSlider ? parseFloat(volumeSlider.value) : 0.4;
      masterGain.gain.setValueAtTime(currentVol * 0.12, synthAudioCtx.currentTime);
      masterGain.connect(synthAudioCtx.destination);
    } catch {
      // AudioContext not supported
    }
  }

  function startAtmosphericSound() {
    initSynthAudio();
    if (!synthAudioCtx) return;
    if (synthAudioCtx.state === 'suspended') {
      synthAudioCtx.resume();
    }
    stopAtmosphericSound();

    try {
      // Create rich dual oscillator ambient pad
      padOsc1 = synthAudioCtx.createOscillator();
      padOsc2 = synthAudioCtx.createOscillator();

      const baseFreq = currentTrackIdx === 0 ? 110 : currentTrackIdx === 1 ? 98 : 82;
      padOsc1.type = 'triangle';
      padOsc1.frequency.setValueAtTime(baseFreq, synthAudioCtx.currentTime);

      padOsc2.type = 'sine';
      padOsc2.frequency.setValueAtTime(baseFreq * 1.5, synthAudioCtx.currentTime);

      padOsc1.connect(masterGain);
      padOsc2.connect(masterGain);

      padOsc1.start();
      padOsc2.start();
    } catch {
      // Audio playback caught
    }
  }

  function stopAtmosphericSound() {
    try {
      if (padOsc1) { padOsc1.stop(); padOsc1.disconnect(); padOsc1 = null; }
      if (padOsc2) { padOsc2.stop(); padOsc2.disconnect(); padOsc2 = null; }
    } catch {
      // Disconnect caught
    }
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      if (masterGain && synthAudioCtx) {
        const val = parseFloat(e.target.value);
        masterGain.gain.setValueAtTime(val * 0.12, synthAudioCtx.currentTime);
      }
    });
  }

  function formatDuration(sec) {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${String(s).padStart(2, '0')}`;
  }

  function loadTrack(idx) {
    currentTrackIdx = idx;
    currentTime = 0;
    const track = tracks[currentTrackIdx];

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (statusTagEl) statusTagEl.textContent = `${track.genre} // ${track.tag}`;
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
    if (totalTimeEl) totalTimeEl.textContent = formatDuration(track.duration);
    if (scrubberFill) scrubberFill.style.width = '0%';

    // Update playlist active item
    playlistItems.forEach((item, i) => {
      item.classList.toggle('active', i === currentTrackIdx);
    });

    if (isPlaying) {
      startAtmosphericSound();
    }
  }

  function play() {
    isPlaying = true;
    playerCard?.classList.add('is-playing');
    cassetteReel?.classList.add('playing');
    if (playBtn) {
      playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      `;
      playBtn.setAttribute('aria-label', 'Пауза');
    }
    startAtmosphericSound();

    clearInterval(playInterval);
    playInterval = setInterval(() => {
      const track = tracks[currentTrackIdx];
      if (currentTime < track.duration) {
        currentTime++;
        if (currentTimeEl) currentTimeEl.textContent = formatDuration(currentTime);
        const percent = (currentTime / track.duration) * 100;
        if (scrubberFill) scrubberFill.style.width = `${percent}%`;
      } else {
        next();
      }
    }, 1000);
  }

  function pause() {
    isPlaying = false;
    playerCard?.classList.remove('is-playing');
    cassetteReel?.classList.remove('playing');
    if (playBtn) {
      playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      `;
      playBtn.setAttribute('aria-label', 'Відтворити');
    }
    stopAtmosphericSound();
    clearInterval(playInterval);
  }

  function next() {
    const nextIdx = (currentTrackIdx + 1) % tracks.length;
    loadTrack(nextIdx);
    if (isPlaying) play();
  }

  function prev() {
    const prevIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
    loadTrack(prevIdx);
    if (isPlaying) play();
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) pause();
      else play();
    });
  }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  playlistItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      if (currentTrackIdx === idx && isPlaying) {
        pause();
      } else {
        loadTrack(idx);
        play();
      }
    });
  });

  if (scrubberTrack) {
    scrubberTrack.addEventListener('click', (e) => {
      const rect = scrubberTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const track = tracks[currentTrackIdx];
      currentTime = Math.floor(ratio * track.duration);
      if (currentTimeEl) currentTimeEl.textContent = formatDuration(currentTime);
      if (scrubberFill) scrubberFill.style.width = `${ratio * 100}%`;
    });
  }

  // Initial track load
  loadTrack(0);
}

/* ==========================================================================
   6. Fashion Filter System
   ========================================================================== */
function initFashionFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const brandCards = document.querySelectorAll('.brand-card');
  if (!filterBtns.length || !brandCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      brandCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. Fashion Modal Details
   ========================================================================== */
function initFashionModal() {
  const modalOverlay = document.getElementById('brandModalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalFounder = document.getElementById('modalFounder');
  const modalContent = document.getElementById('modalContent');
  const modalPoints = document.getElementById('modalKeyPoints');
  const moreBtns = document.querySelectorAll('.brand-more-btn');

  if (!modalOverlay || !closeBtn) return;

  const brandDetails = {
    yohji: {
      category: 'Japanese Archive',
      title: 'Yohji Yamamoto',
      founder: 'Засновано Йоджі Ямамото (Токіо / Париж)',
      content: '«Чорний колір одночасно скромний і зарозумілий. Чорний лінивий і легкий, але водночас таємничий». Йоджі Ямамото переосмислив класичний крій, створивши вільні, архітектурні силуети, де тканина рухається разом із тілом, кидаючи виклик стандартам західної моди.',
      points: [
        'Філософія монохрому та глибокої текстури чорного',
        'Вільні деконструйовані драпування з преміальної вовни',
        'Втілення концепції тіні та внутрішньої свободи'
      ]
    },
    undercover: {
      category: 'Japanese Archive',
      title: 'Undercover',
      founder: 'Джун Такахаші (Jun Takahashi, Токіо)',
      content: 'Undercover — це революційний симбіоз сирої енергії панк-року, похмурого сюрреалізму та високої японської кравецької майстерності. Слоган бренду «We Make Noise, Not Clothes» демонструє концептуальний підхід до кожної архівної колекції.',
      points: [
        'Культові графічні принти та панк-естетика',
        'Експериментальні гібридні тканини та функціональний крій',
        'Концептуальні колекції-маніфести (Scab, But Beautiful)'
      ]
    },
    margiela: {
      category: 'Japanese Archive / Avant-Garde',
      title: 'Maison Margiela',
      founder: 'Мартін Маржела (Париж / Антверпен)',
      content: 'Дім без обличчя, який перевернув світ моди догори дриґом. Чотири білі стібки замість логотипу, розкриті внутрішні шви, культове взуття Tabi та апсайклінг вінтажних речей у кутюрні витвори мистецтва.',
      points: [
        'Культова концепція Tabi (натхненна японськими шкарпетками XV ст.)',
        'Деконструкція та анонімність (білі бирки з числами 0-23)',
        'Мистецтво оголеної структури одягу'
      ]
    },
    rickowens: {
      category: 'Avant-Garde',
      title: 'Rick Owens',
      founder: 'Рік Оуенс («Lord of Darkness», Париж / Лос-Анджелес)',
      content: 'Монументальний темний бруталізм, видовжені силуети та скульптурні форми. Кросівки Geobasket, Ramones та асиметричні шкіряні куртки стали фундаментальними іконами авангардної моди XXI століття.',
      points: [
        'Скульптурні масивні кросівки (Geobasket, Ramones)',
        'Архітектурні форми драпування та видовжений крій',
        'Використання брутальних матеріалів: преміальна шкіра, важка бавовна'
      ]
    },
    isseymiyake: {
      category: 'Japanese Archive & Avant-Garde',
      title: 'Issey Miyake',
      founder: 'Іссей Міяке (Хіросіма / Токіо)',
      content: 'Революціонер технологічної тканини. Створивши легендарну технологію «Pleats Please» та концепцію «A-POC» (A Piece of Cloth), Міяке довів, що одяг може бути легкою, невагомою скульптурою, яка не сковує людину.',
      points: [
        'Фірмова запатентована технологія перманентного плісирування',
        'Концепція монолітного шматка тканини (A-POC)',
        'Органічна взаємодія форми з простором і повітрям'
      ]
    },
    cdg: {
      category: 'Avant-Garde',
      title: 'Comme des Garçons',
      founder: 'Рей Кавакубо (Rei Kawakubo, Токіо / Париж)',
      content: 'Безкомпромісна анти-мода, яка в 1981 році шокувала Париж виходом колекції «Destroy». Рей Кавакубо створила естетику недосконалості (Wabi-Sabi), асиметричних дірок, вузлів та деформованих пропорцій, надихнувши цілі покоління митців.',
      points: [
        'Радикальне руйнування канонів пропорцій людського тіла',
        'Естетика чистого експерименту та концептуального мистецтва',
        'Вплив на світовий авангардний рух та заснування Dover Street Market'
      ]
    }
  };

  moreBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const brandKey = btn.getAttribute('data-brand');
      const data = brandDetails[brandKey];
      if (!data) return;

      if (modalCategory) modalCategory.textContent = data.category;
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalFounder) modalFounder.textContent = data.founder;
      if (modalContent) modalContent.textContent = data.content;

      if (modalPoints) {
        modalPoints.innerHTML = data.points
          .map((pt) => `<li class="modal-point">${pt}</li>`)
          .join('');
      }

      modalOverlay.classList.add('open');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   8. Contact Terminal & Copy Action
   ========================================================================== */
function initContactTerminal() {
  const copyBtn = document.getElementById('copyContactBtn');
  const copyTarget = document.getElementById('copyTargetText');
  const contactForm = document.getElementById('terminalContactForm');
  const statusMsg = document.getElementById('terminalStatusMsg');

  if (copyBtn && copyTarget) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = copyTarget.textContent || 'ivan_ort_ai';
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'СКОПІЙОВАНО!';
        copyBtn.style.background = '#22c55e';
        copyBtn.style.color = '#000000';
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.background = '';
          copyBtn.style.color = '';
        }, 2200);
      } catch {
        copyBtn.textContent = 'ГОТОВО';
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('senderName');
      const msgInput = document.getElementById('senderMsg');

      if (!nameInput?.value.trim() || !msgInput?.value.trim()) {
        if (statusMsg) {
          statusMsg.textContent = '[ПОМИЛКА]: Будь ласка, заповніть усі поля перед відправленням.';
          statusMsg.className = 'form-status-msg error';
        }
        return;
      }

      if (statusMsg) {
        statusMsg.textContent = '[ШИФРУВАННЯ ТА ВІДПРАВЛЕННЯ...]';
        statusMsg.className = 'form-status-msg';
      }

      setTimeout(() => {
        if (statusMsg) {
          statusMsg.textContent = `[УСПІХ]: Повідомлення від "${nameInput.value.trim()}" успішно надіслано в термінал!`;
          statusMsg.className = 'form-status-msg success';
        }
        contactForm.reset();
      }, 700);
    });
  }
}
