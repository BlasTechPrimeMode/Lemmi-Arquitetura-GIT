(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================
     SMOOTH SCROLL — Lenis
     ===================================================== */
  let lenis = null;
  if (!prefersReducedMotion && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => lenis.raf(time * 1000));
      window.gsap.ticker.lagSmoothing(0);
    }
  }

  // Smooth in-page anchor navigation
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target, { offset: -90 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          document.getElementById('mobileMenu')?.classList.remove('is-open');
        }
      }
    });
  });

  /* =====================================================
     HEADER — estado ao rolar
     ===================================================== */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* =====================================================
     MENU MOBILE
     ===================================================== */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  /* =====================================================
     HERO — Split Text Reveal
     ===================================================== */
  const revealHero = () => {
    const words = document.querySelectorAll('.hero__title .word');
    const eyebrow = document.querySelector('.hero__eyebrow');
    if (window.gsap) {
      window.gsap.to(eyebrow, { opacity: 1, duration: 0.9, delay: 0.3, ease: 'power2.out' });
      window.gsap.to(words, {
        y: '0%',
        duration: 1.1,
        stagger: 0.12,
        delay: 0.5,
        ease: 'power4.out',
      });
    } else {
      eyebrow.style.opacity = 1;
      words.forEach((w) => (w.style.transform = 'translateY(0)'));
    }
  };
  revealHero();

  /* Parallax leve no hero */
  const heroImg = document.querySelector('.hero__img');
  if (!prefersReducedMotion && heroImg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.transform = `translateY(${y * 0.15}px) scale(1.08)`;
      }
    }, { passive: true });
  }

  /* =====================================================
     SOBRE — Revelação sequencial das palavras ao rolar
     ===================================================== */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.about__title, .about__paragraph').forEach((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      let node;
      let wordIndex = 0;
      while ((node = walker.nextNode())) textNodes.push(node);
      textNodes.forEach((textNode) => {
        const fragment = document.createDocumentFragment();
        textNode.textContent.split(/(\s+)/).forEach((part) => {
          if (/\s+/.test(part)) {
            fragment.append(document.createTextNode(part));
          } else if (part) {
            const word = document.createElement('span');
            word.className = 'about__word';
            word.style.setProperty('--word-delay', `${wordIndex++ * 35}ms`);
            word.textContent = part;
            fragment.append(word);
          }
        });
        textNode.replaceWith(fragment);
      });
    });
  }

  // Controle exclusivo de áudio do vídeo da seção Sobre.
  const aboutVideo = document.querySelector('.about__video');
  const aboutAudioToggle = document.querySelector('[data-about-audio]');
  const aboutAudioIcon = aboutAudioToggle?.querySelector('.about__audio-icon');
  if (aboutVideo && aboutAudioToggle) aboutAudioToggle.addEventListener('click', () => {
    aboutVideo.muted = !aboutVideo.muted;
    const isMuted = aboutVideo.muted;
    aboutAudioToggle.setAttribute('aria-label', isMuted ? 'Ativar áudio' : 'Silenciar áudio');
    aboutAudioToggle.setAttribute('aria-pressed', String(!isMuted));
    if (aboutAudioIcon) aboutAudioIcon.textContent = isMuted ? '🔇' : '🔊';
  });

  // Controle exclusivo de áudio do vídeo de serviços.
  const projectVideo = document.querySelector('.project__video');
  const projectAudioToggle = document.querySelector('[data-project-audio]');
  const projectAudioIcon = projectAudioToggle?.querySelector('.project__audio-icon');
  if (projectVideo && projectAudioToggle) projectAudioToggle.addEventListener('click', () => {
    projectVideo.muted = !projectVideo.muted;
    const isMuted = projectVideo.muted;
    projectAudioToggle.setAttribute('aria-label', isMuted ? 'Ativar áudio' : 'Silenciar áudio');
    projectAudioToggle.setAttribute('aria-pressed', String(!isMuted));
    if (projectAudioIcon) projectAudioIcon.textContent = isMuted ? '🔇' : '🔊';
  });

  /* =====================================================
     REVEAL ON SCROLL — Intersection Observer
     ===================================================== */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* =====================================================
     CURSOR PERSONALIZADO + MAGNETIC HOVER
     ===================================================== */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.body.classList.add('cursor-active');
    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const animateCursor = () => {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.left = `${curX}px`;
      cursor.style.top = `${curY}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });

    // Magnetic buttons
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.4}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* =====================================================
     PROJETOS — GSAP scroll reveal (fallback CSS reveal já cobre)
     ===================================================== */
  const projects = document.querySelectorAll('.project');
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    projects.forEach((project) => {
      window.gsap.fromTo(
        project,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: project,
            start: 'top 82%',
          },
        }
      );
    });
  } else {
    projects.forEach((p) => (p.style.opacity = 1));
  }

  /* =====================================================
     LIGHTBOX DA GALERIA
     ===================================================== */
  const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;
  let lastFocused = null;

  const openLightbox = (index) => {
    currentIndex = index;
    const item = galleryItems[index];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img').alt;
    lastFocused = document.activeElement;
    lightbox.classList.add('is-open');
    if (lenis) lenis.stop();
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    if (lenis) lenis.start();
    lastFocused?.focus();
  };

  const showDelta = (delta) => {
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img').alt;
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showDelta(-1));
  lightboxNext.addEventListener('click', () => showDelta(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showDelta(-1);
    if (e.key === 'ArrowRight') showDelta(1);
  });

  // Swipe no mobile
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 50) showDelta(delta > 0 ? -1 : 1);
  }, { passive: true });

  /* =====================================================
     NEWSLETTER (demonstração — sem backend)
     ===================================================== */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterStatus = document.getElementById('newsletterStatus');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    newsletterStatus.textContent = 'Obrigado. Você foi inscrito com sucesso.';
    newsletterForm.reset();
  });

  /* =====================================================
     RODAPÉ — Ano dinâmico
     ===================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
