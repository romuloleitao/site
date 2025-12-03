// Initialisation du site
document.addEventListener('DOMContentLoaded', function() {
    console.log('📸 Rômulo Studio - Site initialisé');
    
    // Initialisation des fonctionnalités
    initLightbox();
    initMenuToggle();
    initPortfolioFilter();
    initContactForm();
    initScrollAnimations();
    initSmoothScroll();
    
    // Protection des images
    initImageProtection();
});

// ============================================
// LIGHTBOX
// ============================================
let lightbox;

function initLightbox() {
    lightbox = GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        openEffect: 'fade',
        closeEffect: 'fade'
    });
}

function reinitializeLightbox() {
    if (lightbox) {
        lightbox.destroy();
    }
    initLightbox();
}

// ============================================
// MENU TOGGLE - CORRIGIDO
// ============================================
function initMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (!menuToggle || !nav) return;
    
    // Toggle menu
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close menu when clicking outside (only on mobile)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu on resize if switching to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && nav.classList.contains('active')) {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ============================================
// PORTFOLIO FILTER
// ============================================
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (!filterBtns.length || !galleryItems.length) return;
    
    function filterGallery(category) {
        // Update active button
        filterBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Filter items
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
        
        // Reinitialize lightbox
        setTimeout(reinitializeLightbox, 350);
    }
    
    // Add event listeners to filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const category = this.getAttribute('data-filter');
            filterGallery.call(this, category);
        });
    });
}

// ============================================
// CONTACT FORM
// ============================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (!contactForm || !formMessage) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: this.querySelector('#name').value,
            email: this.querySelector('#email').value,
            phone: this.querySelector('#phone').value,
            service: this.querySelector('#service').value,
            message: this.querySelector('#message').value
        };
        
        // Validate form
        if (!formData.name || !formData.email || !formData.service || !formData.message) {
            showFormMessage('Veuillez remplir tous les champs obligatoires.', 'error', formMessage);
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('.btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        submitBtn.disabled = true;
        
        try {
            const data = new FormData(this);
            
            const response = await fetch(this.action, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                showFormMessage('✅ Votre message a été envoyé avec succès. Je vous répondrai dans les plus brefs délais.', 'success', formMessage);
                this.reset();
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            showFormMessage('❌ Une erreur est survenue. Veuillez me contacter directement par email ou téléphone.', 'error', formMessage);
        } finally {
            // Reset button state
            btnText.style.display = 'flex';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

function showFormMessage(message, type, messageElement) {
    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`;
    messageElement.style.display = 'block';
    
    // Scroll to message
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Observe service cards
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observe features
    document.querySelectorAll('.feature').forEach(feature => {
        observer.observe(feature);
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip contact form link (handled separately)
            if (href === '#contact') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    const menuToggle = document.querySelector('.menu-toggle');
                    const nav = document.querySelector('.nav');
                    menuToggle.classList.remove('active');
                    nav.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });
}

// ============================================
// IMAGE PROTECTION
// ============================================
function initImageProtection() {
    // Prevent right-click on gallery images
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG' && e.target.closest('.gallery-item')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Prevent drag and drop of gallery images
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG' && e.target.closest('.gallery-item')) {
            e.preventDefault();
            return false;
        }
    });
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================
let lastScroll = 0;
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// ============================================
// PUBLIC API
// ============================================
window.RomuloStudio = {
    filterPortfolio: function(category) {
        const btn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
        if (btn) btn.click();
    },
    
    scrollToSection: function(sectionId) {
        const target = document.querySelector(sectionId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle image loading errors
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        console.warn('Image failed to load:', this.src);
        this.style.opacity = '0.5';
    });
    
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
});

// Initial log
console.log('✨ Site prêt !');

// Mobile detection helper
function isMobile() {
    return window.innerWidth <= 768;
}