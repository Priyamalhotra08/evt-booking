
const slideshowImages = document.querySelectorAll(".intro-slideshow img");

const nextImageDelay = 5000;
let currentImageCounter = 0; // setting a variable to keep track of the current image (slide)

// slideshowImages[currentImageCounter].style.display = "block";
slideshowImages[currentImageCounter].style.opacity = 1;

setInterval(nextImage, nextImageDelay);

function nextImage() {
  // slideshowImages[currentImageCounter].style.display = "none";
  slideshowImages[currentImageCounter].style.opacity = 0;

  currentImageCounter = (currentImageCounter+1) % slideshowImages.length;

  // slideshowImages[currentImageCounter].style.display = "block";
  slideshowImages[currentImageCounter].style.opacity = 1;
}

document.addEventListener('DOMContentLoaded', () => {
    const text = "Experience the Best Events Anytime Anywhere!";
    const typingElement = document.getElementById("typing-effect");
    let index = 0;

    function type() {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100); // Adjust typing speed here (100ms per character)
        }
    }

    // Clear the initial text and start typing
    typingElement.textContent = "";
    type();
});
console.log("Hello from index2.js")

  window.addEventListener("DOMContentLoaded", function () {
    // Wait 3 seconds before showing the page
    setTimeout(() => {
      document.getElementById("preloader").style.display = "none";
      document.getElementById("main-content").style.display = "block";
    }, 3000); // 3000ms = 3 seconds
  });

