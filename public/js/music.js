document.addEventListener('DOMContentLoaded', function () {
    let filters = {
      date: null,
      language: null,
      category: null,
      price: null,
      comedyType: null
    };
  
    document.querySelectorAll('.filter-dropdown-header').forEach(header => {
      header.addEventListener('click', function () {
        const parent = this.parentElement;
        document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
          if (dropdown !== parent) {
            dropdown.classList.remove('active');
            dropdown.querySelector('.filter-dropdown-content').style.display = 'none';
            dropdown.querySelector('.dropdown-icon').style.transform = 'rotate(0)';
          }
        });
  
        const dropdownContent = this.nextElementSibling;
        parent.classList.toggle('active');
        dropdownContent.style.display = parent.classList.contains('active') ? 'block' : 'none';
        this.querySelector('.dropdown-icon').style.transform = parent.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
      });
    });
  
    document.querySelectorAll('.clear-filter').forEach(clearBtn => {
      clearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const type = this.dataset.filter;
        document.querySelectorAll(`input[name="${type}"]`).forEach(r => r.checked = false);
        filters[type] = null;
        applyFilters();
      });
    });
  
    document.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', function () {
        const name = this.name;
        filters[name] = this.checked ? this.value : null;
        applyFilters();
      });
    });
  
    function applyFilters() {
      const query = new URLSearchParams();
  
      if (filters.date) query.set('date', filters.date);
      if (filters.language) query.set('language', filters.language);
      if (filters.category) query.set('category', filters.category);
      if (filters.price) query.set('price', filters.price);
      if (filters.comedyType) query.set('comedyType', filters.comedyType);
  
      window.location.href = `/music?${query.toString()}`;
    }
  
    function setInitialFilters() {
      const urlParams = new URLSearchParams(window.location.search);
      ['date', 'language', 'category', 'price'].forEach(key => {
        const value = urlParams.get(key);
        if (value) {
          const el = document.querySelector(`input[name="${key}"][value="${value}"]`);
          if (el) el.checked = true;
          filters[key] = value;
        }
      });
      if (urlParams.has('comedyType')) {
        filters.comedyType = urlParams.get('comedyType');
        const btn = document.querySelector(`.comedy-type[data-type="${filters.comedyType}"]`);
        if (btn) btn.classList.add('active');
      }
    }
  
    setInitialFilters();
  });