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
import { movie, movie_purple, tv, tv_purple } from "../../assets/image";
import Spinner from "../../utils/Spinner/Spinner";
import { useAuthContext } from "../../context/auth-context";
import { getAllMedia, getUser } from "../../../services/DB/services-db";
import SplitArrayGroups from "../../utils/SplitArrayGroups";
import ArrayPaginator from "../../utils/ArrayPaginator";

const BestRated = () => {
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
  //-MOVIES BEST RATED
  const knowByRated =
    uniqCastKnow &&
    Array.from(new Set(unionKnow.map((a) => a.id))).map((id) => {
      return unionKnow.find((a) => a.id === id);
    });
  const knowFilterRated =
    knowByRated && knowByRated.filter((nota) => nota.vote_average < 10);

  // - SPEARED BY TYPE AND SORT BY AVERAGE (movie or tv)
  const knowMovie =
    knowFilterRated &&
    knowFilterRated.filter((film) => film.media_type === "movie");
  knowMovie &&
    knowMovie.sort(function (a, b) {
      if (a.vote_average < b.vote_average) {
        return 1;
      }
      if (a.vote_average > b.vote_average) {
        return -1;
      }

      // a must be equal to b
      return 0;
    });
  const knowTv =
    knowFilterRated &&
    knowFilterRated.filter((tvShow) => tvShow.media_type === "tv");
  knowTv &&
    knowTv.sort(function (a, b) {
      if (a.vote_average < b.vote_average) {
        return 1;
      }
      if (a.vote_average > b.vote_average) {
        return -1;
      }

      // a must be equal to b
      return 0;
    });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const loading =
    (knowMovie && Object.keys(knowMovie).length > 0) ||
    (knowTv && Object.keys(knowTv).length > 0);

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
    knowMovie &&
    knowMovie.length &&
    SplitArrayGroups(knowMovie, getCardsPerPage());
  const GroupsKnowTv =
    knowTv &&
    knowTv.length &&
    SplitArrayGroups(knowTv, getCardsPerPage());

  return (
    <div className="w-full h-full text-gray-200 bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
      {/*//- BEST RATED */}
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
          {knowMovie || knowTv ? t("BEST RATED") : null}
        </h1>
        {/* //-MULTIPLE TABS */}
        <div className="px-4 pb-4">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-400">
            <li className="me-2">
              <div
                onClick={() => {setSelectedIndex(0), setCurrentPageIndex(0)}}
                className={`cursor-pointer flex gap-2 justify-center p-4 border-b-2 ${
                  selectedIndex === 0
                    ? "text-purpleNR fill-purpleNR border-purpleNR"
                    : "border-transparent rounded-t-lg hover:border-gray-300 hover:text-gray-300"
                }`}
              >
                {selectedIndex === 0 ? (
                  <img className="w-4 h-4" src={movie_purple} />
                ) : (
                  <img className="w-4 h-4" src={movie} />
                )}
                {t("Movies")}
              </div>
            </li>
            <li className="me-2">
              <div
                onClick={() => {setSelectedIndex(1), setCurrentPageIndex(0)}}
                className={`cursor-pointer flex gap-2 justify-center p-4 border-b-2 ${
                  selectedIndex === 1
                    ? "text-purpleNR border-purpleNR"
                    : "border-transparent rounded-t-lg hover:border-gray-300 hover:text-gray-300"
                }`}
              >
                {selectedIndex === 1 ? (
                  <img className="w-4 h-4" src={tv_purple} />
                ) : (
                  <img className="w-4 h-4" src={tv} />
                )}

                {t("TV Shows")}
                {t(" & Shows")}
              </div>
            </li>
          </ul>
          {/* MOVIES */}
          {selectedIndex === 0 ? (
            !loading ? (
              <Spinner result />
            ) : (
              <>
                <ArrayPaginator
                  data={GroupsKnowMovie}
                  totalResult={knowMovie.length}
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
                          addButton={true}
                          media_movie={true}
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
                  totalResult={knowMovie.length}
                  groupSize={getCardsPerPage()}
                  currentPageIndex={currentPageIndex}
                  setCurrentPageIndex={setCurrentPageIndex}
                />
              </>
            )
          ) : null}
          {/* TV SHOWS & SHOWS */}
          {selectedIndex === 1 ? (
              <>
                <ArrayPaginator
                  data={GroupsKnowTv}
                  totalResult={knowTv.length}
                  groupSize={getCardsPerPage()}
                  currentPageIndex={currentPageIndex}
                  setCurrentPageIndex={setCurrentPageIndex}
                />
                <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {knowTv &&
                    GroupsKnowTv.length > 0 &&
                    GroupsKnowTv[currentPageIndex].map((media, key) => {
                      return (
                        <Multi
                          key={`TvBestRated${key}`}
                          info={media}
                      addButton={true}
                      media_tv={true}
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
                  totalResult={knowTv.length}
                  groupSize={getCardsPerPage()}
                  currentPageIndex={currentPageIndex}
                  setCurrentPageIndex={setCurrentPageIndex}
                />
              </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default BestRated;
