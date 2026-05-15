import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DetailsMedia from './Movies/DetailsMedia';
import Spinner from '../utils/Spinner/Spinner';
import { getCredits, getMediaDetails } from '../../services/TMDB/services-tmdb';
import { useAuthContext } from '../context/auth-context';
import { useMediaContext } from '../context/media-context';

const BLUR_MIN = 5;
const BLUR_MAX = 90;
const OPACITY_MIN = 0.8;
const OPACITY_MAX = 0.8;
const SCROLL_RANGE = 5000;

const Media = () => {
  const { id, media_type } = useParams();
  const [t] = useTranslation('translation');
  const { user } = useAuthContext();
  const { mediasUser, refreshMedias } = useMediaContext();
  const userExist = !!user;

  const [castList, setCastList] = useState([]);
  const [crewsList, setCrewsList] = useState([]);
  const [dataDetails, setDataDetails] = useState([]);
  const [dataMediaUser, setDataMediaUser] = useState({});
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const isFirstRender = useRef(true);

  const overlayRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!overlayRef.current) return;
    const progress = Math.min(window.scrollY / SCROLL_RANGE, 1);
    const blur = BLUR_MIN + (BLUR_MAX - BLUR_MIN) * progress;
    const opacity = OPACITY_MIN + (OPACITY_MAX - OPACITY_MIN) * progress;
    overlayRef.current.style.backdropFilter = `blur(${blur}px)`;
    overlayRef.current.style.WebkitBackdropFilter = `blur(${blur}px)`;
    overlayRef.current.style.backgroundColor = `rgba(32, 40, 62, ${opacity})`;
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!id || !media_type) return;
    getCredits(media_type, id, 'credits', t('es-ES')).then((data) => {
      setCastList(data.cast);
      setCrewsList(data.crew);
    });
    getMediaDetails(media_type, id, t('es-ES')).then((data) => {
      setDataDetails(data);
      setLoading(false);
    });
  }, [t, id, media_type]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (userExist) refreshMedias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeSeenPending]);

  useEffect(() => {
    if (!userExist) return;
    const found = mediasUser.find(
      (m) => m.mediaId === id.toString() && m.media_type === media_type,
    );
    setDataMediaUser(found || {});
  }, [mediasUser, id, userExist]);

  const poster = dataDetails.poster_path
    ? `url(https://image.tmdb.org/t/p/original${dataDetails.poster_path})`
    : undefined;

  return (
    <div
      className="rounded-3xl bg-cover bg-top bg-fixed w-auto h-full mt-6 ring-1 ring-inset ring-[#20283E]"
      style={{ backgroundImage: poster }}
    >
      <div
        ref={overlayRef}
        className="text-gray-200 w-auto bg-local rounded-3xl"
      >
        {loading ? (
          <Spinner result />
        ) : (
          <DetailsMedia
            cast={castList}
            crews={crewsList}
            info={dataDetails}
            mediaType={media_type}
            dataMediaUser={dataMediaUser}
            setChangeSeenPending={setChangeSeenPending}
            changeSeenPending={changeSeenPending}
          />
        )}
      </div>
    </div>
  );
};

export default Media;
