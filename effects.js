/* ==========================================================================
   ULTRA-PREMIUM VVIP EFFECTS (effects.js)
   Contains JS logic for particles, gyroscope tilt, scroll progress, etc.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* 1. SCROLL PROGRESS BAR & JS PARALLAX (Performance Optimized) */
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    const parallaxLayers = document.querySelectorAll('.js-parallax-layer');
    const mainScroll = document.getElementById('main-scroll') || window;

    let ticking = false;
    mainScroll.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollTop = mainScroll.scrollTop || window.scrollY || document.documentElement.scrollTop;
                const scrollHeight = (mainScroll.scrollHeight || document.documentElement.scrollHeight) - (mainScroll.clientHeight || document.documentElement.clientHeight);
                const scrollPercent = (scrollTop / scrollHeight) * 100;
                progressBar.style.width = scrollPercent + '%';

                // JS Parallax Calculation - Hardware Accelerated
                parallaxLayers.forEach(layer => {
                    const speed = parseFloat(layer.getAttribute('data-speed')) || 0.2;
                    const rect = layer.parentElement.getBoundingClientRect();
                    // Using rect.top directly ensures that when a section is at the top of the viewport, it has 0 offset.
                    const yOffset = rect.top * speed;
                    layer.style.transform = `translate3d(0, ${yOffset}px, 0)`;
                });

                // --- CUSTOM HERO CINEMATIC SCROLL ---
                const heroGroup = document.querySelector('section[aria-label="Sampul undangan"]');
                if (heroGroup) {
                    const heroRect = heroGroup.getBoundingClientRect();
                    // Only animate if the hero is visible or scrolling out
                    if (heroRect.top <= 0 && heroRect.bottom > 0) {
                        // Progress goes from 0 (at top) to 1 (scrolled out completely)
                        let progress = Math.abs(heroRect.top) / window.innerHeight;
                        // Clamp progress
                        progress = Math.min(1, Math.max(0, progress));

                        const goldLeft = document.querySelector('.js-hero-gold-left');
                        const goldRight = document.querySelector('.js-hero-gold-right');
                        const photo = document.querySelector('.js-hero-photo');
                        const motifAtas = document.querySelector('.js-hero-motif-atas');
                        const motifBawah = document.querySelector('.js-hero-motif-bawah');

                        // Gold motifs move OUT of the screen (Left goes left, Right goes right)
                        // At progress 1, they should move enough to disappear (e.g., -50vw and 50vw)
                        if (goldLeft) goldLeft.style.transform = `translateX(${-progress * 50}vw)`;
                        if (goldRight) goldRight.style.transform = `translateX(${progress * 50}vw) scaleX(-1)`; // Keep the scaleX(-1)

                        // Sequential text fade-out on scroll
                        const texts = document.querySelectorAll('.js-hero-text');
                        if (texts.length > 0) {
                            texts.forEach((el, index) => {
                                // Split the scroll progress into stages for each text element
                                // Multiply by 0.4 so the whole sequence finishes very fast (by 40% of the scroll)
                                const step = 0.4 / texts.length;
                                const start = index * step;
                                const end = start + step;
                                
                                let opacity = 1;
                                if (progress > start) {
                                    if (progress >= end) {
                                        opacity = 0;
                                    } else {
                                        opacity = 1 - ((progress - start) / step);
                                    }
                                }
                                el.style.opacity = opacity;
                                el.style.transform = `translateY(${-(1 - opacity) * 15}px)`;
                            });
                        }

                        // Bersama photo shrinks down faster and moves downwards
                        // Set transform-origin to bottom so it stays grounded with the motif
                        if (photo) {
                            photo.style.transformOrigin = 'bottom center';
                            photo.style.transform = `translateY(${progress * 15}vh) scale(${Math.max(0, 1 - (progress * 1.5))})`;
                        }

                        // Black motifs move IN to act like a closing curtain
                        // motifAtas should stick to the top of the viewport until it touches motifBawah
                        if (motifAtas && motifBawah) {
                            const topHeight = motifAtas.offsetHeight;
                            const bottomHeight = motifBawah.offsetHeight;
                            // The maximum distance motifAtas can travel down before it touches motifBawah
                            const maxTranslate = heroRect.height - topHeight - bottomHeight;
                            
                            let translateAtas = Math.abs(heroRect.top);
                            if (translateAtas > maxTranslate) {
                                translateAtas = maxTranslate; // Cap the movement so they stick together
                            }
                            motifAtas.style.transform = `translateY(${translateAtas}px)`;
                            motifBawah.style.transform = `translateY(0)`; // Let it scroll up naturally with the section
                        }
                    } else if (heroRect.top > 0) {
                        // Reset everything if scrolled back above (rare, but safe)
                        const goldLeft = document.querySelector('.js-hero-gold-left');
                        const goldRight = document.querySelector('.js-hero-gold-right');
                        const photo = document.querySelector('.js-hero-photo');
                        const motifAtas = document.querySelector('.js-hero-motif-atas');
                        const motifBawah = document.querySelector('.js-hero-motif-bawah');
                        const texts = document.querySelectorAll('.js-hero-text');

                        if (goldLeft) goldLeft.style.transform = `translateX(0)`;
                        if (goldRight) goldRight.style.transform = `translateX(0) scaleX(-1)`;
                        if (photo) photo.style.transform = `scale(1)`;
                        if (motifAtas) motifAtas.style.transform = `translateY(0)`;
                        if (motifBawah) motifBawah.style.transform = `translateY(0)`;
                        if (texts.length > 0) {
                            texts.forEach(el => {
                                el.style.opacity = 1;
                                el.style.transform = `translateY(0)`;
                            });
                        }
                    }
                }
                // ------------------------------------
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    /* 2. FIREFLIES & FALLING LEAVES (Particles) */
    const particlesContainer = document.createElement('div');
    particlesContainer.id = 'particles-container';
    document.body.appendChild(particlesContainer);

    function createParticle(type) {
        const p = document.createElement('div');
        p.className = type === 'firefly' ? 'firefly' : 'falling-leaf';
        p.style.left = Math.random() * 100 + 'vw';
        
        if (type === 'firefly') {
            p.style.top = Math.random() * 100 + 'vh';
            
            // Random duration & delay for glow (index 0) and drift (index 1)
            const driftDuration = 10 + Math.random() * 10; // 10s to 20s drift
            const glowDuration = 3 + Math.random() * 3; // 3s to 6s blink
            p.style.animationDuration = `${glowDuration}s, ${driftDuration}s`;
            p.style.animationDelay = `-${Math.random() * glowDuration}s, -${Math.random() * driftDuration}s`;
            
            // Randomize X and Y translation boundaries for unique paths
            p.style.setProperty('--x1', `${-35 + Math.random() * 70}px`);
            p.style.setProperty('--y1', `${-40 + Math.random() * 80}px`);
            p.style.setProperty('--x2', `${-35 + Math.random() * 70}px`);
            p.style.setProperty('--y2', `${-40 + Math.random() * 80}px`);
            p.style.setProperty('--x3', `${-35 + Math.random() * 70}px`);
            p.style.setProperty('--y3', `${-40 + Math.random() * 80}px`);
            
            const size = 3 + Math.random() * 4;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
        } else {
            p.style.top = '-50px';
            const duration = 10 + Math.random() * 8;
            p.style.animationDuration = `${duration}s`;
            p.style.animationDelay = `-${Math.random() * duration}s`;
            
            // Kalimantan dry forest foliage color palette (harmonious warm earth tones)
            const leafColors = [
                '#8C4F2B', // Dried copper sienna
                '#9E6F43', // Warm mahogany tan
                '#B8860B', // Earthy ochre gold
                '#7A6038', // Muted olive clay
                '#8C7350', // Soft dried branch brown
                '#5C6E3D'  // Dried rainforest leaf green
            ];
            p.style.backgroundColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            
            p.addEventListener('animationiteration', () => {
                p.style.left = Math.random() * 100 + 'vw';
                p.style.backgroundColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            });
        }
        
        particlesContainer.appendChild(p);
    }

    // Generate initial particles
    for(let i=0; i<20; i++) {
        createParticle('firefly');
    }
    for(let i=0; i<15; i++) {
        createParticle('falling-leaf');
    }

    /* 3. TOUCH RIPPLE EFFECT (Hardware Accelerated) */
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        ripple.style.setProperty('--tx', e.clientX + 'px');
        ripple.style.setProperty('--ty', e.clientY + 'px');
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    /* 4. GYROSCOPE TILT PARALLAX (iOS 13+ Safari & Chrome Compliant) */
    const gyroElements = document.querySelectorAll('.gyro-element');
    
    if (gyroElements.length > 0) {
        let gyroInitialized = false;

        function initGyroscope() {
            if (gyroInitialized) return;
            gyroInitialized = true;

            window.addEventListener('deviceorientation', (e) => {
                const beta = Math.max(-45, Math.min(45, e.beta || 0)); 
                const gamma = Math.max(-45, Math.min(45, e.gamma || 0));
                
                const xOffset = gamma * 0.5; 
                const yOffset = beta * 0.5;
                
                gyroElements.forEach(el => {
                    const depth = el.getAttribute('data-depth') || 1;
                    el.style.transform = `translate3d(${xOffset * depth}px, ${yOffset * depth}px, 0)`;
                });
            });
        }

        // iOS requires explicit user interaction to grant sensor permissions
        function requestGyroPermission() {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            initGyroscope();
                        }
                    })
                    .catch(error => {
                        console.warn("Gyroscope permission denied or errored:", error);
                    });
            } else {
                // Non-iOS or Android browsers
                initGyroscope();
            }
        }

        // Bind permission request to the "Buka Undangan" envelope button or general page interaction
        const openEnvelopeBtn = document.querySelector('button[onclick="openInvitation()"]');
        if (openEnvelopeBtn) {
            openEnvelopeBtn.addEventListener('click', requestGyroPermission, { once: true });
        }
        
        // Fallback for general touch trigger
        document.addEventListener('click', requestGyroPermission, { once: true });
    }

    /* 5. VIGNETTE & WARM OVERLAY */
    const vignette = document.createElement('div');
    vignette.className = 'vignette-overlay';
    const warmOverlay = document.createElement('div');
    warmOverlay.className = 'warm-overlay';
    document.body.appendChild(vignette);
    document.body.appendChild(warmOverlay);


    /* 7. CONFETTI EFFECT */
    window.burstConfetti = function() {
        const colors = ['#FFC107', '#D32F2F', '#8B0000', '#FFFFFF'];
        for(let i=0; i<50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
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
                        setTimeout(type, 50); 
                    }
                }
                setTimeout(type, 600); 
            }
        });
    }, { threshold: 0.5 });
    
    typewriters.forEach(el => {
        el.setAttribute('data-text', el.innerText.trim());
        el.innerHTML = ''; 
        twObserver.observe(el);
    });
});
