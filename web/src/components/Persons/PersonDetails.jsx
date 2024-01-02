import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BsFillCaretRightFill } from "react-icons/bs";
import { FaFacebookSquare, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaSquareXTwitter, FaTiktok } from "react-icons/fa6";
import { SiWikidata } from "react-icons/si";
import Carousel from "../../utils/Carousel/Carousel";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import { NoImage, people } from "../../assets/image";
import { getExternalId } from "../../../services/TMDB/services-tmdb";
import { IoIosArrowBack } from "react-icons/io";
import { useAuthContext } from "../../context/auth-context";
import { getImdbPerson } from "../../../services/IMDB/services-imdb";
import PageTitle from "../PageTitle";
import ShowPlaylistMenu from "../../utils/Playlists/showPlaylistMenu";

export const PersonDetails = ({
  info,
  infoEN,
  films,
  media,
  idMedia,
  titleMedia,
}) => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const userExist = !!user;
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
    // eslint-disable-next-line no-unused-vars
    const imdbAPI = async () => {
      const result = await getImdbPerson(imdb_id, t("es-ES"));
      if (result) {
        setImdbPerson(result);
      }
    };
    if (imdb_id) {
      // imdbAPI();
    }
  }, [imdb_id, t]);
  // - EXTERNAL ID (SOCIAL)
  const [externalId, setExternalId] = useState([]);
  useEffect(() => {
    const externalIdAPI = async () => {
      const result = await getExternalId("person", id, t("es-ES"));
      if (result) {
        setExternalId(result);
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
  const tiktokId =
    externalId && externalId.tiktok_id !== "" && externalId.tiktok_id
      ? externalId.tiktok_id
      : null;
  const wikipediaId =
    externalId && externalId.wikidata_id !== "" && externalId.wikidata_id
      ? externalId.wikidata_id
      : null;
  const youtubeId =
    externalId && externalId.youtube_id !== "" && externalId.youtube_id
      ? externalId.youtube_id
      : null;
  const imdbClean =
    imdbPerson.id === undefined ? null : imdbPerson.id ? imdbPerson : null;

  const urlPerson = profile_path
    ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${profile_path}`
    : null;
  const photo = profile_path ? urlPerson : NoImage;
  const height = imdbClean ? imdbClean.height : null;
  const biographyInfo =
    biography !== "" ? biography : infoEN ? infoEN.biography : null;
  const birthdayDate = birthday
    ? new DateAndTimeConvert(
        birthday,
        t,
        false,
        false,
        false,
        true
      ).DateTimeConvert()
    : null;
  const deathdayDate = deathday
    ? new DateAndTimeConvert(
        deathday,
        t,
        false,
        false,
        false,
        true
      ).DateTimeConvert()
    : null;
  const age = !deathdayDate
    ? birthday
      ? new Date().getFullYear() - new Date(birthday).getFullYear()
      : null
    : new Date(deathday).getFullYear() - new Date(birthday).getFullYear();
  const department = imdbClean ? imdbClean.role : null;
  // const knownFor = imdbClean ? imdbClean.knownFor : null;
  const departmentKnown = known_for_department;
  const placeBirth = place_of_birth;

  //-FILTERS REPEATS
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

  //-SPARE FOR MEDIA
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
  //-MOVIE MORE VOTE
  const knownForVote =
    uniqueCastKnown &&
    Array.from(new Set(uniqueKnown.map((a) => a.id))).map((id) => {
      return uniqueKnown.find((a) => a.id === id);
    });
  const knowFilterVote =
    knownForVote && knownForVote.filter((nota) => nota.vote_average < 9);

  knowFilterVote &&
    knowFilterVote.sort(function (a, b) {
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
  const items = knowFilterVote && knowFilterVote.slice(0, size);

  // - PLAYLIST
  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
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
      <PageTitle title={`${name}`} />
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
            {urlPerson ? (
              <img
                className="rounded-xl object-cover h-96"
                src={photo}
                alt={name}
              />
            ) : (
              <div className="relative flex justify-center items-center">
                <img
                  className="absolute h-36 opacity-10"
                  src={people}
                  alt={t("Icon people")}
                />
                <img
                  className="rounded-xl object-cover h-96"
                  src={photo}
                  alt={t("No photo")}
                />
              </div>
            )}
          </div>
          {/* //-ADD PLAYLIST */}
          {userExist ? (
            <ShowPlaylistMenu
              userId={user.id}
              id={Number(id)}
              type={"person"}
              runTime={0}
            />
          ) : null}
        </div>
        <div className="md:col-span-2">
          <div className="mt-6 px-2">
            {/* //-NAME Y DEPARTMENT */}
            <div className="flex justify-between items-stretch mb-2">
              <h1 className="font-semibold text-4xl">{name}</h1>
              {departmentKnown ? (
                <div>
                  <div className="text-xs">{departmentKnown}</div>
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
              <FaSquareXTwitter
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
            {tiktokId ? (
              <FaTiktok
                className="text-3xl ml-1 inline-block hover:text-purpleNR cursor-pointer"
                onClick={() => (
                  window.open(`https://www.tiktok.com/@${tiktokId}`), "_blank"
                )}
              />
            ) : null}
            {youtubeId ? (
              <FaYoutube
                className="text-3xl ml-1 inline-block hover:text-purpleNR cursor-pointer"
                onClick={() => (
                  window.open(`https://www.youtube.com/@${youtubeId}`), "_blank"
                )}
              />
            ) : null}
            {wikipediaId ? (
              <SiWikidata
                className="text-3xl ml-1 inline-block hover:text-purpleNR cursor-pointer"
                onClick={() => (
                  window.open(`https://www.wikidata.org/wiki/${wikipediaId}`),
                  "_blank"
                )}
              />
            ) : null}
            {department ? (
              <div className="flex items-stretch">
                <div className="text-base">
                  <div className="text-gray-400">
                    <div className="text-gray-200 inline-block pl-1">
                      {department}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {/* //-BIOGRAPHY, BIRTHDAY, DEATHDAY AND PLACE BIRTH */}
            {biographyInfo || age || placeBirth || height ? (
              <div className="row-span-2 mt-8">
                {biographyInfo ? (
                  <div className="pb-9">{biographyInfo}</div>
                ) : null}
                {age || placeBirth || height ? (
                  <div className="grid grid-rows-3 grid-flow-col gap-4 justify-between text-sm">
                    {age ? (
                      <div>
                        <div className="inline-block text-gray-400">
                          {deathdayDate !== null
                            ? `${t("DATES")}: `
                            : `${t("DATE OF BIRTH")}: `}
                        </div>
                        <div className="inline-block pl-2">
                          {birthdayDate}
                          {deathdayDate && " - "}
                          {deathdayDate ? deathdayDate : null}
                          {` (${age} ${t("years")})`}
                        </div>
                      </div>
                    ) : null}
                    {placeBirth ? (
                      <div>
                        <div className="inline-block text-gray-400 uppercase">
                          {t("Place of Birth")}:
                        </div>
                        <p className="inline-block pl-2">{placeBirth}</p>
                      </div>
                    ) : null}
                    {height ? (
                      <div>
                        <div className="inline-block text-gray-400">
                          {height ? `${t("Height")}:` : null}
                        </div>
                        <p className="inline-block pl-2">{height}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="text-gray-200">
        {/*//- BEST RATED */}
        <>
          {items && items.length > 0 ? (
            <Link to={`/person/${id}/bestRated`} className="flex justify-end">
              <button className="flex items-center text-base text-[#b1a9fa] text-right hover:text-gray-200 mx-4 transition duration-300">
                {t("Complete list")}
                <BsFillCaretRightFill className="align-middle" size={16} />
              </button>
            </Link>
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
          <div className="bg-local backdrop-blur-3xl bg-[#2c3349]/80 pb-1 pt-4 mt-4 rounded-3xl">
            <Link to={`/person/${id}/listMovies`} className="flex justify-end">
              <button className="flex items-center text-base text-[#b1a9fa] text-right hover:text-gray-200 mx-4 transition duration-300">
                {t("Complete list")}
                <BsFillCaretRightFill
                  className="inline-block align-middle"
                  size={16}
                />
              </button>
            </Link>
            <>
              {knownMovie && (
                <Carousel
                  title={t("MOVIES")}
                  info={JSON.parse(JSON.stringify(knownMovie.slice(0, 20)))}
                />
              )}
            </>
          </div>
        ) : null}
        {/*//- SERIES */}
        <>
          {knownTV && knownTV.length === 0 ? null : (
            <div className="pb-1 mt-4 rounded-3xl">
              <Link
                to={`/person/${id}/listTvShows`}
                className="flex justify-end"
              >
                {items && items.length > 0 ? (
                  <button className="flex items-center text-base text-[#b1a9fa] text-right hover:text-gray-200 mx-4 transition duration-300">
                    {t("Complete list")}
                    <BsFillCaretRightFill
                      className="inline-block align-middle"
                      size={16}
                    />
                  </button>
                ) : null}
              </Link>
              <>
                {knownTV && (
                  <Carousel
                    title={t("TV SHOWS")}
                    info={JSON.parse(JSON.stringify(knownTV.slice(0, 20)))}
                  />
                )}
              </>
            </div>
          )}
        </>
        {/* //- OTHERS */}
        <>
          {knownMovieNoDate && knownMovieNoDate.length === 0 ? null : (
            <div className="bg-local backdrop-blur-3xl bg-[#2c3349]/80 pb-1 pt-4 mt-4 rounded-3xl">
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
