document.addEventListener('DOMContentLoaded', () => {
    // Issues #2 & #6: Shared reduced-motion check + interval handles for pause/resume
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let galleryIntervalId = null;
    let heroIntervalId = null;
    let restartGallery = null;
    let restartHero = null;

    // 1. Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');

            // Issue #3: Keep aria-expanded in sync with menu state
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

            // Toggle FontAwesome icon
            const icon = navToggle.querySelector('i');
            if (isOpen) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when a link is clicked
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // 2. Navbar and Reservation Bar Scroll Effect
    const navbar = document.getElementById('navbar');
    const reservationBar = document.getElementById('reservationBar');
    const heroSection = document.getElementById('home');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        
        // Navbar effect
        if (scrollPos > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Reservation Bar effect (show after hero)
        if (heroSection) {
            const heroHeight = heroSection.offsetHeight;
            if (scrollPos > heroHeight - 100) {
                reservationBar.classList.add('visible');
            } else {
                reservationBar.classList.remove('visible');
            }
        }
    }, { passive: true });

    // 3. Highlight Nav Menu Item on Scroll (top nav + mobile bottom nav)
    const sections = document.querySelectorAll('section');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    function updateActiveNav() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - navbar.clientHeight - 80)) {
                current = section.getAttribute('id');
            }
        });

        // Top nav links
        navLinksItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });

        // Mobile bottom nav tabs
        mobileNavItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === current) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav(); // run once on load

    // Close modal when a mobile bottom nav tab is tapped
    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const modal = document.getElementById('menuModal');
            if (modal && modal.classList.contains('show')) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });

    // 4. Image Slider Logic (Swipe, Dots, Captions)
    const slider = document.getElementById('slider');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');
    let currentIndex = 0;

    if (slider && slides.length > 0) {
        const slidesCount = slides.length;

        function updateSlider() {
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Update dots
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[currentIndex]) dots[currentIndex].classList.add('active');

            // Update active slide for caption animation
            slides.forEach(slide => slide.classList.remove('active-slide'));
            slides[currentIndex].classList.add('active-slide');
        }

        // Initialize first slide caption
        updateSlider();

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % slidesCount;
                updateSlider();
            });

            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + slidesCount) % slidesCount;
                updateSlider();
            });
        }

        // Dot clicks
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                currentIndex = parseInt(e.target.dataset.index);
                updateSlider();
            });
        });

        // Touch / Swipe Navigation
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        slider.addEventListener('touchcancel', () => {
            touchStartX = 0;
            touchEndX = 0;
        }, { passive: true });

        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // Swipe Left (Next)
                currentIndex = (currentIndex + 1) % slidesCount;
                updateSlider();
            }
            if (touchEndX > touchStartX + 50) {
                // Swipe Right (Prev)
                currentIndex = (currentIndex - 1 + slidesCount) % slidesCount;
                updateSlider();
            }
        }

        // Auto-Slide Optional (Issues #2 + #6: skip if reduced motion; store ID for pause/resume)
        if (!prefersReducedMotion) {
            restartGallery = () => {
                galleryIntervalId = setInterval(() => {
                    currentIndex = (currentIndex + 1) % slidesCount;
                    updateSlider();
                }, 5000);
            };
            restartGallery();
        }
    }

    // 4. Hero Slider Logic
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        let currentHeroSlide = 0;

        function nextHeroSlide() {
            heroSlides[currentHeroSlide].classList.remove('active');
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
            heroSlides[currentHeroSlide].classList.add('active');
        }

        // Issues #2 + #6: skip if reduced motion; store ID for pause/resume
        if (!prefersReducedMotion) {
            restartHero = () => {
                heroIntervalId = setInterval(nextHeroSlide, 6000);
            };
            restartHero();
        }

        // Hero swipe support
        const heroContainer = document.getElementById('home');
        if (heroContainer) {
            let heroTouchStartX = 0;
            heroContainer.addEventListener('touchstart', e => {
                heroTouchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            heroContainer.addEventListener('touchend', e => {
                const delta = e.changedTouches[0].screenX - heroTouchStartX;
                if (Math.abs(delta) > 50) {
                    heroSlides[currentHeroSlide].classList.remove('active');
                    currentHeroSlide = delta < 0
                        ? (currentHeroSlide + 1) % heroSlides.length
                        : (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
                    heroSlides[currentHeroSlide].classList.add('active');
                }
            }, { passive: true });
            heroContainer.addEventListener('touchcancel', () => {
                heroTouchStartX = 0;
            }, { passive: true });
        }
    }

    // 5. Scroll to Top Button
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 6. Intersection Observer (Fade-in Animations)
    const fadeSections = document.querySelectorAll('.fade-in-section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeSections.forEach(section => {
        sectionObserver.observe(section);
    });

    // 7. Menu Interactive Modals
    const menuData = {
        'suppen': [
            { title: 'Hausgemachte Tagessuppe', price: '€6.00', desc: 'Bitte fragen Sie uns nach dem aktuellen Angebot.' }
        ],
        'vorspeisen-kalt': [
            { title: 'Hausgemacht Zaziki', price: '€4.50', desc: 'Hausgemachter Joghurt-Gurken-Knoblauchdip.' },
            { title: 'Bruschetta', price: '€7.50', desc: 'Geröstetes Weissbrot mit Tomaten, Knoblauch & Zwiebeln.' },
            { title: 'Oktopussalat traditionell', price: '€8.50', desc: 'Zarter Oktopus mit mediterranen Kräutern.' },
            { title: 'Carpaccio vom Rind', price: '€9.50', desc: 'Hauchdünne Rinderfiletscheiben mit Parmesan.' },
            { title: 'Olive trifft Peperoni', price: '€6.50', desc: 'In feinem Olivenöl eingelegt.' }
        ],
        'vorspeisen-warm': [
            { title: 'Überraschung für Zwei (Antipasti)', price: '€21.50', desc: 'Reichhaltige Auswahl an warmen Vorspeisen.' },
            { title: 'Überraschung für Zwei (Antipasti & Fisch)', price: '€28.50', desc: 'Exquisite Auswahl an Meeresfrüchten und Antipasti.' },
            { title: 'Weinblätter traditionell', price: '€7.50', desc: 'Gefüllte Weinblätter nach Hausrezept.' },
            { title: 'Dicke Bohnen traditionell', price: '€9.00', desc: 'Mit original Fetakäse.' },
            { title: 'Gebratene Peperoni traditionell', price: '€8.50', desc: 'Mit frischem Knoblauch.' },
            { title: 'Überbackener Fetakäse traditionell', price: '€9.50', desc: 'Fetakäse naturbelassen aus dem Ofen mit Peperoni, Zwiebeln und Tomaten.' },
            { title: 'Gebackener Fetakäse traditionell', price: '€7.50', desc: 'Gebackener Fetakäse, herzhaft paniert.' },
            { title: 'Zucchini trifft Aubergine', price: '€7.50', desc: 'Gebratene Zucchini und Auberginenscheiben mit Knoblauch.' }
        ],
        'salate': [
            { title: 'Griechischer Salat klein', price: '€9.00', desc: 'Frische Tomaten, Gurken, Oliven und Feta.' },
            { title: 'Griechischer Salat groß', price: '€11.00', desc: 'Die große Portion unseres Klassikers.' },
            { title: 'Griechischer Bauernsalat traditionell', price: '€13.50', desc: 'Original Rezeptur mit feinsten Zutaten.' },
            { title: 'Griechischer Salat mit Weinblätter', price: '€10.00', desc: 'Kombiniert mit gefüllten Weinblättern.' },
            { title: 'Cremiger Fetakäse „natur" (Extra)', price: '€5.50', desc: 'Dressing: Knoblauch-Olivenöl oder Honig-Senf.' },
            { title: 'Gebackener Fetakäse (Extra)', price: '€7.00', desc: 'Als Ergänzung zu Ihrem Salat.' },
            { title: 'Gegrilltes Lachsfilet (Extra)', price: '€8.50', desc: 'Frisch vom Grill zum Salat.' },
            { title: 'Gegrillte Scampi (3 Stück Extra)', price: '€9.00', desc: 'Große Scampi als Highlight.' },
            { title: 'Gebratene Sardinen (Extra)', price: '€6.50', desc: 'Kross gebraten.' },
            { title: 'Hähnchenbrustfilet (Extra)', price: '€6.50', desc: 'Saftig gegrillt.' }
        ],
        'vegetarisch': [
            { title: 'Griechischer Eintopf traditionell', price: '€14.50', desc: 'Herzhafter fleischloser Genuss nach Hausart.' }
        ],
        'kinder': [
            { title: 'Kinderpizza', price: '€8.50', desc: 'Ein Belag nach Wunsch.' },
            { title: 'Kleines Hähnchenschnitzel', price: '€8.50', desc: 'Dazu knusprige Pommes Frites.' },
            { title: 'Kinder Portion Gyros / Souvlaki', price: '€8.50', desc: 'Dazu Pommes Frites.' }
        ],
        'fisch': [
            { title: 'Lachsfilet aus dem Ofen', price: '€23.50', desc: 'Dazu Couscous Gemüse & Aioli.' },
            { title: 'Kross gebratene Sardinen', price: '€18.50', desc: 'Auf Thymiankartoffeln & Aioli.' },
            { title: 'Riesen Scampi', price: '€24.50', desc: 'Auf Kräuterkartoffelpüree & Aioli.' },
            { title: 'Schollenfilet', price: '€24.50', desc: 'Auf Bratkartoffeln & Aioli.' },
            { title: 'Calamari Tuben', price: '€18.50', desc: 'Frisch geschnitten auf Saisongemüse & Aioli.' }
        ],
        'ofengerichte': [
            { title: 'Lammfleisch traditionell', price: '€24.50', desc: 'Dazu Metaxasauce & Griechische Nudeln.' },
            { title: 'Gyros in Metaxasauce', price: '€19.50', desc: 'Dazu Couscous.' },
            { title: 'Gyros in Champignonsauce', price: '€19.50', desc: 'Dazu Pommes Frites.' },
            { title: 'Schweinemedaillons in Weißweinsauce', price: '€21.00', desc: 'Dazu Couscous.' },
            { title: 'Hähnchenmedaillons in Champignonsauce', price: '€20.50', desc: 'Dazu Couscous.' },
            { title: 'Leber vom Schwein traditionell', price: '€19.00', desc: 'Dazu Couscous.' }
        ],
        'grill': [
            { title: 'Gyros vom Spieß', price: '€15.50', desc: 'Der Klassiker, dazu Reis.' },
            { title: 'Sikoti (Leber)', price: '€14.50', desc: 'Leber vom Schwein mit gerüsteten Zwiebeln, dazu Couscous.' },
            { title: 'Piräus (Bifteki)', price: '€16.00', desc: 'Bifteki vom Grill, dazu Couscous.' },
            { title: 'Meteora (Schweinesteak)', price: '€16.00', desc: '250g mit gerüsteten Zwiebeln, dazu Couscous.' },
            { title: 'Dias (Souvlaki)', price: '€16.00', desc: 'Souvlakispieß, dazu Couscous.' },
            { title: 'Apollon (Bifteki überbacken)', price: '€18.00', desc: 'Dazu Metaxasauce und Reis.' },
            { title: 'Larissa (Gyros & Leber)', price: '€18.00', desc: 'Dazu Reis.' },
            { title: 'Saloniki (Gyros & Souvlaki)', price: '€18.00', desc: 'Dazu Reis.' },
            { title: 'Athen (Lamm)', price: '€24.50', desc: 'Lammfilet & Lammkotelett, dazu Couscous.' },
            { title: 'Santorini (Souvlaki gefüllt)', price: '€19.50', desc: 'Mit Feta, Peperoni und Tomaten, dazu Metaxasauce & Reis.' },
            { title: 'Mykonos (Bifteki gefüllt)', price: '€20.50', desc: 'Mit Feta, Peperoni und Tomate, dazu Couscous.' },
            { title: 'Attika (Lammkotelett)', price: '€21.50', desc: 'Zarte Koteletts, dazu Couscous.' },
            { title: 'Fileto (Schweinefilet)', price: '€21.50', desc: 'Gefüllt mit Feta, dazu Reis.' },
            { title: 'Herkules (Hähnchen)', price: '€20.50', desc: 'Das Beste vom Hähnchen, dazu Couscous.' },
            { title: 'Akropolis (Schwein & Lamm)', price: '€23.50', desc: 'Schwein & Lammfilet, dazu Couscous.' },
            { title: 'Daphne Platte', price: '€21.50', desc: 'Gyros, Souvlaki & Bifteki, dazu Reis.' },
            { title: 'Olympia Platte', price: '€24.50', desc: 'Gyros, Souvlaki, Bifteki und Schweinesteak, dazu Reis.' }
        ],
        'pasta': [
            { title: 'Hausgemachte Pasta', price: '€13.50', desc: 'Aus Hartweizengriess, Eiern & Olivenöl frisch zubereitet.' },
            { title: 'Lachsfilet Extra (Pasta)', price: '€8.50', desc: 'Gegrillt zur Pasta.' },
            { title: 'Scampi Extra (3 Stk)', price: '€9.00', desc: 'Gegrillte Scampi.' },
            { title: 'Sardinen Extra (Pasta)', price: '€6.50', desc: 'Kross gebraten.' },
            { title: 'Hähnchenbrust Extra (Pasta)', price: '€6.50', desc: 'Saftig gegrillt.' }
        ],
        'pizza': [
            { title: 'Pizza Margherita', price: '€12.50', desc: 'Tomaten & Käse.' },
            { title: 'Pizza Salami', price: '€13.50', desc: 'Tomaten, Käse & Salami.' },
            { title: 'Pizza Prosciutto', price: '€13.50', desc: 'Tomaten, Käse & Schinken.' },
            { title: 'Pizza Funghi', price: '€13.50', desc: 'Tomaten, Käse & Champignons.' },
            { title: 'Pizza Salami Funghi', price: '€15.50', desc: 'Tomaten, Käse, Salami & Champignons.' },
            { title: 'Pizza Prosciutto Funghi', price: '€15.50', desc: 'Tomaten, Käse, Schinken & Champignons.' },
            { title: 'Pizza Quattro Stagioni', price: '€16.50', desc: 'Paprika, Zwiebeln, Schinken & Salami.' },
            { title: 'Pizza Tonno', price: '€14.50', desc: 'Rote Zwiebeln & Thunfisch.' },
            { title: 'Pizza Gyros', price: '€17.50', desc: 'Rote Zwiebeln, Peperoni & Gyros.' }
        ],
        'desserts': [
            { title: 'Tiramisu', price: '€7.50', desc: 'Hausgemachtes italienisches Dessert.' },
            { title: 'Kadaifi', price: '€6.50', desc: 'Griechische Spezialität mit einer Kugel Eis.' },
            { title: 'Griechischer Joghurt', price: '€6.50', desc: 'Mit Honig & Nüssen.' },
            { title: 'Crepes', price: '€8.50', desc: 'Mit Schoko und Eis.' },
            { title: 'Gemischtes Eis', price: '€6.50', desc: 'Drei Kugeln nach Wahl.' }
        ],
        'getraenke': [
            { title: 'Beck\'s / Alster', price: '€4.40', desc: 'Vom Fass, 0,4L.' },
            { title: 'Haakebeck Kräusen', price: '€4.80', desc: 'Vom Fass, 0,4L.' },
            { title: 'Coca Cola / Spezi / Fanta', price: '€3.50', desc: 'Erfrischungsgetränke, 0,4L.' },
            { title: 'S.Pellegrino / Acqua Panna', price: '€5.20', desc: 'Mineralwasser, 0,75L.' },
            { title: 'Griechischer Wein (Weiß/Rot)', price: '€5.90', desc: 'Diverse Sorten, 0,25L.' },
            { title: 'Ouzo', price: '€2.00', desc: 'Klassischer Anisschnaps, 2cl.' },
            { title: 'Filterkaffee / Espresso', price: '€2.30', desc: 'Heißgetränke nach Wahl.' }
        ]
    };

    const menuCards = document.querySelectorAll('.menu-cat-card');
    const modal = document.getElementById('menuModal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMenuGrid = document.getElementById('modalMenuGrid');

    // Accessibility Helper: Focus Trap
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let firstFocusableElement;
    let lastFocusableElement;

    if (menuCards.length > 0 && modal) {
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');

        menuCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                const titleText = card.querySelector('h3').textContent;

                // Update Modal Title
                modalTitle.textContent = titleText;

                // Fetch & Build Menu Items
                const items = menuData[category] || [];
                let htmlContent = '';

                if (items.length > 0) {
                    items.forEach(item => {
                        htmlContent += `
                            <div class="menu-item">
                                <div class="menu-item-header">
                                    <span class="menu-item-title">${item.title}</span>
                                    <span class="menu-item-price">${item.price}</span>
                                </div>
                                <p class="menu-item-desc">${item.desc}</p>
                            </div>
                        `;
                    });
                } else {
                    htmlContent = '<p style="color: var(--clr-text-light);">Keine Einträge für diese Kategorie gefunden.</p>';
                }

                modalMenuGrid.innerHTML = htmlContent;

                // Show Modal
                modal.classList.add('show');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling

                // Focus first element
                const focusableContent = modal.querySelectorAll(focusableElements);
                firstFocusableElement = focusableContent[0];
                lastFocusableElement = focusableContent[focusableContent.length - 1];
                if (firstFocusableElement) firstFocusableElement.focus();
            });
        });

        // Close Modal Logic
        const closeMod = () => {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
            // Return focus to the card that opened it (optional but good)
        };

        closeModal.addEventListener('click', closeMod);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeMod();
        });

        // Keyboard navigation (Escape and Tab Trap)
        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('show')) return;

            if (e.key === 'Escape') {
                closeMod();
            }

            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // 8. Highlight Today's Opening Hours & Smart Status
    function updateOpeningStatus() {
        const now = new Date();
        const day = now.getDay(); // 0 is Sunday, 1 is Monday ...
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 100 + minutes; // Format: HHMM

        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        const listItems = document.querySelectorAll('.opening-hours-list p');

        // Schedule Data
        // Mon-Sat: 17:30 (1730) - 23:00 (2300)
        // Sun: 12:00 (1200) - 14:30 (1430)
        
        let isOpen = false;
        let nextOpenMsg = "";

        if (day >= 1 && day <= 6) {
            // Mon - Sat
            if (currentTime >= 1730 && currentTime < 2300) {
                isOpen = true;
            } else if (currentTime < 1730) {
                nextOpenMsg = "Öffnet heute um 17:30 Uhr";
            } else {
                // After 23:00
                const tomorrowIsSun = (day === 6);
                nextOpenMsg = tomorrowIsSun ? "Öffnet morgen um 12:00 Uhr" : "Öffnet morgen um 17:30 Uhr";
            }
        } else if (day === 0) {
            // Sunday
            if (currentTime >= 1200 && currentTime < 1430) {
                isOpen = true;
            } else if (currentTime < 1200) {
                nextOpenMsg = "Öffnet heute um 12:00 Uhr";
            } else {
                // After 14:30 on Sunday
                nextOpenMsg = "Öffnet morgen um 17:30 Uhr";
            }
        }

        // Update UI
        if (statusDot && statusText) {
            if (isOpen) {
                statusDot.className = 'status-dot open';
                statusText.textContent = "Jetzt geöffnet";
            } else {
                statusDot.className = 'status-dot closed';
                statusText.textContent = nextOpenMsg || "Momentan geschlossen";
            }
        }

        // 9. Day Highlighting Fix (Highlight the correct group based on day)
        listItems.forEach(item => {
            item.classList.remove('opening-hours-highlight');
            // Remove caret icon if present to avoid duplication
            item.innerHTML = item.innerHTML.replace('<i class="fas fa-caret-right"></i> ', '');

            const dayAttr = item.getAttribute('data-day');
            
            // Check if day is Monday-Saturday group
            if (dayAttr === "1" && day >= 1 && day <= 6) {
                item.classList.add('opening-hours-highlight');
                item.innerHTML = '<i class="fas fa-caret-right"></i> ' + item.innerHTML;
            } 
            // Check if day is Sunday
            else if (dayAttr === "0" && day === 0) {
                item.classList.add('opening-hours-highlight');
                item.innerHTML = '<i class="fas fa-caret-right"></i> ' + item.innerHTML;
            }
        });
    }

    // Initial run and then every minute
    updateOpeningStatus();
    setInterval(updateOpeningStatus, 60000);

    // Issue #3: Keyboard activation for menu category cards (Enter/Space)
    document.querySelectorAll('.menu-cat-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    // Issue #6: Pause auto-slides when tab is hidden to save battery
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(galleryIntervalId);
            clearInterval(heroIntervalId);
        } else if (!prefersReducedMotion) {
            if (restartGallery) restartGallery();
            if (restartHero) restartHero();
        }
    });
});
