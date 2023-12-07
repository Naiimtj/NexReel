import axios from "axios";

const service = axios.create({
  baseURL: import.meta.env.VITE_URL_PLEX,
});

const apiKeyPLEX = import.meta.env.VITE_APIKEY_PLEX || "";

service.interceptors.request.use(
  (response) => response,
  (err) => Promise.reject(err.response.data)
);

function paramsKey() {
  return {
    "X-Plex-Token": apiKeyPLEX,
  };
}

function mediaID(media) {
  switch (media) {
    case "movie":
      return 18;
    case "tv":
      return 10; // 11 Anime, 12 Animación Infantil y 15 Documentales
    default:
      break;
  }
  return {
    "X-Plex-Token": apiKeyPLEX,
  };
}

// < SEARCH
// export async function getSearch(searchValue, media) {
//   try {
//     const response = await service.get(`/search/${media}`, {
//       params: {
//         query: searchValue,
//         api_key: apiKeyTMDB,
//       },
//     });
//     return response.data;
//   } catch (err) {
//     console.error("Error Search TMDB:", err);
//     return {};
//   }
// }

// . GET ALL MOVIES
export async function getPlexAllMovies(media) {
  try {
    const response = await service.get(`sections/${mediaID(media)}/all`, {
      params: paramsKey(),
    });
    return response.data.MediaContainer.Metadata;
  } catch (err) {
    console.error("Error Plex All Movies:", err);
    return {};
  }
}

// . GET MOVIE DETAILS
export async function getPlexMovie(media, OriginalTitle, imdb_id, id) {
  try {
    const response = await service.get(
      `sections/${mediaID(
        media
      )}/all?X-Plex-Token=${apiKeyPLEX}&title=${OriginalTitle}`
    );
    const results =
      response.data.MediaContainer && response.data.MediaContainer.Metadata
        ? response.data.MediaContainer.Metadata
        : null;
    if (results) {
      const verifySameMedia = results.map((i) => i.ratingKey);
      const resultFinal = await Promise.all(
        verifySameMedia.map((i) => {
          return service.get(`metadata/${i}?X-Plex-Token=${apiKeyPLEX}`);
        })
      );
      if (resultFinal) {
        const isSameMedia =
          resultFinal &&
          resultFinal[0] &&
          resultFinal[0].data &&
          resultFinal[0].data.MediaContainer &&
          resultFinal[0].data.MediaContainer.Metadata[0] &&
          resultFinal[0].data.MediaContainer.Metadata[0].Guid.map((mediaId) => {
            const partsString = mediaId.id.split("://");
            if (imdb_id) {
              return partsString[0] === "imdb" && partsString[1] === imdb_id;
            } else {
              return partsString[0] === "tmdb" && partsString[1] === `${id}`;
            }
          }).filter((f) => f === true).length > 0;
        return isSameMedia;
      }
    } else {
      return false;
    }
  } catch (err) {
    console.error("Error Plex Details Movie:", err);
    return {};
  }
}
