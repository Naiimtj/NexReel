import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDiscover } from '../../../services/TMDB/services-tmdb';
import useTmdbPages from '../../hooks/useTmdbPages';
import Carousel from '../../utils/Carousel/Carousel';
import Spinner from '../../utils/Spinner/Spinner';

const Streaming = ({ media = '' }) => {
  const [t, i18next] = useTranslation('translation');
  const fetchPage = useCallback(
    (page) => getDiscover(media, i18next.language, page),
    [media, i18next.language],
  );
  const { items, hasMore, loadMore, isLoading } = useTmdbPages(fetchPage);
  const [isChange, isSetChange] = useState(true);

  return (
    <div className="mb-20">
      {isLoading && !items.length ? (
        <Spinner result />
      ) : (
        <Carousel
          title={t('Discover')}
          info={items}
          media={media}
          isChange={isChange}
          isSetChange={isSetChange}
          onEndReached={hasMore ? loadMore : undefined}
        />
      )}
    </div>
  );
};
export default Streaming;
