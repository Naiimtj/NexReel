import { useEffect, useState } from 'react';
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
  }, [lang, id, media]);

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
export default Recommendations;
