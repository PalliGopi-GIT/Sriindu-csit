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
   13. APPLICATION HYDRATION & SCROLL-TOP CONTROLLER
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
