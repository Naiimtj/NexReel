import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  deleteFollower,
  postConfirmFollow,
} from '../../services/DB/services-db';
import { useAuthContext } from '../context/auth-context';

const UserNotifications = forwardRef(function UserNotifications(
  {
    notifications = [],
    hasUnreadNotifications = false,
    toggleDropdown = () => {},
    showDropdown = false,
    changeNotifications = false,
    setChangeNotifications = () => {},
  },
  ref,
) {
  const { onReload } = useAuthContext();
  const [t] = useTranslation('translation');
  const [error, setError] = useState('');

  const handleConfirmFollow = async (id) => {
    try {
      if (postConfirmFollow(id)) {
        setChangeNotifications(!changeNotifications);
        onReload();
      }
    } catch (err) {
      console.error('Confirm follow error', err);
      setError(err);
    }
  };

  const handleDeleteFollow = (id) => {
    try {
      deleteFollower(id).then(() =>
        setChangeNotifications(!changeNotifications),
      );
    } catch (err) {
      console.error('Delete follow error', err);
      setError(err);
    }
  };

  const showBadge = notifications.length > 0 && hasUnreadNotifications;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 w-full text-left"
        onClick={toggleDropdown}
      >
        {t('Notifications')}
        {showBadge && (
          <span className="flex h-2 w-2 absolute top-0 right-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute text-sm right-0 bg-white border rounded shadow-lg p-1 w-[350px]">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <p className="font-semibold mr-1 capitalize">{n.username}</p>
                  <p className="text-xs">{t('wants to follow')}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="hover:bg-purpleNR bg-purple-200 px-1 rounded-md transition duration-200"
                    onClick={() => handleConfirmFollow(n.id)}
                  >
                    {t('Confirm')}
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer bg-red-100 hover:bg-red-300 px-1 rounded-md transition duration-200"
                    onClick={() => handleDeleteFollow(n.id)}
                  >
                    {t('Delete')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">{t('No notifications')}</div>
          )}
        </div>
      )}
      {error && (
        <div className="absolute w-full">
          <div className="my-2 text-red-600 font-bold rounded-md">{error}</div>
        </div>
      )}
    </div>
  );
});

UserNotifications.propTypes = {
  notifications: PropTypes.array,
  hasUnreadNotifications: PropTypes.bool,
  toggleDropdown: PropTypes.func,
  showDropdown: PropTypes.bool,
  changeNotifications: PropTypes.bool,
  setChangeNotifications: PropTypes.func,
};

export default UserNotifications;
