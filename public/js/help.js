// Function to show FAQ content
function showFaq(id) {
  // Hide all FAQ contents with animation
  $('.faq-content').removeClass('active');
  
  // Show selected FAQ content with animation
  $('#' + id).addClass('active');
  
  // Update active state in navigation
  $('.nav-item').removeClass('active');
  $('.nav-item').each(function() {
    if ($(this).attr('onclick').includes(id)) {
      $(this).addClass('active');
    }
  });

  // Smooth scroll to content on mobile
  if (window.innerWidth < 992) {
    $('html, body').animate({
      scrollTop: $('#' + id).offset().top - 20
    }, 500);
  }
}

// Search functionality
$(document).ready(function() {
  $("#faqSearch").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    
    // If search is empty, show the first FAQ category
    if (value === "") {
      showFaq('faq1');
      return;
    }
    
    // Count matches in each category
    var matches = {
      faq1: 0,
      faq2: 0,
      faq3: 0,
      faq4: 0,
      faq5: 0,
      faq6: 0
    };
    
    // Search in all accordion items
    $(".accordion-button").each(function() {
      var buttonText = $(this).text().toLowerCase();
      var bodyId = $(this).attr("data-bs-target");
      var bodyText = $(bodyId).find(".accordion-body").text().toLowerCase();
      var parentFaq = $(this).closest(".faq-content").attr("id");
      
      // Check if search term is in button or body text
      if (buttonText.indexOf(value) > -1 || bodyText.indexOf(value) > -1) {
        matches[parentFaq]++;
        
        // Expand this item if it contains the search term
        if ($(this).hasClass("collapsed")) {
          $(this).click();
        }
      } else {
        // Collapse this item if it doesn't contain the search term
        if (!$(this).hasClass("collapsed")) {
          $(this).click();
        }
      }
    });
    
    // Show the FAQ category with the most matches
    var maxMatches = 0;
    var bestMatch = 'faq1';
    
    for (var faq in matches) {
      if (matches[faq] > maxMatches) {
        maxMatches = matches[faq];
        bestMatch = faq;
      }
    }
    
    if (maxMatches > 0) {
      showFaq(bestMatch);
    }
  });

  // Add ripple effect
  $(".ripple").on("click", function(e) {
    var x = e.pageX - $(this).offset().left;
    var y = e.pageY - $(this).offset().top;

    var ripple = $("<span class='ripple-effect'></span>");
    ripple.css({
      left: x,
      top: y
    });

    $(this).append(ripple);

    setTimeout(function() {
      ripple.remove();
    }, 700);
  });

  // Animate items when they come into view
  $(window).scroll(function() {
    $('.accordion-item').each(function() {
      var position = $(this).offset().top;
      var scroll = $(window).scrollTop();
      var windowHeight = $(window).height();
      
      if (scroll + windowHeight > position + 100) {
        $(this).addClass('animate__animated animate__fadeInUp');
      }
    });
  });

  // Initialize tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
});
