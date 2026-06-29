/* ==========================================================================
   ULTRA-PREMIUM VVIP EFFECTS (effects.js)
   Contains JS logic for particles, gyroscope tilt, scroll progress, etc.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* 1. SCROLL PROGRESS BAR & JS PARALLAX */
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    const parallaxLayers = document.querySelectorAll('.js-parallax-layer');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollPercent + '%';

        // JS Parallax Calculation
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0.2;
            // Get the element's offset relative to the viewport
            const rect = layer.parentElement.getBoundingClientRect();
            // Calculate translation based on how far the parent is from center of screen
            const yOffset = (rect.top - window.innerHeight/2) * speed;
            layer.style.transform = `translateY(${yOffset}px)`;
        });
    });

    /* 2. FIREFLIES & FALLING LEAVES (Particles) */
    const particlesContainer = document.createElement('div');
    particlesContainer.id = 'particles-container';
    document.body.appendChild(particlesContainer);

    function createParticle(type) {
        const p = document.createElement('div');
        p.className = type === 'firefly' ? 'firefly' : 'falling-leaf';
        p.style.left = Math.random() * 100 + 'vw';
        
        // Random duration and delay - Slowed down for romantic feel
        const duration = type === 'firefly' ? (6 + Math.random() * 6) : (10 + Math.random() * 8);
        
        if (type === 'firefly') {
            // float-up takes `duration`, glow takes 2s
            p.style.animationDuration = `${duration}s, 2s`;
        } else {
            p.style.animationDuration = `${duration}s`;
        }
        p.style.animationDelay = Math.random() * 8 + 's';
        
        // Random size for fireflies
        if (type === 'firefly') {
            const size = 3 + Math.random() * 5;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
        }
        
        particlesContainer.appendChild(p);

        // Remove and recreate after animation ends to prevent DOM bloat
        setTimeout(() => {
            p.remove();
            createParticle(type);
        }, (duration + 5) * 1000);
    }

    // Generate initial particles
    for(let i=0; i<15; i++) {
        createParticle('firefly');
    }
    for(let i=0; i<10; i++) {
        createParticle('falling-leaf');
    }

    /* 3. TOUCH RIPPLE EFFECT */
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    /* 4. GYROSCOPE TILT PARALLAX */
    const gyroElements = document.querySelectorAll('.gyro-element');
    if (window.DeviceOrientationEvent && gyroElements.length > 0) {
        window.addEventListener('deviceorientation', (e) => {
            // Beta: front-to-back tilt (-180 to 180)
            // Gamma: left-to-right tilt (-90 to 90)
            const beta = Math.max(-45, Math.min(45, e.beta || 0)); // Limit to +-45deg
            const gamma = Math.max(-45, Math.min(45, e.gamma || 0));
            
            const xOffset = gamma * 0.5; // Max 22.5px
            const yOffset = beta * 0.5;
            
            gyroElements.forEach(el => {
                const depth = el.getAttribute('data-depth') || 1;
                el.style.transform = `translate(${xOffset * depth}px, ${yOffset * depth}px)`;
            });
        });
    }

    /* 5. VIGNETTE & WARM OVERLAY */
    const vignette = document.createElement('div');
    vignette.className = 'vignette-overlay';
    const warmOverlay = document.createElement('div');
    warmOverlay.className = 'warm-overlay';
    document.body.appendChild(vignette);
    document.body.appendChild(warmOverlay);

    /* 6. DANCING BARS FOR MUSIC BUTTON */
    const musicBtn = document.getElementById('music-btn');
    if (musicBtn) {
        const dancingBars = document.createElement('div');
        dancingBars.className = 'dancing-bars';
        dancingBars.innerHTML = '<div class="bar"></div><div class="bar"></div><div class="bar"></div>';
        musicBtn.appendChild(dancingBars);
        musicBtn.classList.add('playing');
        
        // Existing music btn logic toggle in script.js will toggle the 'playing' class implicitly?
        // Wait, script.js replaces innerHTML of the button to change icon!
        // So I must intercept or modify the button structure safely.
        // Actually, the button is a 50x50 circle. The dancing bars can sit ON TOP of the button.
    }

    /* 7. CONFETTI EFFECT (Exported for guestbook/rsvp) */
    window.burstConfetti = function() {
        const colors = ['#FFC107', '#D32F2F', '#8B0000', '#FFFFFF'];
        for(let i=0; i<50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            // Random shape (circle or square)
            if (Math.random() > 0.5) confetti.style.borderRadius = '50%';
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3500);
        }
    };

    /* 8. MULTILINE TYPEWRITER EFFECT (JS) */
    const typewriters = document.querySelectorAll('.js-typewriter');
    const twObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
                entry.target.classList.add('typed');
                const text = entry.target.getAttribute('data-text');
                entry.target.innerHTML = '<span class="typing-cursor">|</span>';
                
                let i = 0;
                function type() {
                    if (i < text.length) {
                        entry.target.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor">|</span>';
                        i++;
                        setTimeout(type, 50); // Kecepatan ketikan
                    } else {
                        // Selesai mengetik, biarkan kursor berkedip
                    }
                }
                setTimeout(type, 600); // Delay sebelum mulai mengetik
            }
        });
    }, { threshold: 0.5 });
    
    typewriters.forEach(el => {
        el.setAttribute('data-text', el.innerText.trim());
        el.innerHTML = ''; // Kosongkan, min-height di CSS akan menahan layout
        twObserver.observe(el);
    });
});
