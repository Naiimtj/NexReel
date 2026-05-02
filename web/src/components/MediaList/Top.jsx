import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { getTop } from '../../../services/TMDB/services-tmdb';
import Carousel from '../../utils/Carousel/Carousel';
import Spinner from '../../utils/Spinner/Spinner';

const Top = ({ media = '' }) => {
  const [t, i18next] = useTranslation('translation');
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [isChange, isSetChange] = useState(true);

  useEffect(() => {
    if (!i18next.language || !media) return;
    getTop(media, i18next.language).then((data) => {
      setList(data.results);
      setLoading(false);
    });
  }, [i18next.language, media]);

  return (
    <div className="mb-10">
      {loading && !list.length ? (
        <Spinner result />
      ) : (
        <Carousel
          title={t('TOP')}
          info={list}
          media={media}
          isChange={isChange}
          isSetChange={isSetChange}
        />
      )}
    </div>
  );
};

Top.propTypes = { media: PropTypes.string };

export default Top;
