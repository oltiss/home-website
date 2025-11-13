document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');

        if (targetId === '#') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }

        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');

            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

document.querySelectorAll('section:not(.hero)').forEach(section => {
    observer.observe(section);
});

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#48c774' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }

                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

function highlightNavigation() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active-link');
            });

            const activeLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active-link');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

const activeStyle = document.createElement('style');
activeStyle.textContent = `
    .nav-menu a.active-link {
        color: var(--primary-color) !important;
    }

    .nav-menu a.active-link::after {
        width: 100% !important;
    }
`;
document.head.appendChild(activeStyle);

const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '↑';
backToTopButton.className = 'back-to-top';
backToTopButton.setAttribute('aria-label', 'Wróć na górę');

backToTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

backToTopButton.addEventListener('mouseenter', () => {
    backToTopButton.style.transform = 'translateY(-5px)';
    backToTopButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
});

backToTopButton.addEventListener('mouseleave', () => {
    backToTopButton.style.transform = 'translateY(0)';
    backToTopButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
});

console.log('%c👋 Hej! Widzę, że interesujesz się kodem!', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%c🚀 Szukasz developera? Skontaktuj się z nami: kontakt@design-web.pl', 'color: #764ba2; font-size: 14px;');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ Strona design-web załadowana pomyślnie!');

    highlightNavigation();

    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '1';
    }
});

window.addEventListener('load', () => {
    if ('performance' in window && 'timing' in window.performance) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;

        console.log(`⚡ Strona załadowana w ${loadTime}ms`);

        if (loadTime > 3000) {
            console.warn('⚠️ Strona ładuje się wolno. Rozważ optymalizację obrazków i skryptów.');
        }
    }
});




// ==============================================
// FORMULARZ KONTAKTOWY - Dodaj ten kod na końcu script.js
// ==============================================

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Zapobiega domyślnemu przeładowaniu strony

        // Pobieranie danych z formularza
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // ============================================
        // WALIDACJA PO STRONIE FRONTENDU
        // ============================================

        // Sprawdzenie wymaganych pól
        if (!formData.name || !formData.email || !formData.message) {
            showNotification('Wypełnij wszystkie wymagane pola!', 'error');
            return;
        }

        // Walidacja formatu email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Podaj prawidłowy adres email!', 'error');
            return;
        }

        // Walidacja długości wiadomości
        if (formData.message.length < 10) {
            showNotification('Wiadomość jest zbyt krótka (minimum 10 znaków)', 'error');
            return;
        }

        if (formData.message.length > 5000) {
            showNotification('Wiadomość jest zbyt długa (maksimum 5000 znaków)', 'error');
            return;
        }

        // ============================================
        // ZMIANA STANU PRZYCISKU
        // ============================================
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Wysyłanie...';
        submitBtn.disabled = true;

        try {
            // ============================================
            // WYSYŁANIE ŻĄDANIA DO BACKENDU
            // ============================================

            // UWAGA: Zmień URL w zależności od środowiska:
            // - Development: 'http://localhost:3000/api/contact'
            // - Production: 'https://api.design-web.pl/api/contact' (lub Twoja domena)

            const response = await fetch('https://design-web.pl/api/contact', {
                method: 'POST',  // Metoda HTTP
                headers: {
                    'Content-Type': 'application/json'  // Typ zawartości JSON
                },
                body: JSON.stringify(formData)  // Konwersja obiektu na JSON string
            });

            // Parsowanie odpowiedzi JSON
            const result = await response.json();

            // ============================================
            // OBSŁUGA ODPOWIEDZI
            // ============================================

            if (!response.ok) {
                // Błąd HTTP (4xx, 5xx)
                throw new Error(result.message || 'Błąd wysyłania wiadomości');
            }

            // Sukces - wyświetlamy powiadomienie i resetujemy formularz
            showNotification('✅ Wiadomość została wysłana! Odezwiemy się wkrótce.', 'success');
            contactForm.reset();

            // Opcjonalnie: Google Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'Contact',
                    'event_label': 'Contact Form Submission'
                });
            }

        } catch (error) {
            // Obsługa błędów
            console.error('Form submission error:', error);

            // Różne komunikaty w zależności od typu błędu
            if (error.message.includes('Failed to fetch')) {
                showNotification('❌ Nie można połączyć z serwerem. Sprawdź połączenie internetowe.', 'error');
            } else {
                showNotification(`❌ Wystąpił błąd: ${error.message}`, 'error');
            }

        } finally {
            // ============================================
            // PRZYWRÓCENIE STANU PRZYCISKU
            // ============================================
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// FUNKCJA WYŚWIETLANIA POWIADOMIEŃ
// ============================================
function showNotification(message, type = 'info') {
    // Usunięcie istniejącego powiadomienia
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Tworzenie nowego powiadomienia
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style inline
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#48c774' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
        max-width: 400px;
    `;

    // Dodanie do DOM
    document.body.appendChild(notification);

    // Automatyczne usunięcie po 4 sekundach
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Dodanie stylów animacji (jeśli jeszcze nie istnieją)
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
