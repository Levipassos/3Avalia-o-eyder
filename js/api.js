const API_BASE = 'https://restcountries.com/v3.1';

export async function fetchAllCountries() {
  try {
    const response = await fetch(`${API_BASE}/all?fields=name,flags,capital,region,population,cca3,cca2,translations`);
    if (!response.ok) throw new Error('Erro na requisição');
    return await response.json();
  } catch (error) {
    throw new Error('Erro ao carregar países');
  }
}

export async function searchCountries(name) {
  try {
    const response = await fetch(`${API_BASE}/name/${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('País não encontrado');
    return await response.json();
  } catch (error) {
    throw new Error('Erro na busca');
  }
}

export async function filterByRegion(region) {
  try {
    const response = await fetch(`${API_BASE}/region/${encodeURIComponent(region)}`);
    if (!response.ok) throw new Error('Erro no filtro');
    return await response.json();
  } catch (error) {
    throw new Error('Erro ao filtrar');
  }
}

export async function getCountryByCode(code) {
  try {
    const response = await fetch(`${API_BASE}/alpha/${code}`);
    if (!response.ok) throw new Error('País não encontrado');
    const data = await response.json();
    return data[0];
  } catch (error) {
    throw new Error('Erro ao carregar detalhes');
  }
}