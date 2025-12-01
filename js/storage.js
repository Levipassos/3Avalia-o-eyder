const STORAGE_KEY = 'countryFavorites';

function getFavorites() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function addFavorite(country) {
  const favorites = getFavorites();
  
  if (!favorites.some(fav => fav.cca3 === country.cca3)) {
    favorites.push(country);
    saveFavorites(favorites);
  }
}

export function removeFavorite(countryCode) {
  const favorites = getFavorites().filter(fav => fav.cca3 !== countryCode);
  saveFavorites(favorites);
}

export function clearFavorites() {
  localStorage.removeItem(STORAGE_KEY);
}

export { getFavorites };