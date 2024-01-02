import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BsFillCaretRightFill } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import Carousel from "../../utils/Carousel/Carousel";
import { useTranslation } from "react-i18next";
import {
  getDiscoverGenres,
  getGenresList,
  getMediaDetails,
} from "../../../services/TMDB/services-tmdb";
import PageTitle from "../../components/PageTitle";

function Genres() {
  const [t] = useTranslation("translation");
  const { id, media_type, idGenre } = useParams();
  // -SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  // -GENRES TV
  const processInfo = {
    genreTV1: "Genre Movie",
    genreTV2: "Genre if is the same",
  };
  switch (idGenre) {
    case "10759":
      processInfo.genreTV1 = "28";
      processInfo.genreTV2 = "12";
      break;
    case "10765":
      processInfo.genreTV1 = "878";
      processInfo.genreTV2 = "14";
      break;
    case "10768":
      processInfo.genreTV1 = "10752";
      processInfo.genreTV2 = null;
      break;
    case "10766":
      processInfo.genreTV1 = "10749";
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
    case "28":
      processInfo2.genreMOVIE1 = "10759";
      processInfo2.genreMOVIE2 = null;
      break;
    case "12":
      processInfo2.genreMOVIE1 = "10759";
      processInfo2.genreMOVIE2 = null;
      break;
    case "878":
      processInfo2.genreMOVIE1 = "10765";
      processInfo2.genreMOVIE2 = null;
      break;
    case "14":
      processInfo2.genreMOVIE1 = "10765";
      processInfo2.genreMOVIE2 = null;
      break;
    case "10752":
      processInfo2.genreMOVIE1 = "10768";
      processInfo2.genreMOVIE2 = null;
      break;
    case "10749":
      processInfo2.genreMOVIE1 = "10766";
      processInfo2.genreMOVIE2 = null;
      break;
    default:
      processInfo2.genreMOVIE1 = idGenre;
      processInfo2.genreMOVIE2 = null;
      break;
  }
  const [genreMovie, setGenreMovie] = useState([]);
  const [genreTv, setGenreTv] = useState([]);
  // -MOVIES & TV SHOWS
  useEffect(() => {
    const detailsMovie = async () => {
      const resultGenre1 = await getDiscoverGenres(
        "movie",
        processInfo.genreTV1,
        t("es-ES")
      );
      if (resultGenre1.total_results > 0) {
        const resultGenre2 = await getDiscoverGenres(
          "movie",
          processInfo.genreTV2,
          t("es-ES")
        );
        if (resultGenre2.total_results > 0) {
          setGenreMovie(resultGenre1.results.concat(resultGenre2.results));
        } else {
          setGenreMovie(resultGenre1.results);
        }
      } else {
        setGenreMovie(resultGenre1.results);
      }
    };
    const detailsTv = async () => {
      const resultGenre1 = await getDiscoverGenres(
        "tv",
        processInfo.genreMOVIE1,
        t("es-ES")
      );
      if (resultGenre1.total_results > 0) {
        const resultGenre2 = await getDiscoverGenres(
          "tv",
          processInfo.genreMOVIE2,
          t("es-ES")
        );
        if (resultGenre2.total_results > 0) {
          setGenreTv(resultGenre1.results.concat(resultGenre2.results));
        } else {
          setGenreTv(resultGenre1.results);
        }
      } else {
        setGenreTv(resultGenre1.results);
      }
    };
    if (idGenre) {
      detailsMovie();
      detailsTv();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGenre, t]);
  // -DETAILS MOVIES / TV SHOWS
  const [detailsMedia, setDetailsMedia] = useState({});
  useEffect(() => {
    const detailsAPI = async () => {
      const result = await getMediaDetails(media_type, id, t("es-ES"));
      if (Object.keys(result).length > 0) {
        setDetailsMedia(result);
      }
    };
    if (id && media_type) {
      detailsAPI();
    }
  }, [id, media_type, t]);
  // -NAME GENRE
  const [genreNameList, setGenreNameList] = useState([]);
  useEffect(() => {
    const detailsAPI = async () => {
      const result = await getGenresList(media_type, t("es-ES"));
      if (result) {
        setGenreNameList(result);
      }
    };
    if (media_type) {
      detailsAPI();
    }
  }, [media_type, t]);
  // -FILTER NAME GENRE
  const genreName =
    genreNameList.genres &&
    genreNameList.genres.filter((gene) => gene && gene.id === Number(idGenre));
  const nameGenre = genreName && genreName[0].name;
  // -FILTERS
  const genreFinal =
    genreMovie && genreMovie.length > 0
      ? Array.from(new Set(genreMovie.map((a) => a.id))).map((id) =>
          genreMovie.find((a) => a.id === id)
        )
      : null;
  const genreTotal = genreFinal !== null ? genreFinal : genreMovie;

  return (
    <div className="w-full h-full px-8 pb-5 mt-6 mb-20 text-gray-200 bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
      <PageTitle title={t(nameGenre)} />
      {/* //.BACK MOVIE/TV */}
      <Link
        className="ml-5 pt-5 hover:text-[#6676a7]"
        to={`/${media_type}/${id}`}
        type="submit"
      >
        <IoIosArrowBack
          className="inline-block mr-1"
          size={25}
          alt={t("Before")}
        />
        {detailsMedia.title === undefined
          ? detailsMedia.name
          : detailsMedia.title}
      </Link>
      {/* // -NAME GENRES */}
      <div className="h-full w-full p-2 md:p-4 ">
        <h2 className="inline-block pr-2">{t("Genre")}: </h2>
        <p className="inline-block capitalize font-semibold text-lg">
          {t(nameGenre)}
        </p>
      </div>
      {/* // -MOVIES */}
      {genreTotal && genreTotal.length > 0 ? (
        <>
          <div className="flex justify-end">
            {genreTotal && genreTotal.length > 0 ? (
              <Link
                className="flex items-center text-base text-purpleNR text-right hover:text-gray-200 mx-4 transition duration-300"
                to={`/${media_type}/${id}/genre/${idGenre}/listMovies`}
              >
                {t("Complete list")}
                <BsFillCaretRightFill className="align-middle" size={16} />
              </Link>
            ) : null}
          </div>
          <div>
            {genreTotal && genreTotal.length > 0 && (
              <Carousel title={t("MOVIES")} info={genreTotal} media={"movie"} />
            )}
          </div>
        </>
      ) : null}
      {/* // - TV SHOWS */}
      {genreTv && genreTv.length > 0 ? (
        <>
          <div
            className={
              genreTv && genreTv.length > 0
                ? "pb-1 mt-4 rounded-3xl"
                : "pb-1 rounded-3xl"
            }
          >
            <div className="flex justify-end">
              {genreTv && genreTv.length > 0 ? (
                <Link
                  className="flex items-center text-base text-purpleNR text-right hover:text-gray-200 mx-4 transition duration-300"
                  to={`/${media_type}/${id}/genre/${idGenre}/listTvShows`}
                >
                  {t("Complete list")}
                  <BsFillCaretRightFill className="align-middle" size={16} />
                </Link>
              ) : null}
            </div>
            <div>
              {genreTv && genreTv.length > 0 && (
                <Carousel
                  title={t("TV SHOWS")}
                  info={genreTv}
                  media={"tv"}
                />
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default Genres;
