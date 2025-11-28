// Inicializa o lightbox
const lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    zoomable: false,
    draggable: false,
});

// Gestion du site et des fonctionnalités
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Rômulo Studio - Site initialisé');

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
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Filtrage des portfolios
    const tabBtns = document.querySelectorAll('.tab-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Fonction pour filtrer les éléments
    function filterGallery(category) {
        console.log(`Filtrage de la galerie par: ${category}`);
        
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
        
        // Réinitialiser le lightbox après le filtrage
        setTimeout(() => {
            reinitializeLightbox();
        }, 350);
    }

    // Événements pour les boutons de filtre
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterGallery(category);
            
            // Tracking analytics
            trackEvent('Gallery Filter', 'click', category);
        });
    });

    // Animation d'apparition des éléments de la galerie
    galleryItems.forEach(item => {
        observer.observe(item);
    });

    // Modal functionality
    const modal = document.getElementById('contactModal');
    const contactTriggers = document.querySelectorAll('.contact-trigger');
    const forfaitCards = document.querySelectorAll('.forfait-card');
    const closeBtn = document.querySelector('.modal-close');
    
    // Formulaires
    const mainContactForm = document.getElementById('mainContactForm');
    const quickContactForm = document.getElementById('quickContactForm');
    const mainFormMessage = document.getElementById('mainFormMessage');
    const quickFormMessage = document.getElementById('quickFormMessage');

    // Ouvrir le modal avec forfait pré-sélectionné
    function openModalWithForfait(forfaitName = '') {
        console.log('Ouverture du modal avec forfait:', forfaitName);
        
        document.body.style.overflow = 'hidden';
        modal.classList.add('show');
        
        // Pré-remplir le forfait si spécifié
        if (forfaitName && quickContactForm) {
            const serviceSelect = quickContactForm.querySelector('select[name="service"]');
            if (serviceSelect) {
                serviceSelect.value = forfaitName;
                console.log('Forfait pré-rempli:', forfaitName);
            }
        }
        
        setTimeout(() => {
            const firstInput = quickContactForm ? quickContactForm.querySelector('input, select, textarea') : null;
            if (firstInput) firstInput.focus();
        }, 300);
        
        // Tracking analytics
        trackEvent('Modal', 'open', forfaitName || 'general');
    }

    // Ouvrir le modal depuis les boutons "Me contacter"
    contactTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const forfaitName = this.getAttribute('data-forfait') || this.getAttribute('data-service');
            console.log('Clic sur contact trigger:', forfaitName);
            openModalWithForfait(forfaitName);
        });
    });

    // Ouvrir le modal depuis les cartes de forfait (uniquement si on clique sur la carte, pas sur le bouton)
    forfaitCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Ne pas ouvrir le modal si on clique sur le bouton (géré séparément)
            if (e.target.closest('.forfait-cta')) {
                return;
            }
            
            // Ne pas ouvrir le modal si on clique sur des éléments interactifs
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            
            const forfaitHeader = this.querySelector('.forfait-header h3');
            const forfaitName = forfaitHeader ? forfaitHeader.textContent.replace(/[📦💼🎯]/g, '').trim() : '';
            console.log('Clic sur carte forfait:', forfaitName);
            openModalWithForfait(forfaitName);
        });
    });

    // Fermer le modal
    function closeModal() {
        console.log('Fermeture du modal');
        modal.classList.add('closing');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            modal.classList.remove('show', 'closing');
            if (quickContactForm) quickContactForm.reset();
            if (quickFormMessage) quickFormMessage.style.display = 'none';
        }, 300);
        
        // Tracking analytics
        trackEvent('Modal', 'close', 'user_action');
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // Gestion des formulaires
    if (mainContactForm) {
        mainContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitForm(mainContactForm, mainFormMessage);
        });
    }

    if (quickContactForm) {
        quickContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitForm(quickContactForm, quickFormMessage, true);
        });
    }

    async function submitForm(form, messageElement, isQuick = false) {
        const formData = {
            name: form.querySelector('input[name="name"]').value,
            email: form.querySelector('input[name="email"]').value,
            phone: form.querySelector('input[name="phone"]')?.value || '',
            company: form.querySelector('input[name="company"]')?.value || '',
            city: form.querySelector('input[name="city"]')?.value || '',
            service: form.querySelector('select[name="service"]').value,
            message: form.querySelector('textarea[name="message"]').value
        };

        console.log('Données du formulaire:', formData);

        // Validation
        if (!formData.name || !formData.email || !formData.service || !formData.message) {
            showMessage('Veuillez remplir tous les champs obligatoires.', 'error', messageElement);
            return;
        }

        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // État de chargement
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;

        try {
            const data = new FormData(form);
            
            const response = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showMessage('✅ Message envoyé avec succès! Je vous contacterai dans les plus brefs délais pour votre consultation gratuite.', 'success', messageElement);
                form.reset();
                
                // Tracking analytics
                trackEvent('Form', 'submit_success', formData.service);
                
                if (isQuick) {
                    setTimeout(() => {
                        closeModal();
                    }, 3000);
                }
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            showMessage('❌ Erreur lors de l\'envoi. Veuillez réessayer ou me contacter directement à romulojleitao@gmail.com', 'error', messageElement);
            
            // Tracking analytics
            trackEvent('Form', 'submit_error', formData.service);
        } finally {
            btnText.style.display = 'flex';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    function showMessage(message, type, messageElement) {
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `form-message ${type}`;
            messageElement.style.display = 'block';

            messageElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });

            if (type === 'success') {
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 5000);
            }
        }
    }

    // Smooth scroll pour les liens de navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ne pas appliquer le smooth scroll pour les liens de contact
            if (href === '#contato') {
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Tracking analytics
                trackEvent('Navigation', 'smooth_scroll', href);
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const currentScroll = window.pageYOffset;
    
    // Adiciona classe 'scrolled' quando faz scroll
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

    // Protection des images contre le clic droit
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG' && e.target.closest('.gallery-item')) {
            e.preventDefault();
            showTempMessage('🔒 Les images sont protégées', 'info');
            return false;
        }
    });

    // Protection contre le drag and drop
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG' && e.target.closest('.gallery-item')) {
            e.preventDefault();
            return false;
        }
    });

    // Gestion du chargement des images avec fallback
    const galleryImages = document.querySelectorAll('.gallery-item img');
    galleryImages.forEach(img => {
        img.addEventListener('error', function() {
            this.style.opacity = '0.5';
            this.style.filter = 'grayscale(100%)';
            console.warn('Image non chargée:', this.src);
        });
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });

    // Animation des éléments de différentiation
    const diffItems = document.querySelectorAll('.differentiator-item');
    diffItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
        observer.observe(item);
    });

    // Initialisation des fonctionnalités
    initializeSiteFeatures();
});

// Re-initialize lightbox après le filtrage
function reinitializeLightbox() {
    // Destroy existing lightbox
    const existingLightbox = GLightbox.getInstance();
    if (existingLightbox) {
        existingLightbox.destroy();
    }
    
    // Initialize new lightbox
    GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        zoomable: false,
        draggable: false,
    });
}

// Initialisation des fonctionnalités du site
function initializeSiteFeatures() {
    console.log('🎯 Rômulo Studio - Production de Contenu Visuel & Stratégie Marketing');
    console.log('📍 Basé à Sherbrooke - Disponible dans tout le Québec');
    console.log('📧 romulojleitao@gmail.com');
    console.log('📱 +1 (819) 943-5057');
    
    // Vérifier que tous les éléments essentiels sont présents
    const essentialElements = [
        'header',
        '.hero',
        '#approche',
        '#pourquoi',
        '#forfaits',
        '#services',
        '#processus',
        '.gallery-grid',
        '#contato',
        'footer'
    ];
    
    essentialElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn('Élément manquant:', selector);
        } else {
            console.log(`✅ ${selector} chargé`);
        }
    });

    // Vérifier le fonctionnement des cartes cliquables
    const forfaitCards = document.querySelectorAll('.forfait-card');
    console.log(`✅ ${forfaitCards.length} cartes de forfait configurées`);

    const contactTriggers = document.querySelectorAll('.contact-trigger');
    console.log(`✅ ${contactTriggers.length} boutons de contact configurés`);

    // Ajouter la classe loaded au body pour les animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
}

// Protection supplémentaire
document.addEventListener('DOMContentLoaded', function() {
    // Désactiver les touches de fonction pour les images
    document.addEventListener('keydown', function(e) {
        // Bloquer F12 (DevTools) seulement sur les images
        if (e.key === 'F12' && e.target.closest('.gallery-item')) {
            e.preventDefault();
            showTempMessage('🔒 Fonction désactivée pour la protection des images', 'info');
            return false;
        }
    });

    // Empêcher la sélection de texte sur les images
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName === 'IMG' && e.target.closest('.gallery-item')) {
            e.preventDefault();
            return false;
        }
    });
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur globale:', e.error);
});

// Optimisation du scroll
let scrollTimeout;
window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
        // Réduire l'usage CPU pendant le scroll
    }, 100);
});

// Gestion du resize avec debounce
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        // Réinitialiser le lightbox si nécessaire
        if (window.innerWidth < 768) {
            reinitializeLightbox();
        }
    }, 250);
});

// Amélioration de l'accessibilité
document.addEventListener('keydown', function(e) {
    // Navigation au clavier dans les modals
    if (e.key === 'Tab' && document.body.classList.contains('modal-open')) {
        const modal = document.getElementById('contactModal');
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
});

// Gestion du chargement progressif des images
function lazyLoadImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialiser le lazy loading au chargement
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', lazyLoadImages);
}

// Gestion des performances
let isScrolling = false;
window.addEventListener('scroll', function() {
    if (!isScrolling) {
        window.requestAnimationFrame(function() {
            // Mettre à jour les animations pendant le scroll
            isScrolling = false;
        });
        isScrolling = true;
    }
});

// Gestion de la visibilité de la page
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page cachée - économiser les ressources
        console.log('Page cachée');
    } else {
        // Page visible - reprendre les animations
        console.log('Page visible');
    }
});

// Fallback pour les vieux navigateurs
if (!window.addEventListener) {
    // Fallback pour IE8 et inférieur
    document.attachEvent('onDOMContentLoaded', function() {
        // Code de fallback simple
        const contactForms = document.getElementsByTagName('form');
        for (let i = 0; i < contactForms.length; i++) {
            contactForms[i].attachEvent('onsubmit', function(e) {
                e.returnValue = false;
                alert('Veuillez utiliser un navigateur moderne pour envoyer le formulaire.');
            });
        }
    });
}

// Gestion des erreurs de réseau
window.addEventListener('online', function() {
    console.log('Connexion rétablie');
    showTempMessage('✅ Connexion rétablie', 'success');
});

window.addEventListener('offline', function() {
    console.log('Connexion perdue');
    showTempMessage('⚠️ Connexion perdue', 'warning');
});

// Fonction pour afficher des messages temporaires
function showTempMessage(message, type = 'info') {
    const tempMsg = document.createElement('div');
    tempMsg.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        tempMsg.style.background = '#27ae60';
    } else if (type === 'warning') {
        tempMsg.style.background = '#f39c12';
    } else if (type === 'error') {
        tempMsg.style.background = '#e74c3c';
    } else {
        tempMsg.style.background = '#3498db';
    }
    
    tempMsg.textContent = message;
    document.body.appendChild(tempMsg);
    
    setTimeout(() => {
        tempMsg.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(tempMsg);
        }, 300);
    }, 3000);
}

// Export des fonctions principales pour un usage externe si nécessaire
window.RomuloStudio = {
    reinitializeLightbox: reinitializeLightbox,
    openContactModal: function(forfaitName = '') {
        const modal = document.getElementById('contactModal');
        if (modal) {
            document.body.style.overflow = 'hidden';
            modal.classList.add('show');
            
            if (forfaitName) {
                const serviceSelect = document.querySelector('#quickContactForm select[name="service"]');
                if (serviceSelect) {
                    serviceSelect.value = forfaitName;
                }
            }
        }
    },
    closeContactModal: function() {
        const modal = document.getElementById('contactModal');
        if (modal) {
            modal.classList.add('closing');
            document.body.style.overflow = '';
            setTimeout(() => {
                modal.classList.remove('show', 'closing');
            }, 300);
        }
    },
    filterGallery: function(category) {
        const tabBtn = document.querySelector(`.tab-btn[data-category="${category}"]`);
        if (tabBtn) {
            tabBtn.click();
        }
    },
    scrollToSection: function(sectionId) {
        const target = document.querySelector(sectionId);
        if (target) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
};

// Menu Hamburger functionality - Versão Corrigida
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.nav-overlay');

    // Verifica se os elementos existem
    if (!menuToggle || !nav || !overlay) {
        console.log('Elementos do menu não encontrados');
        return;
    }

    // Toggle menu function
    function toggleMenu() {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    }

    // Event listeners
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 968) {
                toggleMenu();
            }
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Close menu on resize if window becomes larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 968 && nav.classList.contains('active')) {
            toggleMenu();
        }
    });

    console.log('Menu hamburger inicializado corretamente');
});

// Analytics personnalisé
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Log pour le développement
    console.log(`📊 Analytics: ${category} - ${action} - ${label}`);
}

// Suivi des clics sur les CTA
document.addEventListener('DOMContentLoaded', function() {
    const ctaButtons = document.querySelectorAll('.cta-button, .forfait-cta, .contact-trigger');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonType = this.classList.contains('primary') ? 'primary' : 'secondary';
            trackEvent('CTA', 'click', `${buttonType} - ${buttonText}`);
        });
    });
});

// Service Worker pour le cache (optionnel)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Initialisation finale
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Site Rômulo Studio complètement chargé et fonctionnel');
    
    // Animation CSS pour les messages temporaires
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
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
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Gestion des performances - Préchargement des images critiques
function preloadCriticalImages() {
    const criticalImages = [
        'images/logo.png',
        // Ajoutez ici les images critiques à précharger
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Préchargement au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalImages);
} else {
    preloadCriticalImages();
}