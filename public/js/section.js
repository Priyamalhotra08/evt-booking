
document.addEventListener('DOMContentLoaded', function() {
    // Animation for solution cards
    const cards = document.querySelectorAll('.solution-card');
    
    // Initial animation when page loads
    setTimeout(() => {
        animateCards();
    }, 1000);
    
    // Animation on scroll
    window.addEventListener('scroll', function() {
        animateCards();
    });
    
    function animateCards() {
        cards.forEach((card, index) => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight - 100) {
                setTimeout(() => {
                    card.classList.add('visible');
                    card.classList.add('animate__animated');
                    card.classList.add('animate__fadeInRight');
                }, index * 200);
            }
        });
    }
    
    // Hover effects for images
    const mainImage = document.querySelector('.main-image');
    const secondaryImage = document.querySelector('.secondary-image');
    const certBadge = document.querySelector('.cert-badge');
    
    mainImage.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    mainImage.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
    
    secondaryImage.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) rotate(5deg)';
    });
    
    secondaryImage.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
    
    certBadge.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    certBadge.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});
