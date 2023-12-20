import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { getUser, postPlaylistMedia } from "../../../services/DB/services-db";
import { IoIosRemove, IoMdAdd } from "react-icons/io";

const ShowPlaylistMenu = ({ userId, id, type, runTime }) => {
  const [t] = useTranslation("translation");
  const [playlistsChange, setPlaylistsChange] = useState(false);
  const [playlistsList, setPlaylistsList] = useState(false);
  const [dataUser, setDataUser] = useState({});
  useEffect(() => {
    const Data = async () => {
      getUser()
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    };
    Data();
  }, [playlistsChange, id, userId]);

  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  const handleAddPlaylist = async (playlistId) => {
    try {
      await postPlaylistMedia(playlistId, {
        mediaId: `${id}`,
        media_type: type,
        runtime: runTime,
      }).then(
        () => setPlaylistsChange(!playlistsChange),
        setPlaylistsList(false)
      );
    } catch (error) {
      if (error) {
        const { message } = error.response?.data || {};
        setErrorAddPlaylists(message);
      }
    }
  };

  const [isTimeout, setIsTimeout] = useState(true);
  useEffect(() => {
    let timerId;

    if (isTimeout && errorAddPlaylists) {
      timerId = window.setTimeout(() => {
        setIsTimeout(false);
        setErrorAddPlaylists(false);
      }, 3000);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId); // Clean the timer
      }
    };
  }, [isTimeout, errorAddPlaylists]);

  return (
    <div className="relative text-base align-middle col-span-3 ">
      <button
        className={`cursor-pointer text-left font-semibold px:center ${
          !playlistsList ? "text-[#7B6EF6]" : "text-gray-600"
        } transition ease-in-out md:hover:scale-105 duration-300`}
        onClick={(event) => {
          event.stopPropagation(), setPlaylistsList(!playlistsList);
        }}
      >
        {!playlistsList ? (
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
        {t("Playlists")}
      </button>
      {playlistsList ? (
        <div className="absolute flex flex-col text-base bg-grayNR/60 rounded-md md:w-[200px] w-[150px]">
          {errorAddPlaylists ? (
            <div className="text-white bg-gray-50/20 px-1 font-bold">
              {t(errorAddPlaylists)}
            </div>
          ) : null}
          {dataUser &&
            dataUser.playlists.map((i, index) => {
              const roundedTopItem = index === 0 ? "rounded-t-md" : null;
              const roundedBottomItem =
                dataUser.playlists && dataUser.playlists.length === index + 1
                  ? "rounded-b-md"
                  : null;
              const isInPlaylist =
                i &&
                i.medias &&
                i.medias.some((media) => Number(media.mediaId) === id);
              return (
                <div
                  key={i.id}
                  className={`hover:bg-gray-50 px-1 ${
                    dataUser.playlists && dataUser.playlists.length === 1
                      ? "rounded-md"
                      : null
                  } ${roundedTopItem} ${roundedBottomItem} cursor-pointer transition duration-200`}
                  onClick={(event) => {
                    event.stopPropagation(),
                      isInPlaylist ? null : handleAddPlaylist(i.id);
                  }}
                >
                  <div
                    className={
                      isInPlaylist
                        ? "text-green-700 text-left"
                        : "text-black text-left"
                    }
                  >
                    {isInPlaylist ? `✓ ${i.title}` : `· ${i.title}`}
                  </div>
                </div>
              );
            })}
        </div>
      ) : null}
    </div>
  );
};

export default ShowPlaylistMenu;

ShowPlaylistMenu.defaultProps = {
  userId: "",
  id: Number,
  type: "",
  runTime: 0,
};

ShowPlaylistMenu.propTypes = {
  userId: PropTypes.string,
  id: PropTypes.number,
  type: PropTypes.string,
  runTime: PropTypes.number,
};
