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
  {
    setPendingSeen,
    pendingSeen,
    onReload,
    setChangeSeenPending,
    changeSeenPending,
  },
) =>
  promise.then(() => {
    if (setPendingSeen) setPendingSeen(!pendingSeen);
    onReload();
    setChangeSeenPending(!changeSeenPending);
  });

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
    updateData.runtime_seen = totalRunTime;
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

export function SeenPendingSeason(
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
  updateType,
  onReload,
  NumberSeason,
  numberEpisodes,
  numberSeasons,
  runtime_seen,
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
  };

  if (updateType === 'seen') {
    updateData.seen = !seenOrPending;
    const seasonRuntime = (runTimeSeasons && runTimeSeasons[NumberSeason]) || 0;
    updateData.runtime_seen = !seenOrPending
      ? (runtime_seen || 0) + seasonRuntime
      : (runtime_seen || 0) - seasonRuntime;
  } else if (updateType === 'pending') {
    updateData.pending = !seenOrPending;
  }

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

export function SeenPendingEpisode(
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
  };

  if (updateType === 'seen') updateData.seen = !seenOrPending;
  else if (updateType === 'pending') updateData.pending = !seenOrPending;

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
