import { patchSeasons, postSeasons } from "../../../../services/DB/services-db";

function SeenPendingSeason(
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
  numberEpisodes,
  numberSeasons,
  runTimeSeasons,
) {
  const updateData = {
    mediaId: id.toString(),
    media_type: mediaType,
    season: NumberSeason,
    runtime: runTime,
    vote: dataMediaUser.vote || -1,
    number_seasons: numberSeasons,
    number_of_episodes: numberEpisodes,
    runtime_seasons: runTimeSeasons,
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

export default SeenPendingSeason;
