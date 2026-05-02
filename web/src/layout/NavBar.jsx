import { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BaseLink from '../components/base/BaseLink';
import Logo from '/img/logo.svg';
import { useAuthContext } from '../context/auth-context';
import { getInfoUser, logoutDB } from '../../services/DB/services-db';
import UserMenu from './UserMenu';
import SearchLayout from './SearchLayout';

const NavBar = () => {
  const [t] = useTranslation('translation');
  const { user, onLogout } = useAuthContext();
  const [dataUser, setDataUser] = useState({});
  const [hiden, setHiden] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setHiden(true);
        setTimeout(() => setHiden(false), 500);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.id) {
      getInfoUser(user.id)
        .then(setDataUser)
        .catch((err) => err);
    }
  }, [user]);

  const logout = () => logoutDB().then(onLogout);

  const handleHiden = () => {
    setHiden(true);
    setTimeout(() => setHiden(false), 500);
  };

  return (
    <>
      <div className="grid grid-cols-5 justify-between items-center relative">
        <Link to="/" className="flex justify-center items-center">
          <img
            className="h-5 md:h-7 lg:h-10 inline-block"
            src={Logo}
            alt="NaiPlex Logo"
          />
          <h1 className="text-gray-50 font-bold text-xs md:text-base lg:text-4xl ml-2 inline-block align-middle">
            NexReel
          </h1>
        </Link>

        <div className="col-start-3 h-full" ref={searchRef}>
          <SearchLayout hiden={hiden} />
        </div>

        <nav className="text-right col-span-2 flex justify-end items-center">
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
            <div className="inline-block flex text-lg">
              <UserMenu user={dataUser} logout={logout} translate={t} />
            </div>
          )}
          {!user && (
            <BaseLink to="/login" variant="nav">
              {t('Login')}
            </BaseLink>
          )}
        </nav>
      </div>
      <div className="z-49" onClick={handleHiden}>
        <Outlet />
      </div>
    </>
  );
};

export default NavBar;
