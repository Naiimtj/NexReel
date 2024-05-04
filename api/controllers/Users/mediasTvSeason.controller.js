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

    const userId = req.user.id;

    // If seen is true seenComplete is true
    let seenData = false;
    let pendingData = false;

    // Determine the values of seenData and pendingData based on the input conditions

    if (seen && !pending) {
      seenData = true;
    } else {
      pendingData = true;
    }

    // If have vote is seen
    if (vote >= 0) {
      seenData = true;
    }

    const seasonExists = await MediaTvSeason.findOne({
      mediaId: req.params.mediaId,
      userId,
      season,
    });

    let tvSeasonData = {
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
    };

    if (seasonExists) {
      return next(createError(404, "Season already exists"));
    } else {
      await MediaTvSeason.create(tvSeasonData);

      let mediaData = { ...tvSeasonData };
      delete mediaData.userId;
      delete mediaData.season;
      delete mediaData.seenComplete;
      mediaData.like = false;
      mediaData.seen = false;
      mediaData.pending = true;

      req.body = mediaData;
      await mediasController.create(req, res, next);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const media = await MediaTvSeason.findOne({
      mediaId: req.params.mediaId,
      userId: req.user.id,
      season: req.params.season
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
    const { runtime, like, seen, vote } = req.body;
    const media = await req.media;
    // If seen is true seenComplete is true
    let seenData = false;
    let pendingData = false;

    // Determine the values of seenData and pendingData based on the input conditions
    if (seen === undefined) {
      seenData = media.seen;
      pendingData = !media.seen;
    } else if (seen || vote >= 0) {
      seenData = true;
    } else {
      pendingData = true;
    }
    let mediaData = {
      like: like || media.like,
      seen: seenData,
      pending: pendingData,
      runtime: runtime || media.runtime,
      vote: vote || media.vote,
    };
    if (!media) {
      next(createError(404, "Season not found"));
    }
    const updateMedia = await MediaTvSeason.findOneAndUpdate(
      {
        userId: req.user.id,
        mediaId: media.mediaId,
        season: req.params.season,
      },
      mediaData,
      { new: true }
    );
    if (updateMedia) {
      const allSeasons = await MediaTvSeason.find({
        userId: req.user.id,
        mediaId: updateMedia.mediaId,
      });
      const allSeasonsSeen =
        allSeasons.filter((season) => season.seen === true).length ===
        updateMedia.number_seasons;
      if (allSeasonsSeen) {
        let mediaData = {
          seen: true,
        };
        req.body = mediaData;
        await mediasController.update(req, res, next);
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


