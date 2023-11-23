import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { BsFillCaretRightFill } from "react-icons/bs";
import { FaFacebookSquare, FaInstagram, FaTwitterSquare } from "react-icons/fa";
import Carousel from "../../utils/Carousel/Carousel";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import { NoImage } from "../../assets/image";
import { getExternalId } from "../../../services/TMDB/services-tmdb";
import { IoIosArrowBack, IoIosRemove, IoMdAdd } from "react-icons/io";
import { getUser, postPlaylistMedia } from "../../../services/DB/services-db";
import { useAuthContext } from "../../context/auth-context";
import { getImdbPerson } from "../../../services/IMDB/services-imdb";

export const PersonDetails = ({
  info,
  infoEN,
  films,
  media,
  idMedia,
  titleMedia,
}) => {
  const [t] = useTranslation("translation");
  const navegate = useNavigate();
  const { user } = useAuthContext();
  const userExist = !!user;
  const [dataUser, setDataUser] = useState({});
  useEffect(() => {
    const Data = async () => {
      getUser()
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    };
    if (userExist) {
      Data();
    }
  }, [userExist]);
  const {
    id,
    name,
    known_for_department,
    profile_path,
    birthday,
    biography,
    deathday,
    place_of_birth,
    imdb_id,
  } = info;
  //-SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  const [imdbPerson, setImdbPerson] = useState([]);
  useEffect(() => {
    const imdbAPI = async () => {
      const result = await getImdbPerson(imdb_id, t("es-ES"));
      if (result) {
        setImdbPerson(result);
      }
    };
    if (imdb_id) {
      imdbAPI();
    }
  }, [imdb_id, t]);
  // - EXTERNAL ID (SOCIAL)
  const [externalId, setexternalId] = useState([]);
  useEffect(() => {
    const externalIdAPI = async () => {
      const result = await getExternalId("person", id, t("es-ES"));
      if (result) {
        setexternalId(result);
      }
    };
    if (id) {
      externalIdAPI();
    }
  }, [id, t]);

  const facebookId =
    externalId && externalId.facebook_id !== "" && externalId.facebook_id
      ? externalId.facebook_id
      : null;
  const instagramId =
    externalId && externalId.instagram_id !== "" && externalId.instagram_id
      ? externalId.instagram_id
      : null;
  const twitterId =
    externalId && externalId.twitter_id !== "" && externalId.twitter_id
      ? externalId.twitter_id
      : null;

  const imdbclean =
    imdbPerson.id === undefined ? null : imdbPerson.id ? imdbPerson : null;

  const urlPerson = profile_path
    ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${profile_path}`
    : null;

  const photo = profile_path ? urlPerson : NoImage;
  const height = imdbclean ? imdbclean.height : null;
  const biographyInfo =
    biography !== "" ? biography : infoEN ? infoEN.biography : null;
  const birthdayDate = new DateAndTimeConvert(birthday, t).DateTimeConvert();
  const deathdayDate = deathday ? null : deathday;
  const age =
    deathdayDate === null
      ? new Date().getFullYear() - new Date(birthday).getFullYear()
      : new Date(deathdayDate).getFullYear() - new Date(birthday).getFullYear();
  const departament = imdbclean ? imdbclean.role : null;
  // const knownFor = imdbclean ? imdbclean.knownFor : null;
  const departamentKnown = known_for_department;
  const placeBirth = place_of_birth;

  //-FILTERS REPETS
  const uniqueCrewKnown = id
    ? Array.from(new Set(films.crew.map((a) => a.id))).map((id) => {
        return films.crew.find((a) => a.id === id);
      })
    : null;
  const uniqueCastKnown = id
    ? Array.from(new Set(films.cast.map((a) => a.id))).map((id) => {
        return films.cast.find((a) => a.id === id);
      })
    : null;
  //-UNION FILTERS
  const uniqueKnown = uniqueCastKnown && [
    ...uniqueCrewKnown,
    ...uniqueCastKnown,
  ];
  //-ORDER FOR DATE
  const knownFor =
    uniqueKnown &&
    Array.from(new Set([...uniqueKnown].map((a) => a.id))).map((id) => {
      return [...uniqueKnown].find((a) => a.id === id);
    });

  //-SEPARE FOR MEDIA
  const knownNoDate =
    knownFor &&
    knownFor.filter(
      (movieData) =>
        movieData.release_date === "" || movieData.release_date === undefined
    );
  const knownMovieNoDate =
    knownNoDate &&
    knownNoDate.filter((movieData) => movieData.media_type === "movie");
  const knownDate =
    knownFor &&
    knownFor.filter(
      (movieData) => movieData.release_date !== "" && movieData.release_date
    );

  const knownMovie =
    knownDate &&
    knownDate.filter((movieData) => movieData.media_type === "movie");
  knownMovie &&
    knownMovie.sort(function (a, b) {
      if (
        new Date(a.release_date).getTime() < new Date(b.release_date).getTime()
      ) {
        return 1;
      }
      if (
        new Date(a.release_date).getTime() > new Date(b.release_date).getTime()
      ) {
        return -1;
      }
      return 0;
    });

  const knownNoDateT =
    knownFor && knownFor.filter((movieData) => movieData.media_type === "tv");
  const knownNoDateTv =
    knownNoDateT &&
    knownNoDateT.filter(
      (tvData) =>
        tvData.first_air_date === "" || tvData.first_air_date === undefined
    );

  const knownDateTv =
    knownFor && knownFor.filter((tvData) => tvData.media_type === "tv");
  const knownTV =
    knownDateTv &&
    knownDateTv.filter(
      (tvData) => tvData.first_air_date !== "" || tvData.release_date
    );

  knownTV &&
    knownTV.sort(function (a, b) {
      if (
        new Date(a.first_air_date).getTime() <
        new Date(b.first_air_date).getTime()
      ) {
        return 1;
      }
      if (
        new Date(a.first_air_date).getTime() >
        new Date(b.first_air_date).getTime()
      ) {
        return -1;
      }
      //must be equal to b
      return 0;
    });
  //-PELÍCULAS CON MÁS NOTA
  const knownForNota =
    uniqueCastKnown &&
    Array.from(new Set(uniqueKnown.map((a) => a.id))).map((id) => {
      return uniqueKnown.find((a) => a.id === id);
    });
  const conocidoFiltNota =
    knownForNota && knownForNota.filter((nota) => nota.vote_average < 9);

  conocidoFiltNota &&
    conocidoFiltNota.sort(function (a, b) {
      if (a.vote_average < b.vote_average) {
        return 1;
      }
      if (a.vote_average > b.vote_average) {
        return -1;
      }

      // a must be equal to b
      return 0;
    });
  const size = 20;
  const items = conocidoFiltNota && conocidoFiltNota.slice(0, size);

  // - PLAYLIST
  const [playlistsList, setPlaylistsList] = useState(false);
  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  const handleAddPlaylist = async (playlistId) => {
    try {
      await postPlaylistMedia(playlistId, {
        mediaId: `${id}`,
        media_type: "person",
        runtime: 0,
      });
    } catch (error) {
      if (error) {
        const { message } = error.response?.data || {};
        setErrorAddPlaylists(message);
      }
    }
  };

  const [isTimeout, setIsTimeout] = useState(true);
  useEffect(() => {
    let timerId;

    if (isTimeout && errorAddPlaylists) {
      timerId = window.setTimeout(() => {
        setIsTimeout(false);
        setErrorAddPlaylists(false);
      }, 3000);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId); // Clean the timer
      }
    };
  }, [isTimeout, errorAddPlaylists]);

  return (
    <div>
      {/* //.BACK TO MOVIE/TV SHOW */}
      {idMedia !== "" ? (
        <Link
          className="ml-5 pt-5 hover:text-[#6676a7]"
          to={`/${media}/${idMedia}`}
          type="submit"
        >
          <IoIosArrowBack className="inline-block mr-1" size={25} alt="Antes" />
          {titleMedia}
        </Link>
      ) : null}
      <div className="h-full w-full grid md:grid-flow-col gap-4 py-2 md:py-4 ">
        {/* //-PHOTO Y ADD PLAYLIST */}
        <div className="md:row-span-1 rounded-xl justify-center">
          <div className="flex justify-around">
            <img
              className="rounded-xl object-cover h-96"
              src={photo}
              alt={name}
            />
          </div>
          {/* //-ADD PLAYLIST */}
          {userExist ? (
            <div className="grid grid-cols-4 gap-4 text-center mt-5 justify-center justify-items-center">
              <div className="col-span-2  cursor-pointer text-left text-base font-semibold px:center text-[#7B6EF6] transition duration-300 ">
                <button
                  className={`cursor-pointer text-left font-semibold px:center ${
                    !playlistsList ? "text-[#7B6EF6]" : "text-gray-600"
                  } transition ease-in-out md:hover:scale-105 duration-300`}
                  onClick={() => setPlaylistsList(!playlistsList)}
                >
                  {!playlistsList ? (
                    <IoMdAdd
                      className="inline-block"
                      size={20}
                      alt={t("Add to one list")}
                    />
                  ) : (
                    <IoIosRemove
                      className="inline-block"
                      size={20}
                      alt={t("Add to one list")}
                    />
                  )}
                  {t("Playlists")}
                </button>
                {playlistsList ? (
                  <div className="absolute flex flex-col text-base bg-grayNR/60 rounded-md md:w-[200px] w-[150px]">
                    {errorAddPlaylists ? (
                      <div className="text-white bg-gray-50/20 px-1 font-bold">
                        {t(errorAddPlaylists)}
                      </div>
                    ) : null}
                    {user &&
                      dataUser &&
                      dataUser.playlists.map((i, index) => {
                        const roundedTopItem =
                          index === 0 ? "rounded-t-md" : null;
                        const roundedBottomItem =
                          dataUser.playlists.length === index + 1
                            ? "rounded-b-md"
                            : null;

                        return (
                          <div
                            key={i.id}
                            className={`hover:bg-gray-50 px-1 ${
                              dataUser.playlists.length === 1
                                ? "rounded-md"
                                : null
                            } ${roundedTopItem} ${roundedBottomItem} cursor-pointer transition duration-200`}
                            onClick={() => handleAddPlaylist(i.id)}
                          >
                            <div className="text-black text-left">
                              · {i.title}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <div className=" mt-6 px-2">
            {/* //-NAME Y DEPARTAMENT */}
            <div className="flex justify-between items-stretch mb-2">
              <h1 className="font-semibold text-4xl">{name}</h1>
              {departamentKnown ? (
                <div>
                  <div className="text-xs">{departamentKnown}</div>
                </div>
              ) : null}
            </div>
            {facebookId ? (
              <FaFacebookSquare
                className="text-3xl inline-block hover:text-purpleNR cursor-pointer mr-1"
                onClick={() => (
                  window.open(`https://www.facebook.com/${facebookId}`),
                  "_blank"
                )}
              />
            ) : null}
            {twitterId ? (
              <FaTwitterSquare
                className="text-3xl inline-block hover:text-purpleNR cursor-pointer mr-1"
                onClick={() => (
                  window.open(`https://twitter.com/${twitterId}`), "_blank"
                )}
              />
            ) : null}
            {instagramId ? (
              <FaInstagram
                className="text-3xl inline-block hover:text-purpleNR cursor-pointer"
                onClick={() => (
                  window.open(`https://www.instagram.com/${instagramId}`),
                  "_blank"
                )}
              />
            ) : null}
            {departament ? (
              <div className="flex items-stretch">
                <div className="text-base">
                  <div className="text-gray-400">
                    <div className="text-gray-200 inline-block pl-1">
                      {departament}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {/* //-BIOGRAFY, BIRTHDAY, DEATHDAY AND PLACE BIRTH */}
            <div className="row-span-2 mt-8">
              <div className="pb-9">{biographyInfo}</div>
              <div className="grid grid-rows-3 grid-flow-col gap-4 justify-between text-sm">
                <div>
                  <div className="inline-block text-gray-400">
                    {deathdayDate
                      ? `${t("DATES")}: `
                      : `${t("DATE OF BIRTH")}: `}
                  </div>
                  <div className="inline-block pl-2">
                    {birthdayDate}
                    {deathdayDate ? " -" : null}
                    {deathdayDate ? { deathdayDate } : null}
                    {`(${age} ${t("years")})`}
                  </div>
                </div>
                <div>
                  <div className="inline-block text-gray-400 uppercase">
                    {t("Place of Birth")}:
                  </div>
                  <p className="inline-block pl-2">{placeBirth}</p>
                </div>
                <div>
                  <div className="inline-block text-gray-400">
                    {height ? `${t("Height")}:` : null}
                  </div>
                  <p className="inline-block pl-2">{height}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-gray-200">
        {/*//- BEST RATED */}
        <>
          {items && items.length > 0 ? (
            <div className="flex justify-end">
              <button
                className="flex items-center text-base text-[#b1a9fa] text-right hover:text-gray-200 mx-4 transition duration-300"
                onClick={() => navegate(`/person/${id}/bestRated`)}
              >
                {t("Complete list")}
                <BsFillCaretRightFill className="align-middle" size={16} />
              </button>
            </div>
          ) : null}
          <>
            {items && items.length !== 0 ? (
              <Carousel
                title={t("BEST RATED")}
                info={JSON.parse(JSON.stringify(items))}
              />
            ) : null}
          </>
        </>
        {/*//- MOVIES */}
        {items && items.length > 0 ? (
          <div className="bg-local backdrop-blur-3xl bg-[#2c3349]/80 pb-1 pt-4 rounded-3xl">
            <div className="flex justify-end">
              <button
                className="flex items-center text-base text-[#b1a9fa] text-right hover:text-gray-200 mx-4 transition duration-300"
                onClick={() => navegate(`/person/${id}/listMovies`)}
              >
                {t("Complete list")}
                <BsFillCaretRightFill
                  className="inline-block align-middle"
                  size={16}
                />
              </button>
            </div>
            <>
              {knownMovie && (
                <Carousel
                  title={t("MOVIES")}
                  info={JSON.parse(JSON.stringify(knownMovie))}
                />
              )}
            </>
          </div>
        ) : null}
        {/*//- SERIES */}
        <>
          {knownTV && knownTV.length === 0 ? null : (
            <div className="pb-1 mt-4 rounded-3xl">
              <div className="flex justify-end">
                {items && items.length > 0 ? (
                  <button
                    className="flex items-center text-base text-[#b1a9fa] text-right hover:text-gray-200 mx-4 transition duration-300"
                    onClick={() => navegate(`/person/${id}/listTvShow`)}
                  >
                    {t("Complete list")}
                    <BsFillCaretRightFill
                      className="inline-block align-middle"
                      size={16}
                    />
                  </button>
                ) : null}
              </div>
              <>
                {knownTV && (
                  <Carousel
                    title={t("TV SHOWS")}
                    info={JSON.parse(JSON.stringify(knownTV))}
                  />
                )}
              </>
            </div>
          )}
        </>
        {/* //- OTRAS */}
        <>
          {knownMovieNoDate && knownMovieNoDate.length === 0 ? null : (
            <div className="bg-local backdrop-blur-3xl bg-[#2c3349]/80 pb-1 pt-4 rounded-3xl">
              <div>
                {knownMovieNoDate && (
                  <Carousel
                    title={t("OTHER MOVIES")}
                    info={JSON.parse(JSON.stringify(knownMovieNoDate))}
                  />
                )}
              </div>
            </div>
          )}
        </>
        <>
          {knownNoDateTv && knownNoDateTv.length === 0 ? null : (
            <div className="pb-1 mt-4 rounded-3xl">
              <div>
                {knownNoDateTv && (
                  <Carousel
                    title={t("OTHER TV SHOWS")}
                    info={JSON.parse(JSON.stringify(knownNoDateTv))}
                  />
                )}
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default PersonDetails;

PersonDetails.defaultProps = {
  info: {},
  infoEN: {},
  films: {},
  media: "",
  idMedia: "",
  titleMedia: "",
};

PersonDetails.propTypes = {
  info: PropTypes.object,
  infoEN: PropTypes.object,
  films: PropTypes.object,
  media: PropTypes.string,
  idMedia: PropTypes.string,
  titleMedia: PropTypes.string,
};
