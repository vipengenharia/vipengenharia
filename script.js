/* ==========================================================================
   VIP ENGENHARIA — interações
   ========================================================================== */

// Google Ads — rastreamento de conversão por clique
function gtag_report_conversion(url) {
    var callback = function () {
        if (typeof(url) != 'undefined') {
            window.open(url, '_blank');
        }
    };
    if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
            'send_to': 'AW-18138030541/_hwkCKq1kKccEM3D8chD',
            'value': 1.0,
            'currency': 'BRL',
            'event_callback': callback
        });
    } else {
        callback();
    }
    return false;
}

(function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Header scroll state
    // -----------------------------------------------------------------------
    // No mobile (iOS Safari, Chrome Android), a barra de URL do navegador
    // colapsa/expande dinamicamente conforme o usuário rola — isso altera
    // window.scrollY mesmo quando o usuário "não rolou de verdade".
    // Por isso usamos a posição do hero como referência: o header só fica
    // branco (is-scrolled) quando o hero deixa de estar visível.
    // -----------------------------------------------------------------------
    const header = document.getElementById('siteHeader');
    const hero   = document.querySelector('.hero');
    const setHeaderState = () => {
        if (!header) return;
        // Páginas internas (servicos/*) não têm .hero — mantém branco sempre.
        if (!hero) { header.classList.add('is-scrolled'); return; }
        const heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom < 80) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
    };
    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });
    window.addEventListener('resize', setHeaderState, { passive: true });

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
    // Carrossel de fotos dos projetos
    // -----------------------------------------------------------------------
    document.querySelectorAll('.project-slider').forEach((slider) => {
        const track = slider.querySelector('.project-slides');
        const slides = track ? track.querySelectorAll('img') : [];
        const total = slides.length;
        const prevBtn = slider.querySelector('.slider-btn--prev');
        const nextBtn = slider.querySelector('.slider-btn--next');
        const dotsBox = slider.querySelector('.slider-dots');

        // Quando há apenas uma foto, esconde controles
        if (total <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dotsBox) dotsBox.style.display = 'none';
            return;
        }

        let current = 0;

        // Cria os indicadores (dots)
        if (dotsBox) {
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
                dot.setAttribute('aria-label', 'Ir para foto ' + (i + 1));
                dot.dataset.index = String(i);
                dotsBox.appendChild(dot);
            }
        }
        const dots = slider.querySelectorAll('.slider-dot');

        const update = () => {
            track.style.transform = 'translateX(-' + (current * 100) + '%)';
            dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
        };

        const goTo = (idx) => {
            current = ((idx % total) + total) % total;
            update();
        };

        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); goTo(current - 1); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); goTo(current + 1); });
        dots.forEach((dot) => {
            dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index, 10) || 0));
        });

        // Navegação por teclado quando o foco está dentro do slider
        slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft')  { goTo(current - 1); e.preventDefault(); }
            if (e.key === 'ArrowRight') { goTo(current + 1); e.preventDefault(); }
        });

        // Suporte a swipe em telas touch
        let startX = 0;
        let isTouching = false;
        track.addEventListener('touchstart', (e) => {
            isTouching = true;
            startX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', (e) => {
            if (!isTouching) return;
            isTouching = false;
            const dx = (e.changedTouches[0].clientX - startX);
            if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
        });
    });

    // -----------------------------------------------------------------------
    // Contact form
    //   1) Envia e-mail automatico para engenhariavipma@gmail.com via FormSubmit
    //   2) Redireciona o usuario para o WhatsApp com a mensagem pre-preenchida
    // -----------------------------------------------------------------------
    const form = document.getElementById('contactForm');
    if (form) {
        const WHATSAPP_NUMBER = '5598984642898';
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
                // Dispara conversao para o Google Ads e redireciona para WhatsApp
                gtag_report_conversion(waURL);
                form.reset();
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
