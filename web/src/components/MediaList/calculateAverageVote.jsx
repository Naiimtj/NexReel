const calculateAverageVote = (voteTMDB, voteIMDB, voteFILMA, voteIMDBFree) => {
  const values = [voteTMDB, voteIMDB, voteFILMA, voteIMDBFree].filter(
    (v) => v !== null && v !== undefined,
  );
  if (!values.length) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 10) / 10;
};

export default calculateAverageVote;
