
(function() {
  const canvas = document.getElementById('neonParticles');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let width, height;
  
  // Gaming colors
  const COLORS = [
    { r: 0, g: 255, b: 135, a: 0.4 },    // green
    { r: 124, g: 58, b: 237, a: 0.3 },    // Electric purple
    { r: 255, g: 45, b: 117, a: 0.2 },    // Hot magenta
    { r: 0, g: 255, b: 135, a: 0.15 },    // Faint green
  ];
  
  const PARTICLE_COUNT = 35;
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  function createParticle() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.15,
      size: Math.random() * 2.5 + 0.5,
      color: color,
      life: Math.random() * 200 + 100,
      maxLife: 300,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }
  
  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }
  }
  
  function drawParticle(p) {
    const pulse = Math.sin(p.pulsePhase) * 0.3 + 0.7;
    const lifeRatio = p.life / p.maxLife;
    const alpha = p.color.a * pulse * (lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1);
    
    if (alpha <= 0.01) return;
    
    // Glow
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`);
    gradient.addColorStop(0.4, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.3})`);
    gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Core
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 1.5})`;
    ctx.fill();
  }
  
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 255, 135, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    drawConnections();
    
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.pulsePhase += p.pulseSpeed;
      
      // Subtle drift
      p.vx += (Math.random() - 0.5) * 0.01;
      p.vy += (Math.random() - 0.5) * 0.01;
      
      // Wrap around edges
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
      
      // Respawn dead particles
      if (p.life <= 0) {
        particles[i] = createParticle();
      }
      
      drawParticle(p);
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Initialize
  window.addEventListener('resize', resize);
  init();
  animate();
  
  // Pause when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
})();
