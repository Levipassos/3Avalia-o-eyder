import { getCountryByCode } from './api.js';
import { getFavorites, addFavorite, removeFavorite } from './storage.js';
import { formatPopulation, formatArea, getRegionDisplayName, getCountryFlag } from './ui.js';

// Estado
let currentCountry = null;
let isFavorite = false;

// Elementos DOM
const elements = {
  countryName: document.getElementById('country-name'),
  officialName: document.getElementById('country-official-name'),
  countryFlag: document.getElementById('country-flag'),
  countryCapital: document.getElementById('country-capital'),
  countryPopulation: document.getElementById('country-population'),
  countryArea: document.getElementById('country-area'),
  countryRegion: document.getElementById('country-region'),
  countrySubregion: document.getElementById('country-subregion'),
  countryCurrency: document.getElementById('country-currency'),
  countryDomain: document.getElementById('country-domain'),
  countryCode: document.getElementById('country-code'),
  countryLanguages: document.getElementById('country-languages'),
  countryTimezone: document.getElementById('country-timezone'),
  countryMap: document.getElementById('country-map'),
  countryLatitude: document.getElementById('country-latitude'),
  countryLongitude: document.getElementById('country-longitude'),
  countryBorders: document.getElementById('country-borders'),
  favoriteBtn: document.getElementById('favorite-btn'),
  favoriteStar: document.getElementById('favorite-star'),
  errorMessage: document.getElementById('error-message'),
  detailsSection: document.getElementById('country-details'),
  countryCallingCode: document.getElementById('country-callingcode'),
  countryIndependence: document.getElementById('country-independence'),
  countryDrivingSide: document.getElementById('country-driving-side'),
  countryCoatOfArms: document.getElementById('country-coat-of-arms'),
  countryCapitalRepeat: document.getElementById('country-capital-repeat')
};

// Utilitários
function getCountryCodeFromURL() {
  return new URLSearchParams(window.location.search).get('code');
}

function formatCurrency(currencies) {
  if (!currencies) return 'Não informado';
  const currency = Object.values(currencies)[0];
  return `${currency.name}${currency.symbol ? ` (${currency.symbol})` : ''}`;
}

function formatCallingCode(idd) {
  if (!idd?.root) return 'Não informado';
  const suffix = idd.suffixes?.[0] || '';
  return `${idd.root}${suffix}`;
}

function formatBoolean(value, trueText = 'Sim', falseText = 'Não') {
  if (value === undefined || value === null) return 'Não informado';
  return value ? trueText : falseText;
}

// Carregamento de dados
async function loadCountryData() {
  const countryCode = getCountryCodeFromURL();
  
  if (!countryCode) {
    showError('Nenhum código de país fornecido na URL.');
    return;
  }
  
  try {
    showLoading();
    
    const country = await getCountryByCode(countryCode);
    
    if (!country) {
      showError(`País com código "${countryCode}" não encontrado.`);
      return;
    }
    
    currentCountry = country;
    isFavorite = getFavorites().some(fav => fav.cca3 === country.cca3);
    
    updateCountryDisplay();
    updateFavoriteButton();
    
    hideLoading();
    elements.detailsSection?.classList.remove('loading');
    elements.errorMessage && (elements.errorMessage.hidden = true);
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showError('Erro ao carregar dados do país. Tente novamente mais tarde.');
  }
}

// Atualização da interface
function updateCountryDisplay() {
  if (!currentCountry) return;
  const c = currentCountry;
  
  // Informações básicas
  setText(elements.countryName, c.translations?.por?.common || c.name.common);
  setText(elements.officialName, c.translations?.por?.official || c.name.official);
  setFlag(elements.countryFlag, c.flags);
  
  // Capital
  const capital = Array.isArray(c.capital) ? c.capital[0] : c.capital;
  setText(elements.countryCapital, capital);
  setText(elements.countryCapitalRepeat, capital);
  
  // Dados demográficos
  setText(elements.countryPopulation, formatPopulation(c.population));
  setText(elements.countryArea, c.area ? `${formatArea(c.area)} km²` : null);
  setText(elements.countryRegion, getRegionDisplayName(c.region));
  setText(elements.countrySubregion, c.subregion);
  
  // Dados econômicos
  setText(elements.countryCurrency, formatCurrency(c.currencies));
  setText(elements.countryDomain, c.tld?.[0]);
  setText(elements.countryCode, c.cca3 || c.cca2);
  setText(elements.countryTimezone, c.timezones?.[0]);
  setText(elements.countryCallingCode, formatCallingCode(c.idd));
  
  // Informações políticas
  setText(elements.countryIndependence, formatBoolean(c.independent));
  setText(elements.countryDrivingSide, c.car?.side === 'right' ? 'Direita' : 'Esquerda');
  
  // Brasão de armas
  updateCoatOfArms(c.coatOfArms);
  
  // Idiomas
  updateLanguages(c.languages);
  
  // Mapa e coordenadas
  updateMap(c.latlng);
  
  // Países vizinhos
  displayBorderCountries(c.borders);
}

function setText(element, value) {
  if (element) element.textContent = value || 'Não informado';
}

function setFlag(element, flags) {
  if (element && flags) {
    element.src = flags.svg || flags.png || '';
    element.alt = `Bandeira do ${currentCountry?.name.common || 'país'}`;
  }
}

function updateCoatOfArms(coatOfArms) {
  if (!elements.countryCoatOfArms || !coatOfArms) return;
  
  const url = coatOfArms.svg || coatOfArms.png;
  if (url) {
    elements.countryCoatOfArms.src = url;
    elements.countryCoatOfArms.alt = `Brasão de armas do ${currentCountry?.name.common || 'país'}`;
    elements.countryCoatOfArms.style.display = 'block';
  } else {
    elements.countryCoatOfArms.style.display = 'none';
  }
}

function updateLanguages(languages) {
  if (!elements.countryLanguages) return;
  
  elements.countryLanguages.innerHTML = '';
  
  if (languages) {
    Object.values(languages).forEach(lang => {
      const tag = document.createElement('span');
      tag.className = 'language-tag';
      tag.textContent = lang;
      elements.countryLanguages.appendChild(tag);
    });
  } else {
    const tag = document.createElement('span');
    tag.className = 'language-tag';
    tag.textContent = 'Não informado';
    elements.countryLanguages.appendChild(tag);
  }
}

function updateMap(latlng) {
  if (!elements.countryMap || !latlng?.length) return;
  
  const [lat, lng] = latlng;
  elements.countryMap.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-5}%2C${lat-5}%2C${lng+5}%2C${lat+5}&layer=mapnik&marker=${lat}%2C${lng}`;
  setText(elements.countryLatitude, `${lat}°`);
  setText(elements.countryLongitude, `${lng}°`);
}

// Países vizinhos
async function loadBorderCountries(borderCodes) {
  if (!borderCodes?.length) return [];
  
  try {
    const codesToFetch = borderCodes.slice(0, 10);
    const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codesToFetch.join(',')}&fields=name,translations,cca2,cca3`);
    
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error('Erro ao buscar países vizinhos:', error);
    return [];
  }
}

async function displayBorderCountries(borderCodes) {
  if (!elements.countryBorders) return;
  
  elements.countryBorders.innerHTML = '';
  
  if (!borderCodes?.length) {
    elements.countryBorders.innerHTML = '<span class="border-item">Nenhum país vizinho</span>';
    return;
  }
  
  elements.countryBorders.innerHTML = '<span class="border-item loading">Carregando...</span>';
  
  try {
    const borderCountries = await loadBorderCountries(borderCodes);
    
    elements.countryBorders.innerHTML = '';
    
    if (borderCountries.length === 0) {
      borderCodes.forEach(code => createBorderLink(code, code));
    } else {
      borderCountries.forEach(country => {
        const name = country.translations?.por?.common || country.name.common || country.cca3;
        const emoji = getCountryFlag(country.cca2);
        createBorderLink(country.cca3, `${emoji} ${name}`);
      });
    }
  } catch (error) {
    borderCodes.forEach(code => createBorderLink(code, code));
  }
}

function createBorderLink(code, text) {
  const link = document.createElement('a');
  link.className = 'border-item';
  link.href = `detalhes.html?code=${code}`;
  link.innerHTML = text;
  link.title = `Ver detalhes de ${text}`;
  elements.countryBorders.appendChild(link);
}

// Botão de favoritos
function updateFavoriteButton() {
  if (!elements.favoriteBtn) return;
  
  elements.favoriteBtn.setAttribute('aria-pressed', isFavorite);
  elements.favoriteBtn.title = isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
  
  if (elements.favoriteStar) {
    elements.favoriteStar.textContent = isFavorite ? '★' : '⭐';
  }
}

// Estados de carregamento
function showLoading() {
  if (!elements.detailsSection) return;
  
  elements.detailsSection.classList.add('loading');
  
  let overlay = elements.detailsSection.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div><p>Carregando dados do país...</p>';
    elements.detailsSection.appendChild(overlay);
  }
  
  overlay.style.display = 'flex';
}

function hideLoading() {
  if (!elements.detailsSection) return;
  
  elements.detailsSection.classList.remove('loading');
  
  const overlay = elements.detailsSection.querySelector('.loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

function showError(message) {
  hideLoading();
  
  if (elements.detailsSection) elements.detailsSection.style.display = 'none';
  if (elements.errorMessage) {
    elements.errorMessage.innerHTML = `
      <h3>Erro ao carregar dados do país</h3>
      <p>${message || 'Não foi possível carregar as informações do país solicitado.'}</p>
      <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Voltar para a página principal</a>
    `;
    elements.errorMessage.hidden = false;
  }
}

// Event Listeners
elements.favoriteBtn?.addEventListener('click', () => {
  if (!currentCountry) return;
  
  isFavorite ? removeFavorite(currentCountry.cca3) : addFavorite(currentCountry);
  isFavorite = !isFavorite;
  updateFavoriteButton();
});

// Tema
function setupTheme() {
  const toggle = document.querySelector('.theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (toggle) toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  }
  
  const saved = localStorage.getItem('theme');
  saved ? setTheme(saved) : prefersDark.matches && setTheme('dark');
  
  toggle?.addEventListener('click', toggleTheme);
  
  // Ano atual
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  loadCountryData();
});