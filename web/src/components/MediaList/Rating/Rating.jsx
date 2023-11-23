import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { FaRegStar, FaStar } from "react-icons/fa";
import { BiCaretDown, BiCaretUp } from "react-icons/bi";
import {
  EmptyStar,
  RightHalfStar,
  LeftHalfStar,
  HoverNoStar,
  HoverRightHalfStar,
  HoverLeftHalfStar,
} from "../../../assets/image";
import { patchMedia, postMedia } from "../../../../services/DB/services-db";
import "./Rating.css";

const Rating = ({
  dataMediaUser,
  setPendingSeen,
  pendingSeen,
  mediaId,
  media_type,
  runtime,
}) => {
  const { t } = useTranslation("translation");
  const { vote } = dataMediaUser;
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);
  const [modalRating, setModalRating] = useState(false);
  const [hover0, setHover0] = useState(null);
  useEffect(() => {
    setRating(vote >= 0 ? vote : null);
  }, [vote]);
  useEffect(() => {
    if (
      Object.keys(dataMediaUser).length &&
      rating !== null &&
      rating !== vote
    ) {
      patchMedia(mediaId, { seen: true, vote: rating }).then(
        () => setPendingSeen(!pendingSeen),
        setHover0(null)
      );
    } else if (rating !== null && !vote) {
      postMedia({
        mediaId,
        media_type,
        runtime,
        like: false,
        pending: false,
        seen: true,
        vote: rating,
      }).then((data) => {
        if (data) {
          setPendingSeen(!pendingSeen);
          setHover0(null);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rating, vote]);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleRating = () => {
    setModalRating(!modalRating);
  };

  const handleRating0 = () => {
    patchMedia(mediaId, { vote: -1 }).then(
      () => setPendingSeen(!pendingSeen),
      setRating(null),
      setHover0(null)
    );
  };

  const handleStarHover = (value) => {
    setHover(value);
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const ratingValue = i / 2 + 0.5;
      const isHovered = ratingValue <= (hover || rating);

      const starComponent =
        ratingValue === Math.trunc(ratingValue + 0.4) ? (
          <img
            className="cursor-pointer object-cover h-7"
            src={isHovered ? HoverRightHalfStar : RightHalfStar}
            alt={isHovered ? t("Right Half Star Hover") : t("Right Half Star")}
            onMouseEnter={() => handleStarHover(ratingValue.toFixed(1))}
            onMouseLeave={() => handleStarHover(null)}
          />
        ) : (
          <img
            className="cursor-pointer object-cover h-7"
            src={isHovered ? HoverLeftHalfStar : LeftHalfStar}
            alt={isHovered ? t("Left Half Star Hover") : t("Left Half Star")}
            onMouseEnter={() => handleStarHover(ratingValue.toFixed(1))}
            onMouseLeave={() => handleStarHover(null)}
          />
        );

      stars.push(
        <label className="inline-block align-middle mt-1" key={i}>
          <input
            type="radio"
            name="rating"
            value={ratingValue.toFixed(1)}
            onClick={() => handleStarClick(Number(ratingValue.toFixed(1)))}
          />
          {starComponent}
        </label>
      );
    }
    return stars;
  };
  const finalRating = rating < 0 ? null : rating;

  return (
    <div>
      {!modalRating ? (
        <button
          className="pt-2 cursor-pointer text-left text-sm px:center text-[#FFCA28] transition ease-in-out md:hover:text-gray-200 duration-300"
          onClick={handleRating}
        >
          {finalRating ? (
            <FaStar
              className="inline-block align-middle mr-1"
              size={18}
              alt={t("Star Full")}
            />
          ) : (
            <FaRegStar
              className="inline-block align-middle mr-1"
              size={18}
              alt={t("Star Empty")}
            />
          )}
          <div className="inline-block align-middle text-base">
            {!finalRating ? t("Your Rating") : finalRating}
          </div>
          <BiCaretDown className="inline-block align-middle" size={18} />
        </button>
      ) : (
        <div>
          <button
            className="pt-2 cursor-pointer text-left text-sm px:center text-[#FFCA28] transition ease-in-out md:hover:text-gray-200 duration-300"
            onClick={handleRating}
          >
            <FaRegStar className="inline-block align-middle mr-1" size={18} />
            <div className="inline-block align-middle text-base">
              {!finalRating ? t("Your Rating") : finalRating}
            </div>
            <BiCaretUp className="inline-block align-middle" size={18} />
          </button>
        </div>
      )}
      {modalRating && (
        <div className="flex flex-row">
          <div className="basis-10/12">
            {renderStars(20)}
            <p className="inline-block align-middle ml-2 text-amber-400">
              {(hover || finalRating) === null ? "" : hover || finalRating}
            </p>
            <div className="inline-block align-middle">
              {finalRating !== null ? (
                <button
                  className="inline-block align-middle"
                  onClick={handleRating0}
                >
                  {hover0 !== null || !(finalRating >= 0) ? (
                    <img
                      className="cursor-pointer object-cover h-8 mt-1"
                      src={EmptyStar}
                      alt={t("Empty No Star")}
                      onMouseEnter={() => setHover0(0)}
                      onMouseLeave={() => setHover0(null)}
                    />
                  ) : (
                    <img
                      className="cursor-pointer object-cover h-8 mt-1"
                      src={HoverNoStar}
                      alt={t("Hover No Star")}
                      onMouseEnter={() => setHover0(0)}
                      onMouseLeave={() => setHover0(null)}
                    />
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rating;
Rating.defaultProps = {
  dataMediaUser: {},
  setPendingSeen: () => {},
  pendingSeen: false,
  mediaId: 0,
  media_type: "",
  runtime: 0,
};
Rating.propTypes = {
  dataMediaUser: PropTypes.object,
  setPendingSeen: PropTypes.func,
  pendingSeen: PropTypes.bool,
  mediaId: PropTypes.number,
  media_type: PropTypes.string,
  runtime: PropTypes.number,
};
