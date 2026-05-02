import axios from 'axios';
// -- Mock data imports (used when VITE_USE_MOCKS=true) --
import mockMovie from '../__mocks__/data/movie.json';
import mockTv from '../__mocks__/data/tv.json';
import mockPerson from '../__mocks__/data/person.json';
import mockPersonCredits from '../__mocks__/data/person-credits.json';
import mockCreditsMovie from '../__mocks__/data/credits-movie.json';
import mockCreditsTv from '../__mocks__/data/credits-tv.json';
import mockWatchProviders from '../__mocks__/data/watch-providers.json';
import mockTrailers from '../__mocks__/data/trailers.json';
import mockKeywordsMovie from '../__mocks__/data/keywords-movie.json';
import mockKeywordsTv from '../__mocks__/data/keywords-tv.json';
import mockSeason from '../__mocks__/data/season.json';
import mockEpisode from '../__mocks__/data/episode.json';
import mockReleaseDates from '../__mocks__/data/release-dates.json';
import mockContentRatings from '../__mocks__/data/content-ratings.json';
import mockExternalIds from '../__mocks__/data/external-ids.json';
import mockExternalIdsPerson from '../__mocks__/data/external-ids-person.json';
import mockCollection from '../__mocks__/data/collection.json';
import mockListMovies from '../__mocks__/data/list-movies.json';
import mockListTv from '../__mocks__/data/list-tv.json';
import mockListTrending from '../__mocks__/data/list-trending.json';
import mockListPerson from '../__mocks__/data/list-person.json';
import mockGenresMovie from '../__mocks__/data/genres-movie.json';
import mockGenresTv from '../__mocks__/data/genres-tv.json';
import mockKeywordDetail from '../__mocks__/data/keyword-detail.json';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const service = axios.create({
  baseURL: import.meta.env.VITE_URL_TMDB,
});

const apiKeyTMDB = import.meta.env.VITE_APIKEY_TMDB || '';

service.interceptors.request.use(
  (response) => response,
  (err) => Promise.reject(err.response.data),
);

const paramsKeyLang = (lang) => ({ api_key: apiKeyTMDB, language: lang });

const fetchTmdb = async (label, url, params, fallback = {}) => {
  try {
    const response = await service.get(url, { params });
    return response.data;
  } catch (err) {
    console.error(`Error ${label} TMDB:`, err);
    return fallback;
  }
};

// < SEARCH
export async function getSearch(searchValue, media) {
  if (USE_MOCKS) {
    if (media === 'movie') return mockListMovies;
    if (media === 'tv') return mockListTv;
    if (media === 'person') return mockListPerson;
    return mockListMovies;
  }
  return fetchTmdb('Search', `/search/${media}`, {
    query: searchValue,
    api_key: apiKeyTMDB,
    adult: false,
  });
}

// . Discover
export async function getDiscover(media, id, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockListTv : mockListMovies;
  const url = `/discover/${media}?include_adult=false&include_video=false&language=${lang}&region=ES&&page=2`;
  return fetchTmdb('Discover', url, paramsKeyLang(lang));
}
// . External Id
export async function getExternalId(media, id, lang = 'es-ES') {
  if (USE_MOCKS)
    return media === 'person' ? mockExternalIdsPerson : mockExternalIds;
  return fetchTmdb(
    'External Id',
    `/${media}/${id}/external_ids`,
    paramsKeyLang(lang),
  );
}
// . Top
export async function getTop(media, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockListTv : mockListMovies;
  const region = lang.split('-')[1];
  return fetchTmdb('Top', `/${media}/popular`, {
    ...paramsKeyLang(lang),
    region,
  });
}
// . Trending
export async function getTrending(lang = 'es-ES') {
  if (USE_MOCKS) return mockListTrending;
  return fetchTmdb('Trending', '/trending/all/day', paramsKeyLang(lang));
}
// . Media Details English
export async function getMediaDetailsEN(media, id) {
  if (USE_MOCKS) {
    if (media === 'tv') return mockTv;
    if (media === 'person') return mockPerson;
    return mockMovie;
  }
  return fetchTmdb(
    'Media Details English',
    `/${media}/${id}`,
    paramsKeyLang('en-US'),
  );
}
// . Media Details
export async function getMediaDetails(media, id, lang = 'es-ES') {
  if (USE_MOCKS) {
    if (media === 'tv') return mockTv;
    if (media === 'person') return mockPerson;
    return mockMovie;
  }
  return fetchTmdb('Details', `/${media}/${id}`, paramsKeyLang(lang));
}
// . Credits
export async function getCredits(media, id, creditsText, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockCreditsTv : mockCreditsMovie;
  return fetchTmdb(
    'Credits',
    `/${media}/${id}/${creditsText}`,
    paramsKeyLang(lang),
  );
}
// . WatchList
export async function getWatchList(media, id, lang = 'es-ES') {
  if (USE_MOCKS) return mockWatchProviders;
  return fetchTmdb(
    'Watch List',
    `/${media}/${id}/watch/providers`,
    paramsKeyLang(lang),
  );
}
// . Trailer
export async function getTrailer(media, id, lang = 'es-ES') {
  if (USE_MOCKS) return mockTrailers;
  return fetchTmdb(
    'Trailer',
    `/${media}/${id}/videos`,
    paramsKeyLang(lang),
    [],
  );
}
// . Collections
export async function getCollections(id, lang = 'es-ES') {
  if (USE_MOCKS) return mockCollection;
  return fetchTmdb('Collections', `/collection/${id}`, paramsKeyLang(lang));
}
// . KeyWords
export async function getKeyWords(media, id, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockKeywordsTv : mockKeywordsMovie;
  return fetchTmdb('KeyWords', `/${media}/${id}/keywords`, paramsKeyLang(lang));
}
// . Release
export async function getRelease(media, id, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockContentRatings : mockReleaseDates;
  const data = media === 'tv' ? 'content_ratings' : 'release_dates';
  return fetchTmdb('Release', `/${media}/${id}/${data}`, paramsKeyLang(lang));
}
// . Similar
export async function getSimilar(media, id, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockListTv : mockListMovies;
  return fetchTmdb('Similar', `/${media}/${id}/similar`, paramsKeyLang(lang));
}
// . Recommendations
export async function getRecommendations(media, id, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockListTv : mockListMovies;
  return fetchTmdb(
    'Recommendations',
    `/${media}/${id}/recommendations`,
    paramsKeyLang(lang),
  );
}
// < TV SHOW
// . Season
export async function getSeasonDetails(id, season, lang = 'es-ES') {
  if (USE_MOCKS) return mockSeason;
  return fetchTmdb(
    'Season Details',
    `/tv/${id}/season/${season}`,
    paramsKeyLang(lang),
  );
}
// . Episode
export async function getEpisodeDetails(id, season, episode, lang = 'es-ES') {
  if (USE_MOCKS) return mockEpisode;
  return fetchTmdb(
    'Episode Details',
    `/tv/${id}/season/${season}/episode/${episode}`,
    paramsKeyLang(lang),
  );
}
// < PERSON
// . Detail Person
export async function getPersonDetails(media, id, lang = 'es-ES') {
  if (USE_MOCKS) return mockPersonCredits;
  return fetchTmdb(
    'Person Details',
    `/${media}/${id}/combined_credits`,
    paramsKeyLang(lang),
  );
}
// < GENRES
// . Discover
export async function getDiscoverGenres(
  media,
  withGenres,
  lang = 'es-ES',
  page = 1,
) {
  if (USE_MOCKS) return media === 'tv' ? mockListTv : mockListMovies;
  return fetchTmdb('Discover Genres', `/discover/${media}`, {
    api_key: apiKeyTMDB,
    language: lang,
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
    page,
    with_genres: withGenres,
  });
}
// . Genres List
export async function getGenresList(media, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockGenresTv : mockGenresMovie;
  return fetchTmdb('List Genres', `/genre/${media}/list`, paramsKeyLang(lang));
}
// < KEYWORDS
// . Discover
export async function getDiscoverKeywords(media, withKeywords, lang = 'es-ES') {
  if (USE_MOCKS) return media === 'tv' ? mockListTv : mockListMovies;
  return fetchTmdb('Discover Keywords', `/discover/${media}`, {
    api_key: apiKeyTMDB,
    language: lang,
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
    page: '1',
    with_keywords: withKeywords,
  });
}
// . Keywords List
export async function getKeywordsList(id, lang = 'es-ES') {
  if (USE_MOCKS) return mockKeywordDetail;
  return fetchTmdb('List Keyword', `/keyword/${id}`, paramsKeyLang(lang));
}
