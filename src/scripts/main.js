// src/scripts/main.js

let ctx; 

function initAnimations() {
    const gsap = window.gsap || window['gsap'];
    const ScrollTrigger = window.ScrollTrigger || window['ScrollTrigger'];
    const ScrollSmoother = window.ScrollSmoother || window['ScrollSmoother'];
    const Flip = window.Flip || window['Flip'];
    const CustomEase = window.CustomEase || window['CustomEase'];

    if (!gsap || !ScrollSmoother) return;

    // 1. SMOOTHER
    try {
        const wrapperEl = document.getElementById('smooth-wrapper');
        const contentEl = document.getElementById('smooth-content');
        if (wrapperEl && contentEl) {
            window.miSmoother = ScrollSmoother.create({
                wrapper: wrapperEl,
                content: contentEl,
                smooth: 1,
                normalizeScroll: true 
            });
        }
    } catch(e) { console.error(e); }

    // 2. MOTOR DE TEXTOS ANIMADOS
    function initGlobalTextReveal() {
        try {
            const revealElements = document.querySelectorAll(".reveal-text");
            if (revealElements.length === 0) return;

            const SplitText = window.SplitText || window['SplitText'];
            if (!SplitText) return;

            revealElements.forEach((el) => {
                const split = new SplitText(el, { type: "lines", linesClass: "line", mask: "lines" });
                gsap.set(split.lines, { y: "110%" });
                ScrollTrigger.create({
                    trigger: el,
                    start: "top 85%", 
                    onEnter: () => gsap.to(split.lines, { y: "0%", duration: 1.2, stagger: 0.1, ease: "power4.out", delay: 0.5 })
                });
            });
            setTimeout(() => ScrollTrigger.refresh(), 150);
        } catch(e) { console.error(e); }
    }

    initGlobalTextReveal();

    // 3. REFERENCIAS GLOBALES
    const scrollMain = document.querySelector('.content');
    const textElements = document.querySelectorAll('.el');
    const logoEl = document.querySelector('.logo > span'); 
    const relatedEl = document.querySelector('.related');
    const relatedItems = relatedEl?.querySelectorAll('.grid__item');
    const imgElement = document.getElementById('scroll-image');
    const clientsPreview = document.querySelector(".clients-preview");
    const clientNames = document.querySelectorAll(".client-name");

    if (logoEl) {
        textElements.forEach((el) => { el.dataset.text = el.textContent; });
        logoEl.dataset.text = logoEl.textContent;
    }

    function safeRun(fn) { try { fn(); } catch(e) { console.error(e); } }

    function initImageSequence() {
        if (!imgElement || !scrollMain) return;
        const images = ['/images/apple.webp', '/images/BMW.webp', '/images/bottega.webp', '/images/microsoft.webp', '/images/prada.webp'];
        ScrollTrigger.create({
            trigger: scrollMain,
            start: "top top", end: "bottom bottom", scrub: true,
            onUpdate: (self) => {
                const index = Math.floor(self.progress * (images.length - 1));
                if (imgElement.dataset.currentIndex !== index.toString()) {
                    gsap.to(imgElement, { opacity: 0.1, duration: 0.1, onComplete: () => {
                        imgElement.src = images[index];
                        gsap.to(imgElement, { opacity: 1, duration: 0.2 });
                    }});
                    imgElement.dataset.currentIndex = index;
                }
            }
        });
    }

    function initFlips() {
        if (!textElements.length) return;
        textElements.forEach((el) => gsap.set(el, { clearProps: 'transform,opacity,filter' }));
        textElements.forEach((el) => {
            const originalClass = [...el.classList].find((c) => c.startsWith('pos-'));
            const targetClass = el.dataset.altPos;
            if (!originalClass || !targetClass || !Flip) return;
            el.classList.add(targetClass); el.classList.remove(originalClass);
            const flipState = Flip.getState(el, { props: 'opacity, filter, width' });
            el.classList.add(originalClass); el.classList.remove(targetClass);
            Flip.to(flipState, { ease: "expo.inOut", scrollTrigger: { trigger: el, start: 'clamp(bottom bottom-=10%)', end: 'clamp(center center)', scrub: true } });
            Flip.from(flipState, { ease: "expo.inOut", scrollTrigger: { trigger: el, start: 'clamp(center center)', end: 'clamp(top top)', scrub: true } });
        });
    }

    function initScramble() {
        if (!window.ScrambleTextPlugin || !textElements.length) return;
        function scramble(el, d = 1, r = 0) {
            const text = el.dataset.text ?? el.textContent;
            gsap.fromTo(el, { scrambleText: { text: '', chars: '' } }, { scrambleText: { text, chars: 'upperAndLowerCase', revealDelay: r }, duration: d });
        }
        textElements.forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onEnter: () => scramble(el), onEnterBack: () => scramble(el) }));
        // El logo principal tarda en total 1.5s en formarse (1s duración + 0.5s delay)
        if (logoEl) scramble(logoEl, 1, 0.5); 
    }

    function initClientsHover() {
        if (!clientsPreview || clientNames.length === 0 || !CustomEase) return;
        CustomEase.create("hop", "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1");
        const clientImages = ['/images/apple.webp', '/images/BMW.webp', '/images/bottega.webp', '/images/microsoft.webp', '/images/prada.webp'];
        let activeClientIndex = -1;

        const defaultImg = document.getElementById('default-client-img');
        const centerLogo = document.querySelector('.logo.fixed'); 

        // CROSSFADE SINCORNIZADO: 3.5 segundos en total (1.5s de escritura + 2s totalmente visible)
        if (defaultImg) {
            gsap.to(defaultImg, { 
                opacity: 0.8, 
                duration: 1.2, 
                delay: 2, // NUEVO TIEMPO
                ease: "power2.inOut" 
            });
        }

        if (centerLogo) {
            // Forzamos que se mantenga en 100% visible mientras espera
            gsap.set(centerLogo, { opacity: 1 }); 

            gsap.to(centerLogo, {
                opacity: 0,
                duration: 1.2,
                delay: 2, // NUEVO TIEMPO
                ease: "power2.inOut",
                onComplete: () => {
                    centerLogo.style.display = "none"; 
                }
            });
        }

        clientNames.forEach((client, index) => {
            let activeClientImgWrapper = null, activeClientImg = null;
            
            client.addEventListener("mouseover", () => {
                if (activeClientIndex === index) return;
                activeClientIndex = index;

                if (defaultImg) {
                    gsap.to(defaultImg, { opacity: 0, duration: 0.3, overwrite: true });
                }

                const wrapper = document.createElement("div"); wrapper.className = "client-img-wrapper";
                const img = document.createElement("img"); img.src = clientImages[index];
                gsap.set(img, { scale: 1.25, opacity: 0 });
                wrapper.appendChild(img); clientsPreview.appendChild(wrapper);
                activeClientImgWrapper = wrapper; activeClientImg = img;
                
                gsap.to(wrapper, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.3, ease: "hop" });
                gsap.to(img, { opacity: 1, scale: 1, duration: 0.4, ease: "hop" });
            });
            
            client.addEventListener("mouseout", () => {
                activeClientIndex = -1;
                if (activeClientImg && activeClientImgWrapper) {
                    const w = activeClientImgWrapper;
                    gsap.to(activeClientImg, { opacity: 0, duration: 0.2, onComplete: () => w.remove() });
                }

                if (defaultImg) {
                    gsap.to(defaultImg, { opacity: 0.8, duration: 0.5, delay: 0.1, overwrite: true });
                }
            });
        });
    }

    // EJECUCIÓN 
    safeRun(initImageSequence);
    safeRun(initFlips);
    safeRun(initScramble);
    safeRun(initClientsHover);

    const handleResize = () => { ScrollTrigger.refresh(true); safeRun(initFlips); };
    window.addEventListener('resize', handleResize);
    window._homeResizeHandler = handleResize; 
}

document.addEventListener('astro:page-load', () => {
    const gsap = window.gsap || window['gsap'];
    if (!gsap) return;
    
    // ¡LA MAGIA VUELVE AQUÍ! Registramos oficialmente todos los plugins
    gsap.registerPlugin(
        window.ScrollTrigger, 
        window.ScrollSmoother, 
        window.Flip, 
        window.CustomEase,
        window.SplitText,
        window.ScrambleTextPlugin
    );

    ctx = gsap.context(() => { initAnimations(); });
});

document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && link.href !== window.location.href && !link.hasAttribute('data-astro-reload')) {
        const gsap = window.gsap || window['gsap'];
        const ScrollTrigger = window.ScrollTrigger || window['ScrollTrigger'];
        
        if (window.miSmoother && gsap) {
            gsap.killTweensOf(window.miSmoother);
            window.miSmoother.kill();
            window.miSmoother = null;
        }

        if (ScrollTrigger) {
            ScrollTrigger.getAll().forEach(t => t.kill());
            ScrollTrigger.clearScrollMemory();
        }
        
        if (ctx) ctx.revert();

        document.documentElement.style.overflow = ''; document.body.style.overflow = '';
        document.documentElement.style.height = ''; document.body.style.height = '';
        document.body.style.pointerEvents = '';

        if (window._homeResizeHandler) window.removeEventListener('resize', window._homeResizeHandler);
    }
}, { capture: true });