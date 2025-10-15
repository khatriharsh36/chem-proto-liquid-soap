// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Animate member cards
    const memberCards = document.querySelectorAll('.member-card');
    memberCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate procedure cards
    const procedureCards = document.querySelectorAll('.procedure-card');
    procedureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
});

// Enhanced floating molecules animation
document.addEventListener('DOMContentLoaded', () => {
    const molecules = document.querySelectorAll('.molecule');
    molecules.forEach((molecule, index) => {
        // Add random movement
        setInterval(() => {
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            molecule.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 2000 + index * 500);
    });
});

// Virtual lab preview animation
document.addEventListener('DOMContentLoaded', () => {
    const virtualBeaker = document.querySelector('.virtual-beaker');
    if (virtualBeaker) {
        setInterval(() => {
            virtualBeaker.style.background = `linear-gradient(to top, 
                rgba(102, 126, 234, 0.3) 0%, 
                rgba(102, 126, 234, 0.1) 50%, 
                transparent 100%)`;
            
            setTimeout(() => {
                virtualBeaker.style.background = 'transparent';
            }, 1000);
        }, 3000);
    }
});

// Gallery video controls
document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('.gallery-item video');
    videos.forEach(video => {
        video.addEventListener('mouseenter', () => {
            video.play();
        });
        
        video.addEventListener('mouseleave', () => {
            video.pause();
        });
    });
});

// Lab enter button animation
document.addEventListener('DOMContentLoaded', () => {
    const labBtn = document.querySelector('.lab-enter-btn');
    if (labBtn) {
        labBtn.addEventListener('mouseenter', () => {
            labBtn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
            labBtn.style.color = 'white';
        });
        
        labBtn.addEventListener('mouseleave', () => {
            labBtn.style.background = 'white';
            labBtn.style.color = '#667eea';
        });
    }
});

// Mobile menu toggle (if needed)
document.addEventListener('DOMContentLoaded', () => {
    const navMenu = document.querySelector('.nav-menu');
    
    // Create mobile menu button if screen is small
    if (window.innerWidth <= 768) {
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #4a5568;
            cursor: pointer;
        `;
        
        const navbar = document.querySelector('.navbar');
        navbar.appendChild(mobileMenuBtn);
        
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'none' ? 'flex' : 'none';
        });
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Counter animation for statistics (if you want to add stats)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// Add loading animation
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});