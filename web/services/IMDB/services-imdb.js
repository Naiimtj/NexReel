import axios from 'axios';
import mockRatings from '../__mocks__/data/ratings.json';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const imdbApiService = axios.create({
  baseURL: 'https://api.imdbapi.dev/',
});

const service = axios.create({
  baseURL: import.meta.env.VITE_URL_IMDB,
  headers: {
    'X-RapidAPI-Host': 'film-show-ratings.p.rapidapi.com',
    'X-RapidAPI-Key': import.meta.env.VITE_APIKEY_IMDB,
  },
});

const apiKeyIMDB = import.meta.env.VITE_APIKEY_IMDB || '';
const notUseIMDB = import.meta.env.VITE_NOT_USE_IMDB === 'true';

// Throttle queue: max 1 concurrent request, 300ms between calls
let _imdbQueue = Promise.resolve();
function _enqueue(fn) {
  const result = _imdbQueue
    .then(() => new Promise((res) => setTimeout(res, 300)))
    .then(fn);
  // Absorb errors in the chain so queue never breaks
  _imdbQueue = result.catch(() => {});
  return result;
}

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

// . IMDB API rating (aggregateRating on 0-10 scale)
export async function getImdbApiRating(imdbId) {
  if (!imdbId || notUseIMDB || USE_MOCKS) return null;
  return _enqueue(async () => {
    try {
      const response = await imdbApiService.get(`titles/${imdbId}`);
      return response.data?.rating?.aggregateRating ?? null;
    } catch (err) {
      return null;
    }
  });
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
