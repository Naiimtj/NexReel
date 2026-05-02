import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Carousel from '../../utils/Carousel/Carousel';
import { getSimilar } from '../../../services/TMDB/services-tmdb';

const Similar = ({
  title = '',
  id = 0,
  media = '',
  lang = 'es-ES',
  pendingSeenMedia = false,
  setPendingSeenMedia = () => {},
}) => {
  const [similarList, setSimilarList] = useState([]);
  const [isChange, isSetChange] = useState(false);

  useEffect(() => {
    getSimilar(media, id, lang).then(setSimilarList);
    isSetChange(false);
  }, [lang, id, media]);

  useEffect(() => {
    if (!isChange) isSetChange(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!similarList.results) return null;

  return (
    <div className="text-gray-200 px-4 md:px-6 text-lg pt-4">
      <Carousel
        title={similarList?.length !== 0 ? title : null}
        info={similarList.results}
        media={media}
        isSetChange={isSetChange}
        isChange={isChange}
        setPendingSeenMedia={setPendingSeenMedia}
        pendingSeenMedia={pendingSeenMedia}
      />
    </div>
  );
};

Similar.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  media: PropTypes.string,
  lang: PropTypes.string,
  setPendingSeenMedia: PropTypes.func,
  pendingSeenMedia: PropTypes.bool,
};

export default Similar;
