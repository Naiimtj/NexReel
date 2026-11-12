import { useCallback, useEffect, useState } from 'react';
import Carousel from '../../utils/Carousel/Carousel';
import { getSimilar } from '../../../services/TMDB/services-tmdb';
import useTmdbPages from '../../hooks/useTmdbPages';

const Similar = ({
  title = '',
  id = 0,
  media = '',
  lang = 'es-ES',
  pendingSeenMedia = false,
  setPendingSeenMedia = () => {},
}) => {
  const fetchPage = useCallback(
    (page) => getSimilar(media, id, lang, page),
    [media, id, lang],
  );
  const { items, hasMore, loadMore } = useTmdbPages(fetchPage);
  const [isChange, isSetChange] = useState(false);

  useEffect(() => {
    isSetChange(false);
  }, [lang, id, media]);

  useEffect(() => {
    if (!isChange) isSetChange(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!items.length) return null;

  return (
    <div className="text-gray-200 px-4 md:px-6 text-lg pt-4">
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
export default Similar;
