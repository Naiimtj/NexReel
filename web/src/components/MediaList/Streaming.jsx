import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
// service
import { getDiscover } from "../../../services/TMDB/services-tmdb";
// components/utils
import Carousel from "../../utils/Carousel/Carousel";
import Spinner from "../../utils/Spinner/Spinner";

const Streaming = ({ media }) => {
  const [t, i18next] = useTranslation("translation");
  const [loading, setLoading] = useState(true);
  const [PopularList, setPopularList] = useState([]);
  useEffect(() => {
    if ((i18next.language, media)) {
      getDiscover(media, i18next.language).then((data) => {
        setPopularList(data.results);
        setLoading(false);
      });
    }
  }, [i18next.language, media]);
  return (
    <div className="mb-20">
      {loading && !PopularList.length > 0 ? (
        <Spinner result />
      ) : (
        <Carousel
          title={t("Discover")}
          info={PopularList}
          media={media}
        />
      )}
    </div>
  );
};

export default Streaming;

Streaming.defaultProps = {
  media: "",
};

Streaming.propTypes = {
  media: PropTypes.string,
};
