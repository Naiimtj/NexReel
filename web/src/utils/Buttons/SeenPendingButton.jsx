import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { BaseIcon } from '../../components/base';

const ICONS = {
  Pending: { active: 'alarmOutline', inactive: 'alarmFill' },
  Seen: {
    active: 'checkmarkCircleOutline',
    inactive: 'checkmarkCircleFill',
  },
};

const SeenPendingButton = ({
  condition = false,
  text = '',
  handle = () => {},
  className = '',
}) => {
  const [t] = useTranslation('translation');
  const pair = ICONS[text];
  if (!pair) return null;

  const iconName = condition ? pair.inactive : pair.active;
  const label = condition ? t(`No ${text}`) : t(text);

  return (
    <BaseIcon
      icon={iconName}
      color="#FFCA28"
      className={`inline-block transition ease-in-out md:hover:scale-110 duration-300 ${className} md:size-6 size-7 max-xs:size-6`}
      aria-label={label}
      onClick={handle}
      tooltip={label}
    />
  );
};

SeenPendingButton.propTypes = {
  condition: PropTypes.bool,
  text: PropTypes.string,
  handle: PropTypes.func,
  className: PropTypes.string,
};

export default SeenPendingButton;
