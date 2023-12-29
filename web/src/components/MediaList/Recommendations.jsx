import PropTypes from "prop-types";
import Carousel from "../../utils/Carousel/Carousel";
import { getRecommendations } from "../../../services/TMDB/services-tmdb";
import { useEffect, useState } from "react";

const Recommendations = ({ title, id, media, lang }) => {
  const [recommendationsList, setRecommendationsList] = useState({});
  const [isChange, isSetChange] = useState(false);
  useEffect(() => {
    getRecommendations(media, id, lang).then((data) => {
      setRecommendationsList(data);
    });
  }, [lang, id, media]);
  useEffect(() => {
    if (!isChange) {
      isSetChange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      {recommendationsList.results &&
      recommendationsList.results.length !== 0 ? (
        <div className="text-gray-200 text-lg pt-4 px-4 md:px-6">
          <Carousel
            title={
              recommendationsList && recommendationsList.length !== 0
                ? title
                : null
            }
            info={recommendationsList.results}
            media={media}
            isSetChange={isSetChange}
            isChange={isChange}
          />
        </div>
      ) : null}
    </>
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
