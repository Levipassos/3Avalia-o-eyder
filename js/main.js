import { fetchAllCountries, searchCountries, filterByRegion, getCountryByCode } from './api.js';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from './storage.js';
import { showLoading, hideLoading, showError, hideError, renderCountries, renderFavorites } from './ui.js';

class CountryApp {
  constructor() {
    this.state = {
      allCountries: [],
      filteredCountries: [],
      favorites: getFavorites(),
      currentSearch: '',
      currentFilter: ''
    };
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadCountries();
    this.updateUI();
  }

  async loadCountries() {
    try {
      showLoading();
      this.state.allCountries = await fetchAllCountries();
      this.state.filteredCountries = this.state.allCountries;
    } catch (error) {
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('continent-filter');
    const clearFavsBtn = document.querySelector('.btn-clear-favs');

    searchInput?.addEventListener('input', this.debounce((e) => {
      this.state.currentSearch = e.target.value;
      this.handleSearch();
    }, 500));

    regionFilter?.addEventListener('change', (e) => {
      this.state.currentFilter = e.target.value;
      this.handleFilter();
    });

    clearFavsBtn?.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar todos os favoritos?')) {
        clearFavorites();
        this.state.favorites = [];
        this.updateUI();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-role="details"]')) {
        this.handleDetails(e.target.closest('.country-card').dataset.cca3);
      }
      if (e.target.matches('[data-role="fav"]')) {
        this.handleFavorite(e.target.closest('.country-card').dataset.cca3);
      }
      if (e.target.matches('.btn-remove-fav')) {
        this.handleRemoveFavorite(e.target.dataset.cca3);
      }
    });
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  async handleSearch() {
    try {
      if (!this.state.currentSearch.trim()) {
        this.state.filteredCountries = this.state.allCountries;
      } else {
        showLoading();
        const results = await searchCountries(this.state.currentSearch);
        this.state.filteredCountries = results;
      }
    } catch (error) {
      showError(error.message);
      this.state.filteredCountries = [];
    } finally {
      hideLoading();
      this.updateUI();
    }
  }

  async handleFilter() {
    try {
      if (!this.state.currentFilter) {
        this.state.filteredCountries = this.state.allCountries;
      } else {
        showLoading();
        const results = await filterByRegion(this.state.currentFilter);
        this.state.filteredCountries = results;
      }
    } catch (error) {
      showError(error.message);
      this.state.filteredCountries = [];
    } finally {
      hideLoading();
      this.updateUI();
    }
  }

  async handleDetails(countryCode) {
    try {
      const country = await getCountryByCode(countryCode);
      alert(`Detalhes de ${country.translations?.por?.common || country.name.common}\nPopulação: ${country.population.toLocaleString()}`);
    } catch (error) {
      showError(error.message);
    }
  }

  handleFavorite(countryCode) {
    const country = this.state.allCountries.find(c => c.cca3 === countryCode);
    if (!country) return;

    if (this.state.favorites.some(fav => fav.cca3 === countryCode)) {
      removeFavorite(countryCode);
    } else {
      addFavorite(country);
    }
    this.state.favorites = getFavorites();
    this.updateUI();
  }

  handleRemoveFavorite(countryCode) {
    removeFavorite(countryCode);
    this.state.favorites = getFavorites();
    this.updateUI();
  }

  updateUI() {
    renderCountries(this.state.filteredCountries, this.state.favorites);
    renderFavorites(this.state.favorites);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CountryApp();
});