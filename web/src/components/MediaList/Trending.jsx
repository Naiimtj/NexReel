import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTrending } from '../../../services/TMDB/services-tmdb';
import useTmdbPages from '../../hooks/useTmdbPages';
import Carousel from '../../utils/Carousel/Carousel';

const Trending = () => {
  const [t, i18next] = useTranslation('translation');
  const fetchPage = useCallback(
    (page) => getTrending(i18next.language, page),
    [i18next.language],
  );
  const { items, hasMore, loadMore } = useTmdbPages(fetchPage);
  const [isChange, isSetChange] = useState(true);

  if (!items.length) return null;

  return (
    <div className="md:mb-[12rem] ">
      <Carousel
        title={t('Trending')}
        info={items}
        isChange={isChange}
        isSetChange={isSetChange}
        onEndReached={hasMore ? loadMore : undefined}
      />
    </div>
  );
};

export default Trending;
