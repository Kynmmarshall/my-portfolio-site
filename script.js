/**
 * Portfolio Website JavaScript Enhancements
 * Enhanced with detailed comments and error fixes
 * Author: Kamdeu Yamdjeuson Neil Marshall
 */

// Wait for the DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio website initialized');
    
    // Initialize all features
    initSmoothScrolling();
    initNavbarEffects();
    //initContactForm();
    initScrollAnimations();
    initSkillHoverEffects();
    updateCopyrightYear();
    
    // Remove problematic image loading code that causes display issues
    // initImageLoading(); // Commented out to fix disappearing images
});

/**
 * Smooth scrolling for navigation links
 * Fixes jerky anchor navigation
 */
function initSmoothScrolling() {
    console.log('Initializing smooth scrolling...');
    
    // Select all anchor links that start with #
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default jump behavior
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Smooth scroll to target element
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start', // Align to top of viewport
                    inline: 'nearest'
                });
                
                console.log('Smooth scrolling to:', targetId);
            } else {
                console.warn('Target element not found:', targetId);
            }
        });
    });
}

/**
 * Navbar background change on scroll
 * Adds visual feedback when user scrolls
 */
function initNavbarEffects() {
    console.log('Initializing navbar effects...');
    
    const navbar = document.querySelector('.topButtons');
    
    if (!navbar) {
        console.warn('Navbar element (.topButtons) not found');
        return;
    }
    
    window.addEventListener('scroll', function() {
        // Add background and shadow when scrolled down
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(12, 12, 12, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            navbar.style.backdropFilter = 'blur(10px)'; // Modern glass effect
        } else {
            // Reset to original style
            navbar.style.backgroundColor = 'rgb(12, 12, 12)';
            navbar.style.boxShadow = 'none';
            navbar.style.backdropFilter = 'none';
        }
    });
}

/**
 * Contact form submission handling
 * Provides user feedback and error handling
 */
function initContactForm() {
    console.log('Initializing contact form...');
    
    const contactForm = document.querySelector('form');
    
    if (!contactForm) {
        console.warn('Contact form not found');
        return;
    }
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        console.log('Form submission started...');
        
        const submitButton = this.querySelector('.sendbutton');
        const originalText = submitButton.textContent;
        const originalBgColor = submitButton.style.backgroundColor;
        
        // Show loading state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        submitButton.style.backgroundColor = '#ffa500'; // Orange loading color
        
        // Create FormData object from form
        const formData = new FormData(this);
        
        // Send form data to Formspree
        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        
        .then(response => {
            console.log('Form submission response:', response.status);
            
            if (response.ok) {
                // Success - show confirmation
                showFormMessage(submitButton, 'Message Sent!', '#4CAF50', originalText, true);
                this.reset(); // Clear form fields
                console.log('Form submitted successfully');
            } else {
                throw new Error(`Server responded with status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            // Error - show retry message
            showFormMessage(submitButton, 'Error - Try Again', '#f44336', originalText, false);
        });
    });
}

/**
 * Helper function to show form submission messages
 */
function showFormMessage(button, message, color, originalText, isSuccess) {
    button.textContent = message;
    button.style.backgroundColor = color;
    
    // Reset button after delay
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
        button.disabled = false;
        
        if (isSuccess) {
            // Additional success actions can go here
            console.log('Form reset completed');
        }
    }, 3000);
}

/**
 * Scroll animations for sections
 * Fades in elements as they enter viewport
 */
function initScrollAnimations() {
    console.log('Initializing scroll animations...');
    
    // Configuration for intersection observer
    const observerOptions = {
        threshold: 0.1,    // Trigger when 10% visible
        rootMargin: '0px 0px -50px 0px' // Adjust trigger point
    };
    
    // Create intersection observer
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element is in viewport - animate in
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                console.log('Section animated in:', entry.target.id);
            }
        });
    }, observerOptions);
    
    // Observe all main sections for animation
    const sectionsToAnimate = document.querySelectorAll('#Aboutme, #Skills, #Projects, #Contactme');
    
    sectionsToAnimate.forEach(section => {
        // Set initial state (hidden)
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)'; // Start slightly lower
        
        // Start observing
        observer.observe(section);
    });
}

/**
 * Enhanced hover effects for skill icons
 * Adds interactive feedback
 */
function initSkillHoverEffects() {
    console.log('Initializing skill hover effects...');
    
    const skillLogos = document.querySelectorAll('.logo');
    
    skillLogos.forEach(logo => {
        logo.addEventListener('mouseenter', function() {
            // Scale up on hover
            this.style.transform = 'scale(1.15)';
            this.style.transition = 'transform 0.3s ease, filter 0.3s ease';
            this.style.filter = 'brightness(1.9)'; // Add brightness effect
        });
        
        logo.addEventListener('mouseleave', function() {
            // Return to normal state
            this.style.transform = 'scale(1)';
            this.style.filter = 'brightness(1)';
        });
        
        // Add click feedback
        logo.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

/**
 * Update copyright year automatically
 * Ensures year is always current
 */
function updateCopyrightYear() {
    console.log('Updating copyright year...');
    
    const yearElements = document.querySelectorAll('footer p');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        const originalText = element.textContent;
        // Replace 2025 with current year using regex
        const updatedText = originalText.replace(/2025/, currentYear.toString());
        element.textContent = updatedText;
    });
    
    console.log('Copyright year updated to:', currentYear);
}

/**
 * Error boundary and debugging utilities
 * Catches and reports runtime errors
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    console.error('In file:', e.filename, 'at line:', e.lineno);
});



/**
 * Responsive menu for mobile devices
 * Creates mobile-friendly navigation
 */
function initMobileMenu() {
    console.log('Initializing mobile menu...');
    
    // Only create mobile menu on small screens
    if (window.innerWidth <= 768) {
        const navbar = document.querySelector('.topButtons');
        
        if (!navbar) {
            console.warn('Navbar not found for mobile menu');
            return;
        }
        
        // Create mobile menu toggle button
        const menuToggle = document.createElement('button');
        menuToggle.innerHTML = '☰';
        menuToggle.classList.add('menu-toggle');
        menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Insert toggle button
        document.body.appendChild(menuToggle);
        
        // Toggle menu visibility
        menuToggle.addEventListener('click', function() {
            navbar.classList.toggle('mobile-active');
            menuToggle.classList.toggle('active');
            menuToggle.innerHTML = navbar.classList.contains('mobile-active') ? '✕' : '☰';
        });
        
        // Close menu when clicking on links
        navbar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('mobile-active');
                menuToggle.classList.remove('active');
                menuToggle.innerHTML = '☰';
            });
        });
    }
}

// Initialize mobile menu (uncomment when ready)
// initMobileMenu();

console.log('Portfolio JavaScript loaded successfully!');