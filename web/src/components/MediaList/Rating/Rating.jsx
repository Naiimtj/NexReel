import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { BiCaretDown, BiCaretUp } from 'react-icons/bi';
import {
  EmptyStar,
  RightHalfStar,
  LeftHalfStar,
  HoverNoStar,
  HoverRightHalfStar,
  HoverLeftHalfStar,
} from '../../../assets/image';
import { patchMedia, postMedia } from '../../../../services/DB/services-db';
import './Rating.css';

const Rating = ({
  dataMediaUser,
  setPendingSeen,
  pendingSeen,
  mediaId,
  media_type,
  runtime,
}) => {
  const { t } = useTranslation('translation');
  const { vote } = dataMediaUser;
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);
  const [dropDownRating, setdropDownRating] = useState(false);
  const [hover0, setHover0] = useState(null);
  const containerRef = useRef(null);

  // Close the rating selector when clicking outside of it
  useEffect(() => {
    if (!dropDownRating) return undefined;
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setdropDownRating(false);
        setHover(null);
        setHover0(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropDownRating]);

  // Reset Rating when media changes
  useEffect(() => {
    setRating(null);
  }, [mediaId]);

  // Sync local rating from incoming vote, but only when it's a valid number.
  // Avoids wiping the user's selection while the parent is refetching and
  // dataMediaUser temporarily lacks `vote`.
  useEffect(() => {
    if (typeof vote === 'number' && vote >= 0) {
      setRating(vote);
    }
  }, [vote]);

  const persistVote = (value) => {
    const hasRecord =
      Object.keys(dataMediaUser).length > 0 && vote !== undefined;
    if (hasRecord) {
      patchMedia(mediaId, media_type, { seen: true, vote: value }).then(() => {
        setPendingSeen(!pendingSeen);
        setHover0(null);
      });
    } else {
      postMedia(media_type, {
        mediaId,
        media_type,
        runtime,
        like: false,
        pending: false,
        seen: true,
        vote: value,
      }).then((data) => {
        if (data) {
          setPendingSeen(!pendingSeen);
          setHover0(null);
        }
      });
    }
  };

  const handleStarClick = (value) => {
    if (value === rating) return;
    setRating(value);
    persistVote(value);
  };

  const handleRating = () => {
    setdropDownRating(!dropDownRating);
  };

  const handleRating0 = () => {
    patchMedia(mediaId, media_type, { vote: -1 }).then(() => {
      setPendingSeen(!pendingSeen);
      setRating(null);
      setHover0(null);
    });
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
            alt={isHovered ? t('Right Half Star Hover') : t('Right Half Star')}
            onMouseEnter={() => handleStarHover(ratingValue.toFixed(1))}
            onMouseLeave={() => handleStarHover(null)}
          />
        ) : (
          <img
            className="cursor-pointer object-cover h-7"
            src={isHovered ? HoverLeftHalfStar : LeftHalfStar}
            alt={isHovered ? t('Left Half Star Hover') : t('Left Half Star')}
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
        </label>,
      );
    }
    return stars;
  };

  const finalRating = rating < 0 ? null : rating;

  return (
    <div ref={containerRef}>
      {!dropDownRating ? (
        <button
          className="cursor-pointer text-left text-sm px:center text-[#FFCA28] transition ease-in-out md:hover:text-gray-200 duration-300"
          onClick={handleRating}
        >
          {finalRating ? (
            <FaStar
              className="inline-block align-middle mr-1"
              size={18}
              alt={t('Star Full')}
            />
          ) : (
            <FaRegStar
              className="inline-block align-middle mr-1"
              size={18}
              alt={t('Star Empty')}
            />
          )}
          <div className="inline-block align-middle text-sm md:text-base">
            {!finalRating ? t('Your Rating') : finalRating}
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
            <div className="inline-block align-middle text-sm md:text-base">
              {!finalRating ? t('Your Rating') : finalRating}
            </div>
            <BiCaretUp className="inline-block align-middle" size={18} />
          </button>
        </div>
      )}
      {dropDownRating && (
        <div className="flex flex-row w-full">
          <div className="flex flex-row items-center">
            {renderStars(20)}
            <div className="flex flex-row items-center gap-1 ml-2 align-middle">
              <p className="align-middle  text-amber-400">
                {(hover || finalRating) === null ? '' : hover || finalRating}
              </p>
              <div className="align-middle">
                {finalRating !== null ? (
                  <button className="align-middle" onClick={handleRating0}>
                    {hover0 !== null || !(finalRating >= 0) ? (
                      <img
                        className="cursor-pointer object-cover h-8 mt-1"
                        src={EmptyStar}
                        alt={t('Empty No Star')}
                        onMouseEnter={() => setHover0(0)}
                        onMouseLeave={() => setHover0(null)}
                      />
                    ) : (
                      <img
                        className="cursor-pointer object-cover h-8 mt-1"
                        src={HoverNoStar}
                        alt={t('Hover No Star')}
                        onMouseEnter={() => setHover0(0)}
                        onMouseLeave={() => setHover0(null)}
                      />
                    )}
                  </button>
                ) : null}
              </div>
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
  media_type: '',
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
