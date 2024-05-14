import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { getMediaDetails } from "../../../services/TMDB/services-tmdb";
import Spinner from "../../utils/Spinner/Spinner";
import MultiSmall from "../MediaList/MultiSmall";
import { getDetailMedia } from "../../../services/DB/services-db";

const ViewsPending = ({ data }) => {
  const [t, i18next] = useTranslation("translation");
  const { media_type, mediaId } = data;
  const [dataMedia, setDataMedia] = useState({});
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    getMediaDetails(media_type, mediaId, t("es-ES")).then((d) => {
      setDataMedia(d);
    });
    getDetailMedia(mediaId, media_type).then((d) => {
      setDataMediaUser(d);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18next.language, mediaId, media_type]);

  const mediaMovie = data.media_type === "movie";
  const mediaTv = data.media_type === "tv";

  return (
    <>
      {!dataMediaUser && !dataMedia.length > 0 ? (
        <Spinner result />
      ) : (
        <MultiSmall
          info={dataMedia}
          mediaMovie={mediaMovie}
          mediaTv={mediaTv}
        />
      )}
    </>
  );
};

export default ViewsPending;

ViewsPending.defaultProps = {
  data: {},
};

ViewsPending.propTypes = {
  data: PropTypes.object,
};
