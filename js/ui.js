// Formatação
export function formatPopulation(population) {
  return population?.toLocaleString('pt-BR') || 'N/A';
}

export function formatArea(area) {
  return area?.toLocaleString('pt-BR') || 'N/A';
}

// Helpers
export function getCountryDisplayName(country) {
  return country.translations?.por?.common || country.name.common;
}

export function getRegionDisplayName(region) {
  const regionMap = {
    'Africa': 'África',
    'Americas': 'América',
    'Asia': 'Ásia',
    'Europe': 'Europa',
    'Oceania': 'Oceania',
    'Antarctic': 'Antártida'
  };
  
  return regionMap[region] || region;
}

export function getCountryFlag(code) {
  if (!code) return '🏳️';
  
  try {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🏳️';
  }
}

// UI States
function getElement(selector) {
  return document.querySelector(selector);
}

export function showLoading() {
  const spinner = getElement('[data-role="spinner"]');
  if (spinner) spinner.style.display = 'block';
}

export function hideLoading() {
  const spinner = getElement('[data-role="spinner"]');
  if (spinner) spinner.style.display = 'none';
}

export function showError(message) {
  const errorEl = getElement('[data-role="error"]');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
}

export function hideError() {
  const errorEl = getElement('[data-role="error"]');
  if (errorEl) errorEl.hidden = true;
}

// Renderização
function createCountryCard(country, favorites) {
  const { cca3, flags, capital, region, population } = country;
  const displayName = getCountryDisplayName(country);
  const isFavorite = favorites.some(fav => fav.cca3 === cca3);
  
  return `
    <article class="country-card" data-cca3="${cca3}">
      <img class="country-flag" src="${flags.svg}" alt="Bandeira do ${displayName}" loading="lazy">
      <div class="card-body">
        <h2 class="country-name">${getCountryFlag(country.cca2)} ${displayName}</h2>
        <p><strong>Capital:</strong> ${capital?.[0] || 'N/A'}</p>
        <p><strong>Região:</strong> ${getRegionDisplayName(region)}</p>
        <p><strong>População:</strong> ${formatPopulation(population)}</p>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary" onclick="window.location.href='detalhes.html?code=${cca3}'">
          Detalhes
        </button>
        <button class="btn btn-ghost btn-fav" data-role="fav" data-cca3="${cca3}" 
                aria-pressed="${isFavorite}" title="${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
          ${isFavorite ? '★' : '⭐'}
        </button>
      </div>
    </article>
  `;
}

export function renderCountries(countries, favorites) {
  const container = getElement('[data-role="list"]');
  if (!container) return;
  
  if (!countries?.length) {
    container.innerHTML = '<div class="no-results"><p>Nenhum país encontrado</p></div>';
    return;
  }
  
  const sorted = [...countries].sort((a, b) => 
    getCountryDisplayName(a).localeCompare(getCountryDisplayName(b))
  );
  
  container.innerHTML = sorted.map(country => createCountryCard(country, favorites)).join('');
}

export function renderFavorites(favorites) {
  const container = getElement('[data-role="favorites"]');
  const list = container?.querySelector('.fav-list');
  const clearBtn = container?.querySelector('.btn-clear-favs');
  
  if (!list) return;
  
  if (!favorites.length) {
    list.innerHTML = '<li class="fav-item-placeholder">Nenhum país adicionado aos favoritos ainda.</li>';
  } else {
    list.innerHTML = favorites.map(country => `
      <li class="fav-item">
        ${getCountryFlag(country.cca2)} ${getCountryDisplayName(country)}
        <button class="btn-remove-fav" data-cca3="${country.cca3}">×</button>
      </li>
    `).join('');
  }
  
  if (clearBtn) clearBtn.hidden = !favorites.length;
}