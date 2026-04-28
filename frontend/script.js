const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
});

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

document.addEventListener('click', e => {
  if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  }
});

navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

document.getElementById('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      message: document.getElementById('message').value.trim(),
    };

    if (!formData.name || !formData.email || !formData.message) {
      showNotification('Wypełnij wszystkie wymagane pola!', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showNotification('Podaj prawidłowy adres email!', 'error'); return;
    }

    const btn = contactForm.querySelector('.submit-btn');
    const orig = btn.innerHTML;
    btn.innerHTML = 'Wysyłanie...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Błąd wysyłania');
      showNotification('✅ Wiadomość wysłana! Odezwiemy się wkrótce.', 'success');
      contactForm.reset();
    } catch (err) {
      showNotification(`❌ ${err.message}`, 'error');
    } finally {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  });
}

function showNotification(msg, type = 'info') {
  document.querySelector('.notification')?.remove();
  const n = document.createElement('div');
  n.className = `notification notification-${type}`;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => { n.classList.add('hiding'); setTimeout(() => n.remove(), 300); }, 4000);
}
