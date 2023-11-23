import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import SeasonList from "./SeasonList";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

export const Seasons = ({ info, idSerie, dataUser, runTime }) => {
  const [t] = useTranslation("translation");
  // - SEASONS
  const [modalMoreSeasons, setModalMoreSeasons] = useState(false);
  const handleDownShow = () => {
    setModalMoreSeasons(true);
  };
  const handelUpHidden = () => {
    setModalMoreSeasons(false);
  };

  const getCardsPerPage = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 750) return 6;
    if (screenWidth < 1000) return 8;
    if (screenWidth < 1280) return 12;
    if (screenWidth <= 1440) return 14;
    return 16;
  };
  const cardsPerPage = getCardsPerPage();
  const size = cardsPerPage;
  const items = info && info.slice(0, size);

  return (
    <div className="text-gray-200 px-4">
      {info && info.length > 0 ? (
        <div className="flex gap-1 text-xl">
          {t("SEASONS")}
          <p className="text-xs">{`(${info.length})`}</p>
        </div>
      ) : null}
      <>
        {info && info.length > 0 ? (
          info.length > cardsPerPage ? (
            <>
              {/* // - SEASONS */}
              {info &&
                (modalMoreSeasons === false ? (
                  <>
                    <div className="text-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1 p-2 md:pt-4 md:px-4">
                      {items &&
                        items.map((season, key) => {
                          return (
                            <SeasonList
                              season={season}
                              key={key}
                              idSerie={idSerie}
                              dataUser={dataUser}
                              runTime={runTime}
                            />
                          );
                        })}
                    </div>
                    {items && (
                      <button
                        className="w-full flex justify-center cursor-pointer text-[#b1a9fa] transition ease-in-out md:hover:text-gray-200 duration-100"
                        onClick={handleDownShow}
                      >
                        <IoIosArrowDown className="" size={60} />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-gray-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-2 md:pt-4 md:px-4">
                      {info &&
                        info.map((season, key) => {
                          return (
                            <SeasonList
                              season={season}
                              key={key}
                              idSerie={idSerie}
                              dataUser={dataUser}
                              runTime={runTime}
                            />
                          );
                        })}
                    </div>
                    {info && (
                      <button
                        className="w-full flex justify-center cursor-pointer text-[#b1a9fa] transition ease-in-out md:hover:text-gray-200 duration-100"
                        onClick={handelUpHidden}
                      >
                        <IoIosArrowUp className="" size={60} />
                      </button>
                    )}
                  </>
                ))}
            </>
          ) : (
            <div className="my-5 text-gray-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-2 md:pt-4 md:px-4">
              {info &&
                info.map((season, key) => {
                  return (
                    <SeasonList
                      season={season}
                      key={key}
                      idSerie={idSerie}
                      dataUser={dataUser}
                      runTime={runTime}
                    />
                  );
                })}
            </div>
          )
        ) : null}
      </>
    </div>
  );
};

export default Seasons;

Seasons.defaultProps = {
  info: [],
  idSerie: 0,
  dataUser: {},
  runTime: 0,
};

Seasons.propTypes = {
  info: PropTypes.array,
  idSerie: PropTypes.number,
  dataUser: PropTypes.object,
  runTime: PropTypes.number,
};
