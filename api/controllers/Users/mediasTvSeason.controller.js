const createError = require("http-errors");
const MediaTvSeason = require("../../models/User/mediaTvSeason.model");

module.exports.create = async (req, res, next) => {
  try {
    const {
      mediaId,
      media_type,
      season,
      seasonComplete,
      runtime,
      like,
      seen,
      vote,
    } = req.body;
    // If seen is true seasonComplete is true
    let seenData = false;
    let pendingData = false;
    if (seen) {
      seenData = true;
      pendingData = false;
    } else if (seasonComplete) {
      pendingData = false;
      seenData = true;
    } else {
      seenData = false;
      pendingData = true;
    }
    // If seen is true seasonComplete is true
    if (pending) {
      pendingData = true;
    }

    // If you vote you seen
    if (vote >= 0) {
      seenData = true;
    }
    const userId = req.user.id;

    const media = await MediaTvSeason.findOne({ mediaId, userId, season });

    if (media) {
      next(createError(404, "Media Tv Season is exist"));
    } else {
      const addMedia = await MediaTvSeason.create({
        userId,
        mediaId,
        media_type,
        season,
        seenComplete: seenData,
        runtime,
        like,
        seen: seenData,
        pending: pendingData,
        following,
        vote,
      });

      res.status(201).json(addMedia);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const media = await MediaTvSeason.findOne({
      mediaId: req.params.id,
      userId: req.user.id,
    });
    if (!media) {
      res.status(204).json({ result: false });
    } else {
      res.status(200).json(media);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const { seenComplete, following, like, seen, pending, vote } = req.body;
    console.log(seenComplete);
    const media = await req.media;
    // If seen is true seenComplete is true
    let seenData = false;
    if (seen) {
      seenData = true;
    } else if (seenComplete) {
      seenData = true;
    } else {
      seenData = false;
    }
    // If seen is true seenComplete is true
    let pendingData = pending;
    if (seen) {
      pendingData = false;
    } else if (seenComplete) {
      pendingData = false;
    }
    if (!media) {
      next(createError(404, "Media Tv Season not found"));
    }
    const updateMedia = await MediaTvSeason.findOneAndUpdate(
      { mediaId: media.mediaId, season: media.season },
      {
        like,
        seen: seenData,
        seenComplete: seenData,
        pending: pendingData,
        following,
        vote: vote || -1,
      },
      { new: true }
    );
    if (updateMedia) {
      if (!updateMedia.like && !updateMedia.seen && !updateMedia.following && updateMedia.vote === -1) {
        await module.exports.delete(req, res, next);
        return;
      } else {
        res.status(200).json(updateMedia);
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const media = await MediaTvSeason.find({ userId: req.user.id });
    if (!media) {
      next(createError(404, "Media Tv Season not found"));
    }
    res.status(200).json(media);
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const media = await req.media;

    if (!media) {
      return next(createError(404, "Media Tv Season not found"));
    }
    const deletedMedia = await MediaTvSeason.findByIdAndDelete(media.id);

    if (!deletedMedia) {
      return next(createError(404, "Media Tv Season not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};
