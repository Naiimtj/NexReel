import { Fragment, useEffect, useRef, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getFollowersUser,
  patchNotifications,
  postConfirmFollow,
  deleteFollower,
} from '../../services/DB/services-db';
import { useAuthContext } from '../context/auth-context';
import BaseModal from '../components/base/BaseModal';
import PageTitle from '../components/PageTitle';

const UserMenu = ({ user = {}, logout = () => {}, translate = () => {} }) => {
  const navigate = useNavigate();
  const [t] = useTranslation('translation');
  const { onReload } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [dataUser, setDataUser] = useState([]);
  const [notifRead, setNotifRead] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    getFollowersUser()
      .then(setDataUser)
      .catch((err) => err);
  }, []);

  useEffect(() => {
    setNotifRead(user.notificationsRead ?? false);
  }, [user.notificationsRead]);

  useEffect(() => {
    if (!showNotifModal) return;
    getFollowersUser()
      .then(setDataUser)
      .catch(() => {});
  }, [showNotifModal]);

  const notifications = (dataUser || [])
    .map((item) => ({
      ...item,
      user: Array.isArray(item.user) ? item.user[0] : item.user,
    }))
    .filter((item) => item.user);

  const hasUnread = notifRead;

  const goTo = (path) => () => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleConfirm = async (followerId) => {
    try {
      await postConfirmFollow(followerId);
      setDataUser((prev) =>
        prev.map((n) =>
          n.UserIDFollower === followerId ? { ...n, UserConfirm: true } : n,
        ),
      );
      onReload();
    } catch (err) {
      console.error('Confirm follow error', err);
    }
  };

  const handleDelete = async (followerId) => {
    try {
      await deleteFollower(followerId);
      setDataUser((prev) =>
        prev.filter((n) => n.UserIDFollower !== followerId),
      );
    } catch (err) {
      console.error('Delete follow error', err);
    }
  };

  const userNavigation = [
    { key: 'profile', name: translate('Profile'), onclick: goTo('/me') },
    {
      key: 'notifications',
      name: translate('Notifications'),
      onclick: () => {
        setMenuOpen(false);
        setShowNotifModal(true);
      },
    },
    {
      key: 'playlists',
      name: translate('Playlists'),
      onclick: goTo(`/playlists/${user.id}`),
    },
    { key: 'forums', name: translate('Forums'), onclick: goTo('/forums') },
    { key: 'signout', name: translate('Sign out'), onclick: logout },
  ];

  return (
    <div className="ml-2 flex items-center md:ml-2">
      <PageTitle title={t('Profile')} />
      <Menu as="div" className="relative">
        <Menu.Button
          className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none hover:scale-105"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="absolute" />
          <span className="sr-only">Open user menu</span>
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={user.avatarURL}
            alt={t('Avatar')}
          />
          {hasUnread && (
            <span className="flex h-2 w-2 absolute top-0 right-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
            </span>
          )}
        </Menu.Button>
        <Transition
          show={menuOpen}
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            ref={menuButtonRef}
            className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            {userNavigation.map((item) => (
              <Menu.Item key={item.key}>
                {() => (
                  <div className={item.key === 'signout' ? 'border-t' : ''}>
                    <button
                      type="button"
                      onClick={item.onclick}
                      className="hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 cursor-pointer w-full text-left flex items-center justify-between"
                    >
                      {item.name}
                      {item.key === 'notifications' && hasUnread && (
                        <span className="relative flex h-2 w-2 ml-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>

      <BaseModal
        visible={showNotifModal}
        onClose={() => {
          setShowNotifModal(false);
          if (notifRead) {
            patchNotifications({ notificationsRead: false });
            setNotifRead(false);
            onReload();
          }
        }}
        title={t('Notifications')}
        className="bg-gray-800 text-gray-200 w-[90vw] max-w-sm"
      >
        <div className="px-4 pb-4">
          {notifications.length > 0 ? (
            notifications
              .filter(
                (n) =>
                  n.UserConfirm === false ||
                  (n.UserConfirm === true && notifRead),
              )
              .map((n) => {
                const isPending = n.UserConfirm === false;
                const isAccepted = !isPending && n.UserIDFollower === user?.id;
                return (
                  <div
                    key={n.id}
                    className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0"
                  >
                    <div className="flex items-center gap-1 text-sm flex-wrap">
                      {isAccepted || isPending ? (
                        <>
                          <span className="font-semibold capitalize">
                            {n.user?.username}
                          </span>
                          <span className="text-gray-400">
                            {isAccepted
                              ? t('accepted your follow')
                              : t('wants to follow')}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400">Aceptaste a</span>
                          <span className="font-semibold capitalize">
                            {n.user?.username}
                          </span>
                          <span className="text-gray-400">para seguirte</span>
                        </>
                      )}
                    </div>
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="bg-purple-200 hover:bg-purpleNR px-2 py-1 rounded-md transition duration-200 text-gray-800 text-xs"
                          onClick={() => handleConfirm(n.UserIDFollower)}
                        >
                          {t('Confirm')}
                        </button>
                        <button
                          type="button"
                          className="bg-red-100 hover:bg-red-300 px-2 py-1 rounded-md transition duration-200 text-gray-800 text-xs"
                          onClick={() => handleDelete(n.UserIDFollower)}
                        >
                          {t('Delete')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="text-center text-gray-400 py-4">
              {t('No notifications')}
            </div>
          )}
        </div>
      </BaseModal>
    </div>
  );
};
export default UserMenu;
