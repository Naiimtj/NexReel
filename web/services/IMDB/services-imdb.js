/* eslint-disable no-unused-vars */
import axios from "axios";
import MockRating from "./tt0012349 (el Chico - 1921)/Ratings tt0012349.json";

const service = axios.create({
  baseURL: import.meta.env.VITE_URL_IMDB,
  headers: {
    "X-RapidAPI-Host": "film-show-ratings.p.rapidapi.com",
    "X-RapidAPI-Key": import.meta.env.VITE_APIKEY_IMDB,
  },
});

const apiKeyIMDB = import.meta.env.VITE_APIKEY_IMDB || "";

// . Rating
export async function getRating(id) {
  const url = `item/?id=${id}`;
  console.log("url IMDB:", url);
  try {
    const response = await service.get(url);
    return response.data?.result?.ratings;
  } catch (err) {
    console.error("Error External Id IMDB:", err);
    return {};
  }
}

// . Rating
export async function getImdbPerson(id, lang = "es-ES") {
  const langImdb = lang.split("-");
  try {
    const response = await service.get(
      `${langImdb[0]}/API/Name/${apiKeyIMDB}/${id}`
    );
    if (response.data.errorMessage) {
      console.error("Error Person IMDB:", response.data.errorMessage);
    } else {
      return response;
    }
  } catch (err) {
    console.error("Error Person TMDB:", err);
    return {};
  }
}
