import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DetailsMedia from "./Movies/DetailsMedia";
import Spinner from "../utils/Spinner/Spinner";
import { getCredits, getMediaDetails } from "../../services/TMDB/services-tmdb";
import { useTranslation } from "react-i18next";

const Media = () => {
  const { id, media_type } = useParams();
  const [t] = useTranslation("translation");
  const [castList, setCastList] = useState([]);
  const [crewsList, setCrewsList] = useState([]);
  const [dataDetails, setDataDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id && media_type) {
      getCredits(media_type, id, "credits", t("es-ES")).then((data) => {
        setCastList(data.cast);
        setCrewsList(data.crew);
      });
      getMediaDetails(media_type, id, t("es-ES")).then((data) => {
        setDataDetails(data);
        setLoading(false);
      });
    }
  }, [t, id, media_type]);

  return (
    <div
      className="rounded-3xl bg-contain bg-center bg-fixed w-auto h-auto mt-6"
      style={{
        backgroundImage:
          dataDetails.backdrop_path !== undefined
            ? dataDetails.backdrop_path !== null
              ? `url(https://image.tmdb.org/t/p/w500${dataDetails.backdrop_path})`
              : null
            : null,
      }}
    >
      <div className="text-gray-200 w-auto bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
        {!loading ? (
          <DetailsMedia
            cast={castList}
            crews={crewsList}
            info={dataDetails}
            mediaType={media_type}
          />
        ) : (
          <Spinner result />
        )}
      </div>
    </div>
  );
};

export default Media;
