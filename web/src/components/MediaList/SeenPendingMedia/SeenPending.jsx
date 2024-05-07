import { patchMedia, postMedia } from "../../../../services/DB/services-db";

function SeenPending(
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
  numberEpisodes,
  numberSeasons,
  runTimeSeasons,
  totalRunTime
) {
  const updateData =
    mediaType === "tv"
      ? {
          mediaId: id.toString(),
          media_type: mediaType,
          runtime: runTime,
          vote: dataMediaUser.vote,
          number_seasons: numberSeasons,
          number_of_episodes: numberEpisodes,
          runtime_seasons: runTimeSeasons,
        }
      : {
          mediaId: id.toString(),
          media_type: mediaType,
          runtime: runTime,
          vote: dataMediaUser.vote,
        };

  if (updateType === "seen") {
    updateData.seen = !seenOrPending;
    updateData.runtime_seen = totalRunTime;
  } else if (updateType === "pending") {
    updateData.pending = !seenOrPending;
    updateData.runtime_seen = 0;
  }

  Object.keys(dataMediaUser).length
    ? patchMedia(id, updateData).then(() => {
        if (setPendingSeen) {
          setPendingSeen(!pendingSeen);
        }
        onReload();
        setChangeSeenPending(!changeSeenPending);
      })
    : postMedia(updateData).then(() => {
        if (setPendingSeen) {
          setPendingSeen(!pendingSeen);
        }
        onReload();
        setChangeSeenPending(!changeSeenPending);
      });
}

export default SeenPending;
