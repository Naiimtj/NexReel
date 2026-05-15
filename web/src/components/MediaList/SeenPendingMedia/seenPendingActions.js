import {
  patchMedia,
  postMedia,
  patchSeasons,
  postSeasons,
  patchEpisode,
  postEpisode,
} from '../../../../services/DB/services-db';

const applyAndRefresh = (
  promise,
  { setPendingSeen, pendingSeen, setChangeSeenPending, changeSeenPending },
) =>
  promise.then(() => {
    if (setPendingSeen) setPendingSeen(!pendingSeen);
    setChangeSeenPending(!changeSeenPending);
  });

/**
 * Toggle seen/pending on a media (movie or TV show parent).
 * For TV: seen=true creates all season rows, pending=true removes them,
 * neither deletes the media_tv entry.
 */
export function SeenPending(
  dataMediaUser,
  id,
  mediaType,
  runTime,
  seenOrPending,
  setChangeSeenPending,
  changeSeenPending,
  setPendingSeen,
  pendingSeen,
  updateType,
  onReload,
  numberEpisodes,
  numberSeasons,
  runTimeSeasons,
  totalRunTime,
) {
  const isTv = mediaType === 'tv';
  const updateData = {
    mediaId: id.toString(),
    media_type: mediaType,
    runtime: runTime,
    vote: dataMediaUser.vote,
    ...(isTv && {
      number_seasons: numberSeasons,
      number_of_episodes: numberEpisodes,
      runtime_seen: totalRunTime,
      runtime_seasons: runTimeSeasons,
    }),
  };

  if (updateType === 'seen') {
    updateData.seen = !seenOrPending;
    updateData.runtime_seen = !seenOrPending ? totalRunTime : 0;
  } else if (updateType === 'pending') {
    updateData.pending = !seenOrPending;
    updateData.runtime_seen = 0;
  }

  const exists = Object.keys(dataMediaUser).length > 0;
  const promise = exists
    ? patchMedia(id, mediaType, updateData)
    : postMedia(mediaType, updateData);

  return applyAndRefresh(promise, {
    setPendingSeen,
    pendingSeen,
    onReload,
    setChangeSeenPending,
    changeSeenPending,
  });
}

/**
 * Toggle a season as seen/unseen.
 * Row in media_tv_seasons = seen. No row = not seen.
 * Backend handles parent state sync automatically.
 */
export function SeenPendingSeason(
  dataMediaUser,
  id,
  mediaType,
  runTimeSeason,
  runTime,
  isSeen,
  setChangeSeenPending,
  changeSeenPending,
  setPendingSeen,
  pendingSeen,
  onReload,
  NumberSeason,
  numberEpisodes,
  numberSeasons,
  runTimeSeasons,
) {
  const exists = Object.keys(dataMediaUser).length > 0;
  const updateData = {
    mediaId: id.toString(),
    media_type: mediaType,
    season: NumberSeason,
    runtime: exists ? runTimeSeason : runTime,
    vote: dataMediaUser.vote || -1,
    number_seasons: numberSeasons,
    number_of_episodes: numberEpisodes,
    runtime_seasons: runTimeSeasons,
    seen: !isSeen,
  };

  const promise = exists
    ? patchSeasons(id, NumberSeason, updateData)
    : postSeasons(id, updateData);

  return applyAndRefresh(promise, {
    setPendingSeen,
    pendingSeen,
    onReload,
    setChangeSeenPending,
    changeSeenPending,
  });
}

/**
 * Toggle an episode as seen/unseen.
 * Row in media_tv_episodes = seen. No row = not seen.
 * Backend handles season completeness and parent state sync.
 */
export function SeenPendingEpisode(
  dataMediaUser,
  id,
  mediaType,
  runTime,
  isSeen,
  setChangeSeenPending,
  changeSeenPending,
  setPendingSeen,
  pendingSeen,
  onReload,
  NumberSeason,
  NumberEpisode,
  numberEpisodes,
) {
  const updateData = {
    mediaId: id.toString(),
    media_type: mediaType,
    season: NumberSeason,
    episode: NumberEpisode,
    runtime: runTime,
    vote: dataMediaUser.vote ?? -1,
    number_of_episodes: numberEpisodes,
    seen: !isSeen,
  };

  const exists =
    Object.keys(dataMediaUser).length > 0 && dataMediaUser.result !== false;
  const promise = exists
    ? patchEpisode(id, NumberSeason, NumberEpisode, updateData)
    : postEpisode(id, NumberSeason, NumberEpisode, updateData);

  return applyAndRefresh(promise, {
    setPendingSeen,
    pendingSeen,
    onReload,
    setChangeSeenPending,
    changeSeenPending,
  });
}

export default SeenPending;
