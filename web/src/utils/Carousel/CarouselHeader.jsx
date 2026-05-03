import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { BaseIcon } from '../../components/base';

/**
 * Shared header for the Carousel family: title, optional count, and
 * prev/next navigation arrows. Arrow icons go through BaseIcon (per the
 * project-wide icon rule) and receive translated tooltips.
 */
const CarouselHeader = ({
  title,
  count,
  showCount,
  showNav,
  canPrev,
  canNext,
  onPrev,
  onNext,
  titleClassName,
}) => {
  const [t] = useTranslation('translation');

  const baseArrowClass =
    'transition ease-in-out md:hover:scale-110 duration-300';
  const enabledArrowClass = `text-[#6676a7] md:hover:text-gray-200 ${baseArrowClass}`;
  const disabledArrowClass = 'text-gray-700';

  return (
    <div className="flex justify-between items-center">
      <div className="flex text-gray-200">
        <h1 className={titleClassName}>{title}</h1>
        {showCount && title ? (
          <p className="ml-1 text-xs">{`( ${count} )`}</p>
        ) : null}
      </div>
      {showNav ? (
        <div className="flex">
          <div className="align-middle">
            <BaseIcon
              icon="arrowLeft"
              size="large"
              onClick={canPrev ? onPrev : undefined}
              tooltip={t('Previous')}
              className={canPrev ? enabledArrowClass : disabledArrowClass}
            />
          </div>
          <div className="align-middle">
            <BaseIcon
              icon="arrowRight"
              size="large"
              onClick={canNext ? onNext : undefined}
              tooltip={t('Next')}
              className={canNext ? enabledArrowClass : disabledArrowClass}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

CarouselHeader.defaultProps = {
  title: '',
  count: 0,
  showCount: false,
  showNav: false,
  canPrev: false,
  canNext: false,
  onPrev: () => {},
  onNext: () => {},
  titleClassName: 'pl-4 text-sm md:text-2xl uppercase',
};

CarouselHeader.propTypes = {
  title: PropTypes.string,
  count: PropTypes.number,
  showCount: PropTypes.bool,
  showNav: PropTypes.bool,
  canPrev: PropTypes.bool,
  canNext: PropTypes.bool,
  onPrev: PropTypes.func,
  onNext: PropTypes.func,
  titleClassName: PropTypes.string,
};

export default CarouselHeader;
