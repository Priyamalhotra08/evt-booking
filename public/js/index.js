
  document.addEventListener('DOMContentLoaded', () => {
// Elements
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const dropdowns = document.querySelectorAll('.has-dropdown');

// Mobile menu toggle with animation
navToggle.addEventListener('click', () => {
    navbar.classList.toggle('nav-active');
    
    // Prevent scrolling when menu is open
    if (navbar.classList.contains('nav-active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navbar.classList.contains('nav-active')) {
        navbar.classList.remove('nav-active');
        document.body.style.overflow = '';
    }
});

// Handle dropdowns on mobile
dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('.nav-link');
    
    // For mobile: toggle dropdowns on click
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 968) {
            e.preventDefault();
            dropdown.classList.toggle('active');
            
            // Close other dropdowns
            dropdowns.forEach(other => {
                if (other !== dropdown && other.classList.contains('active')) {
                    other.classList.remove('active');
                    
                    // Add slide-up animation class
                    const otherDropdown = other.querySelector('.dropdown');
                    otherDropdown.style.animation = 'slideUp 0.3s forwards';
                    
                    // Remove animation class after it completes
                    setTimeout(() => {
                        otherDropdown.style.animation = '';
                    }, 300);
                }
            });
            
            // Add slide animation for current dropdown
            const currentDropdown = dropdown.querySelector('.dropdown');
            if (dropdown.classList.contains('active')) {
                currentDropdown.style.animation = 'slideDown 0.3s forwards';
            } else {
                currentDropdown.style.animation = 'slideUp 0.3s forwards';
                setTimeout(() => {
                    currentDropdown.style.animation = '';
                }, 300);
            }
        }
    });
});





// Add scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


});


const swiper = new Swiper(".swiper", {
    grabCursor: true,
    initialSlide: 4,
    centeredSlides: true,
    slidesPerView: "auto",
    spaceBetween: 10,
    speed: 1000,
    freeMode: false,
    mousewheel: {
      thresholdDelta: 30,
    },
    pagination: {
      el: ".swiper-pagination",
    },
    on: {
      click(event) {
        swiper.slideTo(this.clickedIndex);
      },
    },
  });
  
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 180,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#fff",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.3,
        random: false,
        anim: {
          enable: false,
          speed: 4,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 4,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 0.4,
        direction: "right",
        random: true,
        straight: false,
        out_mode: "none",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    retina_detect: true,
  });
  
 console.log("hello world");
 
