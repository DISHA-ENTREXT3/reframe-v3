/**
 * Reframe Studios - LoftyLab Motion & Interaction System
 * Enhanced with scroll-reveal animations, parallax, and nav polish.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Bento 3D Tilt & Specular Cursor Spotlight
  const tiltCards = document.querySelectorAll('.lofty-tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Gentle tilt angle (up to 3deg)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // 2. Magnetic Button Physics
  const magneticButtons = document.querySelectorAll('.lofty-magnetic-btn');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });

  // 3. Consultation Modal
  const modal = document.getElementById('consultationModal');
  const openTriggers = document.querySelectorAll('.open-modal-trigger');
  const closeBtn = document.getElementById('closeModalBtn');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';
      setTimeout(() => {
        closeModal();
        setTimeout(() => {
          contactForm.reset();
          contactForm.style.display = 'flex';
          formSuccess.style.display = 'none';
        }, 500);
      }, 2500);
    });
  }

  // 4. Multi-Page & Scroll Navigation Highlighting
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links .nav-item');
  const rawPath = window.location.pathname.split('/').pop() || 'index';
  const currentPathSlug = rawPath.replace('.html', '') || 'index';

  // Highlight active page link based on current URL file or clean route
  navItems.forEach(item => {
    const href = item.querySelector('a')?.getAttribute('href') || '';
    const linkSlug = href.split('#')[0].replace('.html', '');
    if (linkSlug === currentPathSlug || (currentPathSlug === 'index' && (linkSlug === '' || linkSlug === 'index'))) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // If on homepage with multiple sections, track scroll
  if (sections.length > 3) {
    window.addEventListener('scroll', () => {
      let current = '';
      const scrollY = window.pageYOffset;

      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 140;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });

      if (current) {
        navItems.forEach(item => {
          const href = item.querySelector('a')?.getAttribute('href') || '';
          if (href.includes(`#${current}`)) {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
          }
        });
      }
    }, { passive: true });
  }

  // 5. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.02,
      rootMargin: '50px 0px 50px 0px',
    }
  );

  // Immediate Viewport & Subpage Content Visibility Sweep
  const isSubpage = currentPathSlug !== 'index' && currentPathSlug !== '';
  const triggerVisibleElements = () => {
    document.querySelectorAll('.reveal-on-scroll, .stagger-children').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (isSubpage || rect.top < window.innerHeight * 1.35) {
        el.classList.add('is-visible');
      } else {
        revealObserver.observe(el);
      }
    });
  };

  triggerVisibleElements();
  window.addEventListener('load', triggerVisibleElements);
  setTimeout(triggerVisibleElements, 250);

  // Dynamic Cursor & Scroll Color Motion on ALL Hero Sections (Home, About, Services, Work, How We Think, Contact)
  const dynamicColorHeroes = document.querySelectorAll('.hero-section, .subpage-header-wrap, .svc-hero');
  if (dynamicColorHeroes.length > 0) {
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = 240;
    let heroColorRaf = null;

    const renderHeroColorMotion = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      dynamicColorHeroes.forEach(heroEl => {
        const rect = heroEl.getBoundingClientRect();
        // Update when hero is visible in or near viewport
        if (rect.bottom >= -80 && rect.top <= window.innerHeight + 80) {
          const heroW = rect.width || window.innerWidth;
          const heroH = rect.height || 450;
          const xPct = Math.max(0, Math.min(100, ((lastMouseX - rect.left) / heroW) * 100));
          const yPct = Math.max(0, Math.min(100, ((lastMouseY - rect.top) / heroH) * 100));
          
          // Dynamic hue smoothly shifts between cyan (195), electric blue (220), purple (270), and coral (330)
          // Combines both cursor position AND page scroll distance
          const scrollHueFactor = (scrollY * 0.18);
          const dynamicHue = Math.round((195 + (xPct * 1.35) + (yPct * 0.45) + scrollHueFactor) % 360);

          heroEl.style.setProperty('--hero-mouse-x', `${xPct.toFixed(1)}%`);
          heroEl.style.setProperty('--hero-mouse-y', `${yPct.toFixed(1)}%`);
          heroEl.style.setProperty('--hero-hue', `${dynamicHue}`);
        }
      });
      heroColorRaf = null;
    };

    window.addEventListener('mousemove', (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      if (!heroColorRaf) {
        heroColorRaf = requestAnimationFrame(renderHeroColorMotion);
      }
    }, { passive: true });

    window.addEventListener('scroll', () => {
      if (!heroColorRaf) {
        heroColorRaf = requestAnimationFrame(renderHeroColorMotion);
      }
    }, { passive: true });

    // Initial render
    renderHeroColorMotion();
  }

  // 6. Subtle Hero Parallax (clouds drift slower than scroll)
  const heroSection = document.querySelector('.hero-section, .subpage-header-wrap, .svc-hero');
  const heroClouds = document.querySelector('.hero-clouds-bg');
  if (heroClouds && heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      if (scrolled < heroHeight) {
        heroClouds.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    }, { passive: true });
  }

  // 7. Navbar background elevation on scroll
  const navbarContainer = document.querySelector('.navbar-container');
  if (navbarContainer) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      if (scrolled > 80) {
        navbarContainer.style.boxShadow = '0 16px 40px rgba(2, 9, 29, 0.14)';
        navbarContainer.style.background = 'rgba(255, 255, 255, 0.97)';
      } else {
        navbarContainer.style.boxShadow = '0 10px 30px rgba(2, 9, 29, 0.08)';
        navbarContainer.style.background = 'rgba(255, 255, 255, 0.9)';
      }
    }, { passive: true });
  }

  // 8. Interactive LoftyLab Googly Eyes Cursor Tracking
  const eyesContainer = document.querySelector('.sticker-eyes');
  const pupils = document.querySelectorAll('.googly-eye .pupil');
  if (eyesContainer && pupils.length > 0) {
    window.addEventListener('mousemove', (e) => {
      const rect = eyesContainer.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY), 400);
      const maxOffset = 7;
      const offsetX = Math.cos(angle) * (distance / 400 * maxOffset);
      const offsetY = Math.sin(angle) * (distance / 400 * maxOffset);

      pupils.forEach(pupil => {
        pupil.style.animation = 'none';
        pupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    }, { passive: true });
  }

  // 9. Interactive Sticker Click-Pop Spring Reaction
  document.querySelectorAll('.interactive-sticker, .sticker-handwritten').forEach(sticker => {
    sticker.addEventListener('click', () => {
      sticker.style.transition = 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)';
      sticker.style.transform = 'scale(1.4) rotate(-16deg)';
      setTimeout(() => {
        sticker.style.transform = 'scale(0.92) rotate(8deg)';
        setTimeout(() => {
          sticker.style.transform = '';
          sticker.style.transition = '';
        }, 180);
      }, 160);
    });
  });

  // 10. Motion Text Reveal Dynamic Line Splitter
  document.querySelectorAll('.motion-text-reveal').forEach((el) => {
    // Split by line breaks or preserve inner content
    const rawLines = el.innerHTML.split(/<br\s*\/?>/i);
    if (rawLines.length > 1) {
      el.innerHTML = rawLines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        return `<span class="lofty-line-mask"><span class="lofty-reveal-text">${trimmed}</span></span>`;
      }).join('');
    } else {
      const content = el.innerHTML.trim();
      el.innerHTML = `<span class="lofty-line-mask"><span class="lofty-reveal-text">${content}</span></span>`;
    }
  });

  // 11. Interactive Phone Reel Switcher (Zeng Style Reel Selector)
  const reelTabs = document.querySelectorAll('.reel-tab-btn');
  const screenImg = document.getElementById('phoneScreenImg');
  const screenBadge = document.getElementById('phoneTagBadge');
  const screenTitle = document.getElementById('phoneReelTitle');
  const screenSpeaker = document.getElementById('phoneReelSpeaker');
  const leftStat = document.getElementById('statCardLeftText');

  const reelsData = {
    vrushali: {
      img: './assets/vrushali.jpg',
      badge: '⚡ Partner Insight',
      title: '"Why Seed Valuations Don\'t Matter Without Follow-On Architecture"',
      speaker: 'Vrushali Hirpara · Private Markets',
      stat: 'Thesis Breakdown #14'
    },
    tata: {
      img: './assets/work_tata.jpg',
      badge: '🚗 Enterprise Story',
      title: '"From Factory Floor to EV Leadership: The Industrial Playbook"',
      speaker: 'Tata Motors · Executive Film',
      stat: '2.4M Organic Views'
    },
    bmw: {
      img: './assets/work_bmw.jpg',
      badge: '⚡ Precision Narrative',
      title: '"Engineering Obsession & The Psychology of Performance"',
      speaker: 'BMW · Long-Form Editorial',
      stat: '+340% Inbound Recall'
    }
  };

  reelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const reelKey = tab.getAttribute('data-reel');
      const data = reelsData[reelKey];
      if (!data) return;

      reelTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      if (screenImg) {
        screenImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        screenImg.style.opacity = '0';
        screenImg.style.transform = 'scale(1.08)';
        setTimeout(() => {
          screenImg.src = data.img;
          if (screenBadge) screenBadge.textContent = data.badge;
          if (screenTitle) screenTitle.textContent = data.title;
          if (screenSpeaker) screenSpeaker.textContent = data.speaker;
          if (leftStat) leftStat.textContent = data.stat;
          screenImg.style.opacity = '1';
          screenImg.style.transform = 'scale(1)';
        }, 180);
      }
    });
  });

  // 12. Animated Stat Counters (Services Hero)
  const statNums = document.querySelectorAll('.svc-stat-num[data-count]');
  if (statNums.length > 0) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const duration = 1200;
      const startTime = performance.now();
      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.1 });

    statNums.forEach(el => {
      counterObserver.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0 && !el.dataset.counted) {
        el.dataset.counted = 'true';
        animateCounter(el);
      }
    });
  }

  // 13. Services Transform Rows — scroll reveal
  const transformRows = document.querySelectorAll('.svc-tr-animate');
  if (transformRows.length > 0) {
    const rowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.2 });
    transformRows.forEach(row => rowObserver.observe(row));
  }

  // 14. Services page: ensure subpage-container items are visible
  if (document.querySelector('.svc-hero')) {
    document.querySelectorAll('.subpage-container .reveal-on-scroll').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  // 15. Work Page: Interactive 3D Cinema Showcase & Video Switcher
  const workStage = document.getElementById('work3DStage');
  if (workStage) {
    const cinemaDeck = document.getElementById('cinemaDeck');
    const mainImg = document.getElementById('cinemaMainImg');
    const tagBadge = document.getElementById('cinemaTagBadge');
    const titleEl = document.getElementById('cinemaTitle');
    const descEl = document.getElementById('cinemaDesc');
    const timecodeEl = document.getElementById('cinemaTimecode');
    const playBtn = document.getElementById('cinemaPlayBtn');
    const tabs = document.querySelectorAll('.work-3d-tab');
    const wings = document.querySelectorAll('.cinema-wing-card');

    const projectData = {
      tata: {
        img: './assets/work_tata.jpg',
        tag: '🚗 MOBILITY & ENTERPRISE',
        title: 'Tata Motors: Founder & Scale Storytelling',
        desc: 'Unpacking industrial transformation and commercial vision into high-conviction executive cinema.',
        tc: '02:14:08'
      },
      bmw: {
        img: './assets/work_bmw.jpg',
        tag: '⚡ LUXURY & PRECISION',
        title: 'BMW: Precision Engineering & Driver Emotion',
        desc: 'High-fidelity cinematic film articulating engineering obsession and enduring driver connection.',
        tc: '03:42:19'
      },
      makemytrip: {
        img: './assets/work_makemytrip.jpg',
        tag: '🌿 IMPACT & CONSERVATION',
        title: 'MakeMyTrip Foundation: Ecological Regeneration',
        desc: 'Documentary-level storytelling on community preservation, sustainable tourism, and ecological impact.',
        tc: '01:58:12'
      },
      ford: {
        img: './assets/work_ford.jpg',
        tag: '🏎️ AUTOMOTIVE HERITAGE',
        title: 'Ford: Industrial Legacy & Operator Trust',
        desc: 'Brand-led narrative film exploring durable engineering heritage and cross-generational trust.',
        tc: '04:05:22'
      }
    };

    const switchCinemaProject = (key) => {
      const data = projectData[key];
      if (!data) return;

      tabs.forEach(t => {
        const isActive = t.dataset.cinema === key;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      wings.forEach(w => {
        w.classList.toggle('active', w.dataset.cinema === key);
      });

      if (mainImg) {
        mainImg.classList.remove('fade-in');
        void mainImg.offsetWidth; // trigger reflow
        mainImg.src = data.img;
        mainImg.classList.add('fade-in');
      }
      if (tagBadge) tagBadge.textContent = data.tag;
      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;
      if (timecodeEl) timecodeEl.textContent = data.tc;
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchCinemaProject(tab.dataset.cinema));
    });

    wings.forEach(wing => {
      wing.addEventListener('click', () => switchCinemaProject(wing.dataset.cinema));
    });

    // 3D Perspective Mouse Tilt
    if (cinemaDeck) {
      let tiltRaf = null;
      workStage.addEventListener('mousemove', (e) => {
        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(() => {
          const rect = cinemaDeck.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) / (rect.width / 2);
          const deltaY = (e.clientY - centerY) / (rect.height / 2);

          const rotY = Math.max(-12, Math.min(12, deltaX * 10));
          const rotX = Math.max(-10, Math.min(10, -deltaY * 8));

          cinemaDeck.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) translateZ(10px)`;
          tiltRaf = null;
        });
      }, { passive: true });

      workStage.addEventListener('mouseleave', () => {
        cinemaDeck.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    }

    // Play/Pause Interactive Ticker
    let isPlaying = true;
    let tickerInterval = null;
    if (playBtn && timecodeEl) {
      const updateTicker = () => {
        const parts = timecodeEl.textContent.split(':');
        if (parts.length === 3) {
          let secs = parseInt(parts[2], 10) + 1;
          let mins = parseInt(parts[1], 10);
          let hrs = parseInt(parts[0], 10);
          if (secs >= 60) { secs = 0; mins++; }
          if (mins >= 60) { mins = 0; hrs++; }
          timecodeEl.textContent = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
      };
      tickerInterval = setInterval(updateTicker, 1000);

      playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playBtn.innerHTML = isPlaying ? '&#9654;' : '&#10074;&#10074;';
        if (isPlaying && !tickerInterval) {
          tickerInterval = setInterval(updateTicker, 1000);
        } else if (!isPlaying && tickerInterval) {
          clearInterval(tickerInterval);
          tickerInterval = null;
        }
      });
    }
  }

  // 16. How We Think: Floating Philosophy Cards Scroll Parallax
  const philoCards = document.querySelectorAll('.philo-float-card');
  if (philoCards.length > 0) {
    let philoRaf = null;
    window.addEventListener('scroll', () => {
      if (philoRaf) return;
      philoRaf = requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        philoCards.forEach(card => {
          const depth = parseFloat(card.dataset.parallaxDepth) || 0;
          const rect = card.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = (rect.top - window.innerHeight / 2) * depth;
            card.style.setProperty('--philo-offset', `${offset.toFixed(1)}px`);
          }
        });
        philoRaf = null;
      });
    }, { passive: true });
  }

  // 17. Site-wide Section Change Visual Effects & Floating Radar HUD
  const allSections = document.querySelectorAll('section');
  if (allSections.length > 0) {
    // Inject floating section radar indicator if not present
    let radar = document.querySelector('.section-radar-hud');
    if (!radar) {
      radar = document.createElement('aside');
      radar.className = 'section-radar-hud';
      radar.setAttribute('aria-label', 'Active section indicator');
      radar.innerHTML = `
        <span class="radar-pulse-dot" aria-hidden="true"></span>
        <span class="radar-section-name">REFRAME STUDIOS</span>
      `;
      document.body.appendChild(radar);
    }

    const radarName = radar.querySelector('.radar-section-name');

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-in-view');
          const name = entry.target.dataset.sectionName || 
                       entry.target.querySelector('h2, h1')?.textContent?.trim().slice(0, 24) ||
                       entry.target.className.replace('section-', '').replace(/-/g, ' ');
          if (name && radarName) {
            radarName.textContent = name.slice(0, 22);
          }
        }
      });
    }, { threshold: 0.25 });

    allSections.forEach(sec => sectionObserver.observe(sec));
  }

  // 18. Sequential Emerging Problem Cards on Scroll
  const problemGrid = document.querySelector('.problem-grid-emerge');
  const problemCards = document.querySelectorAll('.problem-emerge-card');
  if (problemGrid && problemCards.length > 0) {
    let problemEmerged = false;
    const emergeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !problemEmerged) {
          problemEmerged = true;
          problemCards.forEach((card, idx) => {
            setTimeout(() => {
              card.classList.add('emerged');
              // Trigger idle floating after emergence transition finishes
              setTimeout(() => {
                card.classList.add(`floating-${idx + 1}`);
              }, 850);
            }, idx * 220); // Stagger: 0ms, 220ms, 440ms
          });
          emergeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    emergeObserver.observe(problemGrid);
  }

  // 19. Our Work Cards Entry from Left to Center on Scroll
  const workGrid = document.querySelector('.work-grid');
  const workCardsSlide = document.querySelectorAll('.work-card-slide-left');
  if (workGrid && workCardsSlide.length > 0) {
    let workEmerged = false;
    const workObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !workEmerged) {
          workEmerged = true;
          workCardsSlide.forEach(card => card.classList.add('entered-center'));
          workObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    workObserver.observe(workGrid);
  }

  // 20. Footer Navigation Boxes - Entry from Left & Right
  const footerNavGrids = document.querySelectorAll('.footer-nav-cards');
  if (footerNavGrids.length > 0) {
    const footerCardsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fromLeft = entry.target.querySelectorAll('.footer-card-from-left');
          const fromRight = entry.target.querySelectorAll('.footer-card-from-right');
          fromLeft.forEach(c => c.classList.add('footer-card-entered'));
          fromRight.forEach(c => c.classList.add('footer-card-entered'));
          footerCardsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    footerNavGrids.forEach(grid => footerCardsObserver.observe(grid));
  }
});



