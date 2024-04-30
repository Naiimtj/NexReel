const createError = require("http-errors");
const MediaTvSeason = require("../../models/User/mediaTvSeason.model");
const Media = require("../../models/User/media.model");
const mediasController = require("./medias.controller");

module.exports.create = async (req, res, next) => {
  try {
    const {
      media_type,
      season,
      number_seasons,
      number_of_episodes,
      runtime,
      like,
      seen,
      pending,
      vote,
    } = req.body;
    // If seen is true seenComplete is true
    let seenData = false;
    let pendingData = false;

    // Determine the values of seenData and pendingData based on the input conditions
    if (seen && !pending) {
      seenData = true;
    } else {
      pendingData = true;
    }

    // If you vote you seen
    if (vote >= 0) {
      seenData = true;
    }
    const userId = req.user.id;

    const seasonExists = await MediaTvSeason.findOne({
      mediaId: req.params.mediaId,
      userId,
      season,
    });

    if (seasonExists) {
      return next(createError(404, "Season already exists"));
    } else {
      await MediaTvSeason.create({
        userId,
        mediaId: req.params.mediaId,
        media_type,
        season,
        number_seasons,
        number_of_episodes,
        seenComplete: false,
        runtime,
        like,
        seen: seenData,
        pending: pendingData,
        vote,
      });
      req.body = {
        mediaId: req.params.mediaId,
        media_type,
        number_seasons,
        number_of_episodes,
        runtime,
        like: false,
        seen: false,
        pending: true,
        vote,
      };
      await mediasController.create(req, res, next);
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
    const { runtime, like, seen, pending, vote } = req.body;
    const media = await req.media;
    // If seen is true seenComplete is true
    let seenData = false;
    let pendingData = false;

    // Determine the values of seenData and pendingData based on the input conditions
    if (seen && !pending) {
      seenData = true;
    } else {
      pendingData = true;
    }

    // If you vote you seen
    if (vote >= 0) {
      seenData = true;
    }
    if (!media) {
      next(createError(404, "Season not found"));
    }
    const updateMedia = await MediaTvSeason.findOneAndUpdate(
      { mediaId: media.mediaId, season: media.season },
      {
        runtime,
        like,
        seen: seenData,
        pending: pendingData,
        vote: vote || -1,
      },
      { new: true }
    );
    console.log(updateMedia);
    if (updateMedia) {
      if (
        !updateMedia.pending &&
        !updateMedia.seen &&
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
