import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Logo from "/img/logo.svg";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../context/auth-context";
import { getInfoUser, logoutDB } from "../../services/DB/services-db";
import UserMenu from "./UserMenu";
import SearchLayout from "./SearchLayout";

const NavBar = () => {
  const location = useLocation();
  const [t] = useTranslation("translation");
  const currentURL = location.pathname;
  const { user, onLogout } = useAuthContext();
  const [dataUser, setDataUser] = useState({});
  const [hiden, setHiden] = useState(false);
  const searchRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setHiden(true);
        setTimeout(() => {
          setHiden(false);
        }, 500);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  function logout() {
    logoutDB().then(() => {
      onLogout();
    });
  }
  const handleHiden = () => {
    setHiden(true);
    setTimeout(() => {
      setHiden(false);
    }, 500);
  };

  useEffect(() => {
    if (user && user.id) {
      getInfoUser(user.id)
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    }
  }, [user]);

  return (
    <>
      <div className="grid grid-cols-5 justify-between items-center relative">
        {/* // - LOGO */}
        <>
          <Link to="/" className="flex justify-center items-center">
            <>
              <img
                className="h-5 md:h-7 lg:h-10 inline-block"
                src={Logo}
                alt="NaiPlex Logo"
              />
              <h1 className="text-gray-50 font-bold text-xs md:text-base lg:text-4xl ml-2 inline-block align-middle">
                NexReel
              </h1>
            </>
          </Link>
        </>
        {/* // ! SEARCH */}
        <div className="col-start-3" ref={searchRef}>
          <SearchLayout hiden={hiden}/>
        </div>
        <div className="col-span-2 flex justify-end items-center">
          <nav className="text-right">
            <Link
              className={`${
                currentURL === "/" ? "text-purpleNR font-bold" : "text-grayNR"
              } text-xs md:text-base lg:text-xl pr-4 hover:text-gray-300 transition duration-300`}
              to="/"
            >
              {t("Home")}
            </Link>
            <Link
              className={`${
                currentURL === "/movie"
                  ? "text-purpleNR font-bold"
                  : "text-grayNR"
              } text-xs md:text-base lg:text-xl pr-4 hover:text-gray-300 `}
              to="/movie"
            >
              {t("Movies")}
            </Link>
            <Link
              className={`${
                currentURL === "/tv" ? "text-purpleNR font-bold" : "text-grayNR"
              } text-xs md:text-base lg:text-xl pr-4 hover:text-gray-300 `}
              to="/tv"
            >
              {t("TV Shows")}
            </Link>
            {/* // - LOGIN / AVATAR */}
            <div className="inline-block">
              {user && (
                <div className="flex text-lg">
                  <UserMenu user={dataUser} logout={logout} translate={t} />
                </div>
              )}
            </div>
            {!user && (
              <Link
                className={`${
                  currentURL === "/login"
                    ? "text-purpleNR font-bold"
                    : "text-grayNR"
                } text-xs md:text-base lg:text-xl hover:text-gray-300 `}
                to="/login"
              >
                {t("Login")}
              </Link>
            )}
          </nav>
        </div>
      </div>
      <div className="z-49" onClick={handleHiden}>
        <Outlet />
      </div>
    </>
  );
};

export default NavBar;
