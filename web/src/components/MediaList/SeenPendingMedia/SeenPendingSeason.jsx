import { patchSeasons, postSeasons } from "../../../../services/DB/services-db";

function SeenPendingSeason(
  dataMediaUser,
  id,
  mediaType,
  runTimeSeason,
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
  runtime_seen,
  runTimeSeasons
) {
  let updateData = {
    mediaId: id.toString(),
    media_type: mediaType,
    season: NumberSeason,
    runtime: Object.keys(dataMediaUser).length ? runTimeSeason : runTime,
    vote: dataMediaUser.vote || -1,
    number_seasons: numberSeasons,
    number_of_episodes: numberEpisodes,
    runtime_seasons: runTimeSeasons,
  };

  if (updateType === "seen") {
    updateData.seen = !seenOrPending;
    updateData.runtime_seen = !seenOrPending ? runtime_seen + runTimeSeasons[NumberSeason] : runtime_seen - runTimeSeasons[NumberSeason]
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
