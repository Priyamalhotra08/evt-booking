
    document.addEventListener('DOMContentLoaded', function() {
      // Variables
      const payButton = document.getElementById('pay-button');
const price = parseFloat(document.getElementById('amount').value) || 0;
  const quantityInput = document.getElementById('quantity');
  const decreaseBtn = document.getElementById('decrease-qty');
  const increaseBtn = document.getElementById('increase-qty');
  const summaryQty = document.getElementById('summary-quantity');
;
  const maxQty = parseInt(quantityInput.max) || 10;
  const minQty = parseInt(quantityInput.min) || 1;

      const amountInput = document.getElementById('amount');
      const subtotalEl = document.getElementById('subtotal');
      const taxEl = document.getElementById('tax');
      const totalEl = document.getElementById('total');
      const otpModal = document.getElementById('otpModal');
      const closeModal = document.querySelector('.close');
      const verifyOtpButton = document.getElementById('verify-otp');
      const resendOtpButton = document.getElementById('resend-otp');
      const otpInputs = document.querySelectorAll('.otp-input');
      const errorContainer = document.getElementById('error-container');
      const otpErrorContainer = document.getElementById('otp-error');
      const otpSuccessContainer = document.getElementById('otp-success');
      const maskedEmailEl = document.getElementById('masked-email');
      const timerEl = document.getElementById('timer');
      
      let otpTimer;
      let remainingTime = 300; // 5 minutes in seconds
      
      // Update summary when amount changes
      amountInput.addEventListener('input', updateSummary);
      
      function updateSummary() {
    const qty = parseInt(quantityInput.value) || 1;
    summaryQty.textContent = qty;
    const subtotal = price * qty;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    taxEl.textContent = `₹${tax.toFixed(2)}`;
    totalEl.textContent = `₹${total.toFixed(2)}`;
  }

      
      // Payment method selection
      const paymentOptions = document.querySelectorAll('.payment-option');
      paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
          paymentOptions.forEach(opt => opt.classList.remove('active'));
          this.classList.add('active');
        });
      });
      
      // Format card number with spaces
      const cardNumberInput = document.getElementById('card-number');
      cardNumberInput.addEventListener('input', function() {
        let value = this.value.replace(/\s+/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
          }
          formattedValue += value[i];
        }
        
        this.value = formattedValue;
      });
      
      // Format expiry date
      const expiryInput = document.getElementById('expiry');
      expiryInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length >= 3) {
          this.value = value.slice(0, 2) + '/' + value.slice(2, 4);
        } else if (value.length === 2) {
          this.value = value + '/';
        } else {
          this.value = value;
        }
      });
      
      // Pay button click handler
      payButton.addEventListener('click', function() {
        const amount = amountInput.value;
        
        // Simple validation
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          showError('Please enter a valid amount');
          return;
        }
        
        const cardNumber = cardNumberInput.value.replace(/\s+/g, '');
        const expiry = expiryInput.value;
        const cvv = document.getElementById('cvv').value;
        
        if (cardNumber.length !== 16) {
          showError('Please enter a valid 16-digit card number');
          return;
        }
        
        if (!expiry.match(/^\d{2}\/\d{2}$/)) {
          showError('Please enter a valid expiry date (MM/YY)');
          return;
        }
        
        if (cvv.length !== 3) {
          showError('Please enter a valid 3-digit CVV');
          return;
        }
        
        // Show loading state
        payButton.innerHTML = '<span class="loader"></span><span>Processing...</span>';
        payButton.disabled = true;
        
        // Send request to generate and send OTP
        fetch('/send-payment-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount })
        })
        .then(response => response.json())
        .then(data => {
          payButton.innerHTML = '<span>Pay Now</span>';
          payButton.disabled = false;
          
          if (data.success) {
            // Show OTP modal
            otpModal.style.display = 'flex';
            maskedEmailEl.textContent = data.email;
            otpInputs[0].focus();
            
            // Start OTP timer
            startOtpTimer();
          } else {
            showError(data.message);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          payButton.innerHTML = '<span>Pay Now</span>';
          payButton.disabled = false;
          showError('An error occurred. Please try again.');
        });
      });
      
      // Close modal
      closeModal.addEventListener('click', function() {
        otpModal.style.display = 'none';
        clearOtpInputs();
        clearInterval(otpTimer);
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', function(event) {
        if (event.target === otpModal) {
          otpModal.style.display = 'none';
          clearOtpInputs();
          clearInterval(otpTimer);
        }
      });
      
      // OTP input handling
      otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', function(e) {
          if (e.key >= '0' && e.key <= '9') {
            // Move to next input
            if (index < otpInputs.length - 1) {
              otpInputs[index + 1].focus();
            }
          } else if (e.key === 'Backspace') {
            // Move to previous input on backspace
            if (index > 0) {
              otpInputs[index - 1].focus();
            }
          }
        });
        
        input.addEventListener('click', function() {
          this.select();
        });
        
        // Allow paste for OTP
        input.addEventListener('paste', function(e) {
          e.preventDefault();
          const pasteData = e.clipboardData.getData('text').slice(0, otpInputs.length);
          
          for (let i = 0; i < pasteData.length; i++) {
            if (i + index < otpInputs.length) {
              otpInputs[i + index].value = pasteData[i];
            }
          }
          
          // Focus the appropriate input after paste
          const focusIndex = Math.min(index + pasteData.length, otpInputs.length - 1);
          otpInputs[focusIndex].focus();
        });
      });
      
      // Verify OTP button click handler
      verifyOtpButton.addEventListener('click', function() {
        // Collect OTP
        let otp = '';
        otpInputs.forEach(input => {
          otp += input.value;
        });
        
        if (otp.length !== 6) {
          showOtpError('Please enter the complete 6-digit OTP');
          return;
        }
        
        // Show loading state
        verifyOtpButton.innerHTML = '<span class="loader"></span><span>Verifying...</span>';
        verifyOtpButton.disabled = true;
        
        // Send verification request
        fetch('/verify-payment-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ otp })
        })
        .then(response => response.json())
        .then(data => {
          verifyOtpButton.innerHTML = '<span>Verify OTP</span>';
          verifyOtpButton.disabled = false;
          
          if (data.success) {
            // Show success message
            showOtpSuccess('Payment successful! Redirecting...');
            
            // Clear timer
            clearInterval(otpTimer);
            
            // Redirect to payment result page
            setTimeout(() => {
              window.location.href = `/payment-result?status=success&txnId=${data.transaction.id}&amount=${data.transaction.amount}`;
            }, 2000);
          } else {
            // Handle payment failure
            if (data.transaction) {
              // Payment was processed but failed
              showOtpError(`${data.message}`);
              
              // Redirect to failure result page
              setTimeout(() => {
                window.location.href = `/payment-result?status=failed&txnId=${data.transaction.id}&amount=${data.transaction.amount}`;
              }, 2000);
            } else {
              // OTP verification failed
              showOtpError(data.message);
            }
          }
        })
        .catch(error => {
          console.error('Error:', error);
          verifyOtpButton.innerHTML = '<span>Verify OTP</span>';
          verifyOtpButton.disabled = false;
          showOtpError('An error occurred. Please try again.');
        });
      });
      
      // Resend OTP button click handler
      resendOtpButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get amount from input
        const amount = amountInput.value;
        
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          showOtpError('Please enter a valid amount before resending OTP');
          return;
        }
        
        // Show loading text
        resendOtpButton.textContent = 'Sending...';
        resendOtpButton.style.pointerEvents = 'none';
        
        // Clear previous OTP inputs
        clearOtpInputs();
        
        // Clear previous errors
        hideOtpError();
        hideOtpSuccess();
        
        // Send request to generate and send OTP
        fetch('/send-payment-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount })
        })
        .then(response => response.json())
        .then(data => {
          resendOtpButton.textContent = 'Resend OTP';
          resendOtpButton.style.pointerEvents = 'auto';
          
          if (data.success) {
            showOtpSuccess('OTP resent successfully!');
            otpInputs[0].focus();
            
            // Reset and restart timer
            clearInterval(otpTimer);
            remainingTime = 300;
            startOtpTimer();
          } else {
            showOtpError(data.message);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          resendOtpButton.textContent = 'Resend OTP';
          resendOtpButton.style.pointerEvents = 'auto';
          showOtpError('An error occurred. Please try again.');
        });
      });
      
      // Helper functions
      function showError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
        
        setTimeout(() => {
          errorContainer.classList.add('hidden');
        }, 5000);
      }
      
      function showOtpError(message) {
        otpErrorContainer.textContent = message;
        otpErrorContainer.classList.remove('hidden');
        otpSuccessContainer.classList.add('hidden');
      }
      
      function hideOtpError() {
        otpErrorContainer.classList.add('hidden');
      }
      
      function showOtpSuccess(message) {
        otpSuccessContainer.textContent = message;
        otpSuccessContainer.classList.remove('hidden');
        otpErrorContainer.classList.add('hidden');
      }
      
      function hideOtpSuccess() {
        otpSuccessContainer.classList.add('hidden');
      }
      
      function clearOtpInputs() {
        otpInputs.forEach(input => {
          input.value = '';
        });
        otpInputs[0].focus();
      }
      
      function startOtpTimer() {
        clearInterval(otpTimer);
        remainingTime = 300; // 5 minutes
        
        updateTimerDisplay();
        
        otpTimer = setInterval(() => {
          remainingTime--;
          
          if (remainingTime <= 0) {
            clearInterval(otpTimer);
            timerEl.textContent = 'OTP expired. Please request a new one.';
          } else {
            updateTimerDisplay();
          }
        }, 1000);
      }
      
      function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerEl.textContent = `OTP expires in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
       decreaseBtn.addEventListener('click', function() {
    let qty = parseInt(quantityInput.value) || 1;
    if (qty > minQty) {
      quantityInput.value = qty - 1;
      updateSummary();
    }
  });

  increaseBtn.addEventListener('click', function() {
    let qty = parseInt(quantityInput.value) || 1;
    if (qty < maxQty) {
      quantityInput.value = qty + 1;
      updateSummary();
    }
  });

  quantityInput.addEventListener('input', function() {
    let qty = parseInt(quantityInput.value) || 1;
    if (qty < minQty) qty = minQty;
    if (qty > maxQty) qty = maxQty;
    quantityInput.value = qty;
    updateSummary();
  });
      
      // Initialize summary
      updateSummary();
    });
