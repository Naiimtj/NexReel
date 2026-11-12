import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTop } from '../../../services/TMDB/services-tmdb';
import useTmdbPages from '../../hooks/useTmdbPages';
import Carousel from '../../utils/Carousel/Carousel';
import Spinner from '../../utils/Spinner/Spinner';

const Top = ({ media = '' }) => {
  const [t, i18next] = useTranslation('translation');
  const fetchPage = useCallback(
    (page) => getTop(media, i18next.language, page),
    [media, i18next.language],
  );
  const { items, hasMore, loadMore, isLoading } = useTmdbPages(fetchPage);
  const [isChange, isSetChange] = useState(true);

  return (
    <div className="mb-10">
      {isLoading && !items.length ? (
        <Spinner result />
      ) : (
        <Carousel
          title={t('TOP')}
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
export default Top;
