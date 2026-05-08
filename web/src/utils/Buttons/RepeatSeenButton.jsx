import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { BaseIcon } from '../../components/base';

const RepeatSeenButton = ({
  condition = false,
  handle = () => {},
  className = '',
}) => {
  const [t] = useTranslation('translation');
  const iconName = condition ? 'repeatSeenActive' : 'repeatSeenInactive';
  const label = condition ? t('No Repeat') : t('Repeat');

  return (
    <BaseIcon
      icon={iconName}
      color="#FFCA28"
      className={`inline-block transition ease-in-out md:hover:scale-110 duration-300 ${className} md:size-7 size-8 max-xs:size-7 leading-none`}
      aria-label={label}
      onClick={handle}
      tooltip={label}
    />
  );
};

RepeatSeenButton.propTypes = {
  condition: PropTypes.bool,
  handle: PropTypes.func,
  className: PropTypes.string,
};

export default RepeatSeenButton;
