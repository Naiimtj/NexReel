import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BiCaretDown, BiCaretUp } from "react-icons/bi";
import { IoIosArrowBack } from "react-icons/io";
import {
  getCredits,
  getMediaDetails,
} from "../../../services/TMDB/services-tmdb";
import { useTranslation } from "react-i18next";
import { NoImage } from "../../assets/image";

function CompletCast() {
  const [t] = useTranslation("translation");
  const navegate = useNavigate();
  const { id, media_type } = useParams();
  const [repartoList, setRepartoList] = useState([]);
  const [crewsList, setCrewsList] = useState([]);
  // -SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  // -DETAILS MOVIE/TVSHOW
  const [detailsMedia, setDetailsMedia] = useState([]);
  useEffect(() => {
    const dataMedia = async () => {
      const result = await getMediaDetails(media_type, id, t("es-ES"));
      if (Object.keys(result).length > 0) {
        setDetailsMedia(result);
      }
    };
    if (id && media_type) {
      dataMedia();
    }
  }, [id, media_type, t]);
  // - CAST & CREW
  useEffect(() => {
    const dataCast = async () => {
      const textCredits =
        media_type === "movie" ? "credits" : "aggregate_credits";
      const result = await getCredits(media_type, id, textCredits, t("es-ES"));
      if (Object.keys(result).length > 0) {
        setRepartoList(result.cast);
        setCrewsList(result.crew);
      }
    };
    if (id && media_type) {
      dataCast();
    }
  }, [id, media_type, t]);

  const directores = crewsList.filter(
    (filequ) => filequ.department === "Directing"
  );
  const scriptwriters = crewsList.filter(
    (filequ) => filequ.department === "Writing"
  );
  const arte = crewsList.filter((filequ) => filequ.department === "Art");
  const costumMakeUp = crewsList.filter(
    (filequ) => filequ.department === "Costume & Make-Up"
  );
  const produccion = crewsList.filter(
    (filequ) => filequ.department === "Production"
  );
  const crew = crewsList.filter((filequ) => filequ.department === "Crew");
  const sound = crewsList.filter((filequ) => filequ.department === "Sound");
  const lighting = crewsList.filter(
    (filequ) => filequ.department === "Lighting"
  );
  const editing = crewsList.filter((filequ) => filequ.department === "Editing");
  const camera = crewsList.filter((filequ) => filequ.department === "Camera");
  const actors = crewsList.filter((filequ) => filequ.department === "Actors");
  const visualEffect = crewsList.filter(
    (filequ) => filequ.department === "Visual Effects"
  );
  // -ALL TEAM
  // .CAST
  const [modalCast, setModalCast] = useState(false);
  const handleCast = () => {
    setModalCast(!modalCast);
  };
  // .DIRECTING
  const [modalDirecting, setModalDirecting] = useState(false);
  const handleDirecting = () => {
    setModalDirecting(!modalDirecting);
  };
  // .WRITING
  const [modalScriptwriters, setModalScriptwriters] = useState(false);
  const handleScriptwriters = () => {
    setModalScriptwriters(!modalScriptwriters);
  };
  // .PRODUCTION
  const [modalProduction, setModalProduction] = useState(false);
  const handleProduction = () => {
    setModalProduction(!modalProduction);
  };
  // .ARTE
  const [modalArte, setModalArte] = useState(false);
  const handleArte = () => {
    setModalArte(!modalArte);
  };
  // .CREW
  const [modalCrew, setModalCrew] = useState(false);
  const handleCrew = () => {
    setModalCrew(!modalCrew);
  };
  // .SOUND
  const [modalSound, setModalSound] = useState(false);
  const handleSound = () => {
    setModalSound(!modalSound);
  };
  // .LIGHTING
  const [modalLighting, setModalLighting] = useState(false);
  const handleLighting = () => {
    setModalLighting(!modalLighting);
  };
  // .EDITING
  const [modalEditing, setModalEditing] = useState(false);
  const handleEditing = () => {
    setModalEditing(!modalEditing);
  };
  // .COSTUME & MAKE-UP
  const [modalCostume, setModalCostume] = useState(false);
  const handleCostume = () => {
    setModalCostume(!modalCostume);
  };
  // .CAMERA
  const [modalCamera, setModalCamera] = useState(false);
  const handleCamera = () => {
    setModalCamera(!modalCamera);
  };
  // .VISUAL EFFECTS
  const [modalVisual, setModalVisual] = useState(false);
  const handleVisual = () => {
    setModalVisual(!modalVisual);
  };
  // .ACTORS
  const [modalActors, setModalActors] = useState(false);
  const handleActors = () => {
    setModalActors(!modalActors);
  };

  const dateMovie =
    media_type === "movie" && detailsMedia.release_date === ""
      ? null
      : new Date(detailsMedia.release_date).getFullYear();

  const dateTV =
    media_type === "tv" && detailsMedia.first_air_date === ""
      ? null
      : new Date(detailsMedia.first_air_date).getFullYear();

  const dateMedia = media_type === "movie" ? dateMovie : dateTV;

  function cardCredits(modal, handle, listData, title) {
    return (
      <>
        {modal ? (
          <>
            <button
              className="flex items-center pt-2 cursor-pointer text-left transition ease-in-out text-gray-200 md:hover:text-purpleNR duration-100"
              onClick={handle}
            >
              <h1 className="text-xl mb-4">
                {listData.length !== 0 ? title : null}
              </h1>
              <BiCaretUp className="ml-2" size={18} />
            </button>
            <div className="text-gray-200 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {listData &&
                listData.map((team, index) => (
                  <div
                    className="flex-row pb-4 grid grid-cols-3 gap-4 items-center cursor-pointer transition ease-in-out md:hover:scale-105 duration-100"
                    onClick={() =>
                      navegate(`/${media_type}/${id}/person/${team.id}`)
                    }
                    role="button"
                    tabIndex={index}
                    key={Number(team.id + index)}
                  >
                    <>
                      <img
                        className="static rounded-lg object-cover h-24 w-24 "
                        src={
                          team.profile_path !== null
                            ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${team.profile_path}`
                            : NoImage
                        }
                        alt={team.name}
                      />
                    </>
                    <div className="col-span-2 text-left ">
                      <h2 className="font-semibold text-base">{team.name}</h2>
                      <p className="text-sm text-gray-400">
                        {media_type === "movie"
                          ? team.job
                          : team.jobs && team.jobs[0].job}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : listData.length !== 0 ? (
          <button
            className="flex items-center pt-2 cursor-pointer text-left transition ease-in-out text-gray-200 md:hover:text-purpleNR duration-100"
            onClick={handle}
          >
            <h1 className="text-xl">{listData.length !== 0 ? title : null}</h1>
            <BiCaretDown className="ml-2" size={18} />
          </button>
        ) : null}
      </>
    );
  }

  return (
    <div className="w-full h-full pl-8 pb-5 mt-6 text-gray-200 bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
      {/* // .BACK MEDIA */}
      <button
        className="flex items-center ml-5 mb-4 pt-5 hover:text-[#6676a7]"
        onClick={() => navegate(`/${media_type}/${id}`)}
      >
        <IoIosArrowBack
          className="mr-1"
          size={25}
          alt="Before"
          onClick={() => navegate(`/${media_type}/${id}`)}
        />
        {!detailsMedia.title ? detailsMedia.name : detailsMedia.title}
        {` (${dateMedia})`}
      </button>
      {/* // - CAST COMPLETE  */}
      {modalCast ? (
        <>
          <button
            className="flex items-center pt-2 cursor-pointer text-left transition ease-in-out text-gray-200 md:hover:text-purpleNR duration-100"
            onClick={handleCast}
          >
            <h1 className="text-xl mb-4">
              {repartoList.length !== 0 ? t("CAST COMPLETE") : null}
            </h1>
            <BiCaretUp className="ml-2" size={18} />
          </button>
          <div className="text-gray-200 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 ">
            {/* // .CAST */}
            {repartoList.map((rep, index) => {
              const urlPerson =
                rep.profile_path &&
                `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${rep.profile_path}`;
              const processInfo = {};
              switch (media_type) {
                case "movie":
                  processInfo.foto =
                    rep.profile_path !== null ? urlPerson : NoImage;
                  processInfo.nombre = rep.name;
                  processInfo.personaje = rep.character;
                  processInfo.trabajo = rep.known_for_department;
                  processInfo.idPerson = rep.id;
                  break;
                case "tv":
                  processInfo.foto =
                    rep.profile_path !== null ? urlPerson : NoImage;
                  processInfo.nombre = rep.name;
                  processInfo.personaje =
                    rep.roles && rep.roles.length > 0
                      ? rep.roles[0].character
                      : null;
                  processInfo.trabajo = rep.known_for_department;
                  processInfo.idPerson = rep.id;
                  break;

                default:
                  break;
              }

              return (
                <div
                  className="flex-row pb-4 grid grid-cols-3 gap-4 items-center cursor-pointer transition ease-in-out md:hover:scale-105 duration-100"
                  onClick={() =>
                    navegate(
                      `/${media_type}/${id}/person/${processInfo.idPerson}`
                    )
                  }
                  role="button"
                  tabIndex={index}
                  key={Number(processInfo.idPerson / index + 2)}
                >
                  <div>
                    <img
                      className="static rounded-lg object-cover h-24 w-24"
                      src={processInfo.foto}
                      alt={processInfo.nombre}
                    />
                  </div>
                  <div
                    className="col-span-2 text-left"
                    onClick={() =>
                      navegate(
                        `/${media_type}/${id}/person/${processInfo.idPerson}`
                      )
                    }
                    role="button"
                    tabIndex={index}
                  >
                    <h2 className="font-semibold text-base">
                      {processInfo.nombre}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {processInfo.personaje}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : repartoList.length !== 0 ? (
        <>
          <button
            className="flex items-center pt-2 cursor-pointer text-left transition ease-in-out text-gray-200 md:hover:text-purpleNR duration-100"
            onClick={handleCast}
          >
            <h1 className="text-xl">
              {repartoList.length !== 0 ? t("CAST COMPLETE") : null}
            </h1>
            <BiCaretDown className="ml-2" size={18} />
          </button>
        </>
      ) : null}

      <div className="text-gray-200 ">
        {/* // ! TEAM */}
        {/* // - DEPARTAMENTS  */}
        <div className="text-gray-200 pr-4">
          {/* // .DIRECTING */}
          <div className="mb-2">
            {cardCredits(
              modalDirecting,
              handleDirecting,
              directores,
              t("DIRECTING")
            )}
          </div>
          {/* // .WRITING */}
          <div className="mb-2">
            {cardCredits(
              modalScriptwriters,
              handleScriptwriters,
              scriptwriters,
              t("SCRIPTWRITERS")
            )}
          </div>
          {/* // .PRODUCTION */}
          <div className="mb-2">
            {cardCredits(
              modalProduction,
              handleProduction,
              produccion,
              t("PRODUCTION")
            )}
          </div>
          {/* // .ART */}
          <div className="mb-2">
            {cardCredits(modalArte, handleArte, arte, t("ART"))}
          </div>
          {/* // .CREW */}
          <div className="mb-2">
            {cardCredits(modalCrew, handleCrew, crew, t("CREW"))}
          </div>
          {/* // .SOUND */}
          <div className="mb-2">
            {cardCredits(modalSound, handleSound, sound, t("SOUND"))}
          </div>
          {/* // .LIGHTING */}
          <div className="mb-2">
            {cardCredits(
              modalLighting,
              handleLighting,
              lighting,
              t("LIGHTING")
            )}
          </div>
          {/* // .EDITING */}
          <div className="mb-2">
            {cardCredits(modalEditing, handleEditing, editing, t("EDITING"))}
          </div>
          {/* // .COSTUME & MAKE-UP */}
          <div className="mb-2">
            {cardCredits(
              modalCostume,
              handleCostume,
              costumMakeUp,
              t("COSTUME & MAKE-UP")
            )}
          </div>
          {/* // .CAMERA */}
          <div className="mb-2">
            {cardCredits(modalCamera, handleCamera, camera, t("CAMERA"))}
          </div>
          {/* // .VISUAL EFFECTS */}
          <div className="mb-2">
            {cardCredits(
              modalVisual,
              handleVisual,
              visualEffect,
              t("VISUAL EFFECTS")
            )}
          </div>
          {/* // .ACTORS */}
          <div className="mb-2">
            {cardCredits(modalActors, handleActors, actors, t("ACTORS"))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CompletCast;
