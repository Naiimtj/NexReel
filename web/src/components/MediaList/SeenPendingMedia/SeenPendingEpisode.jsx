import { patchSeasons, postSeasons } from "../../../../services/DB/services-db";

function SeenPendingEpisode(
  dataMediaUser,
  id,
  mediaType,
  runTime,
  seenOrPending,
  setChangeSeenPending,
  changeSeenPending,
  setPendingSeen,
  pendingSeen,
  updateType, // 'seen' or 'pending'
  onReload,
  NumberSeason,
  numberEpisodes
) {
  const updateData = {
    mediaId: id.toString(),
    media_type: mediaType,
    season: NumberSeason,
    runtime: runTime,
    vote: dataMediaUser.vote,
    number_of_episodes: numberEpisodes,
  };

  if (updateType === "seen") {
    updateData.seen = !seenOrPending;
  } else if (updateType === "pending") {
    updateData.pending = !seenOrPending;
  }

  Object.keys(dataMediaUser).length
    ? patchSeasons(id, NumberSeason, updateData).then(() => {
        if (setPendingSeen) {
          setPendingSeen(!pendingSeen);
        }
        onReload();
        setChangeSeenPending(!changeSeenPending);
      })
    : postSeasons(id, updateData).then(() => {
        if (setPendingSeen) {
          setPendingSeen(!pendingSeen);
        }
        onReload();
        setChangeSeenPending(!changeSeenPending);
      });
}

export default SeenPendingEpisode;
