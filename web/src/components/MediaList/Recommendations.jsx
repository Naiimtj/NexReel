import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Carousel from '../../utils/Carousel/Carousel';
import { getRecommendations } from '../../../services/TMDB/services-tmdb';

const Recommendations = ({
  title = '',
  id = 0,
  media = '',
  lang = 'es-ES',
  pendingSeenMedia = false,
  setPendingSeenMedia = () => {},
}) => {
  const [list, setList] = useState({});
  const [isChange, isSetChange] = useState(false);

  useEffect(() => {
    getRecommendations(media, id, lang).then((data) => {
      setList(data);
      isSetChange(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, id, pendingSeenMedia]);

  if (!list.results?.length) return null;

  return (
    <div className="text-gray-200 text-lg pt-4 px-4 md:px-6">
      <Carousel
        title={list?.length !== 0 ? title : null}
        info={list.results}
        media={media}
        isSetChange={isSetChange}
        isChange={isChange}
        setPendingSeenMedia={setPendingSeenMedia}
        pendingSeenMedia={pendingSeenMedia}
      />
    </div>
  );
};

Recommendations.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  media: PropTypes.string,
  lang: PropTypes.string,
  setPendingSeenMedia: PropTypes.func,
  pendingSeenMedia: PropTypes.bool,
};

export default Recommendations;
