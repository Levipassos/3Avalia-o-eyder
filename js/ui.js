import { addFavorite, removeFavorite, getFavorites } from './storage.js';

export function showLoading() {
  const spinner = document.querySelector('[data-role="spinner"]');
  if (spinner) spinner.style.display = 'block';
}

export function hideLoading() {
  const spinner = document.querySelector('[data-role="spinner"]');
  if (spinner) spinner.style.display = 'none';
}

export function showError(message) {
  const errorEl = document.querySelector('[data-role="error"]');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
}

export function hideError() {
  const errorEl = document.querySelector('[data-role="error"]');
  if (errorEl) errorEl.hidden = true;
}

export function renderCountries(countries, favorites) {
  const container = document.querySelector('[data-role="list"]');
  if (!container) return;

  if (!countries.length) {
    container.innerHTML = '<div class="no-results"><p>Nenhum país encontrado</p></div>';
    return;
  }

  container.innerHTML = countries.map(country => `
    <article class="country-card" data-cca3="${country.cca3}">
      <img class="country-flag" src="${country.flags.svg}" alt="Bandeira do ${country.name.common}" loading="lazy" />
      <div class="card-body">
        <h2 class="country-name">${getCountryFlag(country.cca2)} ${country.translations?.por?.common || country.name.common}</h2>
        <p class="country-capital"><strong>Capital:</strong> <span class="value">${country.capital?.[0] || 'N/A'}</span></p>
        <p class="country-region"><strong>Região:</strong> <span class="value">${getRegionName(country.region)}</span></p>
        <p class="country-population"><strong>População:</strong> <span class="value">${formatNumber(country.population)}</span></p>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary btn-details" data-role="details">Detalhes</button>
        <button class="btn btn-ghost btn-fav" data-role="fav" aria-pressed="${favorites.some(fav => fav.cca3 === country.cca3)}">
          ${favorites.some(fav => fav.cca3 === country.cca3) ? '★' : '⭐'}
        </button>
      </div>
    </article>
  `).join('');
}

export function renderFavorites(favorites) {
  const container = document.querySelector('[data-role="favorites"]');
  if (!container) return;

  const list = container.querySelector('.fav-list');
  const clearBtn = container.querySelector('.btn-clear-favs');
  
  if (!list) return;

  list.innerHTML = favorites.length ? 
    favorites.map(country => `
      <li class="fav-item">
        ${getCountryFlag(country.cca2)} ${country.translations?.por?.common || country.name.common}
        <button class="btn-remove-fav" data-cca3="${country.cca3}">×</button>
      </li>
    `).join('') :
    '<li class="fav-item-placeholder">Nenhum país adicionado aos favoritos ainda.</li>';

  if (clearBtn) clearBtn.hidden = !favorites.length;
}

function getCountryFlag(code) {
  if (!code) return '🏳️';
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt()));
  } catch {
    return '🏳️';
  }
}

function getRegionName(region) {
  const regions = {
    'Africa': 'África',
    'Americas': 'América',
    'Asia': 'Ásia',
    'Europe': 'Europa',
    'Oceania': 'Oceania',
    'Antarctic': 'Antártida'
  };
  return regions[region] || region;
}

function formatNumber(num) {
  return num?.toLocaleString('pt-BR') || 'N/A';
}