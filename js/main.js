import { showLoading, hideLoading, showError, renderCountries, renderFavorites } from './ui.js';
import { fetchAllCountries, searchCountries, filterByRegion } from './api.js';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from './storage.js';

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
    document.getElementById('search-input')?.addEventListener('input', 
      this.debounce((e) => {
        this.state.currentSearch = e.target.value;
        this.handleSearch();
      }, 500)
    );
    
    document.getElementById('continent-filter')?.addEventListener('change', (e) => {
      this.state.currentFilter = e.target.value;
      this.handleFilter();
    });
    
    document.querySelector('.btn-clear-favs')?.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar todos os favoritos?')) {
        clearFavorites();
        this.state.favorites = [];
        this.updateUI();
      }
    });
    
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-role="fav"]')) {
        this.handleFavorite(e.target.dataset.cca3);
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
      showLoading();
      
      if (!this.state.currentSearch.trim()) {
        this.state.filteredCountries = this.state.allCountries;
      } else {
        this.state.filteredCountries = await searchCountries(this.state.currentSearch);
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
      showLoading();
      
      if (!this.state.currentFilter) {
        this.state.filteredCountries = this.state.allCountries;
      } else {
        this.state.filteredCountries = await filterByRegion(this.state.currentFilter);
      }
    } catch (error) {
      showError(error.message);
      this.state.filteredCountries = [];
    } finally {
      hideLoading();
      this.updateUI();
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