import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDiscoverGenres } from "../../../services/TMDB/services-tmdb";

const GenreMapper = (mediaType, idGenre, page) => {
  const [t] = useTranslation("translation");
  // -GENRES TV
  const processInfo = {
    genreTV1: "Genre Movie",
    genreTV2: "Genre if is the same",
  };
  switch (idGenre) {
    case "10759": // Action & Adventure
      processInfo.genreTV1 = "28"; // Action
      processInfo.genreTV2 = "12"; // Adventure
      break;
    case "10765": // Sci-Fi & Fantasy
      processInfo.genreTV1 = "878"; // Science Fiction
      processInfo.genreTV2 = "14"; // Fantasy
      break;
    case "10768": // War & Politics
      processInfo.genreTV1 = "10752"; // War
      processInfo.genreTV2 = null;
      break;
    case "10766": // Soap
      processInfo.genreTV1 = "10749"; // Romance
      processInfo.genreTV2 = null;
      break;
    default:
      processInfo.genreTV1 = idGenre;
      processInfo.genreTV2 = null;
      break;
  }
  // -GENRES MOVIE
  const processInfo2 = {
    genreMOVIE1: "Genre TV",
    genreMOVIE2: "Genre if is the same",
  };
  switch (idGenre) {
    case "28": // Action
      processInfo2.genreMOVIE1 = "10759"; // Action & Adventure
      processInfo2.genreMOVIE2 = null;
      break;
    case "12": // Adventure
      processInfo2.genreMOVIE1 = "10759"; // Action & Adventure
      processInfo2.genreMOVIE2 = null;
      break;
    case "878": // Science Fiction
      processInfo2.genreMOVIE1 = "10765"; // Sci-Fi & Fantasy
      processInfo2.genreMOVIE2 = null;
      break;
    case "14": // Fantasy
      processInfo2.genreMOVIE1 = "10765"; // Sci-Fi & Fantasy
      processInfo2.genreMOVIE2 = null;
      break;
    case "10752": // War
      processInfo2.genreMOVIE1 = "10768"; // War & Politics
      processInfo2.genreMOVIE2 = null;
      break;
    case "10749": // Romance
      processInfo2.genreMOVIE1 = "10766"; // Soap
      processInfo2.genreMOVIE2 = null;
      break;
    default:
      processInfo2.genreMOVIE1 = idGenre;
      processInfo2.genreMOVIE2 = null;
      break;
  }
  const [genreMedia, setGenreMedia] = useState([]);
  // -MOVIES & TV SHOWS
  useEffect(() => {
    const detailsMovie = async () => {
      const resultGenre1 = await getDiscoverGenres(
        "movie",
        processInfo.genreTV1,
        t("es-ES"),
        page
      );
      if (processInfo.genreTV2 && resultGenre1.total_results > 0) {
        const resultGenre2 = await getDiscoverGenres(
          "movie",
          processInfo.genreTV2,
          t("es-ES"),
          page
        );
        if (resultGenre2.total_results > 0) {
          setGenreMedia({
            page: page,
            results: resultGenre1.results.concat(resultGenre2.results),
            total_pages: resultGenre1.total_pages + resultGenre2.total_pages,
            total_results:
              resultGenre1.total_results + resultGenre2.total_results,
          });
        } else {
          setGenreMedia(resultGenre1.results);
        }
      } else {
        setGenreMedia(resultGenre1);
      }
    };
    const detailsTv = async () => {
      const resultGenre1 = await getDiscoverGenres(
        "tv",
        processInfo2.genreMOVIE1,
        t("es-ES"),
        page
      );
      if (processInfo2.genreMOVIE2 && resultGenre1.total_results > 0) {
        const resultGenre2 = await getDiscoverGenres(
          "tv",
          processInfo2.genreMOVIE2,
          t("es-ES"),
          page
        );
        if (resultGenre2.total_results > 0) {
          setGenreMedia({
            page: page,
            results: resultGenre1.results.concat(resultGenre2.results),
            total_pages: resultGenre1.total_pages + resultGenre2.total_pages,
            total_results:
              resultGenre1.total_results + resultGenre2.total_results,
          });
        } else {
          setGenreMedia(resultGenre1.results);
        }
      } else {
        setGenreMedia(resultGenre1);
      }
    };
    if (idGenre) {
      if (mediaType === "movie") {
        detailsMovie();
      } else {
        detailsTv();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGenre, mediaType, t, page]);
  console.log(genreMedia);
  return genreMedia;
};

export default GenreMapper;
