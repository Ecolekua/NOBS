// src/scripts/main.js
window.addEventListener('load', () => {
    // 1. REGISTRO DE PLUGINS
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Flip, ScrambleTextPlugin, ScrollToPlugin, CustomEase);

    // 2. CONFIGURACIÓN DE SCROLLSMOOTHER
    const smoother = ScrollSmoother.create({
        smooth: 1,
        normalizeScroll: true,
    });

    // 3. REFERENCIAS Y CACHÉ
    const textElements = document.querySelectorAll('.el');
    const logoEl = document.querySelector('.logo > span');
    const relatedEl = document.querySelector('.related');
    const relatedItems = relatedEl?.querySelectorAll('.grid__item');
    const imgElement = document.getElementById('scroll-image');
    const clientsPreview = document.querySelector(".clients-preview");
    const clientNames = document.querySelectorAll(".client-name");

    if (!logoEl) return;
    const logoText = logoEl.textContent;

    textElements.forEach((el) => { el.dataset.text = el.textContent; });
    logoEl.dataset.text = logoText;

    // 4. SECUENCIA DE IMÁGENES FIJA
    function initImageSequence() {
        const scrollMain = document.querySelector('.content');
        if (!imgElement || !scrollMain) return;

        const images = [
            '/images/apple.webp',
            '/images/BMW.webp',
            '/images/bottega.webp',
            '/images/microsoft.webp',
            '/images/prada.webp'
        ];

        ScrollTrigger.create({
            trigger: scrollMain,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                const progress = self.progress;
                const index = Math.floor(progress * (images.length - 1));
                
                if (imgElement.dataset.currentIndex !== index.toString()) {
                    gsap.to(imgElement, {
                        opacity: 0.1,
                        duration: 0.1,
                        onComplete: () => {
                            imgElement.src = images[index];
                            gsap.to(imgElement, { opacity: 1, duration: 0.2 });
                        }
                    });
                    imgElement.dataset.currentIndex = index;
                }
            }
        });
    }

    // 5. INTERACCIÓN AL CLIC
    function initImageInteraction() {
        if (!imgElement) return;
        imgElement.addEventListener('click', () => {
            gsap.fromTo(imgElement, 
                { scale: 0.9, filter: "brightness(2)" }, 
                { scale: 1, filter: "brightness(1)", duration: 0.6, ease: "back.out(1.7)" }
            );
        });
    }

    // 6. HOVER DE CLIENTES
    function initClientsHover() {
        if (!clientsPreview || clientNames.length === 0) return;
        CustomEase.create("hop", "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1");

        const clientImages = ['/images/apple.webp', '/images/BMW.webp', '/images/bottega.webp', '/images/microsoft.webp', '/images/prada.webp'];
        let activeClientIndex = -1;

        clientNames.forEach((client, index) => {
            let activeClientImgWrapper = null;
            let activeClientImg = null;

            client.addEventListener("mouseover", () => {
                if (activeClientIndex === index) return;
                activeClientIndex = index;
                const clientImgWrapper = document.createElement("div");
                clientImgWrapper.className = "client-img-wrapper";
                const clientImg = document.createElement("img");
                clientImg.src = clientImages[index];
                gsap.set(clientImg, { scale: 1.25, opacity: 0 });
                clientImgWrapper.appendChild(clientImg);
                clientsPreview.appendChild(clientImgWrapper);
                activeClientImgWrapper = clientImgWrapper;
                activeClientImg = clientImg;

                gsap.to(clientImgWrapper, {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    duration: 0.5,
                    ease: "hop",
                });
                gsap.to(clientImg, { opacity: 1, scale: 1, duration: 1.25, ease: "hop" });
            });

            client.addEventListener("mouseout", () => {
                activeClientIndex = -1;
                if (activeClientImg && activeClientImgWrapper) {
                    const wrapperToRemove = activeClientImgWrapper;
                    gsap.to(activeClientImg, { opacity: 0, duration: 0.5, onComplete: () => wrapperToRemove.remove() });
                }
            });
        });
    }

    // 7. FLIPS Y SCRAMBLE
    function resetTextElements() {
        textElements.forEach((el) => { gsap.set(el, { clearProps: 'transform,opacity,filter' }); });
    }

    function initFlips() {
        resetTextElements();
        textElements.forEach((el) => {
            const originalClass = [...el.classList].find((c) => c.startsWith('pos-'));
            const targetClass = el.dataset.altPos;
            if (!originalClass || !targetClass) return;
            el.classList.add(targetClass);
            el.classList.remove(originalClass);
            const flipState = Flip.getState(el, { props: 'opacity, filter, width' });
            el.classList.add(originalClass);
            el.classList.remove(targetClass);
            Flip.to(flipState, { ease: "expo.inOut", scrollTrigger: { trigger: el, start: 'clamp(bottom bottom-=10%)', end: 'clamp(center center)', scrub: true } });
            Flip.from(flipState, { ease: "expo.inOut", scrollTrigger: { trigger: el, start: 'clamp(center center)', end: 'clamp(top top)', scrub: true } });
        });
    }

    function initScramble() {
        textElements.forEach((el) => {
            ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onEnter: () => scramble(el), onEnterBack: () => scramble(el) });
        });
        scramble(logoEl, { revealDelay: 0.5 });
    }

    function scramble(el, { duration, revealDelay = 0 } = {}) {
        const text = el.dataset.text ?? el.textContent;
        gsap.fromTo(el, { scrambleText: { text: '', chars: '' } }, { scrambleText: { text, chars: 'upperAndLowerCase', revealDelay }, duration: duration ?? 1 });
    }

    // 8. RELACIONADOS
    function initRelatedDemos() {
        if (!relatedEl || !relatedItems) return;
        gsap.set(relatedItems, { xPercent: 100, scale: 0, opacity: 0 });
        ScrollTrigger.create({
            trigger: relatedEl,
            start: 'top center+=25%',
            onEnter: () => {
                gsap.to(logoEl, { duration: 0.7, opacity: 0 });
                if (imgElement) gsap.to(imgElement, { duration: 0.7, opacity: 0 });
                gsap.to(relatedItems, { duration: 0.7, stagger: 0.1, xPercent: 0, scale: 1, opacity: 1 });
            },
            onLeaveBack: () => {
                gsap.to(logoEl, { duration: 0.5, opacity: 1 });
                if (imgElement) gsap.to(imgElement, { duration: 0.5, opacity: 1 });
                gsap.to(relatedItems, { duration: 0.5, scale: 0, opacity: 0, xPercent: 100, stagger: 0.05 });
            }
        });
    }

    // 9. AUTO-SCROLL CORREGIDO (HACIA ABAJO)
    function startAutoScroll() {
        gsap.delayedCall(2, () => {
            // Obtenemos la posición absoluta del elemento .clients
            const targetY = smoother.offset(".clients", "top top");
            
            // Forzamos el movimiento hacia esa posición específica
            gsap.to(smoother, {
                scrollTop: targetY,
                duration: 6,
                ease: "power2.inOut",
                overwrite: true // Evita conflictos con el scroll manual
            });
        });
    }

    // 10. EJECUCIÓN
    initFlips();
    initScramble();
    initRelatedDemos();
    initImageSequence();
    initImageInteraction();
    initClientsHover();
    startAutoScroll();

    window.addEventListener('resize', () => {
        ScrollTrigger.refresh(true);
        initFlips();
    });
});