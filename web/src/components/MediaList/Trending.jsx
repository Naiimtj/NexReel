import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTrending } from '../../../services/TMDB/services-tmdb';
import Carousel from '../../utils/Carousel/Carousel';

const Trending = () => {
  const [t, i18next] = useTranslation('translation');
  const [data, setData] = useState([]);
  const [isChange, isSetChange] = useState(true);

  useEffect(() => {
    if (!i18next.language) return;
    getTrending(i18next.language).then((res) => setData(res.results));
  }, [i18next.language]);

  if (!data.length) return null;

  return (
    <div className="mb-20">
      <Carousel
        title={t('Trending')}
        info={data}
        isChange={isChange}
        isSetChange={isSetChange}
      />
    </div>
  );
};

export default Trending;
