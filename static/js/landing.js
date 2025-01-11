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

    function isTablet() {
        return window.innerWidth >= 992 && window.innerWidth <= 1200;
    }

    function updateScrollBehavior() {
        if (isTablet()) {
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
            
            document.querySelectorAll('.section').forEach(section => {
                section.style.height = 'auto';
                section.style.minHeight = 'auto';
            });
        } else if (isLargeScreen()) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'visible';
        } else {
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        }
    }

    function smoothScrollTo(element, duration = 300) {
        if (!isLargeScreen() || isTablet()) {
            element.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3);

            window.scrollTo(0, startPosition + (distance * ease));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                setTimeout(() => {
                    isScrolling = false;
                    lastScrollTime = Date.now();
                }, 50);
            }
        }

        requestAnimationFrame(animation);
    }

    // Function to show tutorial (add this new function)
    function showTutorial() {
        const demoSection = document.getElementById('demo');
        
        if (demoSection) {
            // Find the index of the demo section
            const demoSectionIndex = Array.from(sections).indexOf(demoSection);
            
            // Update current section for smooth scrolling behavior
            currentSection = demoSectionIndex;
            
            // Scroll to demo section
            smoothScrollTo(demoSection);
        }
    }

    // Add event listener for the tutorial button
    const tutorialButton = document.querySelector('button[onclick="showTutorial()"]');
    if (tutorialButton) {
        tutorialButton.addEventListener('click', showTutorial);
    }

    window.addEventListener('wheel', function(e) {
        if (!isLargeScreen() || isTablet()) return;

        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime;

        if (timeSinceLastScroll < 80) return;

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
            }, 10);
        }
    }, { passive: false });

    let touchStartY;
    
    window.addEventListener('touchstart', function(e) {
        if (!isLargeScreen() || isTablet()) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function(e) {
        if (!isLargeScreen() || isTablet()) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaY) > 30) {
            const event = new WheelEvent('wheel', {
                deltaY: deltaY
            });
            window.dispatchEvent(event);
        }
    }, { passive: true });

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

    updateScrollBehavior();
    window.addEventListener('resize', updateScrollBehavior);
});

// Remove the inline onclick attribute from the HTML and handle Google Sign In
async function handleGoogleSignIn() {
    try {
        // Get auth URL from our endpoint
        const response = await fetch('/api/v1/auth/google/login');
        if (!response.ok) {
            throw new Error('Failed to start authentication process');
        }

        const data = await response.json();
        
        if (data.authorization_url) {
            window.location.href = data.authorization_url;
        } else {
            throw new Error('No authorization URL received');
        }

    } catch (error) {
        console.error('Google authentication error:', error);
    }
}

const startFreeTrialButton = document.querySelector('.start-free-trial-btn');
const contineWithGoogleButton = document.querySelector('.google-signin-button');

if (startFreeTrialButton) {
    startFreeTrialButton.addEventListener('click', handleGoogleSignIn);
}

if (contineWithGoogleButton) {
    contineWithGoogleButton.addEventListener('click', handleGoogleSignIn);
}
