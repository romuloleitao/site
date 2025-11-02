// Inicializa o lightbox
const lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    zoomable: false, // Désactive le zoom pour la protection
    draggable: false, // Désactive le drag pour la protection
});

// Gestion du portfolio et des fonctionnalités
document.addEventListener('DOMContentLoaded', function() {
    // Filtrage des portfolios
    const tabBtns = document.querySelectorAll('.tab-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Fonction pour filtrer les éléments
    function filterGallery(category) {
        galleryItems.forEach(item => {
            if (category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'inline-block';
                // Animation d'apparition
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
        });
    });

    // Animation d'apparition des éléments de la galerie
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer les éléments de la galerie
    galleryItems.forEach(item => {
        observer.observe(item);
    });

    // Modal functionality
    const modal = document.getElementById('contactModal');
    const contactTriggers = document.querySelectorAll('.contact-trigger');
    const serviceCards = document.querySelectorAll('.service-card');
    const closeBtn = document.querySelector('.modal-close');
    
    // Formulaires
    const mainContactForm = document.getElementById('mainContactForm');
    const quickContactForm = document.getElementById('quickContactForm');
    const mainFormMessage = document.getElementById('mainFormMessage');
    const quickFormMessage = document.getElementById('quickFormMessage');

    // Ouvrir le modal avec service pré-sélectionné
    function openModalWithService(serviceName = '') {
        document.body.classList.add('modal-open');
        modal.classList.add('show');
        
        // Pré-remplir le service si spécifié
        if (serviceName && quickContactForm) {
            const serviceSelect = quickContactForm.querySelector('select[name="service"]');
            if (serviceSelect) {
                serviceSelect.value = serviceName;
            }
        }
        
        setTimeout(() => {
            const firstInput = quickContactForm.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 300);
    }

    // Ouvrir le modal depuis les boutons
    contactTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const serviceCard = this.closest('.service-card');
            const serviceName = serviceCard ? serviceCard.getAttribute('data-service') : '';
            openModalWithService(serviceName);
        });
    });

    // Ouvrir le modal depuis les cartes de service
    serviceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Ne pas ouvrir le modal si on clique sur le bouton (géré séparément)
            if (e.target.closest('.service-cta')) {
                return;
            }
            const serviceName = this.getAttribute('data-service');
            openModalWithService(serviceName);
        });
    });

    // Fermer le modal
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.add('closing');
        document.body.classList.remove('modal-open');
        
        setTimeout(() => {
            modal.classList.remove('show', 'closing');
            if (quickContactForm) quickContactForm.reset();
            if (quickFormMessage) quickFormMessage.style.display = 'none';
        }, 300);
    }

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
            city: form.querySelector('input[name="city"]')?.value || '',
            service: form.querySelector('select[name="service"]').value,
            message: form.querySelector('textarea[name="message"]').value
        };

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
                showMessage('✅ Message envoyé avec succès! Je vous répondrai dans les plus brefs délais.', 'success', messageElement);
                form.reset();
                
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
            if (href !== '#contato') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Protection des images contre le clic droit
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Protection contre le drag and drop
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
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
            console.log('Image non chargée:', this.src);
        });
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });

    // Initialisation du filtrage lifestyle
    initializeLifestyleFilter();
});

// Fonction pour initialiser le filtrage lifestyle
function initializeLifestyleFilter() {
    // Vérifier si des éléments lifestyle existent
    const lifestyleItems = document.querySelectorAll('.gallery-item[data-category="lifestyle"]');
    console.log(`Nombre d'éléments lifestyle trouvés: ${lifestyleItems.length}`);
    
    // Animation spéciale pour les éléments lifestyle
    lifestyleItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

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

// Protection supplémentaire
document.addEventListener('DOMContentLoaded', function() {
    // Désactiver les touches de fonction pour les images
    document.addEventListener('keydown', function(e) {
        // Bloquer F12 (DevTools)
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Bloquer Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // Bloquer Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        // Bloquer Ctrl+S (Save)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
        // Bloquer Ctrl+P (Print)
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            return false;
        }
    });

    // Empêcher l'inspection d'élément
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Empêcher le clic droit partout
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Empêcher le drag and drop des images
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Empêcher la sélection de texte sur les images
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName === 'IMG') {
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
    } else {
        // Page visible - reprendre les animations
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
});

window.addEventListener('offline', function() {
    console.log('Connexion perdue');
    const messages = document.querySelectorAll('.form-message');
    messages.forEach(message => {
        if (message.style.display === 'block') {
            message.textContent = '❌ Connexion perdue. Veuillez vérifier votre connexion internet.';
            message.className = 'form-message error';
        }
    });
});

// Export des fonctions principales pour un usage externe si nécessaire
window.RomuloPhotography = {
    reinitializeLightbox: reinitializeLightbox,
    openContactModal: function(serviceName = '') {
        const modal = document.getElementById('contactModal');
        if (modal) {
            document.body.classList.add('modal-open');
            modal.classList.add('show');
            
            if (serviceName) {
                const serviceSelect = document.querySelector('#quickContactForm select[name="service"]');
                if (serviceSelect) {
                    serviceSelect.value = serviceName;
                }
            }
        }
    },
    closeContactModal: function() {
        const modal = document.getElementById('contactModal');
        if (modal) {
            modal.classList.add('closing');
            document.body.classList.remove('modal-open');
            setTimeout(() => {
                modal.classList.remove('show', 'closing');
            }, 300);
        }
    },
    filterLifestyle: function() {
        const lifestyleBtn = document.querySelector('.tab-btn[data-category="lifestyle"]');
        if (lifestyleBtn) {
            lifestyleBtn.click();
        }
    }
};

// Initialisation finale
document.addEventListener('DOMContentLoaded', function() {
    console.log('Site Rômulo Photography chargé avec succès');
    
    // Vérifier que tous les éléments essentiels sont présents
    const essentialElements = [
        'header',
        '.gallery-grid',
        '#services',
        '#contato',
        'footer'
    ];
    
    essentialElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn('Élément manquant:', selector);
        }
    });

    // Log pour vérifier le bon fonctionnement du service lifestyle
    const lifestyleService = document.querySelector('.service-card:nth-child(2) h3');
    if (lifestyleService && lifestyleService.textContent.includes('Lifestyle')) {
        console.log('✅ Service Lifestyle correctement configuré');
    }

    // Vérifier le fonctionnement des cartes cliquables
    const serviceCards = document.querySelectorAll('.service-card');
    console.log(`✅ ${serviceCards.length} cartes de service configurées avec click`);
});