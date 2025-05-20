document.getElementById("step2").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission
   
    const emailInput = document.getElementById("mail-email");
    const nameInput = document.getElementById("user");
    const ageInput = document.getElementById("confirm");
    const passwordInput = document.getElementById("password");
  
    const email = emailInput.value.trim();
    const name = nameInput.value.trim();
    const age = ageInput.value.trim();
    const password = passwordInput.value.trim();
  
    const errors = [];
  
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  
    if (!email || !emailRegex.test(email)) {
      errors.push("Please enter a valid email address.");
    }
  
    if (name.length < 3) {
      errors.push("Please write a correct name.");
    }
  
    const ageVal = parseInt(age);
    if (isNaN(ageVal) || ageVal < 13 || ageVal > 120) {
      errors.push("Please enter a valid age between 13 and 120.");
    }
  
    // Changed to match server validation (8 characters minimum)
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number.");
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push("Password must contain at least one special character (@$!%*?&).");
    }
  
    if (errors.length > 0) {
      showErrorPopup(errors.join("<br>"));
    } else {
      // Use fetch API for form submission
      const formData = new FormData(event.target);
      const formDataObj = Object.fromEntries(formData.entries());
      
      fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObj)
      })
      .then(response => {
        if (response.ok) {
          // Redirect to login page on successful registration
          window.location.href = '/login';
        } else {
          return response.json();
        }
      })
      .then(data => {
        if (data && data.errors) {
          showErrorPopup(data.errors.map(err => err.msg).join("<br>"));
        }
      })
      .catch(error => {
        showErrorPopup("An error occurred. Please try again.");
        console.error('Error:', error);
      });
    }
  });
  
  function showErrorPopup(message) {
    const popup = document.getElementById("error-popup");
    popup.innerHTML = message;
    popup.style.display = "block";
    setTimeout(() => {
      popup.style.display = "none";
    }, 4000);
  }