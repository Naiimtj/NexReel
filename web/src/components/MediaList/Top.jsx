import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
// service
import { getTop } from "../../../services/TMDB/services-tmdb";
// components/utils
import Carousel from "../../utils/Carousel/Carousel";
import Spinner from "../../utils/Spinner/Spinner";

const Top = ({ media }) => {
  const [t, i18next] = useTranslation("translation");
  const [loading, setLoading] = useState(true);
  const [moviePopularList, setMoviePopularList] = useState([]);
  const [isChange, isSetChange] = useState(true);
  useEffect(() => {
    if ((i18next.language, media)) {
      getTop(media, i18next.language).then((data) => {
        setMoviePopularList(data.results);
        setLoading(false);
      });
    }
  }, [i18next.language, media]);
  return (
    <div className="mb-10">
      {loading && !moviePopularList.length > 0 ? (
        <Spinner result />
      ) : (
        <Carousel
          title={t("TOP")}
          info={moviePopularList}
          media={media}
          isChange={isChange}
          isSetChange={isSetChange}
        />
      )}
    </div>
  );
};

export default Top;

Top.defaultProps = {
  media: "",
};

Top.propTypes = {
  media: PropTypes.string,
};
