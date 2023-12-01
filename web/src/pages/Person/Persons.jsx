import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  getMediaDetails,
  getMediaDetailsEN,
  getPersonDetails,
} from "../../../services/TMDB/services-tmdb";
import PersonDetails from "../../components/Persons/PersonDetails";
import Spinner from "../../utils/Spinner/Spinner";

const Persons = () => {
  const [t] = useTranslation("translation");
  const { media_type, id, idMedia } = useParams();
  const [persona, setPersona] = useState({});
  const [personaEN, setPersonaEN] = useState({});
  const [filmsPerson, setFilmsPerson] = useState({});
  // -DETAILS MOVIE/TV SHOW
  const [detailsMedia, setDetailsMedia] = useState([]);
  useEffect(() => {
    const dataMedia = async () => {
      const result = await getMediaDetails(media_type, idMedia, t("es-ES"));
      if (Object.keys(result).length > 0) {
        setDetailsMedia(result);
      }
    };
    if (idMedia && media_type) {
      dataMedia();
    }
  }, [idMedia, media_type, t]);
  useEffect(() => {
    if (id) {
      getMediaDetails("person", id, t("es-ES")).then((data) => {
        setPersona(data);
      });
      getMediaDetailsEN("person", id).then((data) => {
        setPersonaEN(data);
      });
      getPersonDetails("person", id, t("es-ES")).then((data) => {
        setFilmsPerson(data);
      });
    }
  }, [t, id]);
  const loading =
    Object.keys(filmsPerson).length > 0 &&
    (Object.keys(persona).length > 0 || Object.keys(personaEN).length > 0);

  return (
    <>
      {!loading ? (
        <Spinner result />
      ) : (
        <div className="rounded-3xl bg-contain bg-center bg-fixed w-auto h-auto mt-6">
          <div className="text-gray-200 w-auto bg-local object-cover backdrop-blur-md bg-transparent/30 rounded-3xl px-4 pb-4">
            <PersonDetails
              info={persona}
              infoEN={personaEN}
              films={filmsPerson}
              media={media_type}
              idMedia={idMedia}
              titleMedia={
                detailsMedia.title === undefined
                  ? detailsMedia.name
                  : detailsMedia.title
              }
            />
          </div>
        </div>
      )}
    </>
  );
};
export default Persons;
