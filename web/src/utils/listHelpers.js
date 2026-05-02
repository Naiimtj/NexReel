export const getCardsPerPage = () => {
  const w = window.innerWidth;
  if (w < 640) return 20;
  if (w < 768) return 21;
  if (w < 1024) return 28;
  if (w < 1280) return 30;
  if (w < 1534) return 36;
  return 40;
};

export const uniqueById = (arr = []) =>
  Array.from(new Map(arr.map((a) => [a.id, a])).values());
