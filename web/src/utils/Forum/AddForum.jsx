import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { IoIosRemove, IoMdAdd } from "react-icons/io";
import {
  deleteForumsMedia,
  postForumsMedia,
} from "../../../services/DB/services-db";

const AddForum = ({
  id,
  runTime,
  type,
  basicForum,
  changeSeenPending,
  setChangeSeenPending,
}) => {
  const [t] = useTranslation("translation");
  const [errorAddForums, setErrorAddForums] = useState(false);
  const isInForum =
    basicForum &&
    basicForum.medias.some((media) => Number(media.mediaId) === id);
  const handleAddForum = async (forumId) => {
    try {
      await postForumsMedia(basicForum.id, {
        mediaId: `${forumId}`,
        media_type: type,
        runtime: runTime,
      }).then(() => setChangeSeenPending(!changeSeenPending));
    } catch (error) {
      if (error) {
        const { message } = error.response?.data || {};
        setErrorAddForums(message);
      }
    }
  };

  const handleRemoveForum = async (forumId) => {
    try {
      await deleteForumsMedia(basicForum.id, {
        mediaIdDelete: `${forumId}`,
      }).then(() => setChangeSeenPending(!changeSeenPending));
    } catch (error) {
      if (error) {
        const { message } = error.response?.data || {};
        setErrorAddForums(message);
      }
    }
  };

  const [isTimeout, setIsTimeout] = useState(true);
  useEffect(() => {
    let timerId;

    if (isTimeout && errorAddForums) {
      timerId = window.setTimeout(() => {
        setIsTimeout(false);
        setErrorAddForums(false);
      }, 3000);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId); // Clean the timer
      }
    };
  }, [isTimeout, errorAddForums]);
  return (
    <div className="relative text-base align-middle col-span-3 ">
      <button
        className={`cursor-pointer text-left font-semibold px:center ${
          !isInForum ? "text-[#7B6EF6]" : "text-red-400"
        } transition ease-in-out md:hover:scale-105 duration-300`}
        onClick={(event) => {
          event.stopPropagation(),
            !isInForum ? handleAddForum(id) : handleRemoveForum(id);
        }}
      >
        {!isInForum ? (
          <IoMdAdd
            className="inline-block"
            size={20}
            alt={t("Add to one list")}
          />
        ) : (
          <IoIosRemove
            className="inline-block"
            size={20}
            alt={t("Add to one list")}
          />
        )}
        {t("Forum")}
      </button>
      {!isInForum ? (
        <div className="absolute flex flex-col text-base bg-grayNR/60 rounded-md md:w-[200px] w-[150px]">
          {errorAddForums ? (
            <div className="text-white bg-gray-50/20 px-1 font-bold">
              {t(errorAddForums)}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="absolute flex flex-col text-base bg-grayNR/60 rounded-md md:w-[200px] w-[150px]">
          {errorAddForums ? (
            <div className="text-white bg-gray-50/20 px-1 font-bold">
              {t(errorAddForums)}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AddForum;

AddForum.defaultProps = {
  id: 0,
  runTime: 0,
  type: "",
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  basicForum: {},
  isForum: false,
};

AddForum.propTypes = {
  id: PropTypes.number,
  runTime: PropTypes.number,
  type: PropTypes.string,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  basicForum: PropTypes.object,
  isForum: PropTypes.bool,
};
