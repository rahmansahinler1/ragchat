document.addEventListener('DOMContentLoaded', function() {
    let scrollTimeout;
    let isScrolling = false;
    const sections = document.querySelectorAll('.section');
    const footer = document.querySelector('footer');
    let currentSection = 0;
    let lastScrollTime = 0;
    
    function isLargeScreen() {
        return window.innerWidth >= 992;
    }

    function updateScrollBehavior() {
        if (isLargeScreen()) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }
    }

    // Daha hızlı scroll animasyonu
    function smoothScrollTo(element, duration = 300) { // 400ms'den 300ms'e düşürdük
        if (!isLargeScreen()) return;

        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Daha hızlı easing
            const ease = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3);

            window.scrollTo(0, startPosition + (distance * ease));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                // Animasyon biter bitmez scroll state'ini resetle
                setTimeout(() => {
                    isScrolling = false;
                    lastScrollTime = Date.now();
                }, 50); // Çok kısa bir bekleme süresi
            }
        }

        requestAnimationFrame(animation);
    }

    window.addEventListener('wheel', function(e) {
        if (!isLargeScreen()) return;

        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime;

        // Minimum scroll aralığını düşürdük
        if (timeSinceLastScroll < 80) return; // 150ms'den 80ms'e düşürdük

        const isFooterVisible = footer.getBoundingClientRect().top < window.innerHeight;
        const isLastSection = currentSection === sections.length - 1;

        if (isLastSection && e.deltaY > 0 && !isFooterVisible) {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            footer.scrollIntoView({ behavior: 'smooth' });
            lastScrollTime = now;
            return;
        }

        if (isFooterVisible && e.deltaY < 0) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            smoothScrollTo(sections[sections.length - 1]);
            lastScrollTime = now;
            return;
        }

        if (!isScrolling) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = true;

                if (e.deltaY > 0 && currentSection < sections.length - 1) {
                    currentSection++;
                    smoothScrollTo(sections[currentSection]);
                } else if (e.deltaY < 0 && currentSection > 0) {
                    currentSection--;
                    smoothScrollTo(sections[currentSection]);
                } else {
                    isScrolling = false;
                }

                lastScrollTime = now;
            }, 10); // Throttle süresini 25ms'den 10ms'e düşürdük
        }
    }, { passive: false });

    // Touch olayları için hızlı yanıt
    let touchStartY;
    
    window.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function(e) {
        if (!isLargeScreen()) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaY) > 30) { // Swipe mesafesini 50'den 30'a düşürdük
            const event = new WheelEvent('wheel', {
                deltaY: deltaY
            });
            window.dispatchEvent(event);
        }
    }, { passive: true });

    // Başlangıç ayarları
    updateScrollBehavior();
    window.addEventListener('resize', updateScrollBehavior);

    // Fade efekti
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(element => {
        observer.observe(element);
    });
});