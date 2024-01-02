import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Multi from "../../components/MediaList/Multi";
import { IoIosArrowBack } from "react-icons/io";
import { useTranslation } from "react-i18next";
import {
  getGenresList,
  getMediaDetails,
} from "../../../services/TMDB/services-tmdb";
import Spinner from "../../utils/Spinner/Spinner";
import { useAuthContext } from "../../context/auth-context";
import { getAllMedia, getUser } from "../../../services/DB/services-db";
import ArrayPaginator from "../../utils/ArrayPaginator";
import GenreMapper from "../Genres/GenreMapper";

const ListMediasGenres = () => {
  const [t] = useTranslation("translation");
  const navigate = useNavigate();
  const { media, id, idGenre } = useParams();
  const { user } = useAuthContext();
  const userExist = !!user;
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [dataUser, setDataUser] = useState({});
  const [mediasUser, setMediasUser] = useState([]);
  useEffect(() => {
    const Data = async () => {
      getUser()
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
      getAllMedia()
        .then((data) => {
          setMediasUser(data);
        })
        .catch((err) => err);
    };
    if (userExist) {
      Data();
    }
  }, [userExist, changeSeenPending]);
  // -NAME GENRE
  const [genreNameList, setGenreNameList] = useState([]);
  useEffect(() => {
    const detailsAPI = async () => {
      const result = await getGenresList(media, t("es-ES"));
      if (result) {
        setGenreNameList(result);
      }
    };
    if (media) {
      detailsAPI();
    }
  }, [media, t]);
  // -FILTER NAME GENRE
  const genreName =
    genreNameList.genres &&
    genreNameList.genres.filter((gene) => gene && gene.id === Number(idGenre));
  const nameGenre = genreName && genreName[0].name;
  const [backMedia, setBackMedia] = useState({});
  //-SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  const mediaType = window.location.href.endsWith("listMovies")
    ? "movie"
    : "tv";
  const mediasGenre = GenreMapper(mediaType, idGenre, currentPageIndex + 1);
  useEffect(() => {
    if (id) {
      getMediaDetails(media, id, t("es-ES")).then((data) => {
        setBackMedia(data);
      });
    }
  }, [media, id, t]);
  const loading = mediasGenre && mediasGenre.total_results > 0;

  return (
    <div className="w-full h-full text-gray-200 bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
      {/*//- MEDIAS */}
      <div className="text-gray-200 mb-20 mt-6">
        <div className="text-gray-200 mb-4">
          {/* //.BACK */}
          <button
            className="ml-5 pt-5 hover:text-[#6676a7]"
            onClick={() => navigate(`/${media}/${id}`)}
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt={t("Back Icon")}
              onClick={() => navigate(`/${media}/${id}`)}
            />
            {backMedia.title}
          </button>
          {/* //.BACK GENRE*/}
          <button
            className="ml-5 pt-5 hover:text-[#6676a7]"
            onClick={() => navigate(`/${media}/${id}/genre/${idGenre}`)}
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt={t("Back Icon")}
              onClick={() => navigate(`/${media}/${id}/genre/${idGenre}}`)}
            />
            {t(nameGenre)}
          </button>
        </div>
        <h1 className="text-gray-200 text-3xl text-center">
          {mediaType === "movie" ? t("MOVIES") : t("TV SHOWS")}
        </h1>
        {/* //-MULTIPLE TABS */}
        <div className="px-4 pb-4">
          {/* MOVIES */}
          {!loading ? (
            <Spinner result />
          ) : (
            <>
              <ArrayPaginator
                data={mediasGenre.results}
                totalResult={mediasGenre.total_results > 10000 ? 10000 : mediasGenre.total_results}
                totalPages={
                  mediasGenre.total_pages > 500 ? 500 : mediasGenre.total_pages
                }
                groupSize={20}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndex={setCurrentPageIndex}
              />
              <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {mediasGenre &&
                  mediasGenre.total_results > 0 &&
                  mediasGenre.results.map((mediaData, key) => {
                    return (
                      <Multi
                        key={`MovieBestRated${key}`}
                        info={mediaData}
                        mediaMovie={mediaType === "movie"}
                        mediaTv={mediaType === "tv"}
                        dataUser={dataUser}
                        mediasUser={mediasUser}
                        changeSeenPending={changeSeenPending}
                        setChangeSeenPending={setChangeSeenPending}
                      />
                    );
                  })}
              </div>
              <ArrayPaginator
                data={mediasGenre.results}
                totalResult={mediasGenre.total_results > 10000 ? 10000 : mediasGenre.total_results}
                totalPages={
                  mediasGenre.total_pages > 500 ? 500 : mediasGenre.total_pages
                }
                groupSize={20}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndex={setCurrentPageIndex}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ListMediasGenres;
