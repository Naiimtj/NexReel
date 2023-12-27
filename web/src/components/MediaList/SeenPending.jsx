import { patchMedia, postMedia } from "../../../services/DB/services-db";

class SeenPending {
  constructor(
    dataMediaUser,
    id,
    mediaType,
    runTime,
    seenOrPending,
    setChangeSeenPending,
    changeSeenPending,
    setPendingSeen,
    pendingSeen
  ) {
    this.dataMedia = dataMediaUser; // number
    this.id = id.toString(); // number
    this.mediaType = mediaType; // t of useTranslation !Important for translation
    this.runTime = runTime; // bool
    this.seenOrPending = seenOrPending; // bool
    this.setChangeSeenPending = setChangeSeenPending; // bool
    this.changeSeenPending = changeSeenPending; // bool
    this.setPendingSeen = setPendingSeen;
    this.pendingSeen = pendingSeen;
  }

  Seen() {
    if (Object.keys(this.dataMedia).length) {
      patchMedia(this.id, {
        mediaId: this.id,
        media_type: this.mediaType,
        runtime: this.runTime,
        seen: !this.seenOrPending,
        vote: this.dataMedia.vote,
      }).then(
        () => this.setChangeSeenPending(!this.changeSeenPending),
        this.setPendingSeen && this.setPendingSeen(!this.pendingSeen)
      );
    } else {
      postMedia({
        mediaId: this.id,
        media_type: this.mediaType,
        runtime: this.runTime,
        like: false,
        seen: true,
      }).then((data) => {
        if (data) {
          this.setChangeSeenPending(!this.changeSeenPending),
          this.setPendingSeen && this.setPendingSeen(!this.pendingSeen);
        }
      });
    }
  }

  Pending() {
    if (Object.keys(this.dataMedia).length) {
      patchMedia(this.id, {
        mediaId: this.id,
        media_type: this.mediaType,
        runtime: this.runTime,
        pending: !this.seenOrPending,
        vote: this.dataMedia.vote,
      }).then(
        () => this.setChangeSeenPending(!this.changeSeenPending),
        this.setPendingSeen && this.setPendingSeen(!this.pendingSeen)
      );
    } else {
      postMedia({
        mediaId: this.id,
        media_type: this.mediaType,
        runtime: this.runTime,
        like: false,
        pending: true,
      }).then((data) => {
        if (data) {
          this.setChangeSeenPending(!this.changeSeenPending),
          this.setPendingSeen && this.setPendingSeen(!this.pendingSeen);
        }
      });
    }
  }
}

export default SeenPending;
