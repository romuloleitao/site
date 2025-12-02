// Inicializa o lightbox
const lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    zoomable: false,
    draggable: false,
});

// CORREÇÃO DO MENU HAMBURGUER - VERSÃO SIMPLIFICADA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Rômulo Studio - Site initialisé');

    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.nav-overlay');
    
    if (menuToggle && nav && overlay) {
        console.log('✅ Menu elements found');
        
        function toggleMenu() {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            
            if (nav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        
        overlay.addEventListener('click', toggleMenu);
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 968) {
                    toggleMenu();
                }
            });
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                toggleMenu();
            }
        });
        
        window.addEventListener('resize', function() {
            if (window.innerWidth > 968 && nav.classList.contains('active')) {
                toggleMenu();
            }
        });
        
        console.log('✅ Menu initialized successfully');
    }

    // Animation d'apparition des éléments au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer les sections principales
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Filtrage des portfolios
    const tabBtns = document.querySelectorAll('.tab-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    function filterGallery(category) {
        galleryItems.forEach(item => {
            if (category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'inline-block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        setTimeout(() => {
            reinitializeLightbox();
        }, 350);
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterGallery(this.getAttribute('data-category'));
        });
    });

    // Modal functionality
    const modal = document.getElementById('contactModal');
    const contactTriggers = document.querySelectorAll('.contact-trigger, .service-cta');
    const closeBtn = document.querySelector('.modal-close');

    function openModalWithService(serviceName = '') {
        if (modal) {
            document.body.style.overflow = 'hidden';
            modal.classList.add('show');
            
            const quickContactForm = document.getElementById('quickContactForm');
            if (serviceName && quickContactForm) {
                const serviceSelect = quickContactForm.querySelector('select[name="service"]');
                if (serviceSelect) {
                    serviceSelect.value = serviceName;
                }
            }
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.add('closing');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                modal.classList.remove('show', 'closing');
                const quickContactForm = document.getElementById('quickContactForm');
                if (quickContactForm) quickContactForm.reset();
            }, 300);
        }
    }

    contactTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceName = this.getAttribute('data-service');
            openModalWithService(serviceName);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // Formulaires
    const mainContactForm = document.getElementById('mainContactForm');
    const quickContactForm = document.getElementById('quickContactForm');

    async function submitForm(form, formType = 'principal') {
        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;

        try {
            const data = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                alert('✅ Message envoyé avec succès! Je vous contacterai dans les plus brefs délais.');
                form.reset();
                if (formType === 'rapide') {
                    setTimeout(closeModal, 1000);
                }
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        } catch (error) {
            alert('❌ Erreur lors de l\'envoi. Veuillez réessayer ou me contacter directement.');
        } finally {
            btnText.style.display = 'flex';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    if (mainContactForm) {
        mainContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitForm(mainContactForm, 'principal');
        });
    }

    if (quickContactForm) {
        quickContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitForm(quickContactForm, 'rapide');
        });
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#contato') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    console.log('✅ Site completely loaded');
});

function reinitializeLightbox() {
    const existingLightbox = GLightbox.getInstance();
    if (existingLightbox) {
        existingLightbox.destroy();
    }
    
    GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        zoomable: false,
        draggable: false,
    });
}