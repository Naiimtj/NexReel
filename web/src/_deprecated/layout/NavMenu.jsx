import { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import UserNotifications from "./UserNotifications";
import { useTranslation } from "react-i18next";
import { FaBars } from "react-icons/fa";

const NavMenu = ({ user, logout, translate }) => {
  const navegate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const menuButtonRef = useRef(null);
  // Agregar un manejador de eventos para cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        setShowDropdown(false);
      }
    };
    // Agregar el manejador de eventos al documento
    document.addEventListener("click", handleClickOutside);
    // Limpiar el manejador de eventos al desmontar el componente
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuButtonRef]);
  const userNavigation = [
    {
      name: translate("Notifications"),
      onclick: () => {
        navegate("/notifications"), setMenuOpen(!menuOpen);
      },
    },
    {
      name: translate("Forums"),
      onclick: () => {
        navegate("/forums"), setMenuOpen(!menuOpen);
      },
    },
    {
      name: translate("Your Profile"),
      onclick: () => {
        navegate("/me"), setMenuOpen(!menuOpen);
      },
    },
    { name: translate("Sign out"), onclick: logout },
  ];
  const [t] = useTranslation("translation");
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div>
      <div className="ml-2 flex items-center md:ml-2">
        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <>
            <div>
              <Menu.Button
                className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none hover:scale-105"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <FaBars />
              </Menu.Button>
            </div>
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
                  <Menu.Item key={item.name}>
                    {() =>
                      item.name !== t("Notifications") ? (
                        <div
                          className={
                            item.name === t("Sign out") ? "border-t " : ""
                          }
                        >
                          <button
                            onClick={item.onclick}
                            className="hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 cursor-pointer w-full text-right"
                          >
                            {item.name}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <UserNotifications
                            notifications={notifications}
                            hasUnreadNotifications={user.notificationsRead}
                            toggleDropdown={toggleDropdown}
                            showDropdown={showDropdown}
                            changeNotifications={changeNotifications}
                            setChangeNotifications={setChangeNotifications}
                          />
                        </div>
                      )
                    }
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </>
        </Menu>
      </div>
    </div>
  );
};

export default NavMenu;

NavMenu.defaultProps = {
  user: {},
  logout: () => {},
  translate: () => {},
};

NavMenu.propTypes = {
  user: PropTypes.object,
  logout: PropTypes.func,
  translate: PropTypes.func,
};
