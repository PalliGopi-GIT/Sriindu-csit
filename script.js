 /* ==========================================================================
       ================= CENTRAL SINGLE PAGE ROUTER ENGINE ======================
       ========================================================================== */
    function openPage(pageId) {
      const screens = document.querySelectorAll('.page-view');
      screens.forEach(screen => screen.classList.remove('active-page'));

      const targetScreen = document.getElementById(pageId);
      if (targetScreen) {
        targetScreen.classList.add('active-page');
        localStorage.setItem('currentActivePage', pageId);
      } else {
        console.error("SPA Engine Error: Mapping pointer target ID '" + pageId + "' is missing.");
      }

      window.scrollTo({ top: 0, behavior: 'instant' });

      /* AUTOMATIC MENUBAR DISMISS WHEN TAP LINK ROUTE SENDS US TO A NEW SECTION */
      const navLinks = document.getElementById('nav-links');
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(d => d.classList.remove('active'));
      }
    }

    /* ================= MOBILE TOGGLE PANEL NAVIGATION ======================== */
    document.addEventListener("DOMContentLoaded", () => {
      const menuBtn = document.getElementById('menu-btn');
      const navLinks = document.getElementById('nav-links');
      
      if (menuBtn && navLinks) {
        menuBtn.onclick = (e) => {
          e.stopPropagation();
          navLinks.classList.toggle('active');
        };
      }

      /* DETECT MOBILE MODE SCREEN SIZE TO MAP TAP GESTURES FOR COLLAPSED NAV ITEM SUBMENUS */
      const dropdowns = document.querySelectorAll('.dropdown');
      dropdowns.forEach(dropdown => {
        const triggerLink = dropdown.querySelector('a');
        if (triggerLink) {
          triggerLink.onclick = (e) => {
            if (window.innerWidth <= 900) {
              e.preventDefault();
              e.stopPropagation();
              
              /* PREVENTS CLUTTER BY ROLLING SIBLING ACCORDIONS CLOSED */
              dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
              });
              
              dropdown.classList.toggle('active');
            }
          };
        }
      });

      /* COMPLETELY HIDES THE SLIDEOUT PANEL BOX IF SOMEONE CLICKS OUTSIDE OF IT ON CANVAS SPACE */
      window.onclick = () => {
        if (window.innerWidth <= 900 && navLinks && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          dropdowns.forEach(d => d.classList.remove('active'));
        }
      };
    });

    /* ================= FILTRATION: LIVE FACULTY SEARCH ======================= */
    function filterFaculty() {
      const input = document.getElementById('facultySearch');
      if (!input) return;
      
      const filter = input.value.toLowerCase();
      const cards = document.querySelectorAll('.faculty-card');
      cards.forEach(card => {
        const cardContent = card.textContent.toLowerCase();
        card.style.display = cardContent.includes(filter) ? "" : "none";
      });
    }

    /* ================= CAROUSEL: HOME SCREEN HERO SLIDER ===================== */
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');
    let currentSlide = 0;

    if (slides.length > 0) {
      function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentSlide = (currentSlide + 1) % slides.length;
          showSlide(currentSlide);
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentSlide = (currentSlide - 1 + slides.length) % slides.length;
          showSlide(currentSlide);
        });
      }
    }

    /* ==========================================================================
       ================ FIXED INTELLIGENT MEDIA CAROUSEL ENGINE ================
       ========================================================================== */
    function initDynamicCarousel(slideClassName, nextBtnId, prevBtnId) {
      let activeIndex = 0;
      const targetSlides = document.querySelectorAll('.' + slideClassName);
      const nextTrigger = document.getElementById(nextBtnId);
      const prevTrigger = document.getElementById(prevBtnId);
      
      if (targetSlides.length === 0) return;

      /* FORCES INACTIVE SLIDER VIDEOS TO PAUSE SO THEY DO NOT LEAK MEMORY STREAM DATA */
      function syncMediaPlaystates() {
        targetSlides.forEach((slide, idx) => {
          const video = slide.tagName === 'VIDEO' ? slide : slide.querySelector('video');
          
          if (video) {
            if (idx === activeIndex) {
              video.play().catch(err => console.log("Auto-playback deferred until interface engagement."));
            } else {
              video.pause();
              video.muted = true;
              
              if (video.readyState >= 2) {
                video.currentTime = 0;
              }
              
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
       ======================= INTERACTIVE SOUND MANAGEMENT =====================
       ========================================================================== */
    function toggleSliderAudio(buttonElement) {
      const video = buttonElement.parentElement.querySelector('video');
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

    /* ==========================================================================
       ================= VIDEO TIMELINE SKIPPING ENGINE =========================
       ========================================================================== */
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
       ================== ACADEMIC NOTES ACCORDION DRAWER LOGIC =================
       ========================================================================== */
    function toggleSemAccordion(panelId) {
      const targetPanel = document.getElementById(panelId);
      if (!targetPanel) return;

      const parentCard = targetPanel.parentElement;
      const isCurrentlyActive = parentCard.classList.contains('active');

      const allPanels = document.querySelectorAll('.sem-expandable-panel');
      const allCards = document.querySelectorAll('.semester-accordion-card');

      allPanels.forEach(panel => panel.style.maxHeight = null);
      allCards.forEach(card => card.classList.remove('active'));

      if (!isCurrentlyActive) {
        parentCard.classList.add('active');
        targetPanel.style.maxHeight = targetPanel.scrollHeight + "px";
      }
    }

    /* ==========================================================================
       ================= DYNAMIC GALLERY CHIP FILTER DRIVE ENGINE ===============
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
                card.style.display = 'block';
              } else {
                card.style.display = 'none';
              }
            });
          });
        });
      }
    });

    /* ==========================================================================
       ============= AUTOMATIC INITIALIZER & REFRESH RECOVERY ENGINE ============
       ========================================================================== */
    document.addEventListener("DOMContentLoaded", () => {
      initDynamicCarousel('class-slide', 'classNext', 'classPrev');
      initDynamicCarousel('lib-slide', 'libNext', 'libPrev');
      initDynamicCarousel('sem-slide', 'semNext', 'semPrev');
      initDynamicCarousel('gal-slide', 'galNext', 'galPrev');

      const allSliderVideos = document.querySelectorAll('.video-slide-container video');
      allSliderVideos.forEach(vid => {
        vid.muted = true;
        vid.volume = 0; 
      });

      const scrollTopBtn = document.getElementById('scrollTop');
      if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
          scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        scrollTopBtn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      /* HYDRATION SYSTEM PREVENTS REFRESH WIPING ACTIVE HISTORY STATES */
      const savedPageId = localStorage.getItem('currentActivePage');
      if (savedPageId && savedPageId !== 'home-page') {
        openPage(savedPageId);
      } else {
        openPage('home-page');
      }
    });