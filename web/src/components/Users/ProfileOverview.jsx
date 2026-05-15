import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseIcon } from '../base';
import SearchUsers from './SearchUsers';
import UserDetails from './UserDetails';

const baseActionClass = 'flex items-center gap-2 px-0 py-0 font-normal';

const ProfileActionButton = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  className = '',
}) => (
  <BaseButton
    variant={variant}
    size="small"
    onClick={onClick}
    className={`${baseActionClass} ${className}`.trim()}
  >
    <BaseIcon icon={icon} size="small" />
    {label}
  </BaseButton>
);
const FollowRequestStatus = ({ onUnfollow }) => {
  const [t] = useTranslation('translation');
  const [isHovered, setIsHovered] = useState(false);
  const label = isHovered ? t('Cancel request') : t('Waiting confirmation');
  const icon = isHovered ? 'userTimes' : 'userClock';

  return (
    <div className="flex items-center gap-1 mb-8 w-full">
      <BaseButton
        variant="primary"
        size="small"
        onClick={onUnfollow}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${baseActionClass} text-base ${
          isHovered ? 'text-gray-500 hover:text-gray-500' : 'text-purpleNR'
        }`}
      >
        <BaseIcon icon={icon} size="small" />
        {label}
      </BaseButton>
    </div>
  );
};
const FollowPreviewList = ({ title, users = [], isFollowerList = false }) => {
  const [t] = useTranslation('translation');

  if (!users.length) {
    return null;
  }

  return (
    <div>
      <h1 className="font-semibold text-xl inline-block">{title}</h1>
      <p className="inline-block ml-1">({users.length})</p>
      <div className="flex flex-row gap-2 mt-2">
        {users.slice(0, 6).map((item, index) => (
          <UserDetails
            key={item.id}
            data={item}
            num={index}
            isFollower={isFollowerList}
          />
        ))}
        {users.length > 6 ? (
          <div className="flex flex-col justify-end">
            <span className="text-left text-base font-semibold text-[#7B6EF6]">
              {t('See all')}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
const ProfileOverview = ({
  user,
  isOtherUser = false,
  isFollowing = undefined,
  isConfirm = false,
  memberSince = '',
  timeTotalSeen = '',
  isFollowingOtherUser = false,
  followersUser = [],
  followingUser = [],
  searchRef,
  hiden = false,
  onFollow,
  onUnfollow,
  onDeleteFollower,
  onEditProfile,
  onChangePassword,
}) => {
  const [t] = useTranslation('translation');
  const canShowConfirmedContent = !isOtherUser || isConfirm;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-center w-full">
        <SearchUsers hiden={hiden} />
      </div>
      <div className="w-full h-full flex flex-col md:flex-row gap-4 px-4">
        <div className="flex flex-col items-center md:w-[500px] w-auto h-full gap-4">
          <img
            className="rounded-full object-cover h-44 w-44"
            src={user.avatarURL}
            alt={t('"Profile avatar"')}
          />
          <h1 className="italic text-center">
            {user.favoritePhrase
              ? `"${user.favoritePhrase}"`
              : `"${t('Personalized phrase')}"`}
          </h1>

          {canShowConfirmedContent ? (
            <div className="flex flex-col items-center">
              <h1 className="font-semibold text-left">{t('Time Viewed')}</h1>
              <p className="text-center">{timeTotalSeen}</p>
            </div>
          ) : null}
        </div>

        <div className="md:w-[500px]">
          <div className="flex justify-between">
            <h3 className="font-semibold">{t('Name')}:</h3>
          </div>
          <p className="w-full font-base text-sm">{user.username}</p>

          <h3 className="font-semibold">{t('Member since')}:</h3>
          <p className="w-full font-base text-sm">{memberSince}</p>

          {isOtherUser && !isFollowing ? (
            <div className="w-full flex items-center gap-1 my-4">
              <ProfileActionButton
                icon="userPlus"
                label={t('Follow')}
                onClick={onFollow}
                className="text-base"
              />
            </div>
          ) : null}

          {isOtherUser && isFollowing && !isConfirm ? (
            <FollowRequestStatus onUnfollow={onUnfollow} />
          ) : null}

          {isOtherUser ? null : (
            <div className="flex flex-col items-start w-full">
              <h1 className="font-semibold">Email:</h1>
              <p className="font-base text-sm mb-4">{user.email}</p>

              <ProfileActionButton
                icon="edit"
                label={t('Edit profile')}
                onClick={onEditProfile}
                className="mb-4 text-base"
                variant="text"
              />
              <ProfileActionButton
                icon="lockPassword"
                label={t('Change password')}
                onClick={onChangePassword}
                className="text-base w-full"
                variant="text"
              />
            </div>
          )}

          <div className="flex flex-col gap-4 mt-4">
            {isOtherUser && isFollowing && isConfirm ? (
              <ProfileActionButton
                icon="userTimes"
                label={t('Unfollow')}
                onClick={onUnfollow}
                className="w-[180px] text-sm"
                variant="text"
              />
            ) : null}

            {isOtherUser && isFollowingOtherUser ? (
              <ProfileActionButton
                icon="userAltSlash"
                label={t('Remove Follower')}
                onClick={onDeleteFollower}
                variant="danger"
                className="w-[180px] text-sm"
              />
            ) : null}
          </div>
        </div>
        <div
          className="flex flex-col justify-start w-full"
          ref={searchRef}
        >
          {canShowConfirmedContent ? (
            <div className="flex flex-row w-full">
              <FollowPreviewList
                title={t('Followers')}
                users={followersUser}
                isFollowerList
              />
              <FollowPreviewList title={t('Following')} users={followingUser} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default ProfileOverview;
