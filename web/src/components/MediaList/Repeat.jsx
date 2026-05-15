import { patchMedia } from '../../../services/DB/services-db';

function Repeat(
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
  onReload,
) {
  if (!seen && pending) return;
  if (!Object.keys(dataMediaUser).length) return;

  const updateData = {
    mediaId: id.toString(),
    repeat: !repeat,
    media_type: mediaType,
    runtime: runTime,
    vote: dataMediaUser.vote,
  };

  patchMedia(id, mediaType, updateData).then(() => {
    setRepeating?.(!repeating);
    setChangeSeenPending(!changeSeenPending);
  });
}

export default Repeat;
