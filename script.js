/* ==========================================================================
   DEPARTMENT OF CSIT — SRI INDU COLLEGE OF ENGINEERING & TECHNOLOGY
   INTELLIGENT APPLICATION RUNTIME ENGINE (VERSION 3.1 — HASH ROUTER)
   ========================================================================== */

/* ==========================================================================
   1. CENTRAL SPA ROUTER ENGINE (HASH-BASED, WITH REAL URLS PER SECTION)
   ========================================================================== */

// Maps internal page-view IDs to human-readable, shareable URL fragments.
// Add an entry here whenever a new .page-view is added to index.html.
const PAGE_ROUTES = {
  'home-page': '',
  'objectives-page': 'objectives',
  'calendar-page': 'academic-calendar',
  'laboratories-page': 'laboratories',
  'classrooms-page': 'classrooms',
  'library-page': 'library',
  'seminar-page': 'seminar-hall',
  'teaching-page': 'faculty',
  'non-teaching-page': 'technical-staff',
  'gallery-page': 'gallery',
  'placements-page': 'placements',
  'notes-page': 'notes',
  'igris-page': 'igris',
  'placement-guide-page': 'placement-guide',
  'contact-page': 'contact',
  // Route registered ahead of the page markup itself, so the nav link's
  // href is a real, shareable hash URL rather than a dead "#". Until the
  // 'faculty-publications-page' .page-view is built, renderPage()'s
  // existence check below falls back to Home gracefully (with a console
  // warning) if someone lands on this route directly.
  'faculty-publications-page': 'faculty-publications'
};

// Reverse lookup: route fragment -> page-view ID
const ROUTE_PAGES = Object.fromEntries(
  Object.entries(PAGE_ROUTES).map(([pageId, route]) => [route, pageId])
);

const DEFAULT_PAGE = 'home-page';

// Per-page <title> and meta description, applied on every route change.
// This gives each section a distinct browser tab title and description —
// useful for users (bookmarks, history, tab switching) even though a hash
// route on its own is not a substitute for real per-page SEO indexing.
const PAGE_META = {
  'home-page': {
    title: 'Department of CSIT | Sri Indu College of Engineering & Technology',
    description: 'Department of Computer Science and Information Technology (CSIT) at Sri Indu College of Engineering and Technology (Autonomous). NBA & NAAC \'A+\' accredited.'
  },
  'objectives-page': {
    title: 'Vision, Mission & Objectives | CSIT, Sri Indu',
    description: 'Institution and department vision, mission, PEOs, PSOs and program outcomes for B.Tech CSIT at Sri Indu College.'
  },
  'calendar-page': {
    title: 'Academic Calendar 2026-27 | CSIT, Sri Indu',
    description: 'Official B.Tech CSIT academic calendar for II, III and IV year — semester schedules and examination dates.'
  },
  'laboratories-page': {
    title: 'Computing Laboratories | CSIT, Sri Indu',
    description: '8 advanced computing labs with 300+ workstations, industry-grade software, and high-speed connectivity.'
  },
  'classrooms-page': {
    title: 'Smart Classrooms | CSIT, Sri Indu',
    description: 'Acoustically designed smart lecture halls with interactive projection and campus-wide Wi-Fi 6 connectivity.'
  },
  'library-page': {
    title: 'Central Library | CSIT, Sri Indu',
    description: '50,000+ volumes and digital library access via IEEE Xplore, DELNET, NPTEL and SpringerLink at Sri Indu College.'
  },
  'seminar-page': {
    title: 'Auditorium & Seminar Halls | CSIT, Sri Indu',
    description: '500+ seat auditorium and departmental seminar hall for conferences, hackathons and guest lectures.'
  },
  'teaching-page': {
    title: 'Faculty Directory | CSIT, Sri Indu',
    description: 'Meet the teaching faculty of the Department of Computer Science and Information Technology at Sri Indu College.'
  },
  'non-teaching-page': {
    title: 'Technical Staff | CSIT, Sri Indu',
    description: 'Laboratory and technical support staff of the CSIT department at Sri Indu College.'
  },
  'gallery-page': {
    title: 'Campus Gallery | CSIT, Sri Indu',
    description: 'Photos and videos from CSIT department events, hackathons, workshops and celebrations.'
  },
  'placements-page': {
    title: 'Placement Records | CSIT, Sri Indu',
    description: '92% placement ratio, 45+ recruiting companies and packages up to 20 LPA for CSIT graduates.'
  },
  'notes-page': {
    title: 'Notes & Resources | CSIT, Sri Indu',
    description: 'Semester-wise lecture notes, lab manuals, question banks and previous exam papers for B.Tech CSIT.'
  },
  'igris-page': {
    title: 'IGRIS AI Study Assistant | CSIT, Sri Indu',
    description: 'AI-powered study assistant for B.Tech CSIT students. Get instant answers from lecture notes, lab manuals, and academic materials.'
  },
  'placement-guide-page': {
    title: 'Placement Preparation Guide | CSIT, Sri Indu',
    description: 'A 4-year roadmap covering DSA, projects, internships, mock interviews and curated prep resources.'
  },
  'contact-page': {
    title: 'Contact Us | CSIT, Sri Indu',
    description: 'Address, phone numbers and email contacts for the Department of CSIT, Sri Indu College of Engineering and Technology.'
  }
};

// Reads the current URL hash and resolves it to a known page-view ID.
// Returns null if the hash doesn't match any registered route.
function getPageIdFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  return Object.prototype.hasOwnProperty.call(ROUTE_PAGES, hash) ? ROUTE_PAGES[hash] : null;
}

// Updates <title> and the meta description tag to match the active page.
function updatePageMeta(pageId) {
  const meta = PAGE_META[pageId] || PAGE_META[DEFAULT_PAGE];
  if (!meta) return;
  document.title = meta.title;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', meta.description);
}

// Public navigation entry point — called from onclick="openPage('xxx-page')"
// throughout the markup, and from <a href="#/route"> links directly.
// Changing window.location.hash is itself what creates the history entry
// (the browser treats every hash change as a new, back-button-able state),
// so no manual history.pushState bookkeeping is required.
function openPage(pageId) {
  const route = Object.prototype.hasOwnProperty.call(PAGE_ROUTES, pageId) ? PAGE_ROUTES[pageId] : '';
  const targetHash = '#/' + route;
  const currentHash = window.location.hash || '#/';

  if (currentHash === targetHash) {
    // Hash isn't changing (e.g. re-clicking the current section), so no
    // 'hashchange' event will fire automatically — render directly.
    renderPage(pageId);
  } else {
    window.location.hash = targetHash;
    // renderPage() runs from the 'hashchange' listener below.
  }
}

// Does the actual DOM work of showing/hiding page-views. Never call this
// directly from markup — go through openPage() so the URL stays in sync.
function renderPage(pageId) {
  const screens = document.querySelectorAll('.page-view');
  screens.forEach(screen => screen.classList.remove('active-page'));

  const exists = document.getElementById(pageId) !== null;
  const resolvedId = exists ? pageId : DEFAULT_PAGE;
  const targetScreen = document.getElementById(resolvedId);

  if (targetScreen) {
    targetScreen.classList.add('active-page');
    triggerCounters(targetScreen);
    triggerScrollReveals(targetScreen);
    updatePageMeta(resolvedId);
  } else {
    console.error("SPA Router Error: Target view ID '" + pageId + "' does not exist.");
  }

  if (!exists) {
    console.warn("SPA Router: '" + pageId + "' has no matching .page-view — falling back to '" + DEFAULT_PAGE + "'. If this route should exist, add its markup and register it in PAGE_ROUTES.");
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  updateNavActiveState(resolvedId);

  // Close mobile drawer if open
  const navLinks = document.getElementById('nav-links');
  if (navLinks && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
  }
}

function updateNavActiveState(pageId) {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.classList.remove('nav-active');
    const parentLi = link.closest('li');
    if (parentLi) parentLi.classList.remove('active');
  });

  navLinks.forEach(link => {
    const onclickAttr = link.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes("'" + pageId + "'")) {
      link.classList.add('nav-active');
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        const topLink = parentDropdown.querySelector(':scope > a');
        if (topLink) topLink.classList.add('nav-active');
        parentDropdown.classList.add('active');
      }
    }
  });
}

// Fires on back/forward navigation, on manually edited/typed hash URLs,
// and whenever openPage() changes the hash. This is what makes the
// browser back/forward buttons actually work.
window.addEventListener('hashchange', () => {
  const pageId = getPageIdFromHash() || DEFAULT_PAGE;
  renderPage(pageId);
});

/* ==========================================================================
   2. MOBILE DRAWER NAVIGATION & ACCORDION DROPDOWNS
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
    };
  }

  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const triggerLink = dropdown.querySelector(':scope > a');
    if (triggerLink) {
      triggerLink.onclick = (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();

          dropdowns.forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
          });

          dropdown.classList.toggle('active');
        }
      };
    }
  });

  window.onclick = () => {
    if (window.innerWidth <= 900 && navLinks && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      dropdowns.forEach(d => d.classList.remove('active'));
    }
  };
});

/* ==========================================================================
   3. ANIMATED NUMBER COUNTERS (INTERSECTION OBSERVER)
   ========================================================================== */
function animateCounter(el) {
  if (el.dataset.animated === 'true') return;
  const target = parseFloat(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const duration = 1600; // ms
  const frameDuration = 1000 / 60;
  const totalFrames = Math.round(duration / frameDuration);
  let frame = 0;

  el.dataset.animated = 'true';

  const timer = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    // Ease out quad
    const currentProgress = 1 - (1 - progress) * (1 - progress);
    const currentValue = Math.round(target * currentProgress);

    el.textContent = prefix + currentValue.toLocaleString() + suffix;

    if (frame === totalFrames) {
      clearInterval(timer);
      el.textContent = prefix + target.toLocaleString() + suffix;
    }
  }, frameDuration);
}

function triggerCounters(scope) {
  const counters = (scope || document).querySelectorAll('.count-number[data-count]');
  counters.forEach(counter => {
    counter.dataset.animated = 'false';
    animateCounter(counter);
  });
}

function initCounterObservers() {
  const counterElements = document.querySelectorAll('.count-number[data-count]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    counterElements.forEach(el => observer.observe(el));
  } else {
    counterElements.forEach(el => animateCounter(el));
  }
}

/* ==========================================================================
   4. SCROLL REVEAL OBSERVER
   ========================================================================== */
function triggerScrollReveals(scope) {
  const revealElements = (scope || document).querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(el => {
    el.classList.add('is-revealed');
  });
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('is-revealed'));
  }
}

/* ==========================================================================
   5. LIVE FACULTY SEARCH FILTRATION
   ========================================================================== */
function filterFaculty() {
  const input = document.getElementById('facultySearch');
  if (!input) return;

  const filter = input.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.faculty-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(filter)) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  const noResults = document.getElementById('facultyNoResults');
  if (noResults) {
    noResults.style.display = visibleCount === 0 ? "block" : "none";
  }
}

/* ==========================================================================
   6. LIVE ACADEMIC NOTES SEARCH FILTRATION
   ========================================================================== */
function filterNotes() {
  const input = document.getElementById('notesSearch');
  if (!input) return;

  const filter = input.value.toLowerCase().trim();
  const subjectRows = document.querySelectorAll('.subject-row-entry');
  const cards = document.querySelectorAll('.semester-accordion-card');

  if (filter === "") {
    subjectRows.forEach(row => row.style.display = "");
    cards.forEach(card => {
      card.style.display = "";
      const panel = card.querySelector('.sem-expandable-panel');
      if (panel && !card.classList.contains('active')) {
        panel.style.maxHeight = null;
      }
    });
    return;
  }

  cards.forEach(card => {
    let cardHasMatch = false;
    const rows = card.querySelectorAll('.subject-row-entry');
    const panel = card.querySelector('.sem-expandable-panel');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.includes(filter)) {
        row.style.display = "";
        cardHasMatch = true;
      } else {
        row.style.display = "none";
      }
    });

    if (cardHasMatch) {
      card.style.display = "";
      card.classList.add('active');
      if (panel) panel.style.maxHeight = panel.scrollHeight + 50 + "px";
    } else {
      card.style.display = "none";
      card.classList.remove('active');
      if (panel) panel.style.maxHeight = null;
    }
  });
}

/* ==========================================================================
   7. HOME SCREEN HERO IMAGE SLIDER
   ========================================================================== */
const heroSlides = document.querySelectorAll('.hero-slide');
const heroNextBtn = document.getElementById('heroNext');
const heroPrevBtn = document.getElementById('heroPrev');
let heroCurrentSlide = 0;
let heroAutoPlayTimer = null;

function showHeroSlide(index) {
  if (heroSlides.length === 0) return;
  heroSlides.forEach(slide => slide.classList.remove('active'));
  heroSlides[index].classList.add('active');
}

function nextHeroSlide() {
  if (heroSlides.length === 0) return;
  heroCurrentSlide = (heroCurrentSlide + 1) % heroSlides.length;
  showHeroSlide(heroCurrentSlide);
}

function prevHeroSlide() {
  if (heroSlides.length === 0) return;
  heroCurrentSlide = (heroCurrentSlide - 1 + heroSlides.length) % heroSlides.length;
  showHeroSlide(heroCurrentSlide);
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  heroAutoPlayTimer = setInterval(nextHeroSlide, 5000);
}

function stopHeroAutoplay() {
  if (heroAutoPlayTimer) clearInterval(heroAutoPlayTimer);
}

if (heroSlides.length > 0) {
  if (heroNextBtn) {
    heroNextBtn.addEventListener('click', () => {
      nextHeroSlide();
      startHeroAutoplay();
    });
  }
  if (heroPrevBtn) {
    heroPrevBtn.addEventListener('click', () => {
      prevHeroSlide();
      startHeroAutoplay();
    });
  }

  const heroWrapper = document.querySelector('.hero-wrapper');
  if (heroWrapper) {
    heroWrapper.addEventListener('mouseenter', stopHeroAutoplay);
    heroWrapper.addEventListener('mouseleave', startHeroAutoplay);
  }

  startHeroAutoplay();
}

/* ==========================================================================
   8. DYNAMIC MEDIA CAROUSEL ENGINE (FOR INFRASTRUCTURE & GALLERY)
   ========================================================================== */
function initDynamicCarousel(slideClassName, nextBtnId, prevBtnId) {
  let activeIndex = 0;
  const targetSlides = document.querySelectorAll('.' + slideClassName);
  const nextTrigger = document.getElementById(nextBtnId);
  const prevTrigger = document.getElementById(prevBtnId);

  if (targetSlides.length === 0) return;

  function syncMediaPlaystates() {
    targetSlides.forEach((slide, idx) => {
      const video = slide.tagName === 'VIDEO' ? slide : slide.querySelector('video');
      if (video) {
        if (idx === activeIndex) {
          video.play().catch(() => { });
        } else {
          video.pause();
          video.muted = true;
          if (video.readyState >= 2) video.currentTime = 0;

          const buttonElement = slide.querySelector('.volume-toggle-btn');
          if (buttonElement) {
            const icon = buttonElement.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-volume-xmark';
            buttonElement.style.background = 'rgba(15, 23, 42, 0.75)';
          }
        }
      }
    });
  }

  function updateCarouselDisplay(index) {
    if (index >= targetSlides.length) {
      activeIndex = 0;
    } else if (index < 0) {
      activeIndex = targetSlides.length - 1;
    } else {
      activeIndex = index;
    }

    targetSlides.forEach(slide => slide.classList.remove('active'));
    targetSlides[activeIndex].classList.add('active');

    syncMediaPlaystates();
  }

  if (nextTrigger) {
    nextTrigger.replaceWith(nextTrigger.cloneNode(true));
    document.getElementById(nextBtnId).addEventListener('click', () => {
      updateCarouselDisplay(activeIndex + 1);
    });
  }

  if (prevTrigger) {
    prevTrigger.replaceWith(prevTrigger.cloneNode(true));
    document.getElementById(prevBtnId).addEventListener('click', () => {
      updateCarouselDisplay(activeIndex - 1);
    });
  }

  syncMediaPlaystates();
}

/* ==========================================================================
   9. INTERACTIVE SOUND & VIDEO CONTROLS
   ========================================================================== */
function toggleSliderAudio(buttonElement) {
  const container = buttonElement.closest('.video-slide-container') || buttonElement.parentElement;
  const video = container.querySelector('video');
  const icon = buttonElement.querySelector('i');

  if (video && icon) {
    if (video.muted || video.volume === 0) {
      video.muted = false;
      video.volume = 1.0;
      icon.className = 'fa-solid fa-volume-high';
      buttonElement.style.background = '#1d4ed8';
    } else {
      video.volume = 0;
      video.muted = true;
      icon.className = 'fa-solid fa-volume-xmark';
      buttonElement.style.background = 'rgba(15, 23, 42, 0.75)';
    }
  }
}

function skipVideo(buttonElement, secondsToSkip) {
  const container = buttonElement.closest('.video-slide-container');
  if (!container) return;

  const video = container.querySelector('video');
  if (video && !isNaN(video.duration)) {
    let targetTime = video.currentTime + secondsToSkip;
    if (targetTime < 0) targetTime = 0;
    if (targetTime > video.duration) targetTime = video.duration;
    video.currentTime = targetTime;
  }
}

/* ==========================================================================
   10. ACADEMIC NOTES ACCORDION DRAWER LOGIC
   ========================================================================== */
function toggleSemAccordion(panelId) {
  const targetPanel = document.getElementById(panelId);
  if (!targetPanel) return;

  const parentCard = targetPanel.closest('.semester-accordion-card');
  const isCurrentlyActive = parentCard.classList.contains('active');

  const allPanels = document.querySelectorAll('.sem-expandable-panel');
  const allCards = document.querySelectorAll('.semester-accordion-card');

  allPanels.forEach(panel => panel.style.maxHeight = null);
  allCards.forEach(card => card.classList.remove('active'));

  if (!isCurrentlyActive) {
    parentCard.classList.add('active');
    targetPanel.style.maxHeight = targetPanel.scrollHeight + 30 + "px";
  }
}

/* ==========================================================================
   11. GALLERY CHIP FILTRATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const filterChips = document.querySelectorAll('.filter-chip');
  const albumCards = document.querySelectorAll('.drive-album-card');

  if (filterChips.length > 0 && albumCards.length > 0) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const targetFilter = chip.getAttribute('data-filter');

        albumCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (targetFilter === 'all' || cardCategory === targetFilter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
});

/* ==========================================================================
   12. NEWS BANNER: ROTATING SINGLE-LINE MESSAGES + DISMISS
   Replaces the old CSS-marquee ticker. Cycles one message at a time with a
   fade/slide transition, and lets the visitor dismiss the whole bar — the
   dismissal is remembered for the rest of the browser tab's session via
   sessionStorage, so it won't reappear on every internal navigation but
   will show again on a fresh visit.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const newsBar = document.getElementById('newsBar');
  if (!newsBar) return;

  if (sessionStorage.getItem('csitNewsBarDismissed') === 'true') {
    newsBar.style.display = 'none';
    return;
  }

  const items = newsBar.querySelectorAll('.news-item');
  let activeIndex = 0;
  if (items.length > 1) {
    setInterval(() => {
      items[activeIndex].classList.remove('active');
      activeIndex = (activeIndex + 1) % items.length;
      items[activeIndex].classList.add('active');
    }, 4500);
  }

  const dismissBtn = document.getElementById('newsDismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      newsBar.style.display = 'none';
      sessionStorage.setItem('csitNewsBarDismissed', 'true');
    });
  }
});

/* ==========================================================================
   13. IGRIS AI STUDY ASSISTANT
   ========================================================================== */
// IGRIS API Configuration
const IGRIS_CONFIG = {
  // Chat endpoints are Vercel Edge Functions living in the same deployment
  // (no separate backend host, no Render, no database), so a relative
  // path works both locally (via `vercel dev`) and in production.
  API_BASE_URL: '',
  STREAMING_ENABLED: true,
  // Edge functions have no meaningful cold start, so a much shorter timeout
  // than the old Render-based backend is plenty.
  TIMEOUT: 30000
};

// Abort handle for the in-flight IGRIS request. openIgris() aborts it when
// the user switches to another subject chat, so a slow response for a
// previous subject can never be written into the newly opened chat.
let igrisActiveAbort = null;

/**
 * Fetch with a timeout and a shared abort handle.
 */
async function igrisFetch(url, options = {}) {
  const controller = new AbortController();
  igrisActiveAbort = controller;
  const timer = setTimeout(() => controller.abort(), IGRIS_CONFIG.TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    if (igrisActiveAbort === controller) igrisActiveAbort = null;
  }
}

// IGRIS state management
let igrisState = {
  subject: null,
  semester: null,
  year: null,
  messages: [],
  isTyping: false,
  mode: 'study', // 'study' or 'exam'
  sessionId: null // Current chat session ID
};

// Open IGRIS with subject context
function openIgris(year, semester, subject) {
  // Abort any in-flight request from the previously open chat so its late
  // response can't land in this new subject's chat.
  if (igrisActiveAbort) {
    igrisActiveAbort.abort();
    igrisActiveAbort = null;
  }

  igrisState = {
    subject: subject,
    semester: semester,
    year: year,
    messages: [],
    isTyping: false,
    mode: 'study',
    sessionId: null
  };

  // Update IGRIS page header with subject context
  const subjectBadge = document.getElementById('igrisSubjectBadge');
  if (subjectBadge) {
    subjectBadge.textContent = `${subject} (${year} - ${semester})`;
  }

  // Clear previous chat
  const chatContainer = document.getElementById('igrisChatMessages');
  if (chatContainer) {
    chatContainer.innerHTML = '';
    addIgrisMessage('assistant', `Hello! I'm IGRIS, your AI study assistant. I'm here to help you with ${subject}. Ask me anything about the course material, concepts, or practice questions. How can I help you today?`);
  }

  // Navigate to IGRIS page
  openPage('igris-page');
}

// Toggle between Study and Exam mode
function toggleIgrisMode() {
  const modeBtn = document.getElementById('igrisModeBtn');
  const modeIndicator = document.getElementById('igrisModeIndicator');

  if (igrisState.mode === 'study') {
    igrisState.mode = 'exam';
    if (modeBtn) modeBtn.textContent = 'Switch to Study Mode';
    if (modeIndicator) {
      modeIndicator.textContent = 'Exam Mode';
      modeIndicator.className = 'igris-mode-indicator exam';
    }
    addIgrisMessage('assistant', '📚 Exam Mode activated! I\'ll now ask you practice questions to test your understanding. Ready to begin?');
  } else {
    igrisState.mode = 'study';
    if (modeBtn) modeBtn.textContent = 'Switch to Exam Mode';
    if (modeIndicator) {
      modeIndicator.textContent = 'Study Mode';
      modeIndicator.className = 'igris-mode-indicator study';
    }
    addIgrisMessage('assistant', '📖 Back to Study Mode. Feel free to ask me any questions about the material!');
  }
}

// Add message to chat
function addIgrisMessage(role, content, sources = null) {
  const chatContainer = document.getElementById('igrisChatMessages');
  if (!chatContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `igris-message ${role}`;

  // User text is escaped as-is; assistant text goes through the markdown
  // formatter (which escapes everything before adding markup).
  const body = role === 'user' ? escapeHtml(content) : formatMarkdown(content);
  let html = `<div class="igris-message-content">${body}</div>`;

  if (sources && sources.length > 0) {
    html += `<div class="igris-sources">
      <span class="igris-sources-label">📚 Sources:</span>
      ${sources.map(s => `<span class="igris-source-chip" title="${escapeHtml(s.title)}">${escapeHtml(s.title)}</span>`).join('')}
    </div>`;
  }

  messageDiv.innerHTML = html;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Check whether the chat the request was made in is still the open chat.
 * openIgris() replaces the igrisState object wholesale, so if the user opened
 * any other chat (even the same subject again) while a request was in flight,
 * this returns false and the stale response is discarded instead of appended.
 */
function isIgrisChatCurrent(requestState) {
  return igrisState === requestState;
}

/**
 * Turn a non-OK API response into an Error carrying the message the API
 * meant for the user (4xx bodies here are friendly by design — rate limit,
 * daily quota, message-too-long, …). Flags the error with isApiMessage so
 * sendIgrisMessage's catch displays it verbatim instead of the generic
 * fallbacks (which would hide what actually happened).
 */
async function apiErrorFromResponse(response) {
  let apiMessage = null;
  try {
    const data = await response.json();
    if (typeof data.error === 'string' && data.error.trim()) {
      apiMessage = data.error;
    }
  } catch (e) {
    // Body wasn't JSON (or already consumed) — fall back below.
  }
  const error = new Error(
    apiMessage || 'Too many requests — please wait a moment and try again.'
  );
  error.isApiMessage = true;
  error.status = response.status;
  return error;
}

// Send message to IGRIS
async function sendIgrisMessage() {
  const input = document.getElementById('igrisInput');
  if (!input) return;

  const message = input.value.trim();
  if (!message || igrisState.isTyping) return;

  // Snapshot the state object this request belongs to. If the user opens
  // another subject chat while the request is in flight, openIgris() swaps
  // igrisState to a new object and this response must be discarded.
  const requestState = igrisState;

  // Add user message
  addIgrisMessage('user', message);
  input.value = '';

  // Show typing indicator
  igrisState.isTyping = true;
  const typingDiv = document.createElement('div');
  typingDiv.className = 'igris-message assistant typing';
  typingDiv.id = 'igrisTypingIndicator';
  typingDiv.innerHTML = '<div class="igris-typing-dots"><span></span><span></span><span></span></div>';
  document.getElementById('igrisChatMessages').appendChild(typingDiv);

  try {
    // Try streaming endpoint first
    if (IGRIS_CONFIG.STREAMING_ENABLED) {
      await streamIgrisResponse(message, requestState);
    } else {
      await fetchIgrisResponse(message, requestState);
    }
  } catch (error) {
    console.error('IGRIS API Error:', error);

    // Stale request — the user already switched to another chat; discard.
    if (!isIgrisChatCurrent(requestState)) return;

    removeTypingIndicator();

    // Show user-friendly error message
    let errorMessage;
    if (error.isApiMessage) {
      // The API's own message (rate limit, daily quota, validation) —
      // it's already worded for the user; don't bury it.
      errorMessage = error.message;
    } else if (error.name === 'AbortError') {
      errorMessage = 'The request timed out. The server may be waking up from sleep — please try again.';
    } else if (error.message && error.message.includes('fetch')) {
      errorMessage = 'Unable to connect to IGRIS. Please check if the server is running.';
    } else {
      errorMessage = 'Something went wrong. Please try again.';
    }
    addIgrisMessage('assistant', `⚠️ ${errorMessage}`);
  } finally {
    if (isIgrisChatCurrent(requestState)) {
      igrisState.isTyping = false;
    }
  }
}

/**
 * Stream response using Server-Sent Events (SSE)
 * @param {string} message - User's message
 * @param {object} requestState - Snapshot of igrisState taken when the request
 *   started. Every DOM write is guarded by isIgrisChatCurrent(requestState)
 *   so a late response never lands in a different subject's chat.
 */
async function streamIgrisResponse(message, requestState) {
  // Try streaming first; fall back to non-streaming study endpoint on 5xx
  let response;
  try {
    response = await igrisFetch(`${IGRIS_CONFIG.API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        subject: requestState.subject,
        semester: requestState.semester,
        year: requestState.year,
        mode: requestState.mode,
        sessionId: requestState.sessionId
      })
    });
  } catch (networkError) {
    // Chat switched (aborted) or timed out — discard, don't double-fire fallback
    if (!isIgrisChatCurrent(requestState) || networkError.name === 'AbortError') throw networkError;
    console.warn('Stream request failed, falling back to non-streaming:', networkError);
    return fetchIgrisResponse(message, requestState);
  }

  if (!response.ok) {
    // 5xx — model overloaded, fall back to non-streaming study endpoint
    if (response.status >= 500) {
      console.warn(`Stream returned ${response.status}, falling back to study endpoint`);
      return fetchIgrisResponse(message, requestState);
    }
    // 4xx (rate limit, validation, quota…) — the API sent a friendly
    // message meant for the user; surface it instead of a generic error.
    // Retrying via the fallback would just hit the same limit twice.
    throw await apiErrorFromResponse(response);
  }

  // User switched chats while we were connecting — discard this response
  if (!isIgrisChatCurrent(requestState)) {
    try { if (response.body && response.body.cancel) response.body.cancel(); } catch (e) { /* ignore */ }
    return;
  }

  // Remove typing indicator and prepare for streaming
  removeTypingIndicator();

  // Create message container for streaming response
  const chatContainer = document.getElementById('igrisChatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'igris-message assistant streaming';
  messageDiv.innerHTML = '<div class="igris-message-content"></div>';
  chatContainer.appendChild(messageDiv);

  const contentDiv = messageDiv.querySelector('.igris-message-content');
  let fullResponse = '';
  let sources = [];
  let streamError = null;

  // Handle one complete SSE data line
  const handleDataLine = (line) => {
    if (!line.startsWith('data:')) return;
    let data;
    try {
      data = JSON.parse(line.slice(5).trim());
    } catch (parseError) {
      return; // Ignore incomplete JSON
    }

    switch (data.type || data.event) {
      case 'session':
        // Only adopt the session if this chat is still the open one
        if (isIgrisChatCurrent(requestState)) {
          igrisState.sessionId = data.sessionId;
        }
        break;

      case 'sources':
        sources = data.sources || [];
        break;

      case 'chunk':
        fullResponse += data.text || '';
        contentDiv.innerHTML = formatMarkdown(fullResponse);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        break;

      case 'done':
        fullResponse = data.response || fullResponse;
        sources = data.sources || sources;
        break;

      case 'error':
        streamError = new Error(data.error || 'Stream error');
        break;
    }
  };

  // Read SSE stream. Buffer partial lines — an event can be split across
  // network reads and dropping half a data: line would silently lose text.
  // A 45s inactivity timeout cancels a stalled stream and renders whatever
  // arrived instead of blinking forever.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let readTimeout = null;

  try {
    while (true) {
      readTimeout = setTimeout(() => {
        try { reader.cancel(); } catch (e) { /* ignore */ }
      }, 45000);

      const { done, value } = await reader.read();
      clearTimeout(readTimeout);
      if (done) break;

      // User switched to another chat mid-stream — stop and discard
      if (!isIgrisChatCurrent(requestState)) {
        messageDiv.remove();
        try { reader.cancel(); } catch (e) { /* ignore */ }
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep the last (possibly incomplete) line buffered
      for (const line of lines) {
        if (line.startsWith('event:')) continue;
        handleDataLine(line);
      }
    }
    if (buffer) handleDataLine(buffer);
  } finally {
    if (readTimeout) clearTimeout(readTimeout);
    reader.releaseLock();
  }

  // If stream produced no content (model overloaded mid-stream), fall back
  if (streamError || !fullResponse.trim()) {
    // An API-worded error (rate limit, quota) won't be fixed by retrying
    // the fallback endpoint — it would just hit the same limit twice.
    // Surface it directly instead.
    if (streamError && streamError.isApiMessage) {
      throw streamError;
    }
    messageDiv.remove();
    if (streamError) console.warn('Stream error, falling back:', streamError);
    else console.warn('Empty stream response, falling back to study endpoint');
    return fetchIgrisResponse(message, requestState);
  }

  // Finalize the message
  messageDiv.classList.remove('streaming');
  contentDiv.innerHTML = formatMarkdown(fullResponse);

  // Add sources if available
  if (sources && sources.length > 0) {
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'igris-sources';
    sourcesDiv.innerHTML = `
      <span class="igris-sources-label">📚 Sources:</span>
      ${sources.map(s => `<span class="igris-source-chip" title="${s.title}">${s.title}</span>`).join('')}
    `;
    messageDiv.appendChild(sourcesDiv);
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Non-streaming fallback (for browsers without SSE support or when disabled)
 * @param {string} message - User's message
 * @param {object} requestState - Snapshot of igrisState taken when the request
 *   started; the response is discarded if the user has switched chats since.
 */
async function fetchIgrisResponse(message, requestState) {
  const response = await igrisFetch(`${IGRIS_CONFIG.API_BASE_URL}/api/study/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      subject: requestState.subject,
      semester: requestState.semester,
      year: requestState.year,
      mode: requestState.mode,
      sessionId: requestState.sessionId
    })
  });

  if (!response.ok) {
    // The API's 4xx bodies carry user-facing messages (rate limit, quota,
    // validation) — display them rather than a generic failure.
    throw await apiErrorFromResponse(response);
  }

  const data = await response.json();

  // User switched chats while we waited — discard the answer
  if (!isIgrisChatCurrent(requestState)) return;

  removeTypingIndicator();

  if (data.success) {
    igrisState.sessionId = data.sessionId;
    addIgrisMessage('assistant', data.response, data.sources);
  } else {
    throw new Error(data.error || 'Failed to get response');
  }
}

/**
 * Remove typing indicator from chat
 */
function removeTypingIndicator() {
  const typing = document.getElementById('igrisTypingIndicator');
  if (typing) typing.remove();
}

/**
 * Simple markdown formatter for chat responses
 */
// Unicode replacements for common LaTeX commands, so $\tau$ becomes τ and
// \times becomes ×. Unknown commands fall through as a space.
const LATEX_SYMBOLS = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε',
  varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', Theta: 'Θ', iota: 'ι',
  kappa: 'κ', lambda: 'λ', Lambda: 'Λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π',
  Pi: 'Π', rho: 'ρ', sigma: 'σ', Sigma: 'Σ', tau: 'τ', upsilon: 'υ',
  phi: 'φ', varphi: 'φ', Phi: 'Φ', chi: 'χ', psi: 'ψ', Psi: 'Ψ',
  omega: 'ω', Omega: 'Ω', times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓',
  leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈',
  equiv: '≡', sim: '∼', propto: '∝', infty: '∞', to: '→', rightarrow: '→',
  leftarrow: '←', Rightarrow: '⇒', leftrightarrow: '↔', sum: 'Σ', prod: '∏',
  int: '∫', partial: '∂', nabla: '∇', degree: '°', circ: '°', forall: '∀',
  exists: '∃', in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', cup: '∪',
  cap: '∩', emptyset: '∅', cdots: '⋯', ldots: '…', dots: '…', perp: '⊥',
  angle: '∠', neg: '¬', land: '∧', lor: '∨'
};

// Digits and common exponent letters → unicode superscript
const SUPERSCRIPT_CHARS = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶',
  '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'i': 'ⁱ'
};

// Quick gate: skip LaTeX conversion entirely for text with no math in it.
function hasLatexMath(text) {
  return /\\[a-zA-Z]+|\$[^$\n]*[\\^_{}]/.test(text);
}

// Convert the inside of one math span ($...$, $$...$$, \(...\), \[...\])
// into readable plain unicode text. Runs BEFORE HTML escaping.
function convertLatexMath(math) {
  let out = ` ${math} `;

  // Common fractions first
  out = out
    .replace(/\\[dt]?frac\{1\}\{2\}/g, '½')
    .replace(/\\[dt]?frac\{1\}\{4\}/g, '¼')
    .replace(/\\[dt]?frac\{3\}\{4\}/g, '¾')
    .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a, b) => `(${a})/(${b})`);

  // \sqrt{x} → √(x), \text{...}/\mathrm{...} → contents
  out = out
    .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
    .replace(/\\(?:mathbf|mathit|mathrm|text|mathbb|operatorname|mbox)\{([^{}]*)\}/g, '$1');

  // Superscripts: ^{2} or ^2 → ² ; leave anything non-convertible untouched
  out = out.replace(/\^\{([^{}]*)\}|\^(\w)/g, (m, braced, single) => {
    const src = braced !== undefined ? braced : single;
    const chars = [...src].map(c => SUPERSCRIPT_CHARS[c]);
    return chars.length && chars.every(Boolean) ? chars.join('') : m;
  });

  // Subscripts: _{th} or _1 → _th / _1 (readable plain text)
  out = out.replace(/_\{([^{}]*)\}|_(\w)/g, (_, braced, single) => `_${braced !== undefined ? braced : single}`);

  // Symbol commands: \tau → τ, unknown → space
  out = out.replace(/\\([A-Za-z]+)/g, (m, name) => (
    LATEX_SYMBOLS[name] !== undefined ? LATEX_SYMBOLS[name] : ' '
  ));

  // Spacing commands, line breaks, and leftover braces
  out = out
    .replace(/\\[,;:!>]|\\quad|\\qquad/g, ' ')
    .replace(/\\\\/g, ' ')
    .replace(/[{}]/g, '');

  return out.replace(/\s+/g, ' ').trim();
}

// Convert LaTeX math spans anywhere in text; leaves non-math text untouched.
function formatLatex(text) {
  if (!hasLatexMath(text)) return text;
  return text
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => convertLatexMath(m))
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => convertLatexMath(m))
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => convertLatexMath(m))
    .replace(/\$([^$\n]+?)\$/g, (_, m) => convertLatexMath(m));
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Inline markdown for one line's content: citations, bold, italic, links.
// Inline code spans were already protected upstream; codes is the shared
// array of prepared <code> HTML that the placeholders index into.
function inlineFormat(line, codes) {
  let s = escapeHtml(line);

  // Citation markers [[1]] → small styled chip
  s = s.replace(/\[\[(\d+)\]\]/g, '<sup class="igris-cite">[$1]</sup>');

  // Bold (** or __), then italic (single * only — underscores appear in
  // plain-text math like V_th, so _italic_ is intentionally not supported)
  s = s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*\s][^*]*?)\*/g, '<em>$1</em>');

  // Linkify bare URLs
  s = s.replace(/(https?:\/\/[^\s<)"']+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

  // Restore protected inline code spans
  return s.replace(/@@IGRIS-IC-(\d+)@@/g, (_, i) => codes[+i] || '');
}

// Render a chat message into HTML: LaTeX cleanup, code blocks, headings,
// bullet/numbered lists, citations, bold/italic, links. All text is HTML-
// escaped, so user input and API output can never inject markup.
function formatMarkdown(text) {
  if (!text) return '';

  // 1. Protect fenced code blocks from all further processing
  const codeBlocks = [];
  let src = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(`<pre><code class="language-${lang}">${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`);
    return `@@IGRIS-CB-${codeBlocks.length - 1}@@`;
  });

  // Drop leftover fence lines (output truncated mid-code-block)
  src = src.replace(/^```[\w-]*\s*$/gm, '');

  // 2. Protect inline code spans BEFORE LaTeX conversion, so code like
  //    $HOME $PATH is never mistaken for math delimiters
  const inlineCodes = [];
  src = src.replace(/`([^`\n]+)`/g, (_, c) => {
    inlineCodes.push(`<code>${escapeHtml(c)}</code>`);
    return `@@IGRIS-IC-${inlineCodes.length - 1}@@`;
  });

  // 3. Convert LaTeX math spans ($...$, $$...$$, \(...\), \[...\])
  src = formatLatex(src);

  const headingTags = ['h3', 'h4', 'h4', 'h5'];
  const inline = (s) => inlineFormat(s, inlineCodes);
  let html = '';
  let listTag = null; // 'ul' | 'ol' while inside a list

  const closeList = () => {
    if (listTag) { html += `</${listTag}>`; listTag = null; }
  };

  for (const rawLine of src.split('\n')) {
    const line = rawLine.trim();

    // Blank line — close any open list, skip
    if (!line) { closeList(); continue; }

    // Standalone fenced code block
    const block = line.match(/^@@IGRIS-CB-(\d+)@@$/);
    if (block) { closeList(); html += codeBlocks[+block[1]] || ''; continue; }

    // Heading: # / ## / ### / ####
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeList();
      const tag = headingTags[heading[1].length - 1];
      html += `<${tag}>${inline(heading[2])}</${tag}>`;
      continue;
    }

    // Bullet list item: - item or * item
    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) {
      if (listTag !== 'ul') { closeList(); html += '<ul>'; listTag = 'ul'; }
      html += `<li>${inline(ul[1])}</li>`;
      continue;
    }

    // Numbered list item: 1. item or 1) item
    const ol = line.match(/^(\d+)[.)]\s+(.*)$/);
    if (ol) {
      if (listTag !== 'ol') { closeList(); html += '<ol>'; listTag = 'ol'; }
      html += `<li>${inline(ol[2])}</li>`;
      continue;
    }

    closeList();
    html += `<p>${inline(line)}</p>`;
  }
  closeList();

  // Safety net: a code block that ended up mid-line instead of standalone
  html = html.replace(/@@IGRIS-CB-(\d+)@@/g, (_, i) => codeBlocks[+i] || '');

  return html;
}

// Mock study response generator (fallback when API is unavailable)
function generateMockStudyResponse(query) {
  const subject = igrisState.subject || 'this subject';
  const responses = [
    `Great question about ${subject}! This is a mock response during development. When IGRIS is fully connected, I'll provide detailed answers from your actual course materials.`,
    `Let me explain that concept from ${subject}. In the full implementation, I'll search through your notes, lab manuals, and previous papers to give you accurate, cited information.`,
    `That's an important topic in ${subject}. Once connected to the knowledge base, I'll pull relevant sections from your study materials and show you exactly where to find more details.`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Mock exam response generator (fallback when API is unavailable)
function generateMockExamResponse(query) {
  const questions = [
    `Practice Question: Explain the key principles of ${igrisState.subject}. List at least 3 important concepts.`,
    `Let's test your knowledge: What are the main differences between the approaches we discussed in class?`,
    `Exam-style question: Describe a real-world application of the concepts from ${igrisState.subject}.`
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

// Generate mock sources (fallback when API is unavailable)
function generateMockSources() {
  return [
    { title: 'Lecture Notes', url: '#' },
    { title: 'Lab Manual', url: '#' }
  ];
}

// Handle Enter key in input
function handleIgrisKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendIgrisMessage();
  }
}

/* ==========================================================================
   14. APPLICATION HYDRATION & SCROLL-TOP CONTROLLER
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dynamic carousels
  initDynamicCarousel('class-slide', 'classNext', 'classPrev');
  initDynamicCarousel('lib-slide', 'libNext', 'libPrev');
  initDynamicCarousel('sem-slide', 'semNext', 'semPrev');
  initDynamicCarousel('gal-slide', 'galNext', 'galPrev');

  // Mute all slider videos initially
  const allSliderVideos = document.querySelectorAll('.video-slide-container video');
  allSliderVideos.forEach(vid => {
    vid.muted = true;
    vid.volume = 0;
  });

  // Setup Scroll-Top Button
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.style.display = window.scrollY > 350 ? 'flex' : 'none';
    });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Setup Observers
  initCounterObservers();
  initScrollReveal();

  // Render whichever section the URL points to on first load. This is what
  // makes a shared/bookmarked link like example.com/#/faculty open directly
  // on the Faculty page instead of always landing on Home.
  const initialPageId = getPageIdFromHash() || DEFAULT_PAGE;
  renderPage(initialPageId);
});
