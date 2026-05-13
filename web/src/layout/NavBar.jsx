import { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsSearch } from 'react-icons/bs';
import BaseLink from '../components/base/BaseLink';
import BaseModal from '../components/base/BaseModal';
import Logo from '/img/logo.svg';
import { useAuthContext } from '../context/auth-context';
import {
  getInfoUser,
  logoutDB,
  getFollowersUser,
  patchNotifications,
  postConfirmFollow,
  deleteFollower,
} from '../../services/DB/services-db';
import UserMenu from './UserMenu';
import SearchLayout from './SearchLayout';

const NavBar = () => {
  const [t] = useTranslation('translation');
  const { user, onLogout, onReload } = useAuthContext();
  const [dataUser, setDataUser] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const [mobileNotifications, setMobileNotifications] = useState([]);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [notifRead, setNotifRead] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (user?.id) {
      getInfoUser(user.id)
        .then(setDataUser)
        .catch((err) => err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getFollowersUser()
        .then((data) => {
          const notifications = (data || [])
            .map((item) => ({
              ...item,
              user: Array.isArray(item.user) ? item.user[0] : item.user,
            }))
            .filter((item) => item.user);
          setMobileNotifications(notifications);
        })
        .catch((err) => err);
    }
  }, [user]);

  useEffect(() => {
    setNotifRead(dataUser?.notificationsRead ?? false);
  }, [dataUser?.notificationsRead]);

  useEffect(() => {
    if (!showMobileNotifications) return;
    getFollowersUser()
      .then((data) => {
        setMobileNotifications(
          (data || [])
            .map((item) => ({
              ...item,
              user: Array.isArray(item.user) ? item.user[0] : item.user,
            }))
            .filter((item) => item.user),
        );
      })
      .catch(() => {});
  }, [showMobileNotifications]);

  const hasUnread = notifRead;

  const handleMobileConfirm = async (followerId) => {
    try {
      await postConfirmFollow(followerId);
      setMobileNotifications((prev) =>
        prev.map((n) =>
          n.UserIDFollower === followerId ? { ...n, UserConfirm: true } : n,
        ),
      );
      onReload();
    } catch (err) {
      console.error('Confirm follow error', err);
    }
  };

  const handleMobileDelete = async (followerId) => {
    try {
      await deleteFollower(followerId);
      setMobileNotifications((prev) =>
        prev.filter((n) => n.UserIDFollower !== followerId),
      );
    } catch (err) {
      console.error('Delete follow error', err);
    }
  };

  const logout = () => logoutDB().then(onLogout);

  return (
    <>
      <div className="flex flex-row justify-between items-center relative">
        <Link to="/" className="flex justify-center items-center">
          <img
            className="h-7 lg:h-10 inline-block"
            src={Logo}
            alt="NaiPlex Logo"
          />
          <h1 className="text-gray-50 font-bold text-lg lg:text-4xl inline-block align-middle">
            NexReel
          </h1>
        </Link>

        <div className="flex justify-center">
          <button
            type="button"
            aria-label={t('Search')}
            onClick={() => setSearchModalOpen(true)}
            className="p-2 rounded-md md:hover:text-gray-400 text-purpleNR focus:outline-none"
          >
            <BsSearch className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <nav className="text-right flex justify-end items-center">
          <div className="hidden md:flex items-center">
            <BaseLink to="/" variant="nav" className="pr-4">
              {t('Home')}
            </BaseLink>
            <BaseLink to="/movie" variant="nav" className="pr-4">
              {t('Movies')}
            </BaseLink>
            <BaseLink to="/tv" variant="nav" className="pr-4">
              {t('TV Shows')}
            </BaseLink>
            {user && (
              <div className="flex text-lg">
                <UserMenu user={dataUser} logout={logout} translate={t} />
              </div>
            )}
            {!user && (
              <BaseLink to="/login" variant="nav">
                {t('Login')}
              </BaseLink>
            )}
          </div>

          <div className="md:hidden relative z-50" ref={mobileMenuRef}>
            <button
              type="button"
              aria-label={t('Open menu')}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="relative z-50 p-2 rounded-md bg-gray-900/80 md:hover:text-gray-400 text-purpleNR focus:outline-none"
            >
              {hasUnread && !mobileMenuOpen && (
                <span className="flex h-2 w-2 absolute top-1 right-1 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                </span>
              )}
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-50 z-50 py-2 text-left">
                <BaseLink
                  to="/"
                  variant="nav"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  {t('Home')}
                </BaseLink>
                <BaseLink
                  to="/movie"
                  variant="nav"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  {t('Movies')}
                </BaseLink>
                <BaseLink
                  to="/tv"
                  variant="nav"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  {t('TV Shows')}
                </BaseLink>

                <div className="my-2 border-t border-gray-700" />

                {user ? (
                  <>
                    <div className="flex items-center px-4 py-2">
                      {dataUser?.avatarURL && (
                        <img
                          className="h-8 w-8 rounded-full object-cover mr-2"
                          src={dataUser.avatarURL}
                          alt={t('Avatar')}
                        />
                      )}
                      <span className="text-grayNR text-sm truncate">
                        {dataUser?.username || dataUser?.name || ''}
                      </span>
                    </div>
                    <BaseLink
                      to="/me"
                      variant="nav"
                      className="block px-4 py-2 hover:bg-gray-700"
                      onClick={closeMobileMenu}
                    >
                      {t('Profile')}
                    </BaseLink>

                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-grayNR hover:bg-gray-700 text-base flex items-center justify-between"
                      onClick={() => {
                        setShowMobileNotifications(true);
                        closeMobileMenu();
                      }}
                    >
                      <span>{t('Notifications')}</span>
                      {hasUnread && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                        </span>
                      )}
                    </button>

                    <BaseLink
                      to={`/playlists/${dataUser?.id || user.id}`}
                      variant="nav"
                      className="block px-4 py-2 hover:bg-gray-700"
                      onClick={closeMobileMenu}
                    >
                      {t('Playlists')}
                    </BaseLink>
                    <BaseLink
                      to="/forums"
                      variant="nav"
                      className="block px-4 py-2 hover:bg-gray-700"
                      onClick={closeMobileMenu}
                    >
                      {t('Forums')}
                    </BaseLink>

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-grayNR hover:bg-gray-700 text-xs md:text-base"
                    >
                      {t('Sign out')}
                    </button>
                  </>
                ) : (
                  <BaseLink
                    to="/login"
                    variant="nav"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={closeMobileMenu}
                  >
                    {t('Login')}
                  </BaseLink>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
      <BaseModal
        visible={showMobileNotifications}
        onClose={() => {
          setShowMobileNotifications(false);
          if (notifRead) {
            patchNotifications({ notificationsRead: false });
            setNotifRead(false);
          }
        }}
        title={t('Notifications')}
        className="bg-gray-800 text-gray-200 w-[90vw] max-w-sm"
      >
        <div className="px-4 pb-4">
          {mobileNotifications.length > 0 ? (
            mobileNotifications
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
                          onClick={() => handleMobileConfirm(n.UserIDFollower)}
                        >
                          {t('Confirm')}
                        </button>
                        <button
                          type="button"
                          className="bg-red-100 hover:bg-red-300 px-2 py-1 rounded-md transition duration-200 text-gray-800 text-xs"
                          onClick={() => handleMobileDelete(n.UserIDFollower)}
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

      <BaseModal
        visible={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        fullscreen
        className="bg-[#20283E] text-gray-200 md:!w-[calc(100vw-1rem)] md:!h-[calc(100vh-5rem)] md:!rounded-xl"
        overlayClassName="md:!items-start md:!pt-20"
      >
        <div className="px-2 md:px-6 pt-2 pb-4 flex flex-col items-stretch">
          <SearchLayout
            hiden={!searchModalOpen}
            fullWidth
            onSelect={() => setSearchModalOpen(false)}
          />
        </div>
      </BaseModal>
      <Outlet />
    </>
  );
};

export default NavBar;
