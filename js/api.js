const API_BASE = 'https://restcountries.com/v3.1';
const DETAILS_FIELDS = 'name,flags,capital,region,subregion,population,area,languages,currencies,tld,borders,timezones,latlng,cca3,cca2,translations,coatOfArms,car,independent,idd';

async function fetchAPI(url, errorMessage) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(errorMessage);
  }
}

export async function fetchAllCountries() {
  const url = `${API_BASE}/all?fields=name,flags,capital,region,population,cca3,cca2,translations`;
  return fetchAPI(url, 'Erro ao carregar países');
}

export async function searchCountries(name) {
  const url = `${API_BASE}/name/${encodeURIComponent(name)}`;
  return fetchAPI(url, 'Erro na busca');
}

export async function filterByRegion(region) {
  const url = `${API_BASE}/region/${encodeURIComponent(region)}`;
  return fetchAPI(url, 'Erro ao filtrar');
}

export async function getCountryByCode(code) {
  try {
    const url = `${API_BASE}/alpha/${code}`;
    const data = await fetchAPI(url, 'Erro ao carregar detalhes do país');
    
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Erro ao buscar país:', error);
    throw error;
  }
}

export async function getCountriesByCodes(codes) {
  if (!codes?.length) return [];
  
  const url = `${API_BASE}/alpha?codes=${codes.join(',')}&fields=name,cca3,translations,cca2,flags`;
  return fetchAPI(url, 'Erro ao carregar países vizinhos');
}