/* ==========================================================================
   VIP ENGENHARIA — interações
   ========================================================================== */

(function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Header scroll state
    // -----------------------------------------------------------------------
    const header = document.getElementById('siteHeader');
    const setHeaderState = () => {
        if (!header) return;
        if (window.scrollY > 30) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
    };
    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });

    // -----------------------------------------------------------------------
    // Mobile nav toggle
    // -----------------------------------------------------------------------
    const navToggle = document.getElementById('navToggle');
    const siteNav   = document.getElementById('siteNav');
    if (navToggle && siteNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = siteNav.classList.toggle('is-open');
            navToggle.classList.toggle('is-open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        // Close menu after click on a link (mobile)
        siteNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('is-open');
                navToggle.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // -----------------------------------------------------------------------
    // Reveal on scroll (IntersectionObserver)
    // -----------------------------------------------------------------------
    const revealEls = document.querySelectorAll(
        '.section-head, .service-card, .method-list li, .tech-item, .project, .why-list li, .stat, .visual-card, .visual-quote, .col-text, .contact-form, .contact-text'
    );
    revealEls.forEach((el) => el.setAttribute('data-reveal', ''));

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach((el) => obs.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // -----------------------------------------------------------------------
    // Animated counters (stats)
    // -----------------------------------------------------------------------
    const countEls = document.querySelectorAll('.stat-num');
    const animateCount = (el) => {
        const target = parseInt(el.dataset.count || '0', 10);
        if (!target) return;
        const duration = 1600;
        const start = performance.now();
        const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString('pt-BR');
        };
        requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window && countEls.length) {
        const countObs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    countObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        countEls.forEach((el) => countObs.observe(el));
    } else {
        countEls.forEach(animateCount);
    }

    // -----------------------------------------------------------------------
    // Hero parallax (light)
    // -----------------------------------------------------------------------
    const heroImg = document.querySelector('.hero-media img');
    if (heroImg && window.matchMedia('(min-width: 800px)').matches) {
        window.addEventListener('scroll', () => {
            const y = Math.min(window.scrollY, 600);
            heroImg.style.transform = `translateY(${y * 0.18}px) scale(1.05)`;
        }, { passive: true });
    }

    // -----------------------------------------------------------------------
    // Footer year
    // -----------------------------------------------------------------------
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // -----------------------------------------------------------------------
    // Contact form (mailto fallback)
    // -----------------------------------------------------------------------
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = new FormData(form);
            const nome     = (data.get('nome') || '').toString().trim();
            const email    = (data.get('email') || '').toString().trim();
            const telefone = (data.get('telefone') || '').toString().trim();
            const servico  = (data.get('servico') || '').toString();
            const mensagem = (data.get('mensagem') || '').toString().trim();

            if (!nome || !email || !mensagem) {
                alert('Por favor, preencha os campos obrigatórios (nome, e-mail e mensagem).');
                return;
            }

            const subject = encodeURIComponent(`Solicitação de proposta — ${servico || 'VIP Engenharia'}`);
            const body = encodeURIComponent(
                `Nome: ${nome}\n` +
                `E-mail: ${email}\n` +
                `Telefone: ${telefone || '—'}\n` +
                `Tipo de demanda: ${servico || '—'}\n\n` +
                `Mensagem:\n${mensagem}\n`
            );

            // Abre o cliente de e-mail do usuário
            window.location.href = `mailto:engenhariavipma@gmail.com?subject=${subject}&body=${body}`;
        });
    }

    // -----------------------------------------------------------------------
    // Smooth scroll offset (compensa o header fixo)
    // -----------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const offset = (header ? header.offsetHeight : 0) + 10;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();
