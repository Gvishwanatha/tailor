/* ======================================
   VISHWA TAILORS — JavaScript
   ====================================== */

document.addEventListener('DOMContentLoaded', () => {
    // === WhatsApp Configuration ===
    const WHATSAPP_NUMBER = '918660998149'; // Your WhatsApp number (for floating button & contact links)
    const WHATSAPP_DEFAULT_TEXT = "Hi Vishwa Tailors, I'd like to enquire about your services.";

    // === Backend API URL (handles Twilio WhatsApp notifications securely) ===
    const API_BASE_URL = ''; // Empty = same origin (when served via server.js)

    // Dynamically update all WhatsApp links in the page
    function updateWhatsAppLinks() {
        const defaultMsgEncoded = encodeURIComponent(WHATSAPP_DEFAULT_TEXT);
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMsgEncoded}`;
        
        // Update contact section card link
        const whatsappContactCardLink = document.querySelector('#contact-whatsapp a');
        if (whatsappContactCardLink) {
            whatsappContactCardLink.href = waUrl;
        }

        // Update floating WhatsApp button
        const whatsappFloat = document.getElementById('whatsappFloat');
        if (whatsappFloat) {
            whatsappFloat.href = waUrl;
        }
    }
    updateWhatsAppLinks();

    // === Preloader ===
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => { preloader.style.display = 'none'; }, 600);
        }, 800);
    });

    // Fallback: hide preloader after 3 seconds
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            setTimeout(() => { preloader.style.display = 'none'; }, 600);
        }
    }, 3000);


    // === Sticky Navbar ===
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.scrollY;
        if (currentScroll > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run on load


    // === Active Nav Link on Scroll ===
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });


    // === Hamburger Menu ===
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link, .mobile-cta');

    function toggleMenu() {
        const isActive = hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileMenu.setAttribute('aria-hidden', !isActive);
        hamburger.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });


    // === Smooth Scroll ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });


    // === Scroll Reveal Animations ===
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));


    // === Back to Top ===
    const backToTop = document.getElementById('backToTop');

    function handleBackToTop() {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', handleBackToTop, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // === Set minimum date for appointment form ===
    const dateInput = document.getElementById('form-date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
    }


    // === Form Validation & Submission ===
    const form = document.getElementById('appointmentForm');
    const formSuccess = document.getElementById('formSuccess');

    // --- Send appointment to backend API (which sends WhatsApp via Twilio) ---
    async function sendWhatsAppNotification(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/book-appointment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('WhatsApp notification error:', error);
            return false;
        }
    }

    function showError(id, message) {
        const input = document.getElementById(id);
        const error = document.getElementById('error-' + id.replace('form-', ''));
        if (input) input.classList.add('error');
        if (error) error.textContent = message;
    }

    function clearError(id) {
        const input = document.getElementById(id);
        const error = document.getElementById('error-' + id.replace('form-', ''));
        if (input) input.classList.remove('error');
        if (error) error.textContent = '';
    }

    function clearAllErrors() {
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    // Real-time validation clearing
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => {
            clearError(field.id);
        });
        field.addEventListener('change', () => {
            clearError(field.id);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors();
        let isValid = true;

        // Name
        const name = document.getElementById('form-name').value.trim();
        if (!name) {
            showError('form-name', 'Please enter your name');
            isValid = false;
        } else if (name.length < 2) {
            showError('form-name', 'Name must be at least 2 characters');
            isValid = false;
        }

        // Phone
        const phone = document.getElementById('form-phone').value.trim();
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,15}$/;
        if (!phone) {
            showError('form-phone', 'Please enter your phone number');
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            showError('form-phone', 'Please enter a valid phone number');
            isValid = false;
        }

        // Email (optional but must be valid if provided)
        const email = document.getElementById('form-email').value.trim();
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('form-email', 'Please enter a valid email address');
                isValid = false;
            }
        }

        // Service
        const service = document.getElementById('form-service').value;
        if (!service) {
            showError('form-service', 'Please select a service');
            isValid = false;
        }

        // Date
        const date = document.getElementById('form-date').value;
        if (!date) {
            showError('form-date', 'Please select a date');
            isValid = false;
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                showError('form-date', 'Please select a future date');
                isValid = false;
            }
        }

        if (isValid) {
            // Collect form data
            const serviceText = document.getElementById('form-service').options[document.getElementById('form-service').selectedIndex].text;
            const time = document.getElementById('form-time').value || '';
            const timeText = time
                ? document.getElementById('form-time').options[document.getElementById('form-time').selectedIndex].text 
                : 'Not specified';
            const message = document.getElementById('form-message').value.trim();

            // Show loading state on button
            const submitBtn = document.getElementById('form-submit');
            submitBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Booking...
            `;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            // Send appointment data to backend API (which sends WhatsApp via Twilio)
            sendWhatsAppNotification({
                name: name,
                phone: phone,
                email: email || '',
                service: serviceText,
                date: date,
                time: timeText,
                message: message || ''
            })
                .then((success) => {
                    // Show success to customer regardless
                    form.style.display = 'none';
                    formSuccess.style.display = 'block';

                    if (success) {
                        console.log('✅ WhatsApp notification sent to shop owner successfully.');
                    } else {
                        console.warn('⚠️ WhatsApp notification may not have been delivered.');
                    }
                })
                .catch(() => {
                    // Still show success to the customer
                    form.style.display = 'none';
                    formSuccess.style.display = 'block';
                    console.warn('⚠️ WhatsApp notification failed to send.');
                });
        } else {
            // Scroll to first error
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    });


    // === WhatsApp Float visibility ===
    const whatsappFloat = document.getElementById('whatsappFloat');
    function handleWhatsAppVisibility() {
        if (window.scrollY > 300) {
            whatsappFloat.style.opacity = '1';
            whatsappFloat.style.transform = 'scale(1)';
        }
    }
    window.addEventListener('scroll', handleWhatsAppVisibility, { passive: true });


    // === Keyboard accessibility ===
    document.addEventListener('keydown', (e) => {
        // Escape closes mobile menu
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });


    // === Counter Animation for hero stats ===
    function animateCounters() {
        const counters = document.querySelectorAll('.hero-stat-number');
        counters.forEach(counter => {
            const text = counter.textContent;
            const match = text.match(/(\d+)/);
            if (!match) return;

            const target = parseInt(match[1]);
            const suffix = text.replace(match[1], '');
            let current = 0;
            const increment = Math.max(1, Math.floor(target / 50));
            const duration = 2000;
            const stepTime = duration / (target / increment);

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = current + suffix;
            }, stepTime);
        });
    }

    // Trigger counter animation when hero section is visible
    const heroSection = document.getElementById('home');
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(animateCounters, 500);
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    heroObserver.observe(heroSection);
    // === Silk Canvas Animation ===
    function initSilkCanvas() {
        const canvas = document.getElementById('silkCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let time = 0;
        const speed = 0.02;
        const scale = 2;
        const noiseIntensity = 0.8;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const noise = (x, y) => {
            const G = 2.71828;
            const rx = G * Math.sin(G * x);
            const ry = G * Math.sin(G * y);
            return (rx * ry * (1 + x)) % 1;
        };

        const animate = () => {
            const width = canvas.width;
            const height = canvas.height;
            
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(0.5, '#2a2a2a');
            gradient.addColorStop(1, '#1a1a1a');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Create silk-like pattern
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            // Use step to optimize performance on large screens
            const step = width > 1024 ? 4 : 2;

            for (let x = 0; x < width; x += step) {
                for (let y = 0; y < height; y += step) {
                    const u = (x / width) * scale;
                    const v = (y / height) * scale;
                    
                    const tOffset = speed * time;
                    let tex_x = u;
                    let tex_y = v + 0.03 * Math.sin(8.0 * tex_x - tOffset);

                    const pattern = 0.6 + 0.4 * Math.sin(
                        5.0 * (tex_x + tex_y + 
                        Math.cos(3.0 * tex_x + 5.0 * tex_y) + 
                        0.02 * tOffset) +
                        Math.sin(20.0 * (tex_x + tex_y - 0.1 * tOffset))
                    );

                    const rnd = noise(x, y);
                    const intensity = Math.max(0, pattern - rnd / 15.0 * noiseIntensity);
                    
                    const r = Math.floor(123 * intensity);
                    const g = Math.floor(116 * intensity);
                    const b = Math.floor(129 * intensity);
                    
                    for (let dx = 0; dx < step; dx++) {
                        for (let dy = 0; dy < step; dy++) {
                            if (x + dx < width && y + dy < height) {
                                const index = ((y + dy) * width + (x + dx)) * 4;
                                data[index] = r;
                                data[index + 1] = g;
                                data[index + 2] = b;
                                data[index + 3] = 255;
                            }
                        }
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Add subtle overlay for depth
            const overlayGradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 2
            );
            overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
            
            ctx.fillStyle = overlayGradient;
            ctx.fillRect(0, 0, width, height);

            time += 1;
            requestAnimationFrame(animate);
        };

        animate();
    }
    
    initSilkCanvas();
    // === Accordion Gallery Initialization ===
    function initAccordionGallery() {
        if (typeof gsap === 'undefined') return;
        
        const root = document.getElementById('ag-root');
        if (!root) return;

        const panels = Array.from(root.querySelectorAll('.ag-panel'));
        if (!panels.length) return;

        const count = panels.length;
        let active = 2;
        const expandRatio = 0.52;
        const duration = 0.6;
        const ease = 'power3.out';
        const tilt = 8;
        const parallax = 0.5;
        const stagger = 0.06;
        
        let tl;
        let mediaSize = 320;
        
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function applyLayout(animate = true) {
            const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
            const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

            if (tl) tl.kill();
            const dur = animate && !prefersReduced ? duration : 0;
            tl = gsap.timeline();

            panels.forEach((panel, i) => {
                const isActive = i === active;
                const media = panel.querySelector('.ag-panel__media');
                const bar = panel.querySelector('.ag-panel__bar');
                const text = panel.querySelector('.ag-panel__text');

                const rot = isActive ? 0 : i < active ? tilt : -tilt;
                
                if (isActive) panel.classList.add('ag-panel--active');
                else panel.classList.remove('ag-panel--active');

                // Determine if vertical layout based on window width
                const vertical = window.innerWidth <= 768;
                const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

                tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

                if (media) {
                    const drift = Math.max(-1.5, Math.min(1.5, active - i));
                    const shift = drift * parallax * mediaSize * 0.06;
                    const gray = isActive ? 0 : 1;
                    
                    tl.to(media, {
                        xPercent: -50,
                        yPercent: -50,
                        x: vertical ? 0 : (isActive ? 0 : shift),
                        y: vertical ? (isActive ? 0 : shift) : 0,
                        '--ag-gray': gray,
                        '--ag-dim': isActive ? 0 : 0.35,
                        duration: dur,
                        ease
                    }, 0);
                }

                if (bar && text) {
                    if (isActive) {
                        tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
                    } else {
                        tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
                    }
                }
            });
        }

        function measure() {
            const vertical = window.innerWidth <= 768;
            const rect = root.getBoundingClientRect();
            const total = vertical ? rect.height : rect.width;
            const usable = Math.max(total - 10 * (count - 1), 120);
            const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
            mediaSize = size;
            root.style.setProperty('--ag-media-size', `${size}px`);
            
            // Adjust height property directly on element depending on layout
            if(vertical) {
                root.style.height = '600px'; 
            } else {
                root.style.height = '460px';
            }

            applyLayout(true);
        }

        // Delay measure slightly to ensure CSS variables are applied and styles are loaded
        setTimeout(measure, 50);
        window.addEventListener('resize', measure);

        panels.forEach((panel, i) => {
            panel.addEventListener('mouseenter', () => {
                if (active !== i) {
                    active = i;
                    applyLayout(true);
                }
            });
            
            panel.addEventListener('focus', () => {
                if (active !== i) {
                    active = i;
                    applyLayout(true);
                }
            });

            panel.addEventListener('click', (e) => {
                if (active !== i) {
                    e.preventDefault();
                    active = i;
                    applyLayout(true);
                }
            });

            panel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    active = (i + 1) % count;
                    panels[active].focus();
                    applyLayout(true);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    active = (i - 1 + count) % count;
                    panels[active].focus();
                    applyLayout(true);
                }
            });
        });
    }
    
    initAccordionGallery();
});


// === Add spin animation CSS dynamically ===
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
