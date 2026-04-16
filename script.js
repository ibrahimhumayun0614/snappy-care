// ===== Smooth Sticky Header (requestAnimationFrame) =====
(function() {
    var header = document.querySelector('.header');
    if (header) {
        var ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
})();

// ===== Scroll-Triggered Reveal Animations =====
(function() {
    var selectors = [
        '.hero-subtitle', '.hero-title', '.hero-description', '.hero-buttons',
        '.about-subtitle', '.about-title', '.about-text', '.about-footer', '.about-btn',
        '.cert-badge', '.collage-item',
        '.section-subtitle', '.section-title', '.section-description',
        '.why-subtitle', '.why-title', '.why-card',
        '.team-subtitle', '.team-title', '.team-card',
        '.faq-subtitle', '.faq-title', '.faq-item',
        '.insurance-subtitle', '.insurance-title', '.insurance-logo',
        '.testimonials-subtitle', '.testimonials-title', '.testimonial-card',
        '.insights-subtitle', '.insights-title', '.insight-card'
    ];

    var revealElements = [];
    selectors.forEach(function(sel) {
        var els = document.querySelectorAll(sel);
        for (var i = 0; i < els.length; i++) {
            revealElements.push(els[i]);
        }
    });

    if (!revealElements.length) return;

    // Add initial state
    revealElements.forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var delay = parseFloat(el.dataset.delay) || 0;
                setTimeout(function() {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function(el) {
        var parent = el.parentElement;
        var siblings = parent.querySelectorAll(el.tagName);
        var siblingIndex = Array.prototype.indexOf.call(siblings, el);
        el.dataset.delay = (siblingIndex * 120).toString();
        observer.observe(el);
    });
})();

// ===== Smooth Mobile Menu Toggle =====
(function() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    var isOpen = false;

    toggle.addEventListener('click', function() {
        isOpen = !isOpen;
        if (isOpen) {
            nav.classList.add('active');
            toggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
        if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
            isOpen = false;
            nav.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
})();

// ===== Smooth Dropdown Toggle (Mobile) =====
(function() {
    var dropdowns = document.querySelectorAll('.nav-item.dropdown');
    if (!dropdowns.length) return;

    dropdowns.forEach(function(dropdown) {
        var link = dropdown.querySelector('.nav-link');
        if (!link) return;

        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                dropdown.classList.toggle('dropdown-active');

                var icon = dropdown.querySelector('.dropdown-icon');
                if (icon) {
                    if (dropdown.classList.contains('dropdown-active')) {
                        icon.style.transform = 'rotate(180deg)';
                    } else {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            }
        });
    });
})();

// ===== Care Slider =====
(function() {
    var track = document.querySelector('.care-slider-track');
    if (!track) return;

    var cards = track.querySelectorAll('.care-card');
    if (!cards.length) return;

    var prevBtn = document.querySelector('.prev-care');
    var nextBtn = document.querySelector('.next-care');
    var prevBtn2 = document.querySelector('.prev');
    var nextBtn2 = document.querySelector('.next');

    var GAP = 20;
    var AUTO_INTERVAL = 3000;
    var TOTAL = cards.length;

    // Clone all cards twice for infinite effect
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < TOTAL; j++) {
            track.appendChild(cards[j].cloneNode(true));
        }
    }

    var currentIndex = TOTAL;
    var autoTimer = null;
    var isAnimating = false;

    function getCardWidth() {
        var card = track.querySelector('.care-card');
        if (!card) return 314;
        return card.offsetWidth + GAP;
    }

    function getStep() {
        return getCardWidth();
    }

    // Set initial position instantly
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + (currentIndex * getStep()) + 'px)';

    function slideTo(index) {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex = index;
        track.style.transition = 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)';
        track.style.transform = 'translateX(-' + (currentIndex * getStep()) + 'px)';
    }

    function jumpTo(index) {
        currentIndex = index;
        track.style.transition = 'none';
        track.style.transform = 'translateX(-' + (currentIndex * getStep()) + 'px)';
        requestAnimationFrame(function() {
            isAnimating = false;
        });
    }

    // Silent reset after transition completes
    track.addEventListener('transitionend', function() {
        if (currentIndex >= TOTAL * 2) {
            jumpTo(TOTAL);
        } else if (currentIndex < TOTAL) {
            jumpTo(TOTAL);
        } else {
            isAnimating = false;
        }
    });

    function next() {
        slideTo(currentIndex + 1);
    }

    function prev() {
        slideTo(currentIndex - 1);
    }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(next, AUTO_INTERVAL);
    }

    function stopAuto() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    // Arrow controls - first set (header)
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            next();
            startAuto();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            prev();
            startAuto();
        });
    }

    // Arrow controls - second set (bottom)
    if (nextBtn2) {
        nextBtn2.addEventListener('click', function(e) {
            e.preventDefault();
            next();
            startAuto();
        });
    }

    if (prevBtn2) {
        prevBtn2.addEventListener('click', function(e) {
            e.preventDefault();
            prev();
            startAuto();
        });
    }

    // Pause on hover
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    // Smooth touch/drag support for mobile
    var touchStartX = 0;
    var isDragging = false;

    track.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        isDragging = true;
        stopAuto();
        track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        var currentX = e.changedTouches[0].screenX;
        var diff = touchStartX - currentX;
        var baseTranslate = -(currentIndex * getStep());
        track.style.transform = 'translateX(' + (baseTranslate - diff) + 'px)';
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
        isDragging = false;
        var touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) { next(); } else { prev(); }
        } else {
            track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            track.style.transform = 'translateX(-' + (currentIndex * getStep()) + 'px)';
        }
        startAuto();
    }, { passive: true });

    // Recalculate on resize
    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            track.style.transition = 'none';
            track.style.transform = 'translateX(-' + (currentIndex * getStep()) + 'px)';
        }, 150);
    }, { passive: true });

    // Start auto-slide
    startAuto();
})();

// ===== FAQ Accordion Logic =====
(function() {
    var faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(function(item) {
        var question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            var isActive = item.classList.contains('active');
            
            // Close other items
            faqItems.forEach(function(otherItem) {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
})();

// ===== Testimonials Auto-Slide Logic =====
(function() {
    var track = document.querySelector('.testimonials-track');
    if (!track) return;
    
    var pos = 0;
    var speed = 0.5; // Pixels per frame
    var isPaused = false;
    
    function animate() {
        if (!isPaused) {
            pos -= speed;
            
            var firstCard = track.querySelector('.testimonial-card');
            if (firstCard) {
                var cardWidth = firstCard.offsetWidth + 24; // Width + gap
                if (pos <= -cardWidth) {
                    pos += cardWidth;
                    track.appendChild(firstCard);
                }
            }
            
            track.style.transform = 'translateX(' + pos + 'px)';
        }
        requestAnimationFrame(animate);
    }
    
    // Pause on hover
    track.addEventListener('mouseenter', function() { isPaused = true; });
    track.addEventListener('mouseleave', function() { isPaused = false; });
    
    animate();
})();
