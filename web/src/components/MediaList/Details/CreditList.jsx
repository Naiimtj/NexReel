import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Renders a labeled list of credits (people or companies).
 * Optionally clickable (navigates to /person/:id) and with a "more..."
 * link to the credits page when totalCount exceeds the displayed items.
 */
function CreditList({
  label,
  items,
  totalCount,
  linkable,
  mediaType,
  mediaId,
  containerClassName,
}) {
  const navigate = useNavigate();
  const [t] = useTranslation('translation');

  if (!items || items.length === 0) return null;

  const MOBILE_LIMIT = 1;
  const showMoreDesktop = (totalCount ?? items.length) > items.length;
  const hasHiddenOnMobile = items.length > MOBILE_LIMIT;
  const showMoreButton = showMoreDesktop || hasHiddenOnMobile;
  // If we only need "more..." for the mobile overflow, hide the button on
  // desktop (where everything is already visible).
  const moreVisibilityClass = showMoreDesktop ? '' : 'md:hidden';

  const renderItem = (item, index) => {
    const isLastOverall = index === items.length - 1;
    const isMobileBoundary = index === MOBILE_LIMIT - 1;
    const itemVisibilityClass =
      index >= MOBILE_LIMIT ? 'hidden md:inline' : 'inline';
    // Separator after this item, with a class controlling on which breakpoints
    // it should appear so the comma never trails an invisible neighbor.
    let separator = null;
    if (!isLastOverall) {
      const sepClass =
        isMobileBoundary && hasHiddenOnMobile ? 'hidden md:inline' : 'inline';
      separator = <span className={sepClass}>, </span>;
    }
    if (linkable) {
      return (
        <span key={`${item.id}-${index}`} className={itemVisibilityClass}>
          <button
            type="button"
            className="cursor-pointer text-purpleNR md:hover:text-gray-400"
            onClick={() => navigate(`/person/${item.id}`)}
          >
            {item.name}
          </button>
          {separator}
        </span>
      );
    }
    return (
      <span
        key={`${item.id ?? item.name}-${index}`}
        className={itemVisibilityClass}
      >
        {item.name}
        {separator}
      </span>
    );
  };

  return (
    <div className={containerClassName}>
      <div className="inline-block font-medium text-gray-400 mr-1 text-xs">{`${label}:`}</div>
      <div className="inline-block text-grayNR">
        {items.map(renderItem)}
        {showMoreButton && mediaType && mediaId ? (
          <span className={moreVisibilityClass}>
            <span>, </span>
            <button
              type="button"
              className="transition ease-in-out text-purpleNR md:hover:text-gray-400 duration-300 cursor-pointer"
              onClick={() => navigate(`/${mediaType}/${mediaId}/credits`)}
            >
              {t('more...')}
            </button>
          </span>
        ) : null}
      </div>
    </div>
  );
}

CreditList.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.array,
  totalCount: PropTypes.number,
  linkable: PropTypes.bool,
  mediaType: PropTypes.string,
  mediaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  containerClassName: PropTypes.string,
};

CreditList.defaultProps = {
  items: [],
  totalCount: null,
  linkable: true,
  mediaType: '',
  mediaId: '',
  containerClassName: 'flex flex-row text-sm items-center',
};

export default CreditList;
