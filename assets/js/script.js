/* ========================================
   Nithiyarasan P — AI Engineer Portfolio
   Full Flow Script + Scroll Frame Sequencer
   + Sound Control + Immersive 3D Scroll
   ======================================== */

(function () {
    'use strict';

    // --- DOM ---
    const overlay = document.getElementById('loading-overlay');
    const heroVideo = document.getElementById('hero-video');
    const heroContent = document.getElementById('hero-content');
    const heroSection = document.getElementById('hero');
    const videoWrapper = document.getElementById('video-wrapper');
    const zoomFlash = document.getElementById('zoom-flash');
    const btnCheckDetail = document.getElementById('btn-check-detail');
    const newVideoSection = document.getElementById('new-video-section');
    const newVideo = document.getElementById('new-video');
    const wmBlocker = document.getElementById('wm-blocker');
    const detailSection = document.getElementById('detail-section');
    const btnReplay = document.getElementById('btn-replay');
    const soundToggle = document.getElementById('sound-toggle');

    let hasTransitioned = false;
    let loadingDone = false;
    let soundEnabled = true; // Sound ON by default
    const LOADING_DURATION = 2500;

    // ========================================
    // SOUND TOGGLE
    // ========================================
    function updateSoundState() {
        const onIcon = soundToggle.querySelector('.sound-on-icon');
        const offIcon = soundToggle.querySelector('.sound-off-icon');

        if (soundEnabled) {
            soundToggle.classList.remove('muted');
            onIcon.style.display = '';
            offIcon.style.display = 'none';
            if (heroVideo) heroVideo.muted = false;
            if (newVideo) newVideo.muted = false;
        } else {
            soundToggle.classList.add('muted');
            onIcon.style.display = 'none';
            offIcon.style.display = '';
            if (heroVideo) heroVideo.muted = true;
            if (newVideo) newVideo.muted = true;
        }
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            updateSoundState();
        });
    }

    // ========================================
    // FLOATING CYBERPUNK NAV BAR
    // ========================================
    const cyberNav = document.getElementById('cyber-nav');
    const navLinks = document.querySelectorAll('.cyber-nav .nav-link');
    const navIndicator = document.getElementById('nav-indicator');
    const sectionIds = ['hero', 'about-section', 'skills-section', 'projects-section', 'experience-section', 'contact-section'];

    // Smooth scroll on nav link click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Move the sliding indicator to the active link
    function moveNavIndicator(activeLink) {
        if (!navIndicator || !activeLink) return;
        const navInner = activeLink.parentElement;
        const navRect = navInner.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const offsetLeft = linkRect.left - navRect.left;
        navIndicator.style.left = (offsetLeft + 8) + 'px';
        navIndicator.style.width = linkRect.width + 'px';
    }

    // Track active section on scroll
    function updateActiveNav() {
        let currentSection = 'hero';
        const scrollY = window.scrollY + window.innerHeight / 3;

        for (const id of sectionIds) {
            const section = document.getElementById(id);
            if (section && section.offsetTop <= scrollY) {
                currentSection = id;
            }
        }

        navLinks.forEach(link => {
            const isActive = link.getAttribute('data-section') === currentSection;
            link.classList.toggle('active', isActive);
            if (isActive) moveNavIndicator(link);
        });
    }

    // Scroll listener with throttle
    let navScrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!navScrollTicking) {
            requestAnimationFrame(() => {
                updateActiveNav();
                navScrollTicking = false;
            });
            navScrollTicking = true;
        }
    });

    // Initial position
    setTimeout(() => {
        const firstActive = document.querySelector('.cyber-nav .nav-link.active');
        if (firstActive) moveNavIndicator(firstActive);
    }, 100);

    // ========================================
    // OPTIMUS PRIME SCROLL-DRIVEN FRAME SEQUENCER
    // (Apple-style canvas frame animation)
    // ========================================
    const canvas = document.getElementById('optimus-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const FRAME_COUNT = 121;
    const frames = [];
    let imagesLoaded = 0;
    let currentFrame = 0;

    // Build frame path: frames/frame_0001.jpg → frames/frame_0121.jpg
    function framePath(index) {
        const num = String(index + 1).padStart(4, '0');
        return `assets/images/frames/frame_${num}.jpg`;
    }

    // Preload all frames
    function preloadFrames() {
        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            img.src = framePath(i);
            img.onload = () => {
                imagesLoaded++;
                // Show canvas once enough frames are loaded (first 20 for fast start)
                if (imagesLoaded === 20 && canvas) {
                    canvas.classList.add('loaded');
                    drawFrame(0);
                }
                // All loaded — ensure first frame is drawn cleanly
                if (imagesLoaded === FRAME_COUNT) {
                    drawFrame(currentFrame);
                }
            };
            frames[i] = img;
        }
    }

    // Draw a specific frame to canvas — cover-fit like CSS object-fit: cover
    function drawFrame(frameIndex) {
        if (!ctx || !frames[frameIndex] || !frames[frameIndex].complete) return;

        const img = frames[frameIndex];
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        // Cover-fit calculation
        const scale = Math.max(cw / iw, ch / ih);
        const sw = iw * scale;
        const sh = ih * scale;
        const dx = (cw - sw) / 2;
        const dy = (ch - sh) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, sw, sh);
    }

    // Resize canvas to match viewport
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawFrame(currentFrame);
    }

    // Initialize the frame sequencer
    if (canvas && ctx) {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        preloadFrames();
    }

    // ========================================
    // PHASE 1: Click-to-Enter → Hero plays with SOUND
    // ========================================
    window.addEventListener('DOMContentLoaded', () => {
        document.body.style.overflow = 'hidden';

        const enterOverlay = document.getElementById('enter-overlay');
        
        if (enterOverlay) {
            enterOverlay.addEventListener('click', () => {
                // User clicked! Browser now allows audio playback.
                enterOverlay.style.opacity = '0';
                enterOverlay.style.visibility = 'hidden';
                
                setTimeout(() => enterOverlay.remove(), 900);

                document.body.style.overflow = '';
                loadingDone = true;
                firstInteraction = true;

                if (heroVideo) {
                    heroVideo.loop = false;
                    heroVideo.muted = false; // Audio guaranteed after user click
                    heroVideo.currentTime = 0;
                    heroVideo.play().catch(() => {});
                }

                setTimeout(() => {
                    if (heroContent) heroContent.classList.add('visible');
                    if (cyberNav) cyberNav.classList.remove('hidden');
                }, 300);
            });
        }
    });

    // Enable sound on first user interaction (bypass autoplay policy)
    let firstInteraction = false;
    function enableSoundOnInteraction() {
        if (firstInteraction) return;
        firstInteraction = true;
        if (soundEnabled) {
            if (heroVideo) heroVideo.muted = false;
            if (newVideo) newVideo.muted = false;
        }
        document.removeEventListener('click', enableSoundOnInteraction);
        document.removeEventListener('touchstart', enableSoundOnInteraction);
        document.removeEventListener('scroll', enableSoundOnInteraction);
    }
    document.addEventListener('click', enableSoundOnInteraction);
    document.addEventListener('touchstart', enableSoundOnInteraction);
    document.addEventListener('scroll', enableSoundOnInteraction);

    // ========================================
    // GSAP SCROLL → FRAME MAPPING
    // ========================================
    window.addEventListener('load', () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        // Create a scroll-driven object that maps scroll progress to frame index
        const frameObj = { frame: 0 };

        gsap.to(frameObj, {
            frame: FRAME_COUNT - 1,
            snap: 'frame', // Snap to whole frame numbers
            ease: 'none',
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.5 // Smooth scrubbing
            },
            onUpdate: () => {
                const newFrame = Math.round(frameObj.frame);
                if (newFrame !== currentFrame) {
                    currentFrame = newFrame;
                    drawFrame(currentFrame);
                }
            }
        });

        // Hide canvas when entering "Check Detail" cinematic transition
        if (btnCheckDetail && canvas) {
            btnCheckDetail.addEventListener('click', () => {
                gsap.to(canvas, { opacity: 0, duration: 0.8 });
            });
        }

        // Restore canvas when returning home
        const btnHome = document.getElementById('btn-home');
        if (btnHome && canvas) {
            btnHome.addEventListener('click', () => {
                gsap.to(canvas, { opacity: 1, duration: 0.6 });
            });
        }

        // ========================================
        // IMMERSIVE 3D SCROLL ANIMATIONS (GSAP)
        // ========================================

        // Cyberpunk Text Scrambler Effect (Preserves HTML Tags)
        function scrambleTextNodes(element) {
            const textNodes = [];
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                if (node.nodeValue.trim() !== '') {
                    textNodes.push({ node: node, originalText: node.nodeValue });
                }
            }

            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+<>[]";
            
            textNodes.forEach(item => {
                const finalString = item.originalText;
                let iteration = 0;
                const speed = 25 + Math.random() * 15;

                const interval = setInterval(() => {
                    item.node.nodeValue = finalString.split("").map((letter, index) => {
                        if (letter === ' ' || letter === '\n') return letter;
                        if(index < iteration) return finalString[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join("");

                    if(iteration >= finalString.length) {
                        clearInterval(interval);
                        item.node.nodeValue = finalString;
                    }
                    iteration += 1/3;
                }, speed);
            });
        }

        document.querySelectorAll('.glitch-title').forEach(title => {
            gsap.set(title, { autoAlpha: 1 }); // ensure visible
            ScrollTrigger.create({
                trigger: title,
                start: 'top 85%',
                onEnter: () => scrambleTextNodes(title),
                once: true
            });
        });

        // 3D Card Assembly Reveal (Fractured to Solid)
        gsap.set('.card-3d-reveal', { autoAlpha: 0 });
        document.querySelectorAll('.card-3d-reveal').forEach((card) => {
            const delay = parseFloat(card.getAttribute('data-delay')) || 0;
            gsap.fromTo(card,
                { autoAlpha: 0, rotateX: 60, rotateY: 30, scale: 0.6, z: -500, y: 150 },
                {
                    autoAlpha: 1, rotateX: 0, rotateY: 0, scale: 1, z: 0, y: 0,
                    duration: 1.5, ease: 'back.out(1.4)',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    delay: delay
                }
            );
        });

        // Magnetic UI Buttons Effect
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
                const innerSvg = btn.querySelector('svg');
                if (innerSvg) gsap.to(innerSvg, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
                const innerSvg = btn.querySelector('svg');
                if (innerSvg) gsap.to(innerSvg, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
            });
        });

        // Parallax effect on section particles
        document.querySelectorAll('.section-particles').forEach(el => {
            gsap.to(el, {
                y: -80,
                scrollTrigger: {
                    trigger: el.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        // Skill bars fill animation
        document.querySelectorAll('.bar-fill').forEach(bar => {
            const width = bar.getAttribute('data-width');
            gsap.to(bar, {
                width: width + '%',
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: bar,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Counter animation for stats
        document.querySelectorAll('.mini-stat-value').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            gsap.to(counter, {
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // 3D tilt on skill cards via GSAP
        document.querySelectorAll('.skill-card-inner').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    duration: 0.3,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });

        // Project card hover glow follows mouse
        document.querySelectorAll('.project-card').forEach(card => {
            const glow = card.querySelector('.project-card-glow');
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0,242,254,0.06) 0%, transparent 50%)`;
            });
        });
    });

    // ========================================
    // PHASE 2: Click Check Detail → Zoom → New Video
    // ========================================
    if (btnCheckDetail) {
        btnCheckDetail.addEventListener('click', () => {
            if (hasTransitioned || !loadingDone) return;
            hasTransitioned = true;
            document.body.style.overflow = 'hidden';

            // Hide nav during cinematic
            if (cyberNav) cyberNav.classList.add('cinematic-hide');

            // Fade out hero text
            if (heroContent) heroContent.classList.add('fade-away');

            // Zoom into eyes
            setTimeout(() => {
                if (videoWrapper) videoWrapper.classList.add('zooming');
            }, 300);

            // Flash
            setTimeout(() => {
                if (zoomFlash) zoomFlash.classList.add('active');
            }, 1000);
            
            // Hide watermark blocker initially
            if (wmBlocker) wmBlocker.classList.remove('visible');

            // Show new video section behind flash
            setTimeout(() => {
                if (newVideoSection) newVideoSection.classList.add('active');
                if (newVideo) {
                    newVideo.currentTime = 0;
                    newVideo.muted = !soundEnabled;
                    newVideo.play().catch(() => {});
                }
            }, 1300);

            // Fade out flash
            setTimeout(() => {
                if (zoomFlash) {
                    zoomFlash.classList.remove('active');
                    zoomFlash.classList.add('dim');
                }
                if (heroSection) heroSection.style.display = 'none';
            }, 1600);

            // Clean flash
            setTimeout(() => {
                if (zoomFlash) zoomFlash.classList.remove('dim');
            }, 2600);
        });
    }

    // ========================================
    // PHASE 3: New Video timeupdate — stars in last 6s
    // ========================================
    if (newVideo) {
        newVideo.addEventListener('timeupdate', () => {
            const timeLeft = newVideo.duration - newVideo.currentTime;
            if (timeLeft <= 6 && wmBlocker) {
                wmBlocker.classList.add('visible');
            } else if (wmBlocker) {
                wmBlocker.classList.remove('visible');
            }
        });

        // When video ends → show detail section
        newVideo.addEventListener('ended', () => {
            // Hide video
            setTimeout(() => {
                if (newVideoSection) newVideoSection.classList.remove('active');
            }, 500);

            // Show detail section
            setTimeout(() => {
                if (detailSection) detailSection.classList.add('active');
            }, 800);

            // Hide stars
            if (wmBlocker) wmBlocker.classList.remove('visible');
        });
    }

    const btnHome = document.getElementById('btn-home');

    // ========================================
    // REPLAY — replay only the new_video
    // ========================================
    if (btnReplay) {
        btnReplay.addEventListener('click', () => {
            // Hide detail
            if (detailSection) detailSection.classList.remove('active');
            
            // Show new video section & play
            if (newVideoSection) newVideoSection.classList.add('active');
            if (newVideo) {
                newVideo.currentTime = 0;
                newVideo.muted = !soundEnabled;
                newVideo.play().catch(() => {});
            }
            if (wmBlocker) wmBlocker.classList.remove('visible');
        });
    }

    // ========================================
    // HOME — reset everything
    // ========================================
    if (btnHome) {
        btnHome.addEventListener('click', () => {
            // Hide detail
            if (detailSection) detailSection.classList.remove('active');
            if (newVideoSection) newVideoSection.classList.remove('active');
            if (newVideo) { newVideo.pause(); newVideo.currentTime = 0; }
            if (wmBlocker) wmBlocker.classList.remove('visible');

            // Reset hero
            if (heroSection) heroSection.style.display = '';
            if (videoWrapper) videoWrapper.classList.remove('zooming');
            if (heroContent) {
                heroContent.classList.remove('fade-away');
                heroContent.classList.add('visible');
            }

            // Show fetched details on home screen next to Hi
            const heroDetails = document.getElementById('hero-details');
            if (heroDetails) {
                heroDetails.style.display = 'block';
                // Trigger reflow for animation
                void heroDetails.offsetWidth;
                heroDetails.classList.add('show');
            }

            document.body.style.overflow = '';

            // Show nav again
            if (cyberNav) cyberNav.classList.remove('cinematic-hide');
            hasTransitioned = false;
            
            // Scroll back to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========================================
    // SCROLL REVEAL OBSERVER
    // ========================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseFloat(entry.target.getAttribute('data-delay')) || 0;
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay * 1000);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px'
    });

    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // ========================================
    // NARRATE PROTOCOL (Audio with Auto-Scroll)
    // ========================================
    const btnNarrate = document.getElementById('btn-narrate');
    const optimusVisualizer = document.getElementById('optimus-visualizer');
    
    if (btnNarrate) {
        let narrateAudio = new Audio('assets/audio/narration.mp3');
        let isPlaying = false;
        
        // --- AUTO-SCROLL TIMINGS (EXACT from audio) ---
        // Part1=13s, Part2=12s, Part3=16s, Part4=17s, Part5=12s, then music till 5:14
        const scrollSchedule = [
            { time: 0,   id: 'top' },
            { time: 1,   id: 'about-section' },
            { time: 13,  id: 'skills-section' },
            { time: 25,  id: 'experience-section' },
            { time: 41,  id: 'projects-section' },
            { time: 58,  id: 'contact-section' },
            { time: 70,  id: 'prime-overlay' }
        ];
        
        let currentScheduleIndex = 0;

        function cancelScroll() {}

        // Pause heavy animations during narration for smooth scrolling
        function enterNarrationMode() {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.getAll().forEach(st => st.disable(false));
            }
            const optimusCanvas = document.getElementById('optimus-canvas');
            if (optimusCanvas) optimusCanvas.style.opacity = '0';
        }

        function exitNarrationMode() {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.getAll().forEach(st => st.enable(false));
                ScrollTrigger.refresh();
            }
            const optimusCanvas = document.getElementById('optimus-canvas');
            if (optimusCanvas) optimusCanvas.style.opacity = '1';
        }

        function executeScroll(point) {
            if (point.id === 'top') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            if (point.id === 'prime-overlay') {
                document.getElementById('prime-overlay').classList.add('active');
                return;
            }
            
            const targetEl = document.getElementById(point.id);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Create the "I AM PRIME" cinematic overlay dynamically
        const primeOverlay = document.createElement('div');
        primeOverlay.id = 'prime-overlay';
        primeOverlay.innerHTML = `
            <img src="assets/images/prime-overlay-bg.png" alt="Prime Background" class="prime-fullscreen-img">
            <button id="btn-exit-prime" class="btn-exit-prime magnetic-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                STOP & EXIT
            </button>
        `;
        document.body.appendChild(primeOverlay);

        const btnExitPrime = document.getElementById('btn-exit-prime');
        btnExitPrime.addEventListener('click', () => {
            // Stop audio
            narrateAudio.pause();
            narrateAudio.currentTime = 0;
            isPlaying = false;
            cancelScroll();
            exitNarrationMode();
            
            // Reset UI
            btnNarrate.innerHTML = '<span class="narrate-icon"></span>NARRATE';
            btnNarrate.classList.remove('active');
            btnNarrate.style.color = '';
            btnNarrate.style.borderColor = '';
            btnNarrate.style.boxShadow = '';
            if (optimusVisualizer) optimusVisualizer.classList.remove('active');
            hidePrimeOverlay();
            currentScheduleIndex = 0;
        });

        function hidePrimeOverlay() {
            primeOverlay.classList.remove('active');
        }

        narrateAudio.addEventListener('timeupdate', () => {
            if (!isPlaying) return;
            
            const currentTime = narrateAudio.currentTime;
            
            // Check if we need to advance to the next schedule point
            if (currentScheduleIndex < scrollSchedule.length - 1) {
                const nextPoint = scrollSchedule[currentScheduleIndex + 1];
                
                if (currentTime >= nextPoint.time) {
                    currentScheduleIndex++;
                    executeScroll(scrollSchedule[currentScheduleIndex]);
                }
            }
        });

        // Reset UI when audio ends
        narrateAudio.addEventListener('ended', () => {
            isPlaying = false;
            cancelScroll();
            exitNarrationMode();
            btnNarrate.innerHTML = '<span class="narrate-icon"></span>NARRATE';
            btnNarrate.classList.remove('active');
            btnNarrate.style.color = '';
            btnNarrate.style.borderColor = '';
            btnNarrate.style.boxShadow = '';
            if (optimusVisualizer) optimusVisualizer.classList.remove('active');
            hidePrimeOverlay();
            currentScheduleIndex = 0;
        });

        btnNarrate.addEventListener('click', () => {
            if (isPlaying) {
                // Stop audio
                narrateAudio.pause();
                narrateAudio.currentTime = 0;
                isPlaying = false;
                cancelScroll();
                exitNarrationMode();
                
                // Reset UI
                btnNarrate.innerHTML = '<span class="narrate-icon"></span>NARRATE';
                btnNarrate.classList.remove('active');
                btnNarrate.style.color = '';
                btnNarrate.style.borderColor = '';
                btnNarrate.style.boxShadow = '';
                if (optimusVisualizer) optimusVisualizer.classList.remove('active');
                hidePrimeOverlay();
                currentScheduleIndex = 0;
                return;
            }
            
            // Start audio
            narrateAudio.currentTime = 0;
            currentScheduleIndex = 0;
            
            narrateAudio.play().then(() => {
                isPlaying = true;
                enterNarrationMode();
                
                // Update UI to active state
                btnNarrate.innerHTML = '[ SCRIBING... ]';
                btnNarrate.classList.add('active');
                btnNarrate.style.color = '#00f2fe';
                btnNarrate.style.borderColor = '#00f2fe';
                btnNarrate.style.boxShadow = '0 0 20px rgba(0,242,254,0.4)';
                if (optimusVisualizer) optimusVisualizer.classList.add('active');
                
                // Jump to top immediately upon starting
                gsap.to(window, { scrollTo: 0, duration: 0.8, ease: 'power2.out' });
            }).catch(err => {
                console.error("Audio playback failed:", err);
                alert("Please make sure you have placed the audio file 'narration.mp3' in your project folder!");
            });
        });
    }

    // ========================================
    // SPINNING WHEEL — SPIN BUTTON
    // ========================================
    const spinBtn = document.getElementById('spinBtn');
    const spinWheel = document.getElementById('spinWheel');
    if (spinBtn && spinWheel) {
        let spinning = false;
        spinBtn.addEventListener('click', () => {
            if (spinning) return;
            spinning = true;
            spinWheel.classList.add('boosted');
            spinBtn.style.pointerEvents = 'none';
            spinBtn.querySelector('.spin-btn-icon').style.transform = 'rotate(1080deg)';
            spinBtn.querySelector('.spin-btn-icon').style.transition = 'transform 2.5s cubic-bezier(0.2,0.8,0.3,1)';

            setTimeout(() => {
                spinWheel.classList.remove('boosted');
                spinBtn.style.pointerEvents = '';
                spinBtn.querySelector('.spin-btn-icon').style.transform = '';
                spinBtn.querySelector('.spin-btn-icon').style.transition = 'transform 0.6s ease';
                spinning = false;
            }, 2500);
        });
    }

    // ========================================
    // DIGITAL BOARD — ANIMATE BARS ON SCROLL
    // ========================================
    const boardFills = document.querySelectorAll('.board-fill');
    if (boardFills.length > 0) {
        const boardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fills = entry.target.querySelectorAll('.board-fill');
                    fills.forEach((fill, i) => {
                        const w = fill.getAttribute('data-width');
                        fill.style.setProperty('--target-width', w + '%');
                        setTimeout(() => {
                            fill.classList.add('animated');
                        }, i * 120);
                    });
                    boardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const board = document.querySelector('.digital-board');
        if (board) boardObserver.observe(board);
    }

    // ========================================
    // LEADERBOARD — ANIMATE POWER BARS ON SCROLL
    // ========================================
    const lbPanel = document.getElementById('leaderboard-panel');
    if (lbPanel) {
        const lbObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate power fill bars with stagger
                    const fills = lbPanel.querySelectorAll('.lb-power-fill');
                    fills.forEach((fill, i) => {
                        const power = fill.getAttribute('data-power');
                        fill.style.setProperty('--lb-target', power + '%');
                        setTimeout(() => {
                            fill.classList.add('animated');
                        }, i * 150);
                    });

                    // Animate energon meter
                    const energonFill = document.getElementById('lb-energon-fill');
                    if (energonFill) {
                        setTimeout(() => {
                            energonFill.classList.add('animated');
                        }, fills.length * 150 + 200);
                    }

                    lbObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        lbObserver.observe(lbPanel);
    }

    // ========================================
    // LEADERBOARD — FACTION TOGGLE
    // ========================================
    const factionToggle = document.getElementById('lb-faction-toggle');
    if (factionToggle) {
        factionToggle.addEventListener('click', (e) => {
            const label = e.target.closest('.lb-faction-label');
            if (!label || label.classList.contains('active')) return;

            factionToggle.querySelectorAll('.lb-faction-label').forEach(l => l.classList.remove('active'));
            label.classList.add('active');

            // Visual feedback — flash rows
            const rows = document.querySelectorAll('.lb-row');
            rows.forEach((row, i) => {
                row.style.transition = 'none';
                row.style.opacity = '0';
                row.style.transform = 'translateX(-10px)';
                setTimeout(() => {
                    row.style.transition = 'all 0.35s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                }, 50 + i * 60);
            });
        });
    }

    // ========================================
    // 3D CIRCULAR RING CAROUSEL
    // ========================================
    var cCards = document.querySelectorAll('.carousel-card');
    var cTrack = document.getElementById('carouselTrack');
    var cPrev = document.getElementById('carouselPrev');
    var cNext = document.getElementById('carouselNext');
    var cDotsBox = document.getElementById('carouselDots');
    var cCurrent = 0;
    var cTotal = cCards.length;
    var cAutoTimer = null;

    if (cTotal > 0 && cTrack) {
        // Calculate the angle between each card and the radius
        var cAngle = 360 / cTotal;
        var cRadius = window.innerWidth < 768 ? 600 : 1050; // distance from center

        // Position each card around the ring
        cCards.forEach(function(card, i) {
            var angle = cAngle * i;
            card.style.transform = 'rotateY(' + angle + 'deg) translateZ(' + cRadius + 'px)';
        });

        // Generate dots
        if (cDotsBox) {
            for (var i = 0; i < cTotal; i++) {
                var dot = document.createElement('span');
                dot.classList.add('carousel-dot');
                if (i === 0) dot.classList.add('active');
                (function(idx) {
                    dot.addEventListener('click', function() { cGoTo(idx); });
                })(i);
                cDotsBox.appendChild(dot);
            }
        }

        function cUpdate() {
            // Rotate the track so the current card faces front, pushed back to preserve scale
            var rotation = -(cAngle * cCurrent);
            cTrack.style.transform = 'translateZ(-' + cRadius + 'px) rotateY(' + rotation + 'deg)';

            // Mark active card
            cCards.forEach(function(card, i) {
                if (i === cCurrent) {
                    card.classList.add('is-active');
                } else {
                    card.classList.remove('is-active');
                }
            });

            // Update dots
            var dots = document.querySelectorAll('.carousel-dot');
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === cCurrent);
            });
        }

        function cGoTo(index) {
            cCurrent = ((index % cTotal) + cTotal) % cTotal;
            cUpdate();
            cResetAuto();
        }

        function cNextSlide() { cGoTo(cCurrent + 1); }
        function cPrevSlide() { cGoTo(cCurrent - 1); }

        if (cPrev) cPrev.addEventListener('click', cPrevSlide);
        if (cNext) cNext.addEventListener('click', cNextSlide);

        // Keyboard nav
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') cPrevSlide();
            if (e.key === 'ArrowRight') cNextSlide();
        });

        // Touch swipe
        var cTouchX = 0;
        var cEl = document.getElementById('projectCarousel');
        if (cEl) {
            cEl.addEventListener('touchstart', function(e) {
                cTouchX = e.touches[0].clientX;
            }, { passive: true });
            cEl.addEventListener('touchend', function(e) {
                var diff = cTouchX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) cNextSlide();
                    else cPrevSlide();
                }
            }, { passive: true });
        }

        // Auto rotate
        function cStartAuto() {
            cAutoTimer = setInterval(cNextSlide, 4000);
        }
        function cResetAuto() {
            clearInterval(cAutoTimer);
            cStartAuto();
        }

        // Init
        cUpdate();
        cStartAuto();

        // Pause on hover
        if (cEl) {
            cEl.addEventListener('mouseenter', function() { clearInterval(cAutoTimer); });
            cEl.addEventListener('mouseleave', cStartAuto);
        }
    }

})();
