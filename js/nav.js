/* 
 * Global UI Interactions
 * Handles menu, sidebar, custom cursor, and particle systems.
 */

/* 3-Dot Menu → Sidebar Toggle */
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("active");
    menuBtn.classList.toggle("active");
  });

  // Close sidebar on outside click
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.remove("active");
      menuBtn.classList.remove("active");
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      sidebar.classList.remove("active");
      menuBtn.classList.remove("active");
    }
  });
}

/* Navbar smart auto-hide on scroll */
function initNavbarScroll() {
  const nav = document.querySelector(".premium-nav");
  if (!nav) return;

  let ticking = false;
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 40) {
          nav.classList.add("scrolled");
        } else {
          nav.classList.remove("scrolled");
        }

        // Smart auto-hide
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          nav.classList.add("nav-hidden");
        } else {
          nav.classList.remove("nav-hidden");
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* Cursor Glow Trail */
function initCursorGlow() {
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  const volumetric = document.createElement("div");
  volumetric.className = "volumetric-spotlight";
  document.body.appendChild(volumetric);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.classList.add("active");

    // Mouse tracking for proximity lighting
    document.documentElement.style.setProperty('--mouse-x', mouseX + "px");
    document.documentElement.style.setProperty('--mouse-y', mouseY + "px");
  });

  document.addEventListener("mouseleave", () => {
    glow.classList.remove("active");
  });

  // Smooth follow with lerp (GPU accelerated)
  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.transform = `translate3d(${glowX - 125}px, ${glowY - 125}px, 0)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

/* Tactile Micro-Interactions */
const UIAudioEngine = {
  hoverSound: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAACAf35+fX18fHt7enp5eXg='),
  clickSound: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAACAf317eXd1c3FvbWxramZk'),
  playHover() { this.hoverSound.volume = 0.02; this.hoverSound.currentTime = 0; this.hoverSound.play().catch(()=>{}); },
  playClick() { this.clickSound.volume = 0.05; this.clickSound.currentTime = 0; this.clickSound.play().catch(()=>{}); }
};

function initTactileFeedback() {
  const interactives = document.querySelectorAll('.btn, .category-btn, .hero-selector-item, .hero-play-btn, a, .action-btn, .menu-btn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => UIAudioEngine.playHover());
    el.addEventListener('click', function(e) {
      UIAudioEngine.playClick();
      const rect = this.getBoundingClientRect();
      let clickX = e.clientX, clickY = e.clientY;
      if(e.clientX === 0 && e.clientY === 0) {
        clickX = rect.left + rect.width / 2;
        clickY = rect.top + rect.height / 2;
      }
      createExplosion(clickX, clickY);
    });
  });
}

function createExplosion(x, y) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = x + "px";
  container.style.top = y + "px";
  container.style.zIndex = "9999";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  for(let i = 0; i < 6; i++) {
    const particle = document.createElement("div");
    particle.className = "click-particle";
    const angle = Math.random() * Math.PI * 2;
    const velocity = 18 + Math.random() * 35;
    particle.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
    particle.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');
    container.appendChild(particle);
  }
  setTimeout(() => container.remove(), 500);
}

/* Floating Particle System */
function initParticles() {
  const container = document.createElement("div");
  container.className = "particle-ambient";
  document.body.appendChild(container);

  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDelay = Math.random() * 12 + "s";
    p.style.animationDuration = (10 + Math.random() * 10) + "s";
    p.style.width = (1 + Math.random() * 2) + "px";
    p.style.height = p.style.width;
    container.appendChild(p);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNavbarScroll();
  initCursorGlow();
  initTactileFeedback();
  initParticles();
  initMagneticElements();
  initScrollReveal();
  observeCards();
  applyInteraction();
});

/* Magnetic Cursor Effect for Interactive UI */
function initMagneticElements() {
  const selectors = '.hero-play-btn, .hero-info-btn, .category-btn, .login-area .premium-btn, .action-btn, .sidebar-cat-link';
  const elements = document.querySelectorAll(selectors);
  const MAGNETIC_STRENGTH = 0.3; // 0–1, how much the element moves

  elements.forEach(el => {
    let currentTx = 0, currentTy = 0;
    let targetTx = 0, targetTy = 0;
    let magRaf = null;

    function magAnimate() {
      currentTx += (targetTx - currentTx) * 0.1;
      currentTy += (targetTy - currentTy) * 0.1;

      el.style.transform = `translate(${currentTx.toFixed(2)}px, ${currentTy.toFixed(2)}px)`;

      if (Math.abs(currentTx - targetTx) > 0.01 || Math.abs(currentTy - targetTy) > 0.01) {
        magRaf = requestAnimationFrame(magAnimate);
      } else {
        el.style.transform = '';
        magRaf = null;
      }
    }

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      targetTx = (e.clientX - cx) * MAGNETIC_STRENGTH;
      targetTy = (e.clientY - cy) * MAGNETIC_STRENGTH;

      if (!magRaf) magRaf = requestAnimationFrame(magAnimate);
    });

    el.addEventListener('mouseleave', () => {
      targetTx = 0;
      targetTy = 0;
      if (!magRaf) magRaf = requestAnimationFrame(magAnimate);
    });
  });
}

/* 
 * 3D Card Interaction System
 * Handles smooth lerp tilting, border tracing, and hover glows for game cards.
 */
function applyInteraction() {
  const cards = document.querySelectorAll(".game-card:not(.wow-init), .related-card:not(.wow-init)");

  cards.forEach((card) => {
    card.classList.add("wow-init");

    const shine = document.createElement("div");
    shine.classList.add("shine");
    card.appendChild(shine);

    const borderTrace = card.querySelector('.card-glow-trace');

    let bounds;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let targetLift = 0, currentLift = 0;
    let shineTargetX = 50, shineTargetY = 50;
    let shineCurrX = 50, shineCurrY = 50;
    let glowIntensity = 0, targetGlowIntensity = 0;
    let isHovering = false;
    let rafId = null;

    const LERP = 0.08;        
    const LIFT_LERP = 0.06;   
    const GLOW_LERP = 0.05;   
    const MAX_TILT = 4;       
    const MAX_LIFT = -8;      
    const THRESHOLD = 0.005;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function animate() {
      currentX = lerp(currentX, targetX, LERP);
      currentY = lerp(currentY, targetY, LERP);
      currentLift = lerp(currentLift, targetLift, LIFT_LERP);
      shineCurrX = lerp(shineCurrX, shineTargetX, LERP);
      shineCurrY = lerp(shineCurrY, shineTargetY, LERP);
      glowIntensity = lerp(glowIntensity, targetGlowIntensity, GLOW_LERP);

      card.style.transform = `perspective(800px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg) translateY(${currentLift.toFixed(2)}px)`;

      const glow = glowIntensity.toFixed(3);
      shine.style.background = `
        radial-gradient(ellipse at ${shineCurrX.toFixed(1)}% ${shineCurrY.toFixed(1)}%, rgba(0, 255, 135, ${(0.06 * glow).toFixed(4)}), transparent 60%),
        radial-gradient(circle at ${shineCurrX.toFixed(1)}% ${shineCurrY.toFixed(1)}%, rgba(255, 255, 255, ${(0.10 * glow).toFixed(4)}), transparent 45%)
      `;
      shine.style.opacity = glow;

      if (borderTrace) {
        borderTrace.style.setProperty('--trace-x', `${shineCurrX.toFixed(1)}%`);
        borderTrace.style.setProperty('--trace-y', `${shineCurrY.toFixed(1)}%`);
        borderTrace.style.opacity = glow;
      }

      const shadowX = currentY * 0.8;
      const shadowY = -currentX * 0.8 + 8 + (currentLift * -0.5);
      const shadowGlow = 0.05 + glowIntensity * 0.12;
      card.style.boxShadow = `
        ${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${(30 + 10 * glowIntensity).toFixed(0)}px rgba(0, 0, 0, ${(0.6 + glowIntensity * 0.2).toFixed(2)}),
        0 0 ${(20 + 15 * glowIntensity).toFixed(0)}px rgba(0, 255, 135, ${shadowGlow.toFixed(3)})
      `;

      const delta = Math.abs(currentX - targetX) + Math.abs(currentY - targetY) +
                    Math.abs(currentLift - targetLift) + Math.abs(glowIntensity - targetGlowIntensity);

      if (delta > THRESHOLD || isHovering) {
        rafId = requestAnimationFrame(animate);
      } else {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.transition = ''; 
        rafId = null;
      }
    }

    function startLoop() {
      if (!rafId) rafId = requestAnimationFrame(animate);
    }

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
      isHovering = true;
      targetLift = card.classList.contains('related-card') ? -4 : MAX_LIFT; // Less lift for sidebar cards
      targetGlowIntensity = 1;
      card.classList.add('is-hovering');
      card.style.transition = 'none'; 
      startLoop();
    });

    card.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mx = e.clientX - bounds.left;
      const my = e.clientY - bounds.top;
      const cx = bounds.width / 2;
      const cy = bounds.height / 2;

      targetX = ((my - cy) / cy) * -MAX_TILT;
      targetY = ((mx - cx) / cx) * MAX_TILT;
      shineTargetX = (mx / bounds.width) * 100;
      shineTargetY = (my / bounds.height) * 100;
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      card.classList.remove('is-hovering');
      targetX = 0;
      targetY = 0;
      targetLift = 0;
      targetGlowIntensity = 0;
      shineTargetX = 50;
      shineTargetY = 50;
      bounds = null;
      startLoop();
    });
  });
}

/* Scroll Element Reveal Observers */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -10px 0px"
  });

  document.querySelectorAll(".reveal, .section-title").forEach(el => {
    observer.observe(el);
  });
}

function observeCards() {
  const cardObserver = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, delay);
        delay += 70;
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -20px 0px"
  });

  document.querySelectorAll(".game-card:not(.observed), .related-card:not(.observed)").forEach(card => {
    card.classList.add("observed");
    cardObserver.observe(card);
  });
}
