const calculateAverageVote = (voteTMDB, voteIMDB, voteFILMA) => {
  const values = [voteTMDB, voteIMDB, voteFILMA].filter(
    (v) => v !== null && v !== undefined,
  );
  if (!values.length) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 100) / 100;
};

export default calculateAverageVote;
