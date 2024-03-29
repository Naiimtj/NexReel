import PropTypes from "prop-types";
import Carousel from "../../utils/Carousel/Carousel";
import { getSimilar } from "../../../services/TMDB/services-tmdb";
import { useEffect, useState } from "react";

const Similar = ({
  title,
  id,
  media,
  lang,
  pendingSeenMedia,
  setPendingSeenMedia,
}) => {
  const [similarList, setSimilarList] = useState([]);
  const [isChange, isSetChange] = useState(false);
  useEffect(() => {
    getSimilar(media, id, lang).then((data) => {
      setSimilarList(data);
    });
    isSetChange(false);
  }, [lang, id, media]);
  useEffect(() => {
    if (!isChange) {
      isSetChange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/exhaustive-deps
  }, [id]);
  // useEffect(() => {
  //   isSetChange(true)
  // }, [pendingSeenMedia]);
  return (
    <>
      {similarList.results && (
        <div className="text-gray-200 px-4 md:px-6 text-lg pt-4">
          <Carousel
            title={similarList && similarList.length !== 0 ? title : null}
            info={similarList.results}
            media={media}
            isSetChange={isSetChange}
            isChange={isChange}
            setPendingSeenMedia={setPendingSeenMedia}
            pendingSeenMedia={pendingSeenMedia}
          />
        </div>
      )}
    </>
  );
};

export default Similar;

Similar.defaultProps = {
  id: 0,
  title: "",
  media: "",
  lang: "es-ES",
  setPendingSeenMedia: () => {},
  pendingSeenMedia: false,
};

Similar.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  media: PropTypes.string,
  lang: PropTypes.string,
  setPendingSeenMedia: PropTypes.func,
  pendingSeenMedia: PropTypes.bool,
};
