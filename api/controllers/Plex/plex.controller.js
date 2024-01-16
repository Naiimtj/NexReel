const createError = require("http-errors");
const axios = require("axios");
const PlexData = require("../../models/Plex/plex.model");

const service = axios.create({
  baseURL: process.env.URL_PLEX,
});

const apiKeyPLEX = process.env.APIKEY_PLEX || "";

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
      return 10;
    case "anime":
      return 11;
    case "animation":
      return 12;
    case "documental":
      return 15;
    default:
      break;
  }
  return {
    "X-Plex-Token": apiKeyPLEX,
  };
}

module.exports.create = async (req, res, next) => {
  try {
    const plexDataExist = await PlexData.find();
    if (!plexDataExist.length) {
      await createPlexData();
    } else {
      await updatePlexData(plexDataExist[0].id);
    }
  } catch (error) {
    console.error("Error executing create:", error);
  }
};

async function createPlexData() {
  try {
    const sections = ["movie", "tv", "anime", "animation", "documental"];
    const responses = await Promise.all(
      sections.map((section) =>
        service.get(`sections/${mediaID(section)}/all`, { params: paramsKey() })
      )
    );

    const validResponses = responses.filter(
      (response) =>
        response &&
        response.data &&
        response.data.MediaContainer &&
        response.data.MediaContainer.Metadata
    );

    if (validResponses.length === sections.length) {
      const combinedResults = validResponses.reduce(
        (acc, response) => acc.concat(response.data.MediaContainer.Metadata),
        []
      );

      const moviesResult = combinedResults.filter(
        (item) => item.type === "movie"
      );
      const tvShowsResults = combinedResults.filter(
        (item) => item.type === "show"
      );
      const filteredMoviesResult = moviesResult.map((movie) => ({
        ratingKey: movie.ratingKey,
        type: movie.type,
        year: movie.year,
        originalTitle: movie.originalTitle || "",
        title: movie.title,
      }));
      const filteredTvShowsResult = tvShowsResults.map((show) => ({
        ratingKey: show.ratingKey,
        type: show.type,
        year: show.year,
        originalTitle: show.originalTitle || "",
        title: show.title,
      }));

      if (filteredMoviesResult.length > 0 && filteredTvShowsResult.length > 0) {
        const createdPlexData = await PlexData.create({
          movie: filteredMoviesResult,
          tv: filteredTvShowsResult,
        });

        if (createdPlexData) {
          return createdPlexData;
        } else {
          throw new Error("Plex Data not created");
        }
      } else {
        console.error("Can't get Plex Movie or TV data");
        throw new Error("Can't get Plex Movie or TV data");
      }
    } else {
      console.error("Some Plex section data is missing or invalid");
      throw new Error("Some Plex section data is missing or invalid");
    }
  } catch (err) {
    console.error("Error creating Plex data");
    // throw err;
  }
}

async function updatePlexData(idPlexData, res, next) {
  try {
    const sections = ["movie", "tv", "anime", "animation", "documental"];
    const responses = await Promise.all(
      sections.map((section) =>
        service.get(`sections/${mediaID(section)}/all`, { params: paramsKey() })
      )
    );

    const validResponses = responses.filter(
      (response) =>
        response &&
        response.data &&
        response.data.MediaContainer &&
        response.data.MediaContainer.Metadata
    );

    if (validResponses.length === sections.length) {
      const combinedResults = validResponses.reduce(
        (acc, response) => acc.concat(response.data.MediaContainer.Metadata),
        []
      );

      const moviesResult = combinedResults.filter(
        (item) => item.type === "movie"
      );
      const tvShowsResults = combinedResults.filter(
        (item) => item.type === "show"
      );
      const filteredMoviesResult = moviesResult.map((movie) => ({
        ratingKey: movie.ratingKey,
        type: movie.type,
        year: movie.year,
        originalTitle: movie.originalTitle || "",
        title: movie.title,
      }));
      const filteredTvShowsResult = tvShowsResults.map((show) => ({
        ratingKey: show.ratingKey,
        type: show.type,
        year: show.year,
        originalTitle: show.originalTitle || "",
        title: show.title,
      }));
      if (filteredMoviesResult.length > 0 && filteredTvShowsResult.length > 0) {
        const updatePlexData = await PlexData.findByIdAndUpdate(idPlexData, {
          movie: filteredMoviesResult,
          tv: filteredTvShowsResult,
        });

        if (updatePlexData) {
          return updatePlexData;
        } else {
          throw new Error("Plex Data not updated");
        }
      } else {
        console.error("Can't get Plex Movie or TV data");
        throw new Error("Can't get Plex Movie or TV data");
      }
    } else {
      console.error("Some Plex section data is missing or invalid");
      throw new Error("Some Plex section data is missing or invalid");
    }
  } catch (err) {
    console.error("Error creating Plex data:", err);
    throw err;
  }
}

module.exports.list = async (req, res, next) => {
  try {
    const plexData = await PlexData.find();
    if (!plexData) {
      return next(createError(404, "Plex Data not found"));
    }
    res.status(200).json(plexData);
  } catch (error) {
    next(error);
  }
};
