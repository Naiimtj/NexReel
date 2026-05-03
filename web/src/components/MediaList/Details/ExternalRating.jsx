import PropTypes from 'prop-types';

function ExternalRating({ icon, alt, value, iconClassName }) {
  if (!value || value <= 0) return null;
  return (
    <div className="mb-1">
      <img className={iconClassName} src={icon} alt={alt} />
      <div className="inline-block text-amber-400 text-xs text-left pl-2">
        {value}
      </div>
    </div>
  );
}

ExternalRating.propTypes = {
  icon: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  value: PropTypes.number,
  iconClassName: PropTypes.string,
};

ExternalRating.defaultProps = {
  iconClassName: 'inline-block pr-1 w-10',
  value: null,
};

export default ExternalRating;
