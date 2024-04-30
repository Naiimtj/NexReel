const createError = require("http-errors");
const MediaTvEpisode = require("../../models/User/mediaTvEpisode.model");

module.exports.create = async (req, res, next) => {
  try {
    const {
      mediaId,
      media_type,
      season,
      idEpisode,
      seenComplete,
      runtime,
      like,
      seen,
      pending,
      vote,
    } = req.body;
    // If seen is true seenComplete is true
    let seenData = false;
    if (seen) {
      seenData = true;
    } else if (seenComplete) {
      seenData = true;
    } else {
      seenData = false;
    }
    // If you vote you seen
    if (vote >= 0) {
      seenData = true;
    }
    const userId = req.user.id;

    const media = await MediaTvEpisode.findOne({ mediaId, userId, season });

    if (media) {
      next(createError(404, "Media is exist"));
    } else {
      const addMedia = await MediaTvEpisode.create({
        userId,
        mediaId,
        media_type,
        season,
        idEpisode,
        seenComplete: seenData,
        runtime,
        like,
        seen: seenData,
        pending,
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
    const media = await MediaTvEpisode.findOne({
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
    const { season, idEpisode, seenComplete, like, seen, pending, vote } =
      req.body;
    const media = await req.media;
    if (!media) {
      next(createError(404, "Media not found"));
    }
    const updateMedia = await MediaTvEpisode.findByIdAndUpdate(
      media.id,
      {
        like,
        seen,
        pending,
        vote,
      },
      { new: true }
    );
    if (updateMedia) {
      if (
        !updateMedia.like &&
        !updateMedia.seen &&
        !updateMedia.pending &&
        updateMedia.vote === -1
      ) {
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
    const media = await MediaTvEpisode.find({ userId: req.user.id });
    if (!media) {
      next(createError(404, "Media not found"));
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
      return next(createError(404, "Media not found"));
    }
    const deletedMedia = await MediaTvEpisode.findByIdAndDelete(media.id);

    if (!deletedMedia) {
      return next(createError(404, "Media not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};
