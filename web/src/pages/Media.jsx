import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DetailsMedia from './Movies/DetailsMedia';
import Spinner from '../utils/Spinner/Spinner';
import { getCredits, getMediaDetails } from '../../services/TMDB/services-tmdb';
import { useAuthContext } from '../context/auth-context';
import { useMediaContext } from '../context/media-context';

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
    const found = mediasUser.find((m) => m.mediaId === id.toString());
    setDataMediaUser(found || {});
  }, [mediasUser, id, userExist]);

  const backdrop = dataDetails.backdrop_path
    ? `url(https://image.tmdb.org/t/p/w500${dataDetails.backdrop_path})`
    : undefined;

  return (
    <div
      className="rounded-3xl bg-contain bg-center bg-fixed w-auto h-auto mt-6 ring-2 ring-inset ring-[#20283E]"
      style={{ backgroundImage: backdrop }}
    >
      <div className="text-gray-200 w-auto bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
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
