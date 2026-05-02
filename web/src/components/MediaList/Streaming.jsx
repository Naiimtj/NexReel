import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { getDiscover } from '../../../services/TMDB/services-tmdb';
import Carousel from '../../utils/Carousel/Carousel';
import Spinner from '../../utils/Spinner/Spinner';

const Streaming = ({ media = '' }) => {
  const [t, i18next] = useTranslation('translation');
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [isChange, isSetChange] = useState(true);

  useEffect(() => {
    if (!i18next.language || !media) return;
    getDiscover(media, i18next.language).then((data) => {
      setList(data.results);
      setLoading(false);
    });
  }, [i18next.language, media]);

  return (
    <div className="mb-20">
      {loading && !list.length ? (
        <Spinner result />
      ) : (
        <Carousel
          title={t('Discover')}
          info={list}
          media={media}
          isChange={isChange}
          isSetChange={isSetChange}
        />
      )}
    </div>
  );
};

Streaming.propTypes = { media: PropTypes.string };

export default Streaming;
