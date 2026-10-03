/**
 * H4 GYM - Interactive Navigation & Website Controller
 * Features:
 * - Smooth desktop & mobile anchor scrolling with fixed-header offset
 * - Interactive mobile hamburger menu (open, close on toggle, close on link click & backdrop)
 * - "Join Now" direct smooth navigation to membership
 * - Dynamic active link highlighting on scroll (ScrollSpy)
 * - Persistent Dark / Light theme toggle preference with LocalStorage
 * - Non-intrusive contact form validation & feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. DOM ELEMENT SELECTORS
    // -------------------------------------------------------------------------
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navToggleLabel = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navCta = document.querySelector('.nav-cta');
    const themeToggle = document.getElementById('theme-toggle');
    const sections = document.querySelectorAll('main section[id]');
    const allHashLinks = document.querySelectorAll('a[href^="#"]');

    // -------------------------------------------------------------------------
    // 2. MOBILE HAMBURGER MENU INTERACTION
    // -------------------------------------------------------------------------
    if (navToggle && navToggleLabel) {
        // Accessibility: sync aria-expanded state on toggle change
        navToggle.addEventListener('change', () => {
            const isOpened = navToggle.checked;
            navToggleLabel.setAttribute('aria-expanded', isOpened ? 'true' : 'false');
        });

        // Close mobile menu when clicking outside (backdrop click)
        document.addEventListener('click', (event) => {
            if (navToggle.checked) {
                const isClickInsideMenu = navMenu && navMenu.contains(event.target);
                const isClickOnToggle = navToggleLabel && navToggleLabel.contains(event.target);
                const isClickOnInput = event.target === navToggle;

                if (!isClickInsideMenu && !isClickOnToggle && !isClickOnInput) {
                    closeMobileMenu();
                }
            }
        });

        // Close mobile menu when pressing the Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navToggle.checked) {
                closeMobileMenu();
            }
        });

        // Close mobile menu when resizing back to desktop screen width
        window.addEventListener('resize', () => {
            if (window.innerWidth > 868 && navToggle.checked) {
                closeMobileMenu();
            }
        });
    }

    /**
     * Helper to safely close the mobile navigation drawer
     */
    function closeMobileMenu() {
        if (navToggle && navToggle.checked) {
            navToggle.checked = false;
            if (navToggleLabel) {
                navToggleLabel.setAttribute('aria-expanded', 'false');
            }
        }
    }

    // -------------------------------------------------------------------------
    // 3. SMOOTH NAVIGATION SCROLLING (DESKTOP & MOBILE)
    // -------------------------------------------------------------------------
    allHashLinks.forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Handle lone "#" links gracefully
            if (!targetId || targetId === '#') return;

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                e.preventDefault();

                // 1. Immediately close mobile menu if open
                closeMobileMenu();

                // 2. Compute dynamic header offset
                const headerHeight = header ? header.offsetHeight : 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                // 3. Smoothly scroll to the target
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // 4. Update active navigation link visually
                updateActiveLink(targetId);

                // 5. Update browser URL hash without jump
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            }
        });
    });

    /**
     * Set the .active class on the matching navbar link
     */
    function updateActiveLink(target) {
        navLinks.forEach((link) => {
            if (link.getAttribute('href') === target) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Determine current page filename (e.g., 'about.html', 'services.html', 'index.html')
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html') || (currentPath === 'index.html' && (href === 'index.html' || href === '#hero'))) {
            link.classList.add('active');
        } else if (!href.startsWith('#')) {
            link.classList.remove('active');
        }
    });

    // -------------------------------------------------------------------------
    // 4. SCROLLSPY: DYNAMIC ACTIVE NAV LINK ON SCROLL (MULTI-SECTION PAGES)
    // -------------------------------------------------------------------------
    if (sections.length > 1) {
        let isScrollThrottled = false;

        window.addEventListener('scroll', () => {
            if (!isScrollThrottled) {
                window.requestAnimationFrame(() => {
                    handleScrollSpy();
                    isScrollThrottled = false;
                });
                isScrollThrottled = true;
            }
        });

        function handleScrollSpy() {
            const scrollPosition = window.pageYOffset;
            const headerHeight = header ? header.offsetHeight : 80;

            sections.forEach((section) => {
                const sectionTop = section.offsetTop - headerHeight - 60;
                const sectionHeight = section.offsetHeight;
                const sectionId = `#${section.getAttribute('id')}`;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    updateActiveLink(sectionId);
                }
            });
        }
    }

    // -------------------------------------------------------------------------
    // 5. THEME PREFERENCE PERSISTENCE (DARK / LIGHT LOCALSTORAGE)
    // -------------------------------------------------------------------------
    if (themeToggle) {
        const savedTheme = localStorage.getItem('h4-theme-pref');

        // Restore saved preference
        if (savedTheme === 'light') {
            themeToggle.checked = true;
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            themeToggle.checked = false;
            document.documentElement.removeAttribute('data-theme');
        }

        // Save preference when user toggles
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                localStorage.setItem('h4-theme-pref', 'light');
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                localStorage.setItem('h4-theme-pref', 'dark');
                document.documentElement.removeAttribute('data-theme');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 6. MEMBERSHIP PLAN URL PARAMETER & BUTTON CONNECTIVITY
    // -------------------------------------------------------------------------
    const pricingCards = document.querySelectorAll('.pricing-card');
    const interestSelect = document.getElementById('interest');
    const nameInput = document.getElementById('fullName');

    // Auto-select interest dropdown if arriving from a plan button with ?plan=...
    if (interestSelect) {
        const urlParams = new URLSearchParams(window.location.search);
        const planParam = (urlParams.get('plan') || '').toLowerCase();
        if (planParam.includes('standard')) {
            interestSelect.value = 'general';
        } else if (planParam.includes('elite')) {
            interestSelect.value = 'classes';
        } else if (planParam.includes('champion') || planParam.includes('vip')) {
            interestSelect.value = 'personal-training';
        }
    }

    pricingCards.forEach((card) => {
        const ctaBtn = card.querySelector('.pricing-footer a');
        const planNameEl = card.querySelector('.plan-name');

        if (ctaBtn && interestSelect) {
            ctaBtn.addEventListener('click', () => {
                const href = ctaBtn.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const planTitle = planNameEl ? planNameEl.textContent.trim().toLowerCase() : '';

                    if (planTitle.includes('standard')) {
                        interestSelect.value = 'general';
                    } else if (planTitle.includes('elite')) {
                        interestSelect.value = 'classes';
                    } else if (planTitle.includes('champion') || planTitle.includes('vip')) {
                        interestSelect.value = 'personal-training';
                    }

                    setTimeout(() => {
                        if (nameInput) {
                            nameInput.focus();
                        }
                    }, 600);
                }
            });
        }
    });

    // -------------------------------------------------------------------------
    // 7. COMPREHENSIVE CONTACT FORM VALIDATION & SUCCESS FEEDBACK
    // -------------------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        const fullNameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const formAlert = document.getElementById('formAlert');
        const submitBtn = document.getElementById('submitBtn') || contactForm.querySelector('button[type="submit"]');

        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        const phoneError = document.getElementById('phoneError');

        // Validation Regex Patterns
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;

        /**
         * Helper: Set error state on a specific field
         */
        function setFieldError(input, errorElement, message) {
            input.classList.add('input-error');
            input.setAttribute('aria-invalid', 'true');
            if (errorElement) {
                errorElement.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
            }
        }

        /**
         * Helper: Clear error state on a specific field
         */
        function clearFieldError(input, errorElement) {
            input.classList.remove('input-error');
            input.removeAttribute('aria-invalid');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }

        // Real-time error clearing as user types
        fullNameInput.addEventListener('input', () => clearFieldError(fullNameInput, nameError));
        emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
        phoneInput.addEventListener('input', () => clearFieldError(phoneInput, phoneError));

        contactForm.addEventListener('submit', (e) => {
            // Prevent standard page reload
            e.preventDefault();

            let isValid = true;
            let firstInvalidField = null;

            // Hide any previous alert banner
            if (formAlert) {
                formAlert.className = 'form-alert';
                formAlert.innerHTML = '';
            }

            // 1. Validate Full Name (Required, min 2 characters)
            const nameVal = fullNameInput.value.trim();
            if (!nameVal) {
                setFieldError(fullNameInput, nameError, 'Full name is required.');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = fullNameInput;
            } else if (nameVal.length < 2) {
                setFieldError(fullNameInput, nameError, 'Name must be at least 2 characters.');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = fullNameInput;
            } else {
                clearFieldError(fullNameInput, nameError);
            }

            // 2. Validate Email (Required, proper email format)
            const emailVal = emailInput.value.trim();
            if (!emailVal) {
                setFieldError(emailInput, emailError, 'Email address is required.');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = emailInput;
            } else if (!emailRegex.test(emailVal)) {
                setFieldError(emailInput, emailError, 'Please enter a valid email address (e.g. name@domain.com).');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = emailInput;
            } else {
                clearFieldError(emailInput, emailError);
            }

            // 3. Validate Phone Number (Required, proper digits & format)
            const phoneVal = phoneInput.value.trim();
            const rawDigits = phoneVal.replace(/\D/g, ''); // Extract digits only

            if (!phoneVal) {
                setFieldError(phoneInput, phoneError, 'Phone number is required.');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = phoneInput;
            } else if (!phoneRegex.test(phoneVal) || rawDigits.length < 10) {
                setFieldError(phoneInput, phoneError, 'Please enter a valid phone number (at least 10 digits).');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = phoneInput;
            } else {
                clearFieldError(phoneInput, phoneError);
            }

            // If any validation failed, focus the first problematic input
            if (!isValid) {
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                return;
            }

            // 4. Submission Processing (Valid State)
            const originalButtonHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

            setTimeout(() => {
                // Display Clear Success Message
                if (formAlert) {
                    const safeName = nameVal.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    formAlert.className = 'form-alert form-success show';
                    formAlert.innerHTML = `
                        <i class="fa-solid fa-circle-check"></i>
                        <div>
                            <strong>Pass Reserved!</strong> Thank you, ${safeName}. Your inquiry has been submitted successfully. Our team will contact you shortly to confirm your visit!
                        </div>
                    `;
                }

                // Reset form inputs & clear classes
                contactForm.reset();
                clearFieldError(fullNameInput, nameError);
                clearFieldError(emailInput, emailError);
                clearFieldError(phoneInput, phoneError);

                // Update button status
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';

                // Restore original button state after delay
                setTimeout(() => {
                    submitBtn.innerHTML = originalButtonHtml;
                }, 4000);
            }, 600);
        });
    }

    // -------------------------------------------------------------------------
    // 8. NEWSLETTER FORM HANDLER
    // -------------------------------------------------------------------------
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            const btn = newsletterForm.querySelector('button');

            if (!input.value || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
                input.focus();
                return;
            }

            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            input.value = '';
            input.placeholder = 'Subscribed successfully!';

            setTimeout(() => {
                btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
                input.placeholder = 'Your email address';
            }, 3000);
        });
    }

    // -------------------------------------------------------------------------
    // 9. TRAINER PROFILE MODAL INTERACTION
    // -------------------------------------------------------------------------
    const trainersData = {
        marcus: {
            name: "Marcus Vance",
            specialization: "Head Strength & Conditioning",
            experience: "12+ Years Coaching Pro Athletes",
            bio: "CSCS certified with over a decade preparing professional powerlifters, collegiate athletes, and everyday lifters. Marcus specializes in barbell biomechanics, neuromuscular force production, and long-term athletic longevity.",
            image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80",
            trainingAreas: ["Powerlifting Mechanics", "Olympic Weightlifting", "Hypertrophy Protocols", "Athletic Conditioning", "Injury Prevention"]
        },
        elena: {
            name: "Elena Rostova",
            specialization: "HIIT & Calisthenics Specialist",
            experience: "8+ Years High-Performance Coaching",
            bio: "Former competitive artistic gymnast turned functional conditioning master. Elena designs high-velocity metabolic circuits that accelerate fat burn, enhance neuromuscular reflexes, and build explosive bodyweight control.",
            image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80",
            trainingAreas: ["Metabolic HIIT Circuits", "Bodyweight Calisthenics", "Core & Pelvic Stability", "Plyometric Agility", "Joint Mobility Flow"]
        },
        darius: {
            name: "Darius Cole",
            specialization: "Combat & Striking Coach",
            experience: "10+ Years Ring & Boxing Experience",
            bio: "Former Golden Gloves contender with extensive coaching experience across amateur fighters and functional combat athletes. Darius emphasizes precise footwork, rotational kinetic power, and unyielding anaerobic endurance.",
            image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80",
            trainingAreas: ["Boxing Fundamentals", "Heavy Bag Intervals", "Focus Mitt Pad Work", "Defensive Footwork", "Combat Stamina"]
        },
        aria: {
            name: "Aria Montgomery",
            specialization: "Holistic Nutritionist & Personal Trainer",
            experience: "9+ Years Clinical & Sports Nutrition",
            bio: "Holding a Master of Science in Sports Nutrition, Aria bridges the gap between intense resistance training and metabolic recovery. She coaches clients on sustainable macro periodization, gut health, and hormonal harmony.",
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80",
            trainingAreas: ["Sports Nutrition Blueprints", "Macro Periodization", "Body Recomposition", "Metabolic Recovery", "Mindful Nutrition"]
        }
    };

    const trainerModal = document.getElementById('trainerModal');
    const trainerModalCard = document.getElementById('trainerModalCard');
    const trainerModalClose = document.getElementById('trainerModalClose');
    const trainerModalBody = document.getElementById('trainerModalBody');
    const profileButtons = document.querySelectorAll('.btn-trainer-profile');

    /**
     * Open Trainer Profile Modal
     */
    function openTrainerModal(trainerKey) {
        const trainer = trainersData[trainerKey];
        if (!trainer || !trainerModal || !trainerModalBody) return;

        // Render training area chips
        const areasHtml = trainer.trainingAreas
            .map((area) => `<span class="modal-area-chip"><i class="fa-solid fa-check"></i> ${area}</span>`)
            .join('');

        // Populate modal content
        trainerModalBody.innerHTML = `
            <div class="modal-trainer-header">
                <img src="${trainer.image}" alt="${trainer.name}" class="modal-trainer-avatar">
                <div class="modal-trainer-meta">
                    <h3 class="modal-trainer-name" id="modalTrainerName">${trainer.name}</h3>
                    <span class="modal-trainer-role">${trainer.specialization}</span>
                    <span class="modal-experience-badge">
                        <i class="fa-solid fa-award"></i> ${trainer.experience}
                    </span>
                </div>
            </div>

            <h4 class="modal-section-title">Biography & Coaching Philosophy</h4>
            <p class="modal-trainer-bio">${trainer.bio}</p>

            <h4 class="modal-section-title">Key Training Areas</h4>
            <div class="modal-areas-list">
                ${areasHtml}
            </div>

            <a href="#contact" class="btn btn-primary modal-cta-btn" id="modalBookBtn">
                Train with ${trainer.name.split(' ')[0]} <i class="fa-solid fa-calendar-check"></i>
            </a>
        `;

        // Add action listener to modal booking button
        const modalBookBtn = document.getElementById('modalBookBtn');
        if (modalBookBtn) {
            modalBookBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeTrainerModal();

                // Set interest dropdown to personal training
                const interestSelect = document.getElementById('interest');
                if (interestSelect) {
                    interestSelect.value = 'personal-training';
                }

                // Smooth scroll to contact section
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPos = contactSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({ top: targetPos, behavior: 'smooth' });

                    setTimeout(() => {
                        const nameField = document.getElementById('fullName');
                        if (nameField) nameField.focus();
                    }, 600);
                }
            });
        }

        // Open Modal state
        trainerModal.classList.add('active');
        trainerModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (trainerModalClose) {
            trainerModalClose.focus();
        }
    }

    /**
     * Close Trainer Profile Modal
     */
    function closeTrainerModal() {
        if (!trainerModal) return;
        trainerModal.classList.remove('active');
        trainerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Attach click events to each "View Profile" button
    profileButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
            const trainerKey = this.dataset.trainer;
            openTrainerModal(trainerKey);
        });
    });

    // Close button click
    if (trainerModalClose) {
        trainerModalClose.addEventListener('click', closeTrainerModal);
    }

    // Close when clicking outside the modal card (backdrop overlay click)
    if (trainerModal) {
        trainerModal.addEventListener('click', (event) => {
            if (event.target === trainerModal) {
                closeTrainerModal();
            }
        });
    }

    // Close on Escape key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && trainerModal && trainerModal.classList.contains('active')) {
            closeTrainerModal();
        }
    });

    // -------------------------------------------------------------------------
    // GALLERY INTERACTION & LIGHTBOX
    // -------------------------------------------------------------------------
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentImageIndex = 0;

    // Scroll Reveal with Intersection Observer
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    galleryItems.forEach(item => {
        revealObserver.observe(item);
        
        // Lightbox Click Event
        item.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            openLightbox(index);
        });
    });

    function openLightbox(index) {
        if (!lightbox) return;
        currentImageIndex = index;
        if (lightboxPrev) lightboxPrev.style.display = 'flex';
        if (lightboxNext) lightboxNext.style.display = 'flex';
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function openCustomLightbox(src, alt, caption) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt || 'Preview';
        if (lightboxCaption) {
            lightboxCaption.textContent = caption || '';
        }
        if (lightboxPrev) lightboxPrev.style.display = 'none';
        if (lightboxNext) lightboxNext.style.display = 'none';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        if (lightboxPrev) lightboxPrev.style.display = 'flex';
        if (lightboxNext) lightboxNext.style.display = 'flex';
    }

    function updateLightboxContent() {
        if (galleryItems.length === 0) return;
        const item = galleryItems[currentImageIndex];
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-title').textContent;
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = title;
    }

    function showNextImage() {
        if (galleryItems.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
        updateLightboxContent();
    }

    function showPrevImage() {
        if (galleryItems.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxContent();
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight' && lightboxNext && lightboxNext.style.display !== 'none') showNextImage();
            if (e.key === 'ArrowLeft' && lightboxPrev && lightboxPrev.style.display !== 'none') showPrevImage();
        }
    });

    // -------------------------------------------------------------------------
    // TESTIMONIALS & TRANSFORMATIONS INTERACTION
    // -------------------------------------------------------------------------
    // 1. Dual-View Tab Switching (Transformation Photo vs. Google Review Proof)
    const testimonialTabButtons = document.querySelectorAll('.testimonial-view-tabs .tab-btn');
    testimonialTabButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.testimonial-card');
            if (!card) return;

            const targetView = this.getAttribute('data-target');
            const siblingTabs = card.querySelectorAll('.tab-btn');
            const viewports = card.querySelectorAll('.media-viewport');

            siblingTabs.forEach(tab => {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            viewports.forEach(vp => {
                if (vp.getAttribute('data-view') === targetView) {
                    vp.classList.add('active');
                } else {
                    vp.classList.remove('active');
                }
            });
        });
    });

    // 2. Click-to-Enlarge Lightbox Triggers for Testimonials & Review Summaries
    document.addEventListener('click', function(e) {
        const trigger = e.target.closest('[data-lightbox-src]');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            const src = trigger.getAttribute('data-lightbox-src');
            const caption = trigger.getAttribute('data-lightbox-caption') || '';
            const alt = trigger.getAttribute('aria-label') || caption;
            openCustomLightbox(src, alt, caption);
            return;
        }

        // Also allow clicking directly on media-viewport images
        const viewportImg = e.target.closest('.media-viewport img');
        if (viewportImg) {
            e.preventDefault();
            e.stopPropagation();
            const viewport = viewportImg.closest('.media-viewport');
            const card = viewportImg.closest('.testimonial-card');
            const expandBtn = viewport ? viewport.querySelector('.media-expand-btn') : null;
            const src = expandBtn ? expandBtn.getAttribute('data-lightbox-src') : viewportImg.src;
            const caption = expandBtn ? expandBtn.getAttribute('data-lightbox-caption') : (viewportImg.alt || 'Transformation Image');
            openCustomLightbox(src, viewportImg.alt, caption);
        }
    });

    // =========================================================================
    // GLOBAL ANIMATION ENGINE v2 – works on ALL pages automatically
    // 1. Scroll reveal with stagger   2. Stat counter animation
    // 3. Section title reveals        4. Contact/form reveals
    // =========================================================================
    (function initGlobalAnimations() {

        // ── Scroll Reveal: single elements ──
        const animationMap = [
            { sel: '.section-header',          anim: 'anim-fade-up' },
            { sel: '.section-tag:not(.section-header .section-tag)', anim: 'anim-fade-down' },
            { sel: '.google-reviews-summary-card', anim: 'anim-fade-up' },
            { sel: '.about-image-wrapper',     anim: 'anim-fade-left' },
            { sel: '.about-content',           anim: 'anim-fade-right' },
            { sel: '.contact-info',            anim: 'anim-fade-left' },
            { sel: '.contact-form-container',  anim: 'anim-fade-right' },
            { sel: '.contact-wrapper',         anim: 'anim-fade-up' },
            { sel: '.footer-bottom-strip',     anim: 'anim-fade-up' },
        ];

        // ── Scroll Reveal: staggered children in grids ──
        const staggerGroups = [
            { parentSel: '.services-grid',     childSel: '.service-card',   anim: 'anim-fade-up' },
            { parentSel: '.trainers-grid',     childSel: '.trainer-card',   anim: 'anim-fade-up' },
            { parentSel: '.membership-grid',   childSel: '.pricing-card',   anim: 'anim-scale-in' },
            { parentSel: '.testimonials-grid', childSel: '.testimonial-card', anim: 'anim-fade-up' },
            { parentSel: '.about-pillars',     childSel: '.pillar-item',    anim: 'anim-fade-up' },
            { parentSel: '.why-us-grid',       childSel: '.why-item',       anim: 'anim-fade-up' },
            { parentSel: '.footer-main-row',   childSel: '.footer-col',     anim: 'anim-fade-up' },
            { parentSel: '.gallery-grid',      childSel: '.gallery-item',   anim: 'anim-fade-up' },
        ];

        const allAnimEls = [];

        // 1. Single elements
        animationMap.forEach(({ sel, anim }) => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.closest('.hero-section')) return;
                el.classList.add('anim-ready', anim);
                allAnimEls.push(el);
            });
        });

        // 2. Staggered children
        staggerGroups.forEach(({ parentSel, childSel, anim }) => {
            document.querySelectorAll(parentSel).forEach(parent => {
                if (parent.closest('.hero-section')) return;
                const children = parent.querySelectorAll(childSel);
                children.forEach((child, i) => {
                    child.classList.add('anim-ready', anim, `anim-stagger-${Math.min(i + 1, 10)}`);
                    allAnimEls.push(child);
                });
            });
        });

        // 3. IntersectionObserver for scroll reveal
        if (allAnimEls.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('anim-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.08,
                rootMargin: '0px 0px -40px 0px'
            });

            allAnimEls.forEach(el => observer.observe(el));
        }

        // =====================================================================
        // STAT COUNTER ANIMATION – numbers count up when scrolled into view
        // Parses "1,200+" → target 1200, suffix "+", formats with commas
        // Parses "24/7"   → displayed as-is (not countable)
        // =====================================================================
        const statNumbers = document.querySelectorAll('.stat-number');

        if (statNumbers.length > 0) {
            // Store original text and prepare for counting
            const statData = [];
            statNumbers.forEach(el => {
                const original = el.textContent.trim();

                // Check if it's a non-numeric stat like "24/7"
                if (original.includes('/')) {
                    statData.push({ el, type: 'static', original });
                    return;
                }

                // Extract numeric part and suffix (e.g., "1,200+" → 1200, "+")
                const match = original.match(/^([\d,]+)(.*)$/);
                if (match) {
                    const target = parseInt(match[1].replace(/,/g, ''), 10);
                    const suffix = match[2] || '';
                    statData.push({ el, type: 'count', target, suffix, original });
                    // Set initial display to 0 + suffix
                    el.textContent = '0' + suffix;
                } else {
                    statData.push({ el, type: 'static', original });
                }
            });

            /**
             * Animate a number from 0 to target with easing
             */
            function animateCounter(data) {
                if (data.type !== 'count') return;

                const duration = 2000; // 2 seconds
                const startTime = performance.now();
                const target = data.target;

                function easeOutExpo(t) {
                    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
                }

                function formatNumber(num) {
                    return num.toLocaleString('en-US');
                }

                function step(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = easeOutExpo(progress);
                    const currentVal = Math.round(easedProgress * target);

                    data.el.textContent = formatNumber(currentVal) + data.suffix;

                    if (progress < 1) {
                        requestAnimationFrame(step);
                    }
                }

                requestAnimationFrame(step);
            }

            // Observe the stat section and trigger counters once visible
            let statsAnimated = false;
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !statsAnimated) {
                        statsAnimated = true;
                        statData.forEach((data, i) => {
                            // Stagger each counter start by 150ms
                            setTimeout(() => animateCounter(data), i * 150);
                        });
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.3
            });

            // Observe the parent container (.hero-stats or a wrapper)
            const statsContainer = document.querySelector('.hero-stats');
            if (statsContainer) {
                statsObserver.observe(statsContainer);
            }
        }

    })();

    /* ==============================================
       FAQ ACCORDION LOGIC
       ============================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answerWrapper = question.nextElementSibling;
            
            // Close other open items
            const activeItem = document.querySelector('.faq-item.active');
            if (activeItem && activeItem !== item) {
                activeItem.classList.remove('active');
                activeItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                activeItem.querySelector('.faq-answer-wrapper').style.maxHeight = null;
            }
            
            // Toggle current item
            item.classList.toggle('active');
            const isActive = item.classList.contains('active');
            question.setAttribute('aria-expanded', isActive);
            
            if (isActive) {
                answerWrapper.style.maxHeight = answerWrapper.scrollHeight + "px";
            } else {
                answerWrapper.style.maxHeight = null;
            }
        });
    });

    /* ==============================================
       SCROLL REVEAL OBSERVER
       ============================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        });
        
        revealElements.forEach(el => revealObserver.observe(el));
    }
});