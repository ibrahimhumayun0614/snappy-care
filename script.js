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
        '.insights-subtitle', '.insights-title', '.insight-card',
        '.page-title', '.contact-info-card', '.contact-form-card', '.map-container',
        '.about-intro-grid', '.pillar-card', '.feature-row', '.community-impact-card', '.partner-logo-item',
        '.chairman-container', '.team-member-profile', '.value-item'
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

// ===== Custom Select Dropdown Logic =====
(function() {
    var customSelects = document.querySelectorAll('.custom-select');
    if (!customSelects.length) return;

    var subServiceData = {
        'autism': ['Autism Caregiver', 'Special Needs Child Care', 'ASD/AHSD Care (3 Months)', 'ASD/AHSD Care (1 Year Contract)'],
        'elderly': ['Post-Surgery Care', 'General Care Help', 'Professional Caregivers', 'Wound Care'],
        'pregnancy': ['Personalized Nutritional Counseling', 'Fitness and Wellness Programs', 'Prenatal Education Workshops', 'Emotional and Psychological Support', 'Postpartum Care'],
        'physio': ['Pain Management', 'Mobility and Strength Training', 'Balance and Fall Prevention', 'Post-operative Rehabilitation', 'Chronic Condition Management', 'Evaluation and Treatment Plans'],
        'baby': ['Babysitter', 'Nanny', 'Special Needs Care'],
        'doctor': ['GP Visit at Home'],
        'nursing': ['Wound Dressing', 'IV or IM Injections', 'Overnight Stays', 'Personal Care'],
        'iv': ['Immune Booster', 'Hangover Booster', 'Detox IV', 'Vitamins Infusion', 'Memory Boost', 'Diabetic Therapy', 'Fertility Boost (Male/Female)', 'Hair Loss IV Therapy', 'Cardio Support IV Therapy'],
        'lab': ['Comprehensive Wellness Package', 'Anemia Profile Analysis', 'Hormone Profile (Men & Women)', 'PCOS/PCOD Package', 'Cancer Marker Screening', 'Pediatric Package', 'STD Profile Screening', 'General Lab Tests', 'Thyroid Profile Testing']
    };

    function initSelect(select) {
        var trigger = select.querySelector('.custom-select-trigger');
        var optionsContainer = select.querySelector('.custom-options');
        var options = optionsContainer.querySelectorAll('.custom-option');
        var hiddenInput = select.parentElement.querySelector('input[type="hidden"]');

        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.custom-select').forEach(function(s) {
                if (s !== select) s.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        function handleOptionClick(option) {
            var value = option.getAttribute('data-value');
            var text = option.textContent;

            trigger.querySelector('span').textContent = text;
            if (hiddenInput) {
                hiddenInput.value = value;
                var event = new Event('change');
                hiddenInput.dispatchEvent(event);
            }

            optionsContainer.querySelectorAll('.custom-option').forEach(function(opt) { 
                opt.classList.remove('selected'); 
            });
            option.classList.add('selected');
            select.classList.remove('open');

            // Handle sub-service logic
            if (select.id === 'service-select') {
                updateSubServices(value);
            }
        }

        options.forEach(function(option) {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                handleOptionClick(this);
            });
        });

        return handleOptionClick;
    }

    function updateSubServices(serviceKey) {
        var subRow = document.getElementById('sub-service-row');
        var subOptionsContainer = document.getElementById('sub-service-options');
        var subHiddenInput = document.getElementById('sub-service');
        var subSelect = document.getElementById('sub-service-select');
        var subTriggerSpan = subSelect.querySelector('.custom-select-trigger span');

        if (!subRow || !subOptionsContainer) return;

        var subItems = subServiceData[serviceKey];

        if (subItems && subItems.length > 0) {
            // Clear current options
            subOptionsContainer.innerHTML = '';
            
            // Populate new options
            subItems.forEach(function(item) {
                var span = document.createElement('span');
                span.className = 'custom-option';
                span.setAttribute('data-value', item.toLowerCase().replace(/\s+/g, '-'));
                span.textContent = item;
                subOptionsContainer.appendChild(span);
                
                span.addEventListener('click', function(e) {
                    e.stopPropagation();
                    subTriggerSpan.textContent = item;
                    subHiddenInput.value = span.getAttribute('data-value');
                    
                    subOptionsContainer.querySelectorAll('.custom-option').forEach(function(opt) {
                        opt.classList.remove('selected');
                    });
                    span.classList.add('selected');
                    subSelect.classList.remove('open');
                });
            });

            // Reset sub-selection
            subTriggerSpan.textContent = 'Select an option';
            subHiddenInput.value = '';
            
            // Show the row
            subRow.style.display = 'block';
            
            // Re-apply motion reveal if needed
            subRow.style.opacity = '1';
            subRow.style.transform = 'translateY(0)';
        } else {
            subRow.style.display = 'none';
            subHiddenInput.value = '';
        }
    }

    customSelects.forEach(function(select) {
        initSelect(select);
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('.custom-select').forEach(function(select) {
            select.classList.remove('open');
        });
    });
})();

// ===== Job Description Toggle Logic =====
(function() {
    const toggleButtons = document.querySelectorAll('.toggle-details');
    if (!toggleButtons.length) return;

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const positionItem = button.closest('.position-item');
            const description = positionItem.querySelector('.job-description');
            
            // Toggle active classes
            button.classList.toggle('active');
            description.classList.toggle('active');
            
            // Update button text
            if (description.classList.contains('active')) {
                button.innerHTML = 'Hide Details <i class="fa-solid fa-chevron-up"></i>';
            } else {
                button.innerHTML = 'View Details <i class="fa-solid fa-chevron-down"></i>';
            }
        });
    });

    // Application Modal Logic
    const applyModal = document.getElementById('applyModal');
    const applyButtons = document.querySelectorAll('.apply-btn');
    const closeModal = document.getElementById('closeModal');
    const modalJobTitle = document.getElementById('modalJobTitle');
    const appliedPositionField = document.getElementById('appliedPositionField');
    const applicationForm = document.getElementById('applicationForm');

    if (applyModal && applyButtons.length > 0) {
        applyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const positionItem = button.closest('.position-item');
                const jobTitle = positionItem.querySelector('.pos-title').textContent;
                
                // Populate modal
                modalJobTitle.textContent = jobTitle;
                appliedPositionField.value = jobTitle;
                
                // Show modal
                applyModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scroll
            });
        });

        closeModal.addEventListener('click', () => {
            applyModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scroll
        });

        // Close on clicking outside container
        applyModal.addEventListener('click', (e) => {
            if (e.target === applyModal) {
                applyModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Form Submission
        if (applicationForm) {
            applicationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Thank you! Your application for ' + appliedPositionField.value + ' has been submitted successfully.');
                applyModal.classList.remove('active');
                document.body.style.overflow = '';
                applicationForm.reset();
            });
        }

        // Handle File Name Display
        const resumeUpload = document.getElementById('resumeUpload');
        const fileUploadContent = document.querySelector('.file-upload-content span');
        if (resumeUpload) {
            resumeUpload.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    fileUploadContent.textContent = 'Selected: ' + e.target.files[0].name;
                }
            });
        }
    }
})();

// ===== Community Slider Logic =====
(function() {
    var track = document.querySelector('.community-slider-track');
    var slides = document.querySelectorAll('.community-slide');
    var dots = document.querySelectorAll('.slider-dot');
    var prevBtn = document.querySelector('.arrow-prev');
    var nextBtn = document.querySelector('.arrow-next');

    if (!track || slides.length === 0) return;

    var currentIndex = 0;

    function updateSlider(index) {
        currentIndex = index;
        var offset = -currentIndex * 100;
        track.style.transform = 'translateX(' + offset + '%)';

        // Update dots
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            updateSlider(index);
        });
    });

    // Auto-slide every 5 seconds
    var autoSlide = setInterval(function() {
        var index = (currentIndex + 1) % slides.length;
        updateSlider(index);
    }, 5000);

    // Pause on hover
    var container = document.querySelector('.community-slider-container');
    if (container) {
        container.addEventListener('mouseenter', function() {
            clearInterval(autoSlide);
        });
        container.addEventListener('mouseleave', function() {
            autoSlide = setInterval(function() {
                var index = (currentIndex + 1) % slides.length;
                updateSlider(index);
            }, 5000);
        });
    }
})();

// Reveal on Scroll Logic
(function() {
    var revealElements = document.querySelectorAll('.reveal');
    var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(function(el) {
        revealObserver.observe(el);
    });
})();
