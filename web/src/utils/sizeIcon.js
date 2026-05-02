const SIZE_MAP = {
  'x-small': 17,
  small: 20,
  md: 24,
  large: 32,
  'x-large': 48,
  '2x-large': 64,
};

export const getIconSize = (size = 'md') => {
  if (typeof size === 'number') return size;
  return SIZE_MAP[size] || SIZE_MAP.md;
};

export default getIconSize;
