import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { BaseIcon } from '../../components/base';

const RepeatSeenButton = ({
  condition = false,
  size = 24,
  handle = () => {},
}) => {
  const [t] = useTranslation('translation');
  const iconName = condition ? 'repeatSeenActive' : 'repeatSeenInactive';
  const label = condition ? t('No Repeat') : t('Repeat');

  return (
    <BaseIcon
      icon={iconName}
      size={size}
      color="#FFCA28"
      className="inline-block transition ease-in-out md:hover:scale-110 duration-300"
      aria-label={label}
      onClick={handle}
      tooltip={label}
    />
  );
};

RepeatSeenButton.propTypes = {
  condition: PropTypes.bool,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handle: PropTypes.func,
};

export default RepeatSeenButton;
