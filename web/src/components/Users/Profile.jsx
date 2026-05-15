import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import {
  UnFollow,
  deletePlaylist,
  deleteFollower,
  getUser,
  postFollow,
  getFollowersUser,
} from '../../../services/DB/services-db';
import DateAndTimeConvert from '../../utils/DateAndTimeConvert';
import Spinner from '../../utils/Spinner/Spinner';
import UpdateProfile from './UpdateProfile';
import UpdatePassword from './UpdatePassword';
import PageTitle from '../PageTitle';
import ProfileMediaSections from './ProfileMediaSections';
import ProfileOverview from './ProfileOverview';
import ProfilePlaylistsSection from './ProfilePlaylistsSection';

const SEARCH_HIDE_DELAY_MS = 500;
const DELETE_ERROR_HIDE_DELAY_MS = 3000;

function sortByUpdatedAt(items = [], ascending = false) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(left.updatedAt).getTime();
    const rightDate = new Date(right.updatedAt).getTime();
    return ascending ? leftDate - rightDate : rightDate - leftDate;
  });
}

function filterMediasByFlag(medias, flag) {
  return medias.filter((media) => media?.[flag] !== false);
}

function getConfirmedRelations(relations = []) {
  return relations.filter((item) => item.UserConfirm === true);
}

function getTotalRuntime(medias = []) {
  return medias.reduce((total, media) => {
    if (media?.media_type === 'tv') {
      return total + (media?.runtime_seen ?? 0);
    }
    return total + (media?.runtime ?? 0);
  }, 0);
}

const Profile = ({
  dataUser = {},
  isOtherUser = false,
  setChangeOtherUser = () => {},
  currentUser = {},
}) => {
  const [t] = useTranslation('translation');
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [user, setUser] = useState({});
  const otherUser = dataUser?.user;
  const isFollowing = dataUser?.isFollowing;
  const isConfirm = dataUser?.isConfirm ?? false;

  useEffect(() => {
    let ignore = false;

    const loadUser = async () => {
      if (isOtherUser) {
        setUser(otherUser ?? {});
        return;
      }

      try {
        const data = await getUser();
        if (!ignore) {
          setUser(data ?? {});
        }
      } catch {
        if (!ignore) {
          setUser({});
        }
      }
    };

    loadUser();

    return () => {
      ignore = true;
    };
  }, [isOtherUser, changeSeenPending, otherUser]);

  const [followers, setFollowers] = useState([]);
  const isFollowingOtherUser = followers.some(
    (item) => item.UserIDFollower === user.id && item.UserConfirm === true,
  );

  useEffect(() => {
    let ignore = false;

    const loadFollowers = async () => {
      if (!user.id) {
        setFollowers([]);
        return;
      }

      try {
        const data = await getFollowersUser(user.id);
        if (!ignore) {
          setFollowers(data ?? []);
        }
      } catch {
        if (!ignore) {
          setFollowers([]);
        }
      }
    };

    loadFollowers();

    return () => {
      ignore = true;
    };
  }, [user.id]);

  const memberSince = new DateAndTimeConvert(
    user.createdAt,
    t,
    false,
    false,
    false,
    true,
    'long',
  ).DateTimeConvertLocale();

  const userMedias = sortByUpdatedAt([
    ...(user.medias ?? []),
    ...(user.mediasTv ?? []),
  ]);

  const pendingData = sortByUpdatedAt(
    filterMediasByFlag(userMedias, 'pending'),
  );
  const seenData = sortByUpdatedAt(filterMediasByFlag(userMedias, 'seen'));
  const playlistData = sortByUpdatedAt(user.playlists ?? []);
  const [createPlaylist, setCreatePlaylist] = useState(false);
  const playlistsFollowData = sortByUpdatedAt(user.playlistsFollow ?? []);

  const [modalForm, setModalForm] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const timeTotalSeen = new DateAndTimeConvert(
    getTotalRuntime(seenData),
    t,
  ).TimeConvert();

  const refreshProfile = () => {
    setChangeSeenPending((prev) => !prev);
    setChangeOtherUser((prev) => !prev);
  };

  const handleFollow = () => {
    postFollow(user.id).then(refreshProfile);
  };

  const handleUnFollow = () => {
    UnFollow(user.id).then(refreshProfile);
  };

  const handleDeleteFollower = () => {
    deleteFollower(user.id).then(refreshProfile);
  };

  const followersUser = getConfirmedRelations(user.followers);
  const followingUser = getConfirmedRelations(user.following);

  const [answerDel, setAnswerDel] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [popSureDel, setPopSureDel] = useState(false);
  const [errorDelete, setErrorDelete] = useState('');

  useEffect(() => {
    if (!answerDel || !idDelete) {
      return undefined;
    }

    let ignore = false;

    const removePlaylist = async () => {
      try {
        await deletePlaylist(idDelete);
        if (ignore) {
          return;
        }

        setAnswerDel(false);
        setIdDelete(null);
        setErrorDelete('');
        setChangeSeenPending((prev) => !prev);
        setChangeOtherUser((prev) => !prev);
      } catch (error) {
        if (!ignore) {
          const { message } = error.response?.data || {};
          setAnswerDel(false);
          setErrorDelete(message ?? t('Error'));
        }
      }
    };

    removePlaylist();

    return () => {
      ignore = true;
    };
  }, [answerDel, idDelete, setChangeOtherUser, t]);

  useEffect(() => {
    if (!errorDelete) {
      return undefined;
    }

    const timerId = globalThis.setTimeout(() => {
      setErrorDelete('');
    }, DELETE_ERROR_HIDE_DELAY_MS);

    return () => {
      globalThis.clearTimeout(timerId);
    };
  }, [errorDelete]);

  const [hiden, setHiden] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    let hideTimerId;

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setHiden(true);
        hideTimerId = globalThis.setTimeout(() => {
          setHiden(false);
        }, SEARCH_HIDE_DELAY_MS);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (hideTimerId) {
        globalThis.clearTimeout(hideTimerId);
      }
    };
  }, []);

  const hasLoadedUser = Object.keys(user).length > 0;
  const shouldHideMainContent = modalForm || modalPassword;
  const shouldShowConfirmedContent = !isOtherUser || isConfirm;
  const shouldShowMainContent = !shouldHideMainContent;
  const shouldShowBottomSpacing = isFollowing === false ? '' : 'mb-20';
  const profileTitle = hasLoadedUser
    ? `${t('Profile')} ${user.username}`
    : t('Profile');

  return (
    <>
      {hasLoadedUser ? (
        <div className={shouldShowBottomSpacing}>
          <PageTitle title={profileTitle} />
          <div className="text-gray-200 mt-6 h-full w-full">
            {modalForm ? (
              <UpdateProfile
                setModalForm={setModalForm}
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
              />
            ) : null}
            {modalPassword ? (
              <UpdatePassword
                setModalPassword={setModalPassword}
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
              />
            ) : null}
            {shouldShowMainContent ? (
              <ProfileOverview
                user={user}
                isOtherUser={isOtherUser}
                isFollowing={isFollowing}
                isConfirm={isConfirm}
                memberSince={memberSince}
                timeTotalSeen={timeTotalSeen}
                isFollowingOtherUser={isFollowingOtherUser}
                followersUser={followersUser}
                followingUser={followingUser}
                searchRef={searchRef}
                hiden={hiden}
                onFollow={handleFollow}
                onUnfollow={handleUnFollow}
                onDeleteFollower={handleDeleteFollower}
                onEditProfile={() => setModalForm(true)}
                onChangePassword={() => setModalPassword(true)}
              />
            ) : null}
          </div>
          {shouldShowMainContent && shouldShowConfirmedContent ? (
            <>
              <ProfileMediaSections
                userId={user.id}
                allMedias={userMedias}
                pendingData={pendingData}
                seenData={seenData}
                changeSeenPending={changeSeenPending}
                setChangeSeenPending={setChangeSeenPending}
                isOtherUser={isOtherUser}
              />
              <ProfilePlaylistsSection
                user={user}
                currentUserId={currentUser.id}
                isOtherUser={isOtherUser}
                playlistData={playlistData}
                playlistsFollowData={playlistsFollowData}
                createPlaylist={createPlaylist}
                setCreatePlaylist={setCreatePlaylist}
                changeSeenPending={changeSeenPending}
                setChangeSeenPending={setChangeSeenPending}
                popSureDel={popSureDel}
                setPopSureDel={setPopSureDel}
                setAnswerDel={setAnswerDel}
                setIdDelete={setIdDelete}
                errorDelete={errorDelete}
              />
            </>
          ) : null}
        </div>
      ) : (
        <Spinner result />
      )}
    </>
  );
};

export default Profile;
