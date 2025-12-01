export function setupNavigation() {
  document.addEventListener('click', (event) => {
    const detailsBtn = event.target.closest('[data-role="details"]');
    if (detailsBtn) {
      event.preventDefault();
      const countryCard = detailsBtn.closest('.country-card');
      if (countryCard?.dataset.cca3) {
        window.location.href = `detalhes.html?code=${countryCard.dataset.cca3}`;
      }
    }
    
    const borderLink = event.target.closest('.border-item');
    if (borderLink?.href) {
      event.preventDefault();
      window.location.href = borderLink.href;
    }
  });
}

export function getUrlParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

export function updateActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop();
  
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('href');
    const isActive = 
      linkPage === currentPage ||
      (currentPage === '' && linkPage === 'index.html') ||
      (currentPage === 'index.html' && linkPage === '');
    
    link.classList.toggle('active', isActive);
  });
}