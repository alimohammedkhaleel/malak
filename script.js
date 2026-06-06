// --- Audio Setup ---
const audioPlayer = document.getElementById('local-audio');
const playBtn = document.getElementById('playBtn');
const playIconEl = document.getElementById('playIcon');
const equalizerEl = document.getElementById('equalizer');
let isPlaying = false;

const PLAY_SVG = '<svg viewBox="0 0 24 24"><path d="M3 22v-20l18 10-18 10z"/></svg>';
const PAUSE_SVG = '<svg viewBox="0 0 24 24"><path d="M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z"/></svg>';

// Initial state
playIconEl.innerHTML = PLAY_SVG;

function setPlaying() {
    playIconEl.innerHTML = PAUSE_SVG;
    equalizerEl.classList.remove('paused');
    isPlaying = true;
}

function setPaused() {
    playIconEl.innerHTML = PLAY_SVG;
    equalizerEl.classList.add('paused');
    isPlaying = false;
}

playBtn.addEventListener('click', () => {
    if (isPlaying) {
        audioPlayer.pause();
        setPaused();
    } else {
        audioPlayer.play().then(() => {
            setPlaying();
        }).catch(err => console.log("Audio play failed:", err));
    }
});

// --- Lyric Sync System ---
const syncLyrics = document.querySelectorAll('.sync-lyric');
audioPlayer.addEventListener('timeupdate', () => {
    const currentTime = audioPlayer.currentTime;
    
    syncLyrics.forEach(lyric => {
        const timeData = lyric.dataset.time;
        if(timeData) {
            const [start, end] = timeData.split(',').map(Number);
            if(currentTime >= start && currentTime <= end) {
                if(!lyric.classList.contains('active-lyric')) {
                    lyric.classList.add('active-lyric');
                    // Gently bring into view if needed, but since it's a long page, we only do it if the user is in that section to not hijack scroll.
                    // Instead of hijacking, let's just let it highlight.
                }
            } else {
                lyric.classList.remove('active-lyric');
            }
        }
    });
});

// --- Entry Overlay ---
document.getElementById('entry-btn').addEventListener('click', () => {
    const overlay = document.getElementById('entry-overlay');
    
    // Initial confetti
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ef4444', '#ffffff', '#000000'] });
    }

    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        startHeroAnimations();
    }, 1000);

    // Play music
    audioPlayer.play().then(() => {
        setPlaying();
    }).catch(err => {
        console.log("Autoplay blocked or missing file:", err);
    });
});

// --- Animations Setup (GSAP) ---
gsap.registerPlugin(ScrollTrigger);

function startHeroAnimations() {
    const tl = gsap.timeline();

    // Glow spot
    const spot = document.querySelector('.hero-glow-spot');
    tl.fromTo(spot,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.5, ease: 'elastic.out(1, 0.4)' }
    );

    // Title entrance
    tl.fromTo(".hero-badge",
        { y: 50, opacity: 0, scale: 0.5 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "back.out(1.5)" },
        "-=2"
    )
    .fromTo(".hero-title",
        { opacity: 0, y: 80, rotateX: -60, transformOrigin: "top center" },
        { opacity: 1, y: 0, rotateX: 0, duration: 1.5, ease: "power3.out" },
        "-=1.5"
    )
    .fromTo(".hero-col",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out" },
        "-=1"
    )
    .fromTo(".metric-box",
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.5)" },
        "-=0.6"
    );

    setupScrollAnimations();
}

function setupScrollAnimations() {
    // Section Title
    gsap.utils.toArray('.section-title, .section-text').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 50 },
            {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out"
            }
        );
    });

    // Topology Diagram
    const topoHub = document.querySelector('.topo-hub');
    const spokes = document.querySelectorAll('.topo-spoke');

    if(topoHub) {
        gsap.fromTo(topoHub,
            { scale: 0, opacity: 0, rotation: -10 },
            {
                scrollTrigger: {
                    trigger: topoHub,
                    start: "top 80%"
                },
                scale: 1, opacity: 1, rotation: 0, 
                duration: 0.8, ease: 'back.out(1.7)'
            }
        );

        gsap.fromTo(spokes,
            { y: 30, opacity: 0, scale: 0.8 },
            {
                scrollTrigger: {
                    trigger: topoHub,
                    start: "top 80%"
                },
                y: 0, opacity: 1, scale: 1, 
                duration: 0.6, stagger: 0.2, ease: 'back.out(1.5)',
                delay: 0.4
            }
        );
    }

    // Horizontal Scroll (NCTVPN style) - Desktop only, vertical on mobile
    const horizWrapper = document.querySelector('.horizontal-wrapper');
    const horizContainer = document.querySelector('.horizontal-scroll-container');
    const isMobile = window.innerWidth <= 768;

    if(horizWrapper && horizContainer) {
        const spans = horizWrapper.querySelectorAll('.creative-span');

        if(isMobile) {
            // MOBILE: Simple vertical reveal with stagger
            spans.forEach(el => gsap.set(el, { opacity: 0, y: 30 }));

            gsap.to(spans, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: horizContainer,
                    start: "top 70%",
                    toggleActions: "play none none none"
                },
                onComplete: () => {
                    // After all appear, highlight red ones
                    spans.forEach(el => {
                        const type = el.dataset.type;
                        if(type === "scale" || type === "drop") {
                            gsap.to(el, { color: "#ef4444", duration: 0.4, delay: 0.2 });
                        }
                    });
                }
            });
        } else {
            // DESKTOP: Horizontal pinned scroll
            const getAmountToScroll = () => horizWrapper.scrollWidth - window.innerWidth;
            spans.forEach(el => gsap.set(el, { opacity: 0 }));

            gsap.to(horizWrapper, {
                x: () => getAmountToScroll(),
                ease: "none",
                scrollTrigger: {
                    trigger: horizContainer,
                    pin: true,
                    scrub: 1,
                    start: "top top",
                    end: () => `+=${getAmountToScroll()}`,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        spans.forEach(el => {
                            const type = el.dataset.type;
                            const rect = el.getBoundingClientRect();
                            const center = rect.left + (rect.width / 2);
                            const viewportCenter = window.innerWidth / 2;
                            
                            let dist = (center - viewportCenter) / (window.innerWidth / 2);
                            let p = 1 - Math.abs(dist);
                            p = Math.max(0, Math.min(1, p));

                            if (p > 0.4) {
                                if (type === "scale") gsap.to(el, { scale: 1, opacity: 1, color: "#ef4444", duration: 0.15 });
                                else if (type === "drop") gsap.to(el, { y: 0, opacity: 1, color: "#ef4444", duration: 0.15 });
                                else if (type === "slide-in-rtl") gsap.to(el, { x: 0, opacity: 1, color: "#ffffff", duration: 0.15 });
                                else if (type === "slide-in-ltr") gsap.to(el, { x: 0, opacity: 1, color: "#ffffff", duration: 0.15 });
                            } else {
                                if (type === "scale") gsap.to(el, { scale: 0, opacity: 0, duration: 0.2 });
                                else if (type === "drop") gsap.to(el, { y: -60, opacity: 0, duration: 0.2 });
                                else if (type === "slide-in-rtl") gsap.to(el, { x: 100, opacity: 0, duration: 0.2 });
                                else if (type === "slide-in-ltr") gsap.to(el, { x: -100, opacity: 0, duration: 0.2 });
                            }
                        });
                    }
                }
            });
        }
    }

    // Parallax Effect
    gsap.utils.toArray('.parallax-element').forEach(layer => {
        const depth = layer.dataset.depth || 0.2;
        gsap.to(layer, {
            yPercent: -100 * depth,
            ease: "none",
            scrollTrigger: {
                trigger: layer.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
}

// Confetti Button
document.getElementById('confetti-btn').addEventListener('click', () => {
    if (typeof confetti === 'function') {
        const colors = ['#ef4444', '#f87171', '#fca5a5', '#ffffff'];
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: colors
        });
        
        gsap.fromTo("#confetti-btn",
            { scale: 0.85 },
            { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.3)" }
        );
    }
});

