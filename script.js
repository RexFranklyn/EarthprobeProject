// Advanced script for page transitions, intersections, and interactions

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Remove Page Loader Transition immediately on load with elegant reveal
    const pageTransition = document.querySelector('.page-transition');
    if(pageTransition) {
        setTimeout(() => {
            pageTransition.classList.add('fade-out');
        }, 50); // much faster entrance
    }

    // 2. Intercept local links for smooth page out animation
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="service-"], a[href^="about"], a[href^="contact"], a[href^="index"], a[href^="services"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // If it's just a hash or opens in new tab, ignore
            if (href.startsWith('#') || this.target === '_blank') return;
            
            // Handle mobile menu dropdown toggle instead of navigating
            if (window.innerWidth <= 768 && this.parentElement && this.parentElement.classList.contains('nav-dropdown')) {
                e.preventDefault();
                e.stopPropagation();
                this.parentElement.classList.toggle('mobile-open');
                return;
            }

            e.preventDefault();
            
            // Close mobile menu if open
            if (document.querySelector('.nav-links').classList.contains('active')) {
                document.querySelector('.hamburger').classList.remove('open');
                document.querySelector('.nav-links').classList.remove('active');
                document.querySelector('.site-nav').classList.remove('menu-open');
            }

            // Show transition overlay again
            if(pageTransition) {
                pageTransition.classList.remove('fade-out');
            }
            
            // Navigate rapidly after out-animation begins
            setTimeout(() => {
                window.location.href = href;
            }, 450);
        });
    });

    // 3. Navbar scroll effect & active state styling
    const navbar = document.querySelector('.site-nav');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger once on load

    // Highlight active nav link based on current URL path
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    // 4. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if(hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('active');
            navbar.classList.toggle('menu-open');
        });
    }

    // 5. Sophisticated Intersection Observer for Scroll Animations
    const animElements = document.querySelectorAll('.anim-fade-up, .anim-fade-in, .anim-slide-left, .anim-slide-right, .anim-scale-up');

    const observerOpts = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // trigger slightly before it enters fully
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered delay based on Y position if needed, or just let CSS handle it
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target); // Animate only once per load for sophistication
            }
        });
    }, observerOpts);

    animElements.forEach(el => observer.observe(el));

    // 6. Sophisticated Number Counter
    const statsGrid = document.querySelector('.stats-grid-wrapper');
    const counters = document.querySelectorAll('.stat-number');
    let hasCounted = false;

    if (statsGrid && counters.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting && !hasCounted) {
                hasCounted = true;
                
                counters.forEach(counter => {
                    const targetAttr = counter.getAttribute('data-target');
                    const isFloat = targetAttr.includes('.');
                    const target = parseFloat(targetAttr);
                    const suffix = counter.getAttribute('data-suffix') || '';
                    const duration = 2500; // ms (slightly slower for elegance)
                    
                    let start = null;
                    const easeOutQuart = t => 1 - (--t) * t * t * t;

                    const step = (timestamp) => {
                        if (!start) start = timestamp;
                        const progress = timestamp - start;
                        const percentage = Math.min(progress / duration, 1);
                        
                        // use easing function for rolling numbers
                        const easedProgress = easeOutQuart(percentage);
                        let current = easedProgress * target;
                        
                        if (!isFloat) {
                            current = Math.ceil(current);
                        } else {
                            // ensure fixed decimal length to prevent visual stuttering
                            current = current.toFixed(2);
                        }
                        
                        counter.innerText = current + suffix;
                        
                        if (progress < duration) {
                            window.requestAnimationFrame(step);
                        } else {
                            counter.innerText = targetAttr + suffix;
                        }
                    };
                    window.requestAnimationFrame(step);
                });
            }
        }, { threshold: 0.4 });
        
        statsObserver.observe(statsGrid);
    }

    // 7. Hero Slideshow Logic
    const slides = document.querySelectorAll('.hero .slide');
    const dots = document.querySelectorAll('.slider-controls .dot');
    const prevBtn = document.querySelector('.slider-controls .prev-slide');
    const nextBtn = document.querySelector('.slider-controls .next-slide');
    const sliderControls = document.querySelector('.slider-controls');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            if(dots.length) dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            if(dots.length) dots[index].classList.add('active');
            
            // Re-trigger animations for the active slide elements
            const anims = slides[index].querySelectorAll('.anim-fade-up, .anim-fade-in');
            anims.forEach(el => {
                el.classList.remove('in-view');
                // Small delay to allow CSS reset
                setTimeout(() => el.classList.add('in-view'), 50);
            });

            // Handle Nav color based on slide theme
            if (navbar && slides[index].classList.contains('slide-dark')) {
                navbar.classList.add('on-dark');
            } else if (navbar) {
                navbar.classList.remove('on-dark');
            }

            // Hide slider navigator on the first slide
            if (sliderControls) {
                sliderControls.style.display = index === 0 ? 'none' : '';
            }
        };

        const nextSlideFn = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };

        const prevSlideFn = () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        };

        const startSlider = () => {
            slideInterval = setInterval(nextSlideFn, 6000);
        };

        const resetSlider = () => {
            clearInterval(slideInterval);
            startSlider();
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlideFn();
                resetSlider();
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlideFn();
                resetSlider();
            });
        }

        if(dots.length) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentSlide = index;
                    showSlide(currentSlide);
                    resetSlider();
                });
            });
        }

        // Initialize animations on the first slide
        const firstAnims = slides[0].querySelectorAll('.anim-fade-up, .anim-fade-in');
        firstAnims.forEach(el => setTimeout(() => el.classList.add('in-view'), 100));

        // Initial check for slider navigator
        if (sliderControls) {
            sliderControls.style.display = 'none';
        }

        startSlider();
    }
});
