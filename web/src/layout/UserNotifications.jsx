import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  deleteFollower,
  postConfirmFollow,
} from "../../services/DB/services-db";
import { useAuthContext } from "../context/auth-context";
// import { Link } from "react-router-dom";

const UserNotifications = ({
  notifications,
  hasUnreadNotifications,
  toggleDropdown,
  showDropdown,
  changeNotifications,
  setChangeNotifications,
}) => {
  const { onReload } = useAuthContext();
  const [t] = useTranslation("translation");
  const [error, setError] = useState("");

  const handleConfirmFollow = async (id) => {
    try {
      const confirm = postConfirmFollow(id);
      if (confirm) {
        setChangeNotifications(!changeNotifications), onReload();
      }
    } catch (error) {
      console.error("Sing Up Bad Request", error);
      setError(error);
    }
  };

  const handleDeleteFollow = (id) => {
    try {
      deleteFollower(id).then(() =>
        setChangeNotifications(!changeNotifications)
      );
    } catch (error) {
      console.error("Sing Up Bad Request", error);
      setError(error);
    }
  };
  return (
    <div className="relative">
      {notifications.length > 0 && hasUnreadNotifications ? (
        <div
          className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 w-full text-left"
          onClick={toggleDropdown}
        >
          <div>{t("Notifications")}</div>
          <span className="flex h-2 w-2 absolute top-0 right-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
          </span>
        </div>
      ) : (
        <div
          className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 w-full text-left"
          onClick={toggleDropdown}
        >
          <div>{t("Notifications")}</div>
        </div>
      )}

      {showDropdown && (
        <div className="absolute text-sm right-0 bg-white border rounded shadow-lg p-1 w-[350px]">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <p className="font-semibold mr-1 capitalize">
                    {notification.username}
                  </p>
                  <p className="text-xs">{t("wants to follow")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="hover:bg-purpleNR bg-purple-200 px-1 rounded-md transition duration-200"
                    onClick={() => handleConfirmFollow(notification.id)}
                  >
                    {t("Confirm")}
                  </button>
                  <div
                    className="cursor-pointer bg-red-100 hover:bg-red-300 px-1 rounded-md transition duration-200"
                    onClick={() => handleDeleteFollow(notification.id)}
                  >
                    {t("Delete")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">{t("No notifications")}</div>
          )}
          {/* <div className="flex justify-center items-center gap-1 border-t">
            <Link
              to={`/me/notifications`}
              className="text-purpleNR hover:text-gray-600 px-1 rounded-md transition duration-200 "
              onClick={() => handleConfirmFollow()}
            >
              {t("See all")}
            </Link>
          </div> */}
        </div>
      )}
      {error !== "" && (
        <div className="absolute w-full">
          <div className="my-2 text-red-600 font-bold rounded-md">{error}</div>
        </div>
      )}
    </div>
  );
};

export default UserNotifications;

UserNotifications.defaultProps = {
  notifications: [],
  hasUnreadNotifications: false,
  toggleDropdown: () => {},
  showDropdown: false,
  changeNotifications: false,
  setChangeNotifications: () => {},
};

UserNotifications.propTypes = {
  notifications: PropTypes.array,
  hasUnreadNotifications: PropTypes.bool,
  toggleDropdown: PropTypes.func,
  showDropdown: PropTypes.bool,
  changeNotifications: PropTypes.bool,
  setChangeNotifications: PropTypes.func,
};
