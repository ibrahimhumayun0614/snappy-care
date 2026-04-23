// ===== SCRIPT INITIALIZATION DEBUG =====
console.log('🚀 Script.js loaded and executing');
console.log('📄 Document ready state:', document.readyState);
console.log('📄 Window location:', window.location.href);

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

// ===== Navigation Logic (Mobile Menu & Dropdowns) =====
(function() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav = document.querySelector('.nav');
    var dropdowns = document.querySelectorAll('.nav-item.dropdown');

    if (!toggle || !nav) return;

    var isOpen = false;
    var mobileQuery = window.matchMedia('(max-width: 1024px)');

    function closeAllDropdowns() {
        dropdowns.forEach(function(dropdown) {
            dropdown.classList.remove('dropdown-active');
            var link = dropdown.querySelector('.nav-link');
            var icon = dropdown.querySelector('.dropdown-icon');
            if (link) link.setAttribute('aria-expanded', 'false');
            if (icon) icon.style.transform = '';
        });
    }

    function toggleMenu(forceClose) {
        if (forceClose === true) {
            isOpen = false;
        } else if (forceClose === false) {
            isOpen = true;
        } else {
            isOpen = !isOpen;
        }

        if (isOpen) {
            nav.classList.add('active');
            toggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            closeAllDropdowns();
            document.body.style.overflow = '';
        }
    }

    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    dropdowns.forEach(function(dropdown) {
        var link = dropdown.querySelector('.nav-link');
        if (!link) return;

        link.setAttribute('aria-haspopup', 'true');
        link.setAttribute('aria-expanded', 'false');

        link.addEventListener('click', function(e) {
            if (!mobileQuery.matches) return;

            e.preventDefault();
            e.stopPropagation();

            dropdowns.forEach(function(item) {
                if (item !== dropdown) {
                    item.classList.remove('dropdown-active');
                    var itemLink = item.querySelector('.nav-link');
                    var itemIcon = item.querySelector('.dropdown-icon');
                    if (itemLink) itemLink.setAttribute('aria-expanded', 'false');
                    if (itemIcon) itemIcon.style.transform = '';
                }
            });

            dropdown.classList.toggle('dropdown-active');
            var isActive = dropdown.classList.contains('dropdown-active');
            link.setAttribute('aria-expanded', isActive ? 'true' : 'false');

            var icon = dropdown.querySelector('.dropdown-icon');
            if (icon) {
                icon.style.transform = isActive ? 'rotate(180deg)' : '';
            }
        });
    });

    // Important fix: exclude dropdown parent links from auto-close.
    var allLinks = nav.querySelectorAll('.nav-item:not(.dropdown) > .nav-link, .dropdown-link, .nav-cta .btn-primary');
    allLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (mobileQuery.matches && isOpen) {
                toggleMenu(true);
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
            toggleMenu(true);
        }
    });

    window.addEventListener('resize', function() {
        if (!mobileQuery.matches && isOpen) {
            toggleMenu(true);
        }
    }, { passive: true });
})();

// ===== Smooth Dropdown Toggle (Mobile) =====
(function() {
    // Disabled legacy debug handler. A stable mobile handler is defined below.
    return;

    console.log('� [DROPDOWN] Module initializing...');
    
    // First, let's check if DOM is ready
    if (document.readyState === 'loading') {
        console.warn('⚠️ [DROPDOWN] DOM still loading, waiting for it to finish...');
        document.addEventListener('DOMContentLoaded', arguments.callee);
        return;
    }
    
    // Check nav element
    var nav = document.querySelector('.nav');
    console.log('🔴 [DROPDOWN] Nav element:', nav ? 'FOUND ✅' : 'NOT FOUND ❌');
    if (nav) {
        console.log('  - Nav classes:', nav.className);
        console.log('  - Nav HTML:', nav.outerHTML.substring(0, 100) + '...');
    }
    
    if (!nav) {
        console.error('❌ [DROPDOWN] FATAL: Nav element not found!');
        return;
    }
    
    var mobileNavQuery = window.matchMedia('(max-width: 1024px)');
    console.log('🔴 [DROPDOWN] Mobile viewport (≤1024px):', mobileNavQuery.matches ? 'YES ✅' : 'NO');
    
    // Check for dropdowns
    var allDropdowns = nav.querySelectorAll('.nav-item.dropdown');
    console.log('🔴 [DROPDOWN] Dropdowns found:', allDropdowns.length);
    if (allDropdowns.length === 0) {
        console.error('❌ [DROPDOWN] FATAL: No dropdowns found in nav!');
        // Try to find nav-items at all
        var navItems = nav.querySelectorAll('.nav-item');
        console.log('    But found nav-items:', navItems.length);
        navItems.forEach(function(item, i) {
            console.log('      Item ' + i + ':', item.className, item.innerHTML.substring(0, 50));
        });
        return;
    }
    
    // List all dropdowns
    allDropdowns.forEach(function(d, i) {
        var title = d.querySelector('.nav-link') ? d.querySelector('.nav-link').textContent.trim() : 'Unknown';
        console.log('  [' + i + '] ' + title);
    });
    
    // Add click event listener
    console.log('🔴 [DROPDOWN] Adding click event listener to nav...');
    nav.addEventListener('click', function(e) {
        console.log('🔵 [DROPDOWN] Click event fired');
        console.log('  - Target:', e.target.tagName, e.target.className);
        console.log('  - Mobile:', mobileNavQuery.matches ? 'YES' : 'NO');
        
        var link = e.target.closest('.nav-link');
        console.log('  - Found .nav-link via closest():', !!link);
        
        if (!link) {
            console.log('  ❌ Not a nav-link, returning');
            return;
        }
        
        var dropdown = link.closest('.nav-item.dropdown');
        console.log('  - Found .nav-item.dropdown via closest():', !!dropdown);
        
        if (!dropdown) {
            console.log('  ❌ Not inside a dropdown, returning');
            return;
        }
        
        if (!mobileNavQuery.matches) {
            console.log('  ⚠️ Not on mobile view (viewport > 1024px), ignoring');
            return;
        }
        
        console.log('✅ [DROPDOWN] Processing mobile dropdown toggle');
        e.preventDefault();
        
        var linkText = link.textContent.trim();
        var isActive = dropdown.classList.contains('dropdown-active');
        console.log('  - Dropdown:', linkText);
        console.log('  - Currently active:', isActive);
        
        // Close other dropdowns
        allDropdowns.forEach(function(d) {
            if (d !== dropdown && d.classList.contains('dropdown-active')) {
                console.log('  - Closing other dropdown');
                d.classList.remove('dropdown-active');
                var dLink = d.querySelector('.nav-link');
                var dIcon = d.querySelector('.dropdown-icon');
                if (dLink) dLink.setAttribute('aria-expanded', 'false');
                if (dIcon) dIcon.style.transform = '';
            }
        });
        
        // Toggle current
        dropdown.classList.toggle('dropdown-active');
        var newState = dropdown.classList.contains('dropdown-active');
        console.log('  - New state:', newState ? 'OPEN' : 'CLOSED');
        
        link.setAttribute('aria-expanded', newState ? 'true' : 'false');
        var icon = dropdown.querySelector('.dropdown-icon');
        if (icon) icon.style.transform = newState ? 'rotate(180deg)' : '';
        
        console.log('✅ [DROPDOWN] Toggle complete');
    }, false);
    
    // Initialize aria
    console.log('🔴 [DROPDOWN] Initializing aria attributes...');
    var dropdownLinks = document.querySelectorAll('.nav-item.dropdown .nav-link');
    console.log('  - Found ' + dropdownLinks.length + ' dropdown links');
    
    dropdownLinks.forEach(function(link) {
        link.setAttribute('aria-haspopup', 'true');
        link.setAttribute('aria-expanded', 'false');
    });
    
    console.log('✅ [DROPDOWN] Module initialization complete');
})();

// ===== Stable Dropdown Toggle (Mobile) =====
(function() {
    // Disabled in favor of unified Navigation Logic block above.
    return;

    var nav = document.querySelector('.nav');
    if (!nav) return;

    var mobileNavQuery = window.matchMedia('(max-width: 1024px)');
    var dropdowns = nav.querySelectorAll('.nav-item.dropdown');
    if (!dropdowns.length) return;

    function setDropdownState(dropdown, isOpen) {
        dropdown.classList.toggle('dropdown-active', isOpen);

        var link = dropdown.querySelector('.nav-link');
        if (link) {
            link.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }

        var menu = dropdown.querySelector('.dropdown-menu');
        if (menu && mobileNavQuery.matches) {
            menu.style.display = isOpen ? 'block' : 'none';
        } else if (menu) {
            menu.style.display = '';
        }

        var icon = dropdown.querySelector('.dropdown-icon');
        if (icon) {
            icon.style.transform = isOpen ? 'rotate(180deg)' : '';
        }
    }

    dropdowns.forEach(function(dropdown) {
        var link = dropdown.querySelector('.nav-link');
        if (!link) return;
        link.setAttribute('aria-haspopup', 'true');
        link.setAttribute('aria-expanded', 'false');
        link.setAttribute('role', 'button');
        setDropdownState(dropdown, false);
    });

    function handleDropdownToggle(e) {
        if (!mobileNavQuery.matches) return;

        var link = e.target.closest('.nav-item.dropdown > .nav-link');
        if (!link || !nav.contains(link)) return;

        var dropdown = link.closest('.nav-item.dropdown');
        if (!dropdown) return;

        e.preventDefault();
        e.stopPropagation();
        var shouldOpen = !dropdown.classList.contains('dropdown-active');

        dropdowns.forEach(function(otherDropdown) {
            if (otherDropdown !== dropdown) {
                setDropdownState(otherDropdown, false);
            }
        });

        setDropdownState(dropdown, shouldOpen);
    }

    function resetDesktopDropdownStyles() {
        if (mobileNavQuery.matches) return;
        dropdowns.forEach(function(dropdown) {
            var menu = dropdown.querySelector('.dropdown-menu');
            var icon = dropdown.querySelector('.dropdown-icon');
            if (menu) menu.style.display = '';
            if (icon) icon.style.transform = '';
        });
    }

    if (typeof mobileNavQuery.addEventListener === 'function') {
        mobileNavQuery.addEventListener('change', resetDesktopDropdownStyles);
    } else if (typeof mobileNavQuery.addListener === 'function') {
        mobileNavQuery.addListener(resetDesktopDropdownStyles);
    }

    nav.addEventListener('touchstart', handleDropdownToggle, { passive: false, capture: true });
    nav.addEventListener('click', handleDropdownToggle, true);
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
            if (hiddenInput && hiddenInput.name === 'service') {
                updateSubServices(value, select);
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

    function updateSubServices(serviceKey, serviceSelect) {
        var form = serviceSelect ? serviceSelect.closest('form') : document;
        var subRow = form.querySelector('[data-sub-service-row], #sub-service-row');
        var subOptionsContainer = form.querySelector('[data-sub-service-options], #sub-service-options');
        var subHiddenInput = form.querySelector('input[name="sub-service"]');
        var subSelect = form.querySelector('[data-sub-service-select], #sub-service-select');

        if (!subRow || !subOptionsContainer || !subHiddenInput || !subSelect) return;

        var subTriggerSpan = subSelect.querySelector('.custom-select-trigger span');
        if (!subTriggerSpan) return;

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

// ===== Blog Post TOC (auto from h2) =====
(function() {
    var postContent = document.getElementById('blog-post-content');
    var tocList = document.getElementById('blog-toc-list');
    if (!postContent || !tocList) return;

    var headings = Array.prototype.slice.call(postContent.querySelectorAll('h2'));
    if (!headings.length) return;

    function slugify(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }

    var usedIds = {};
    headings.forEach(function(heading, index) {
        var base = heading.id || slugify(heading.textContent) || ('section-' + (index + 1));
        var unique = base;
        if (usedIds[base] != null) {
            usedIds[base] += 1;
            unique = base + '-' + usedIds[base];
        } else {
            usedIds[base] = 0;
        }
        heading.id = unique;

        var listItem = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#' + unique;
        link.className = 'blog-toc-link';
        link.textContent = heading.textContent;

        link.addEventListener('click', function(event) {
            event.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', '#' + unique);
        });

        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });

    var tocLinks = Array.prototype.slice.call(tocList.querySelectorAll('.blog-toc-link'));
    function setActive(activeId) {
        tocLinks.forEach(function(link) {
            var isActive = link.getAttribute('href') === ('#' + activeId);
            link.classList.toggle('active', isActive);
            if (isActive && window.innerWidth <= 1180) {
                link.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        });
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
            }
        });
    }, {
        rootMargin: '-18% 0px -62% 0px',
        threshold: 0
    });

    headings.forEach(function(heading) {
        observer.observe(heading);
    });

    var hash = window.location.hash ? window.location.hash.substring(1) : '';
    var initial = headings.some(function(heading) { return heading.id === hash; }) ? hash : headings[0].id;
    setActive(initial);

    var tocPanel = tocList.closest('.blog-toc-panel');
    var mobileTocQuery = window.matchMedia('(max-width: 1180px)');
    var postEndMarker = document.querySelector('.blog-post-end-marker');

    function updateMobileTocBoundary() {
        if (!tocPanel) return;

        if (!mobileTocQuery.matches) {
            tocPanel.classList.remove('is-past-post');
            return;
        }

        var tocHeight = tocPanel.offsetHeight || 72;
        var boundaryRect = (postEndMarker || postContent).getBoundingClientRect();
        var shouldHide = boundaryRect.top <= window.innerHeight - tocHeight - 8;
        tocPanel.classList.toggle('is-past-post', shouldHide);
    }

    updateMobileTocBoundary();
    window.addEventListener('scroll', updateMobileTocBoundary, { passive: true });
    window.addEventListener('resize', updateMobileTocBoundary);
    if (mobileTocQuery.addEventListener) {
        mobileTocQuery.addEventListener('change', updateMobileTocBoundary);
    } else if (mobileTocQuery.addListener) {
        mobileTocQuery.addListener(updateMobileTocBoundary);
    }
})();

// ===== Blog Appointment Modal =====
(function() {
    var modal = document.getElementById('appointmentModal');
    var triggers = document.querySelectorAll('.appointment-modal-trigger');
    var closeButton = document.getElementById('appointmentModalClose');
    var form = document.getElementById('appointment-form');
    if (!modal || !triggers.length || !closeButton) return;

    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var firstField = modal.querySelector('form input, form textarea, form button');
        if (firstField) firstField.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    triggers.forEach(function(trigger) {
        trigger.addEventListener('click', openModal);
    });

    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Thank you for your message! Our team will contact you soon.');
            form.reset();
            form.querySelectorAll('.custom-select').forEach(function(select) {
                select.classList.remove('open');
                select.querySelectorAll('.custom-option').forEach(function(option) {
                    option.classList.remove('selected');
                });
            });

            var serviceLabel = form.querySelector('#appointment-service-select .custom-select-trigger span');
            var subServiceLabel = form.querySelector('#appointment-sub-service-select .custom-select-trigger span');
            var subServiceRow = form.querySelector('#appointment-sub-service-row');
            if (serviceLabel) serviceLabel.textContent = 'Select a service';
            if (subServiceLabel) subServiceLabel.textContent = 'Select an option';
            if (subServiceRow) subServiceRow.style.display = 'none';
            closeModal();
        });
    }
})();

// ===== Blog Post Copy Link =====
(function() {
    var copyButton = document.getElementById('blog-post-copy');
    if (!copyButton) return;

    var defaultTitle = copyButton.getAttribute('title') || 'Copy post link';
    var resetTimer = null;

    function setCopiedState(text) {
        copyButton.setAttribute('title', text);
        copyButton.setAttribute('aria-label', text);
        copyButton.classList.add('copied');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function() {
            copyButton.setAttribute('title', defaultTitle);
            copyButton.setAttribute('aria-label', defaultTitle);
            copyButton.classList.remove('copied');
        }, 1800);
    }

    copyButton.addEventListener('click', function() {
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() {
                setCopiedState('Copied');
            }).catch(function() {
                setCopiedState('Copy failed');
            });
            return;
        }

        var input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();

        try {
            document.execCommand('copy');
            setCopiedState('Copied');
        } catch (error) {
            setCopiedState('Copy failed');
        }

        document.body.removeChild(input);
    });
})();
