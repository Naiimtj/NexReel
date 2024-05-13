import { patchMedia } from "../../../services/DB/services-db";

function SeenPending(
  dataMediaUser,
  id,
  mediaType,
  runTime,
  seen,
  pending,
  repeat,
  setChangeSeenPending,
  changeSeenPending,
  setRepeating,
  repeating,
  onReload
) {
  const updateData = {
    mediaId: id.toString(),
    repeat: !repeat,
    media_type: mediaType,
    runtime: runTime,
    vote: dataMediaUser.vote,
  };
  console.log(updateData);
  if (seen || !pending) {
    Object.keys(dataMediaUser).length
      ? patchMedia(id, mediaType, updateData).then(() => {
          if (setRepeating) {
            setRepeating(!repeating);
          }
          onReload();
          setChangeSeenPending(!changeSeenPending);
        })
      : null;
  }
}

export default SeenPending;
