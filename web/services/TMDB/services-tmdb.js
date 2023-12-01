import axios from "axios";

const service = axios.create({
  baseURL: import.meta.env.VITE_URL_TMDB,
});

const apiKeyTMDB = import.meta.env.VITE_APIKEY_TMDB || "";

service.interceptors.request.use(
  (response) => response,
  (err) => Promise.reject(err.response.data)
);

function paramsKeyLang(lang) {
  return {
    api_key: apiKeyTMDB,
    language: lang,
  };
}

// < SEARCH
export async function getSearch(searchValue, media) {
  try {
    const response = await service.get(`/search/${media}&include_adult=false`, {
      params: {
        query: searchValue,
        api_key: apiKeyTMDB,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error Search TMDB:", err);
    return {};
  }
}

// . Discover
export async function getDiscover(media, id, lang = "es-ES") {
  const url = `/discover/${media}?api_key=${apiKeyTMDB}&language=${lang}&region=ES&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_providers=ES&watch_region=ES&with_watch_monetization_types=flatrate`;
  try {
    const response = await service.get(url);
    return response.data;
  } catch (err) {
    console.error("Error Discover TMDB:", err);
    return {};
  }
}
// . External Id
export async function getExternalId(media, id, lang = "es-ES") {
  try {
    const response = await service.get(`/${media}/${id}/external_ids`, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error External Id TMDB:", err);
    return {};
  }
}
// . Top
export async function getTop(media, lang = "es-ES") {
  const url = `/${media}/popular`;
  const region = lang.split("-");
  try {
    const response = await service.get(url, {
      params: { ...paramsKeyLang(lang), region: region[1] },
    });
    return response.data;
  } catch (err) {
    console.error("Error Top TMDB:", err);
    return {};
  }
}
// . Trending
export async function getTrending(lang = "es-ES") {
  const url = "/trending/all/day";
  try {
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Trending TMDB:", err);
    return {};
  }
}
// . Media Details English
export async function getMediaDetailsEN(media, id) {
  try {
    const response = await service.get(`/${media}/${id}`, {
      params: paramsKeyLang("en-US"),
    });
    return response.data;
  } catch (err) {
    console.error("Error Media Details English TMDB:", err);
    return {};
  }
}
// . Media Details
export async function getMediaDetails(media, id, lang = "es-ES") {
  try {
    const response = await service.get(`/${media}/${id}`, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Details TMDB:", err);
    return {};
  }
}
// . Credits
export async function getCredits(media, id, creditsText, lang = "es-ES") {
  try {
    const url = `/${media}/${id}/${creditsText}`;
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Credits TMDB:", err);
    return {};
  }
}
// . WatchList
export async function getWatchList(media, id, lang = "es-ES") {
  const url = `/${media}/${id}/watch/providers`;
  try {
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Watch List TMDB:", err);
    return {};
  }
}
// . Trailer
export async function getTrailer(media, id, lang = "es-ES") {
  const url = `/${media}/${id}/videos`;
  try {
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Trailer TMDB:", err);
    return [];
  }
}
// . Collections
export async function getCollections(id, lang = "es-ES") {
  const url = `/collection/${id}`;
  try {
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Collections TMDB:", err);
    return {};
  }
}
// . KeyWords
export async function getKeyWords(media, id, lang = "es-ES") {
  const url = `/${media}/${id}/keywords`;
  try {
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error KeyWords TMDB:", err);
    return {};
  }
}
// . Release
export async function getRelease(media, id, lang = "es-ES") {
  const data = media === "tv" ? "content_ratings" : "release_dates";
  const url = `/${media}/${id}/${data}`;
  try {
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Release TMDB:", err);
    return {};
  }
}
// . Similar
export async function getSimilar(media, id, lang = "es-ES") {
  const url = `/${media}/${id}/similar`;
  try {
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Similar TMDB:", err);
    return {};
  }
}
// . Recommendations
export async function getRecommendations(media, id, lang = "es-ES") {
  const url = `/${media}/${id}/recommendations`;
  try {
    const response = await service.get(url, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Recommendations TMDB:", err);
    return {};
  }
}
// < TV SHOW
// . Season
export async function getSeasonDetails(id, season, lang = "es-ES") {
  try {
    const response = await service.get(`/tv/${id}/season/${season}`, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Season Details TMDB:", err);
    return {};
  }
}
// < PERSON
// . Detail Person
export async function getPersonDetails(media, id, lang = "es-ES") {
  try {
    const response = await service.get(`/${media}/${id}/combined_credits`, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error Recommendations TMDB:", err);
    return {};
  }
}
// < GENRES
// . Discover
export async function getDiscoverGenres(media, withGenres, lang = "es-ES") {
  try {
    const response = await service.get(`/discover/${media}`, {
      params: {
        api_key: apiKeyTMDB,
        language: lang,
        sort_by: "popularity.desc",
        include_adult: "false",
        include_video: "false",
        page: "1",
        with_genres: withGenres,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error Discover Genres TMDB:", err);
    return {};
  }
}
// . Genres List
export async function getGenresList(media, lang = "es-ES") {
  try {
    const response = await service.get(`/genre/${media}/list`, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error List Genres TMDB:", err);
    return {};
  }
}
// < KEYWORDS
// . Discover
export async function getDiscoverKeywords(media, withKeywords, lang = "es-ES") {
  try {
    const response = await service.get(`/discover/${media}`, {
      params: {
        api_key: apiKeyTMDB,
        language: lang,
        sort_by: "popularity.desc",
        include_adult: "false",
        include_video: "false",
        page: "1",
        with_keywords: withKeywords,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error Discover Genres TMDB:", err);
    return {};
  }
}
// . Keywords List
export async function getKeywordsList(id, lang = "es-ES") {
  try {
    const response = await service.get(`/keyword/${id}`, {
      params: paramsKeyLang(lang),
    });
    return response.data;
  } catch (err) {
    console.error("Error List Keyword TMDB:", err);
    return {};
  }
}
