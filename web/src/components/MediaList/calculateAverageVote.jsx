const calculateAverageVote = (voteTMDB, voteIMDB, voteFILMA) => {
  // Calculate the average rating if both IMDB and FILMA votes are not null.
  const ConditionValoration =
    voteIMDB === null || voteFILMA === null
      ? null
      : (voteIMDB + voteFILMA + voteTMDB) / 3;

  // Calculate the average rating if only the FILMA vote is null.
  const ConditionIMDB =
    voteFILMA === null && voteIMDB === null ? null : (voteIMDB + voteTMDB) / 2;

  // Determine the final rating based on the above conditions.
  const finalRating =
    ConditionValoration === null && ConditionIMDB === null
      ? voteTMDB
      : ConditionValoration || ConditionIMDB;
  return finalRating || null;
};

export default calculateAverageVote;
