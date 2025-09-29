/**
 * Enhanced Interaction with Fixed Experience Section Highlighting
 * - Mobile nav toggle
 * - Active link highlighting via IntersectionObserver (FIXED for Experience section)
 * - Quick fade reveal
 * - Native smooth scrolling (CSS) + scroll-margin-top for offset
 * - Improved accessibility
 */
(function(){
  'use strict';

  const qs  = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    setYear();
    setupNavToggle();
    setupActiveLinkObserver();
    quickReveal();
    secureExternalLinks();
    enhanceAccessibility();
  }

  function setYear(){
    const y = qs('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function setupNavToggle(){
    const toggle = qs('.nav__toggle');
    const list   = qs('.nav__list');
    if(!toggle || !list) return;
    
    toggle.addEventListener('click', () => {
      const open = list.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    
    // Close nav when clicking on a link
    list.addEventListener('click', e => {
      if(e.target.classList.contains('nav__link')){
        list.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      }
    });

    // Close nav when clicking outside
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !list.contains(e.target)) {
        list.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close nav on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && list.classList.contains('open')) {
        list.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  function setupActiveLinkObserver(){
    const links = qsa('.nav__link[href^="#"]');
    const sectionIds = ['hero', 'about', 'experience', 'skills', 'certs', 'contact'];
    const sections = sectionIds.map(id => qs(`#${id}`)).filter(Boolean);
    
    if(!sections.length || !links.length) return;
    
    // Clear all active states initially
    const clearActiveStates = () => {
      links.forEach(link => link.classList.remove('active'));
    };
    
    // Set active state for a specific section
    const setActiveSection = (sectionId) => {
      clearActiveStates();
      const activeLink = qs(`.nav__link[href="#${sectionId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    };
    
    // Enhanced intersection observer with better logic
    const observer = new IntersectionObserver((entries) => {
      let visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      
      if (visibleSections.length > 0) {
        // Get the most visible section
        const mostVisible = visibleSections[0];
        setActiveSection(mostVisible.target.id);
      } else {
        // Fallback: determine section based on scroll position
        const scrollY = window.scrollY;
        const headerHeight = qs('.site-header')?.offsetHeight || 80;
        
        let currentSection = 'hero';
        
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrollY - headerHeight;
          
          if (scrollY >= sectionTop - 100) {
            currentSection = section.id;
          }
        });
        
        setActiveSection(currentSection);
      }
    }, {
      rootMargin: `-80px 0px -50% 0px`, // Account for header height
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    });
    
    // Observe all sections
    sections.forEach(section => {
      observer.observe(section);
    });
    
    // Additional scroll listener for more accurate detection
    let ticking = false;
    const updateActiveOnScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const headerHeight = qs('.site-header')?.offsetHeight || 80;
          
          let activeSection = 'hero';
          let minDistance = Infinity;
          
          sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const distance = Math.abs(scrollY + headerHeight + 50 - sectionTop);
            
            if (distance < minDistance && rect.top <= headerHeight + 100) {
              minDistance = distance;
              activeSection = section.id;
            }
          });
          
          setActiveSection(activeSection);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Throttled scroll listener as backup
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveOnScroll, 50);
    }, { passive: true });
    
    // Set initial active state
    setTimeout(() => {
      updateActiveOnScroll();
    }, 100);
  }

  function quickReveal(){
    const items = qsa('.section, .exp-card, .feature, .skill-block, .cert-card, .profile__contact, .profile__panel, .metric');
    
    if(!('IntersectionObserver' in window)) {
      items.forEach(el => { 
        el.style.opacity = 1; 
        el.style.transform='none'; 
      });
      return;
    }
    
    items.forEach(el => {
      el.style.opacity='0';
      el.style.transform='translateY(20px)';
      el.style.transition='opacity .6s ease, transform .6s ease';
    });
    
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.style.opacity='1';
          entry.target.style.transform='translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1, 
      rootMargin: '0px 0px -10% 0px' 
    });
    
    items.forEach(el => io.observe(el));
  }

  function secureExternalLinks(){
    qsa('a[target="_blank"]').forEach(a => {
      if(!/noopener/i.test(a.rel)) {
        a.rel = (a.rel ? a.rel + ' ' : '') + 'noopener';
      }
    });
  }

  function enhanceAccessibility() {
    // Add skip links behavior
    const skipLink = qs('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = qs(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Improve focus management for nav links
    qsa('.nav__link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const target = qs(`#${targetId}`);
        
        if (target) {
          // Manually set active state immediately
          qsa('.nav__link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          // Smooth scroll to target
          target.scrollIntoView({ behavior: 'smooth' });
          
          // Set focus to the target section for screen readers
          target.setAttribute('tabindex', '-1');
          target.focus();
          setTimeout(() => target.removeAttribute('tabindex'), 1000);
        }
      });
    });

    // Add keyboard navigation for cards
    qsa('.exp-card, .feature, .skill-block, .cert-card').forEach(card => {
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          card.click();
        }
      });
    });
  }

  // Optional contact logging
  qsa('a[href^="mailto:"], a[href*="mail.google.com"], a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', () => {
      console.log('[Contact Event]', {
        type: a.href.includes('mailto') ? 'email' : 'phone',
        href: a.href,
        timestamp: new Date().toISOString()
      });
    });
  });

  // Add smooth scroll behavior fallback for older browsers
  if (!CSS.supports('scroll-behavior', 'smooth')) {
    qsa('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = qs(link.getAttribute('href'));
        if (target) {
          const headerHeight = qs('.site-header')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

})();