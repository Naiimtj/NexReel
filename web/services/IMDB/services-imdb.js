import axios from 'axios';
import mockRatings from '../__mocks__/data/ratings.json';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const service = axios.create({
  baseURL: import.meta.env.VITE_URL_IMDB,
  headers: {
    'X-RapidAPI-Host': 'film-show-ratings.p.rapidapi.com',
    'X-RapidAPI-Key': import.meta.env.VITE_APIKEY_IMDB,
  },
});

const omdbService = axios.create({ baseURL: 'https://www.omdbapi.com/' });

const apiKeyIMDB = import.meta.env.VITE_APIKEY_IMDB || '';
const apiKeyOMDB = import.meta.env.VITE_APIKEY_OMDB || '';
const notUseIMDB = import.meta.env.VITE_NOT_USE_IMDB === 'true';
// Set on a 401 (bad key or 1,000/day limit) so the session stops calling OMDb.
let omdbDisabled = false;

// . Rating
export async function getRating(id) {
  if (notUseIMDB || !localStorage.getItem('user')) {
    return {};
  }
  if (USE_MOCKS) {
    return mockRatings;
  }
  const url = `item/?id=${id}`;
  try {
    const response = await service.get(url);
    return response.data?.result?.ratings;
  } catch (err) {
    console.error('Error External Id IMDB:', err);
    return {};
  }
}

// . OMDb IMDb rating (0-10)
export async function getOmdbRating(imdbId) {
  if (USE_MOCKS || notUseIMDB || !apiKeyOMDB || !imdbId || omdbDisabled) {
    return null;
  }
  try {
    const { data } = await omdbService.get('', {
      params: { i: imdbId, apikey: apiKeyOMDB },
    });
    const rating = Number(data?.imdbRating);
    return rating > 0 ? rating : null;
  } catch (err) {
    if (err.response?.status === 401) {
      omdbDisabled = true;
      console.warn('OMDb disabled:', err.response.data?.Error);
    }
    return null;
  }
}

// . Rating
export async function getImdbPerson(id, lang = 'es-ES') {
  if (notUseIMDB || !localStorage.getItem('user')) {
    return {};
  }
  if (USE_MOCKS) {
    return {};
  }
  const langImdb = lang.split('-');
  try {
    const response = await service.get(
      `${langImdb[0]}/API/Name/${apiKeyIMDB}/${id}`,
    );
    if (response.data.errorMessage) {
      console.error('Error Person IMDB:', response.data.errorMessage);
    } else {
      return response;
    }
  } catch (err) {
    console.error('Error Person IMDB:', err);
    return {};
  }
}
