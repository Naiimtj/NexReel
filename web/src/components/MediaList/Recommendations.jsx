import { useCallback, useEffect, useState } from 'react';
import Carousel from '../../utils/Carousel/Carousel';
import { getRecommendations } from '../../../services/TMDB/services-tmdb';
import useTmdbPages from '../../hooks/useTmdbPages';

const Recommendations = ({
  title = '',
  id = 0,
  media = '',
  lang = 'es-ES',
  pendingSeenMedia = false,
  setPendingSeenMedia = () => {},
}) => {
  const fetchPage = useCallback(
    (page) => getRecommendations(media, id, lang, page),
    [media, id, lang],
  );
  const { items, hasMore, loadMore } = useTmdbPages(fetchPage);
  const [isChange, isSetChange] = useState(false);

  useEffect(() => {
    isSetChange(false);
  }, [lang, id, media]);

  if (!items.length) return null;

  return (
    <div className="text-gray-200 text-lg pt-4 px-4 md:px-6">
      <Carousel
        title={title}
        info={items}
        media={media}
        isSetChange={isSetChange}
        isChange={isChange}
        setPendingSeenMedia={setPendingSeenMedia}
        pendingSeenMedia={pendingSeenMedia}
        onEndReached={hasMore ? loadMore : undefined}
      />
    </div>
  );
};
export default Recommendations;
