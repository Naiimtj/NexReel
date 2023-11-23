import PropTypes from "prop-types";
import Carousel from "../../utils/Carousel/Carousel";
import { getSimilar } from "../../../services/TMDB/services-tmdb";
import { useEffect, useState } from "react";

const Similar = ({ title, id, media, lang }) => {
  const [similarList, setSimilarList] = useState([]);
  useEffect(() => {
    if ((lang, media)) {
      getSimilar(media, id, lang).then((data) => {
        setSimilarList(data);
      });
    }
  }, [lang, id, media]);
  return (
    <div className="text-gray-200">
      <div className="text-gray-200 px-4 md:px-6">
        {similarList.results && (
          <Carousel
            title={similarList && similarList.length !== 0 ? title : null}
            info={similarList.results}
            media={media}
          />
        )}
      </div>
    </div>
  );
};

export default Similar;

Similar.defaultProps = {
  id: 0,
  title: "",
  media: "",
  lang: "es-ES",
};

Similar.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  media: PropTypes.string,
  lang: PropTypes.string,
};
