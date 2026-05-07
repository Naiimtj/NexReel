import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/auth-context';
import { getDetailEpisode } from '../../../services/DB/services-db';
import { SeenPendingEpisode } from '../MediaList/SeenPendingMedia/seenPendingActions';
import DateAndTimeConvert from '../../utils/DateAndTimeConvert';
import SeenPendingButton from '../../utils/Buttons/SeenPendingButton';

const Episodes = ({ info, idTvShow, numSeason, userExist, numberEpisodes }) => {
  const { onReload } = useAuthContext();
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
  const [dataEpisodeUser, setDataEpisodeUser] = useState({});
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [pendingSeen, setPendingSeen] = useState(false);

  const { name, runtime, air_date, episode_number, id } = info;
  const { seen } = dataEpisodeUser;

  useEffect(() => {
    if (userExist) {
      getDetailEpisode(idTvShow, numSeason, episode_number).then((d) => {
        setDataEpisodeUser(d);
      });
    }
  }, [
    changeSeenPending,
    pendingSeen,
    idTvShow,
    userExist,
    numSeason,
    episode_number,
  ]);

  //-SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const TotalTime =
    runtime > 0
      ? new DateAndTimeConvert(runtime, t, false).TimeConvert()
      : null;

  const dateComplete =
    air_date &&
    new DateAndTimeConvert(
      air_date,
      t,
      false,
      false,
      false,
      true,
      false,
    ).DateTimeConvert();

  const handleSeenMedia = (event) => {
    event.stopPropagation();
    SeenPendingEpisode(
      dataEpisodeUser,
      idTvShow,
      'tv',
      runtime || 0,
      seen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      onReload,
      numSeason,
      episode_number,
      numberEpisodes,
    );
  };

  return (
    <div className="flex flex-row justify-between hover:bg-white/10 rounded-xl p-1">
      <div
        className="cursor-pointer flex flex-row items-center gap-4 justify-items-stretch w-full"
        onClick={() =>
          info && navigate(`/tv/${idTvShow}/${numSeason}/${episode_number}`)
        }
      >
        {/* //-NUMBER EPISODE */}
        <h1 className="text-md text-center text-[#7B6EF6] px-2">
          {episode_number}
        </h1>
        {/* //- NAME Y DATE */}
        {/* //-NAME */}
        <div className="flex flex-col justify-start">
          <h1 className="font-semibold text-sm">{name}</h1>
          {/* //-DATE */}
          <div className="flex flex-row items-center gap-2">
            <p className="text-[10px] text-gray-400">({TotalTime})</p>
            <div className="text-xs text-gray-400">{dateComplete}</div>
          </div>
        </div>
      </div>
      {/* //.BUTTON SEEN/UNSEEN */}
      {userExist ? (
        <div className="flex justify-center gap-8 items-center">
          <SeenPendingButton
            condition={seen}
            size={20}
            text={'Seen'}
            handle={handleSeenMedia}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Episodes;

Episodes.defaultProps = {
  info: {},
  idTvShow: '',
  numSeason: '',
  userExist: false,
  numberEpisodes: 0,
};
Episodes.propTypes = {
  info: PropTypes.object,
  idTvShow: PropTypes.string,
  numSeason: PropTypes.string,
  userExist: PropTypes.bool,
  numberEpisodes: PropTypes.number,
};
