import PropTypes from "prop-types";
import Carousel from "../../utils/Carousel/Carousel";
import { getRecommendations } from "../../../services/TMDB/services-tmdb";
import { useEffect, useState } from "react";

const Recommendations = ({ title, id, media, lang }) => {
  const [recomendadosList, setRecomendadosList] = useState({});
  useEffect(() => {
    if ((lang, media)) {
      getRecommendations(media, id, lang).then((data) => {
        setRecomendadosList(data);
      });
    }
  }, [lang, id, media]);
  return (
    <div className="text-gray-200">
      <div className="text-gray-200 px-4 md:px-6">
        {recomendadosList.results && recomendadosList.results.length !== 0 ? (
          <Carousel
            title={
              recomendadosList && recomendadosList.length !== 0 ? title : null
            }
            info={recomendadosList.results}
            media={media}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Recommendations;

Recommendations.defaultProps = {
  id: 0,
  title: "",
  media: "",
  lang: "es-ES",
};

Recommendations.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  media: PropTypes.string,
  lang: PropTypes.string,
};
