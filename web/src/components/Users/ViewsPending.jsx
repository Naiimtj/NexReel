import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { getMediaDetails } from "../../../services/TMDB/services-tmdb";
import Spinner from "../../utils/Spinner/Spinner";
import MultiSmall from "../MediaList/MultiSmall";
import { getDetailMedia } from "../../../services/DB/services-db";
import SeenPending from "../MediaList/SeenPending";

const ViewsPending = ({ data, changeSeenPending, setChangeSeenPending }) => {
  // eslint-disable-next-line no-unused-vars
  const [t, i18next] = useTranslation("translation");
  const { media_type, mediaId, runtime, seen, pending } = data;
  const [dataMedia, setDataMedia] = useState({});
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    if (i18next.language) {
      getMediaDetails(media_type, mediaId, i18next.language).then((d) => {
        setDataMedia(d);
      });
    }
    getDetailMedia(mediaId).then((d) => {
      setDataMediaUser(d);
    });
  }, [i18next.language, mediaId, changeSeenPending, media_type]);

  const mediaMovie = data.media_type === "movie";
  const mediaTv = data.media_type === "tv";

  //-SEEN/NO SEEN
  const handleSeenMedia = () => {
    new SeenPending(
      dataMediaUser,
      mediaId,
      media_type,
      runtime,
      seen,
      setChangeSeenPending,
      changeSeenPending
    ).Seen();
  };
  // -PENDING/NO PENDING
  const handlePending = () => {
    new SeenPending(
      dataMediaUser,
      mediaId,
      media_type,
      runtime,
      pending,
      setChangeSeenPending,
      changeSeenPending
    ).Pending();
  };

  return (
    <>
      {!dataMediaUser && !dataMedia.length > 0 ? (
        <Spinner result />
      ) : (
        <MultiSmall
          info={dataMedia}
          mediaMovie={mediaMovie}
          mediaTv={mediaTv}
          seenMedia={seen}
          pendingMedia={pending}
          handleSeenMedia={handleSeenMedia}
          handlePending={handlePending}
        />
      )}
    </>
  );
};

export default ViewsPending;

ViewsPending.defaultProps = {
  data: {},
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  setRunTime: () => {},
  runTime: 0,
};

ViewsPending.propTypes = {
  data: PropTypes.object,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  setRunTime: PropTypes.func,
  runTime: PropTypes.number,
};
