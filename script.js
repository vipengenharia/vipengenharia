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
    // Contact form
    //   1) Envia e-mail automatico para engenhariavipma@gmail.com via FormSubmit
    //   2) Redireciona o usuario para o WhatsApp com a mensagem pre-preenchida
    // -----------------------------------------------------------------------
    const form = document.getElementById('contactForm');
    if (form) {
        const WHATSAPP_NUMBER = '5598988211191';
        const TARGET_EMAIL    = 'engenhariavipma@gmail.com';
        const DASH            = '-';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = new FormData(form);
            const nome     = (data.get('nome') || '').toString().trim();
            const email    = (data.get('email') || '').toString().trim();
            const telefone = (data.get('telefone') || '').toString().trim();
            const servico  = (data.get('servico') || '').toString();
            const mensagem = (data.get('mensagem') || '').toString().trim();

            if (!nome || !email || !mensagem) {
                alert('Por favor, preencha os campos obrigatorios (nome, e-mail e mensagem).');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Enviando...';
            }

            // Monta a mensagem de WhatsApp com os dados do formulario
            const waLines = [
                'Ola! Acabei de enviar uma solicitacao de proposta pelo site da VIP Engenharia.',
                '',
                '*Nome:* ' + nome,
                '*E-mail:* ' + email,
                '*Telefone:* ' + (telefone || DASH),
                '*Tipo de demanda:* ' + (servico || DASH),
                '',
                '*Mensagem:*',
                mensagem
            ];
            const waMessage = encodeURIComponent(waLines.join('\n'));
            const waURL = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waMessage;

            // Envia e-mail via FormSubmit (sem necessidade de backend proprio)
            const payload = new FormData();
            payload.append('Nome',            nome);
            payload.append('E-mail',          email);
            payload.append('Telefone',        telefone || DASH);
            payload.append('Tipo de demanda', servico || DASH);
            payload.append('Mensagem',        mensagem);
            payload.append('_subject',        'Nova mensagem do site - ' + (servico || 'VIP Engenharia'));
            payload.append('_template',       'table');
            payload.append('_captcha',        'false');
            payload.append('_replyto',        email);

            try {
                await fetch('https://formsubmit.co/ajax/' + TARGET_EMAIL, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: payload
                });
            } catch (err) {
                console.warn('Falha ao enviar e-mail automatico:', err);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                }
                form.reset();
                // Redireciona o usuario para o WhatsApp em nova aba
                window.open(waURL, '_blank');
            }
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
