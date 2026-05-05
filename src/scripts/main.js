// src/scripts/main.js

let ctx; 

function initAnimations() {
    const gsap = window.gsap || window['gsap'];
    const ScrollTrigger = window.ScrollTrigger || window['ScrollTrigger'];
    const ScrollSmoother = window.ScrollSmoother || window['ScrollSmoother'];
    const Flip = window.Flip || window['Flip'];
    const CustomEase = window.CustomEase || window['CustomEase'];

    if (!gsap || !ScrollSmoother) return;


    
    // 1. SMOOTHER (Scroll Suave)
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


// 2. MOTOR DE TEXTOS ANIMADOS (Sin guillotina, a prueba de colapsos)
    function initGlobalTextReveal() {
        const revealElements = document.querySelectorAll(".reveal-text");
        
        if (revealElements.length === 0) return;

        const SplitText = window.SplitText || window['SplitText'];
        
        // Si no tienes SplitText cargado en esta página, avisamos por consola
        if (!SplitText) {
            console.warn("⚠️ GSAP SplitText no está cargado en esta página.");
            return;
        }

        revealElements.forEach((el) => {
            
            // 1. Limpieza extrema
            if (el.split) el.split.revert();
            if (el.mask) el.mask.revert();
            gsap.set(el, { clearProps: "all" });

            // 2. Split Simple (Sin máscara doble)
            el.split = new SplitText(el, { type: "lines", linesClass: "split-line" });
            
            // 3. Animación limpia (y + opacity)
            gsap.fromTo(el.split.lines, 
                { 
                    y: 60,      // Empieza 60px más abajo
                    opacity: 0  // Empieza invisible
                }, 
                {
                    y: 0,       // Sube a su posición original
                    opacity: 1, // Aparece suavemente
                    duration: 1.2,
                    delay:.7,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 95%", // Se activa sin importar qué tan arriba esté en la página
                        toggleActions: "play none none none"
                    }
                }
            );
        });
    }
    

    // 3. REFERENCIAS GLOBALES
    const scrollMain = document.querySelector('.content');
    const textElements = document.querySelectorAll('.el');
    const logoEl = document.querySelector('.logo > span'); 
    const clientsPreview = document.querySelector(".clients-preview");
    const clientNames = document.querySelectorAll(".client-name");
    const imgElement = document.getElementById('scroll-image');

    if (logoEl) {
        textElements.forEach((el) => { el.dataset.text = el.textContent; });
        logoEl.dataset.text = logoEl.textContent;
    }

    function safeRun(fn) { try { fn(); } catch(e) { console.error(e); } }

    // 4. SECUENCIA DE IMÁGENES ACTUALIZADA (Video inicial -> Scroll de fotos)
    function initImageSequence() {
        if (!imgElement || !scrollMain) return;
        
        const bgVideo = document.getElementById('bg-video'); 
        const images = ['/images/apple.webp', '/images/BMW.webp', '/images/bottega.webp', '/images/microsoft.webp', '/images/prada.webp'];
        
        ScrollTrigger.create({
            trigger: scrollMain,
            start: "top top", end: "bottom bottom", scrub: true,
            onUpdate: (self) => {
                
                // Ocultamos el video inicial si el usuario empieza a bajar
                if (bgVideo) {
                    if (self.progress > 0.02) {
                        gsap.to(bgVideo, { opacity: 0, duration: 0.3, overwrite: "auto" });
                    } else {
                        gsap.to(bgVideo, { opacity: 1, duration: 0.3, overwrite: "auto" });
                    }
                }

                // Reproducimos la secuencia de fotos en la etiqueta <img>
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

    // 5. ANIMACIÓN FLIP (Textos volando en distintas direcciones)
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

    // 6. EFECTO SCRAMBLE (Descodificador de texto)
    function initScramble() {
        if (!window.ScrambleTextPlugin || !textElements.length) return;
        function scramble(el, d = 1, r = 0) {
            const text = el.dataset.text ?? el.textContent;
            gsap.fromTo(el, { scrambleText: { text: '', chars: '' } }, { scrambleText: { text, chars: 'upperAndLowerCase', revealDelay: r }, duration: d });
        }
        textElements.forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onEnter: () => scramble(el), onEnterBack: () => scramble(el) }));
        if (logoEl) scramble(logoEl, 1, 0.5); 
    }

    // 7. INTERACCIÓN HOVER DE CLIENTES (Inteligente con Poster para móviles)
    function initClientsHover() {
        if (!clientsPreview || clientNames.length === 0 || !CustomEase) return;
        CustomEase.create("hop", "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1");
        
        // Define aquí los archivos de tus clientes (actualmente fotos, pero listo para videos)
        const clientMediaFiles = [
            '/images/apple.webp',      
            '/images/BMW.webp',        
            '/images/bottega.webp',    
            '/images/microsoft.webp',  
            '/images/prada.webp'       
        ];
        
        let activeClientIndex = -1;

        const defaultImg = document.getElementById('default-client-img');
        const centerLogo = document.querySelector('.logo.fixed'); 

        // CROSSFADE INICIAL CON TUS TIEMPOS PERSONALIZADOS
        if (defaultImg) {
            gsap.to(defaultImg, { 
                opacity: 0.8, 
                duration: 1.2, 
                delay: 1.5, // delay hovers que tú configuraste
                ease: "power2.inOut" });
        }

        if (centerLogo) {
            gsap.set(centerLogo, { opacity: 1 }); 
            gsap.to(centerLogo, {
                opacity: 0,
                duration: 1.2,
                delay: 1, // delay texto nobrand que tú configuraste
                ease: "power2.inOut",
                onComplete: () => { centerLogo.style.display = "none"; }
            });
        }

        clientNames.forEach((client, index) => {
            let activeMediaWrapper = null, activeMediaEl = null;
            
            client.addEventListener("mouseover", () => {
                if (activeClientIndex === index) return;
                activeClientIndex = index;

                if (defaultImg) gsap.to(defaultImg, { opacity: 0, duration: 0.3, overwrite: true });

                const wrapper = document.createElement("div"); 
                wrapper.className = "client-img-wrapper";
                
                const fileSrc = clientMediaFiles[index];
                let mediaElement;

                // DETECCIÓN DE VIDEO VS IMAGEN CON RESPALDO MÓVIL
                if (fileSrc.toLowerCase().endsWith('.mp4')) {
                    mediaElement = document.createElement("video");
                    mediaElement.src = fileSrc;
                    
                    // Aseguramos el poster cambiando la extensión a .webp
                    const posterSrc = fileSrc.replace('.mp4', '.webp');
                    mediaElement.setAttribute("poster", posterSrc); 
                    
                    mediaElement.setAttribute("autoplay", "");
                    mediaElement.setAttribute("loop", "");
                    mediaElement.setAttribute("muted", "");
                    mediaElement.setAttribute("playsinline", "");
                    mediaElement.muted = true; // Doble seguridad para Safari
                    
                    mediaElement.style.position = "absolute";
                    mediaElement.style.top = "0";
                    mediaElement.style.left = "0";
                    mediaElement.style.width = "100%";
                    mediaElement.style.height = "100%";
                    mediaElement.style.objectFit = "cover";
                } else {
                    mediaElement = document.createElement("img"); 
                    mediaElement.src = fileSrc;
                }

                gsap.set(mediaElement, { scale: 1.25, opacity: 0 });
                wrapper.appendChild(mediaElement); 
                clientsPreview.appendChild(wrapper);

                if (mediaElement.tagName === "VIDEO") {
                    mediaElement.load();
                    const playPromise = mediaElement.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn("Autoplay prevenido por el navegador momentáneamente:", error);
                        });
                    }
                }

                activeMediaWrapper = wrapper; 
                activeMediaEl = mediaElement;
                
                gsap.to(wrapper, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.3, ease: "hop" });
                gsap.to(mediaElement, { opacity: 1, scale: 1, duration: 0.4, ease: "hop" });
            });
            
            client.addEventListener("mouseout", () => {
                activeClientIndex = -1;
                if (activeMediaEl && activeMediaWrapper) {
                    const w = activeMediaWrapper;
                    gsap.to(activeMediaEl, { opacity: 0, duration: 0.2, onComplete: () => w.remove() });
                }

                if (defaultImg) gsap.to(defaultImg, { opacity: 0.8, duration: 0.5, delay: 0.1, overwrite: true });
            });
        });
    }


 // 8. ANIMACIÓN DE TEXTO CLIENTES (Aparición en cascada)
    function initTextClientes() {
        // Seleccionamos los elementos. 
        // Nota: Si ".text-clientes" es el contenedor padre, usa ".text-clientes > *"
        // Si ".text-clientes" es la clase que tiene CADA texto, déjalo como ".text-clientes"
        const elementos = document.querySelectorAll(".text-clientes"); 

        if (elementos.length > 0) {
            gsap.from(elementos, {
                y: 40,               
                opacity: 0,          
                duration: 1.2,       
                ease: "power3.out",  
                delay: 2.5,          // Espera a que termine el preloader
                stagger: 0.2         // 🌟 LA MAGIA: 0.2 segundos de diferencia entre cada elemento
            });
        }
    }


  // EJECUCIÓN (¡Todo encendido!)
    safeRun(initGlobalTextReveal); // <-- ✅ 1. LO AGREGAMOS AQUÍ PRIMERO
    safeRun(initImageSequence); 
    safeRun(initFlips);
    safeRun(initScramble);
    safeRun(initClientsHover);
    safeRun(initTextClientes); 

    // ✅ 2. LE DECIMOS A GSAP QUE RECALCULE TODA LA PÁGINA NUEVA
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 100);

    const handleResize = () => { ScrollTrigger.refresh(true); safeRun(initFlips); };
    window.addEventListener('resize', handleResize);
    window._homeResizeHandler = handleResize;
}

// CONEXIÓN MAESTRA CON ASTRO
document.addEventListener('astro:page-load', () => {
    
    // 1. Bloqueamos el scroll fantasma del navegador
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const gsap = window.gsap || window['gsap'];
    if (!gsap) return;

    // 2. Registramos TODOS tus plugins originales
    gsap.registerPlugin(
        window.ScrollTrigger, 
        window.ScrollSmoother, 
        window.Flip, 
        window.CustomEase,
        window.SplitText,
        window.ScrambleTextPlugin
    );

    // 3. LIMPIEZA PROFUNDA (Vital para que Astro no duplique animaciones)
    ScrollTrigger.getAll().forEach(t => t.kill());

    // 4. CREAMOS EL CONTEXTO RESTAURADO
    let ctx = gsap.context(() => { 
        
        // ¡Encendemos toda tu web de nuevo!
        // Esta función contiene a tus clientes, tu smoother y todo lo demás.
        if (typeof initAnimations === "function") {
            initAnimations(); 
        }

    });
});


// LIMPIEZA AL CAMBIAR DE PÁGINA (Evita bugs de scroll y Astro View Transitions)
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