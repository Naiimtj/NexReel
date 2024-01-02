import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Multi from "../../components/MediaList/Multi";
import { IoIosArrowBack } from "react-icons/io";
import { useTranslation } from "react-i18next";
import {
  getMediaDetails,
  getPersonDetails,
} from "../../../services/TMDB/services-tmdb";
import Spinner from "../../utils/Spinner/Spinner";
import { useAuthContext } from "../../context/auth-context";
import { getAllMedia, getUser } from "../../../services/DB/services-db";
import SplitArrayGroups from "../../utils/SplitArrayGroups";
import ArrayPaginator from "../../utils/ArrayPaginator";
import SortsMedias from "../../utils/SortsMedias";

const ListMedias = () => {
  const [t] = useTranslation("translation");
  const navigate = useNavigate();
  const { media, id } = useParams();
  const { user } = useAuthContext();
  const userExist = !!user;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [changeSeenPending, setChangeSeenPending] = useState(false);
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

  const [persona, setPersona] = useState({});
  const [filmsPerson, setFilmsPerson] = useState({});
  const mediaType = window.location.href.endsWith("listMovies")
    ? "movie"
    : "tv";
  //-SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (id) {
      getMediaDetails(media, id, t("es-ES")).then((data) => {
        setPersona(data);
      });
      getPersonDetails(media, id, t("es-ES")).then((data) => {
        setFilmsPerson(data);
      });
    }
  }, [t, media, id]);

  //-FILTER REPEATS
  const uniqCrewKnow =
    filmsPerson.crew !== undefined
      ? Array.from(new Set(filmsPerson.crew.map((a) => a.id))).map((id) => {
          return filmsPerson.crew.find((a) => a.id === id);
        })
      : null;
  const uniqCastKnow =
    filmsPerson.cast !== undefined
      ? Array.from(new Set(filmsPerson.cast.map((a) => a.id))).map((id) => {
          return filmsPerson.cast.find((a) => a.id === id);
        })
      : null;
  //-UNION FILTERS
  const unionKnow = uniqCastKnow && [...uniqCrewKnow, ...uniqCastKnow];

  // - SPEARED BY TYPE AND SORT BY DATE (movie or tv).filter((movie) => movie.release_date !== "")
  const knowMovie =
    unionKnow &&
    mediaType === "movie" &&
    unionKnow.filter((film) => film.media_type === "movie");
  const uniqueKnowMovie =
    knowMovie &&
    mediaType === "movie" &&
    new SortsMedias(knowMovie, mediaType).getUniqueMoviesByDate();

  const knowTv =
    unionKnow &&
    mediaType === "tv" &&
    unionKnow.filter((tvShow) => tvShow.media_type === "tv");
  const uniqueKnowTv =
    knowTv &&
    mediaType === "tv" &&
    new SortsMedias(knowTv, mediaType).getUniqueMoviesByDate();

  const loading =
    (uniqueKnowMovie && Object.keys(uniqueKnowMovie).length > 0) ||
    (uniqueKnowTv && Object.keys(uniqueKnowTv).length > 0);

  const getCardsPerPage = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) return 20;
    if (screenWidth < 768) return 21;
    if (screenWidth < 1024) return 28;
    if (screenWidth < 1280) return 30;
    if (screenWidth < 1534) return 36;
    if (screenWidth > 1534) return 40;
    return 36;
  };

  const GroupsKnowMovie =
    uniqueKnowMovie &&
    uniqueKnowMovie.length &&
    SplitArrayGroups(uniqueKnowMovie, getCardsPerPage());
  const GroupsKnowTv =
    uniqueKnowTv &&
    uniqueKnowTv.length &&
    SplitArrayGroups(uniqueKnowTv, getCardsPerPage());

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
              onClick={() => navigate(`/${media}/${id}}`)}
            />
            {persona.name}
          </button>
        </div>
        <h1 className="text-gray-200 text-3xl text-center">
          {mediaType === "movie" ? t("MOVIES") : t("TV SHOWS")}
        </h1>
        {/* //-MULTIPLE TABS */}
        <div className="px-4 pb-4">
          {/* MOVIES */}
          {mediaType === "movie" ? (
            !loading ? (
              <Spinner result />
            ) : (
              <>
                <ArrayPaginator
                  data={GroupsKnowMovie}
                  totalResult={uniqueKnowMovie.length}
                  groupSize={getCardsPerPage()}
                  currentPageIndex={currentPageIndex}
                  setCurrentPageIndex={setCurrentPageIndex}
                />
                <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {GroupsKnowMovie &&
                    GroupsKnowMovie.length > 0 &&
                    GroupsKnowMovie[currentPageIndex].map((media, key) => {
                      return (
                        <Multi
                          key={`MovieBestRated${key}`}
                          info={media}
                          mediaMovie={true}
                          dataUser={dataUser}
                          mediasUser={mediasUser}
                          changeSeenPending={changeSeenPending}
                          setChangeSeenPending={setChangeSeenPending}
                        />
                      );
                    })}
                </div>
                <ArrayPaginator
                  data={GroupsKnowMovie}
                  totalResult={uniqueKnowMovie.length}
                  groupSize={getCardsPerPage()}
                  currentPageIndex={currentPageIndex}
                  setCurrentPageIndex={setCurrentPageIndex}
                />
              </>
            )
          ) : null}
          {/* TV SHOWS & SHOWS */}
          {mediaType === "tv" ? (
            !loading ? (
              <Spinner result />
            ) : (
              <>
                <ArrayPaginator
                  data={GroupsKnowTv}
                  totalResult={uniqueKnowTv.length}
                  groupSize={getCardsPerPage()}
                  currentPageIndex={currentPageIndex}
                  setCurrentPageIndex={setCurrentPageIndex}
                />
                <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {uniqueKnowTv &&
                    GroupsKnowTv.length > 0 &&
                    GroupsKnowTv[currentPageIndex].map((media, key) => {
                      return (
                        <Multi
                          key={`TvBestRated${key}`}
                          info={media}
                          mediaTv={true}
                          dataUser={dataUser}
                          mediasUser={mediasUser}
                          changeSeenPending={changeSeenPending}
                          setChangeSeenPending={setChangeSeenPending}
                        />
                      );
                    })}
                </div>
                <ArrayPaginator
                  data={GroupsKnowTv}
                  totalResult={uniqueKnowTv.length}
                  groupSize={getCardsPerPage()}
                  currentPageIndex={currentPageIndex}
                  setCurrentPageIndex={setCurrentPageIndex}
                />
              </>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default ListMedias;
