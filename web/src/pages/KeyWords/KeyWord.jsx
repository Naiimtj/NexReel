import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BsFillCaretRightFill } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import {
  getDiscoverKeywords,
  getKeywordsList,
  getMediaDetails,
} from "../../../services/TMDB/services-tmdb";
import { useTranslation } from "react-i18next";
import Carousel from "../../utils/Carousel/Carousel";

function Keyword() {
  const [t] = useTranslation("translation");
  const { id, media_type, idkeyword } = useParams();

  // -SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  const [keywordMovie, setKeywordMovie] = useState([]);
  const [keywordSerie, setKeywordSerie] = useState([]);
  // -DETALLES KEYWORDS PELÍCULAS
  useEffect(() => {
    const detailsMovie = async () => {
      const resultKeywordMovie = await getDiscoverKeywords(
        "movie",
        idkeyword,
        t("es-ES")
      );
      if (resultKeywordMovie.total_results > 0) {
        setKeywordMovie(resultKeywordMovie.results);
      }
    };
    const detailsTv = async () => {
      const resultKeyWordsTv = await getDiscoverKeywords(
        "tv",
        idkeyword,
        t("es-ES")
      );
      if (resultKeyWordsTv.total_results > 0) {
        setKeywordSerie(resultKeyWordsTv.results);
      }
    };
    if (idkeyword) {
      detailsMovie();
      detailsTv();
    }
  }, [idkeyword, t]);
  const [keywordName, setKeywordName] = useState([]);
  // -NAME KEYWORDS
  useEffect(() => {
    const keywordsData = async () => {
      const resultKeywordsList = await getKeywordsList(idkeyword, t("es-ES"));
      if (Object.keys(resultKeywordsList).length > 0) {
        setKeywordName(resultKeywordsList);
      }
    };
    if (idkeyword) {
      keywordsData();
    }
  }, [idkeyword, t]);
  // -DETALLE PELICULA/SERIE
  const [detallesList, setDetallesList] = useState([]);
  useEffect(() => {
    const detallesAPI = async () => {
      const result = await getMediaDetails(media_type, id, t("es-ES"));
      if (Object.keys(result).length > 0) {
        setDetallesList(result);
      }
    };
    if (id && media_type) {
      detallesAPI();
    }
  }, [id, media_type, t]);

  return (
    <div className="w-full h-full px-8 pb-5 mt-6 mb-20 text-gray-200 bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
      {/* //.BACK TO MOVIE/TV SHOW */}
      <Link
        className="ml-5 pt-5 hover:text-[#6676a7]"
        to={`/${media_type}/${id}`}
        type="submit"
      >
        <IoIosArrowBack className="inline-block mr-1" size={25} alt="Antes" />
        {detallesList.title === undefined
          ? detallesList.name
          : detallesList.title}
      </Link>
      {/* // -NOMBRE DE LA KEYWORD */}
      <div className="h-full w-full p-2 md:p-4 ">
        <h2 className="inline-block pr-2">Palabra clave: </h2>
        <p className="inline-block capitalize font-semibold text-lg">
          {keywordName.name}
        </p>
      </div>
      {/* // -MOVIES */}
      {keywordMovie && keywordMovie.length > 0 ? (
        <>
          <div className="flex justify-end">
            {keywordMovie && keywordMovie.length > 0 ? (
              <Link
                className="flex items-center text-base text-purpleNR text-right hover:text-gray-200 mx-4 transition duration-300"
                to={`/${media_type}/${id}/keyword/movie/${idkeyword}/list`}
              >
                {t("Complete list")}
                <BsFillCaretRightFill className="align-middle" size={16} />
              </Link>
            ) : null}
          </div>
          <div>
            {keywordMovie && keywordMovie.length > 0 && (
              <Carousel
                title={t("MOVIES")}
                info={keywordMovie}
                media={"movie"}
              />
            )}
          </div>
        </>
      ) : null}
      {/* // - SERIES */}
      {keywordSerie && keywordSerie.length > 0 ? (
        <>
          <div
            className={
              keywordSerie && keywordSerie.length > 0
                ? "pb-1 mt-4 rounded-3xl"
                : "pb-1 rounded-3xl"
            }
          >
            <div className="flex justify-end">
              {keywordSerie && keywordSerie.length > 0 ? (
                <Link
                  className="flex items-center text-base text-purpleNR text-right hover:text-gray-200 mx-4 transition duration-300"
                  to={`/${media_type}/${id}/keyword/tv/${idkeyword}/list`}
                >
                  {t("Complete list")}
                  <BsFillCaretRightFill className="align-middle" size={16} />
                </Link>
              ) : null}
            </div>
            <div>
              {keywordSerie && keywordSerie.length > 0 && (
                <Carousel
                  title={t("TV SHOWS")}
                  info={keywordSerie}
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

export default Keyword;
