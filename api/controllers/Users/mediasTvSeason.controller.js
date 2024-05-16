const createError = require("http-errors");
const MediaTvSeason = require("../../models/User/mediaTvSeason.model");
const MediaTv = require("../../models/User/mediaTv.model");
const mediasController = require("./medias.controller");

async function createSeasons(seasonData, runtime_seasons) {
  const { mediaId, userId, number_seasons } = seasonData;
  const seasonPromises = [];
  // Create TV seasons based on the number of seasons provided
  for (let seasonNumber = 1; seasonNumber <= number_seasons; seasonNumber++) {
    const tvSeasonExists = await MediaTvSeason.findOne({
      mediaId: mediaId,
      userId: userId,
      season: seasonNumber,
    });
    if (!tvSeasonExists) {
      seasonData.runtime = runtime_seasons[seasonNumber];
      seasonData.season = `${seasonNumber}`;
      seasonPromises.push(MediaTvSeason.create(seasonData));
    }
  }

  // Wait for all TV seasons to be created
  await Promise.all(seasonPromises);
}

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
      runtime_seasons,
      runtime_seen,
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
      runtime_seasons,
    };

    if (seasonExists) {
      return next(createError(404, "Season already exists"));
    } else {
      await MediaTvSeason.create(tvSeasonData);
      const mediaTvExists = await MediaTv.findOne({
        mediaId: req.params.mediaId,
        userId,
      });
      let mediaData = { ...tvSeasonData };
      delete mediaData.userId;
      delete mediaData.season;
      delete mediaData.seenComplete;
      mediaData.like = false;
      mediaData.seen = false;
      mediaData.pending = true;
      mediaData.runtime_seen = runtime_seen;

      console.log("MEDIA DATA", mediaData);
      if (!mediaTvExists) {
        req.body = mediaData;
        await mediasController.create(req, res, next);
        return;
      } else {
        req.media = mediaData;
        req.body = {};
        await mediasController.update(req, res, next, (updateSeason = true));
        // Create basic Data for Season
        const seasonData = {
          userId,
          mediaId: req.params.mediaId,
          media_type: mediaData.media_type,
          number_seasons: mediaData.number_seasons,
          number_of_episodes: mediaData.number_of_episodes,
          like: mediaData.like,
          seen: !mediaData.seen,
          pending: !mediaData.pending,
          seenComplete: !mediaData.seen,
          vote: mediaData.vote,
        };
        createSeasons(seasonData, mediaData.runtime_seasons);
        return;
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const media = await MediaTv.findOne({
      mediaId: req.params.mediaId,
      userId: req.user.id,
    });
    if (!media.seen) {
      const mediaSeason = await MediaTvSeason.findOne({
        mediaId: req.params.mediaId,
        userId: req.user.id,
        season: req.params.season,
      });
      if (!mediaSeason) {
        res.status(204).json({ result: false });
      } else {
        res.status(200).json(mediaSeason);
      }
    } else {
      // const mediaSeason = {
      //   ...media.toObject(),
      //   season: req.params.season,
      //   runtime: media.runtime_seasons[req.params.season],
      // };
      // delete mediaSeason.runtime_seen;
      // delete mediaSeason._id;
      // delete mediaSeason.__v;

      // res.status(200).json(mediaSeason);
      return next(createError(404, "Season no exists"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const { runtime, like, seen, vote, runtime_seen, runtime_seasons } =
      req.body;
    const media = await req.media;
    if (!media) {
      next(createError(404, "Media or Season not found"));
    }
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
      runtime_seen,
      runtime_seasons,
    };
    const mediaId = media.mediaId;
    const updateMedia = await MediaTvSeason.findOneAndUpdate(
      {
        userId: req.user.id,
        mediaId,
        season: req.params.season,
      },
      mediaData,
      { new: true }
    );
    if (!updateMedia) {
      next(createError(404, "Season not found"));
    }
    const allSeasons = await MediaTvSeason.find({
      userId: req.user.id,
      mediaId: mediaId,
    });
    const allSeasonsSeen =
      allSeasons.filter((season) => season.seen === true).length ===
      updateMedia.number_seasons;

    const haveSpecialSeason =
      updateMedia.number_seasons === runtime_seasons.length;

    let totalRunTimeMediaTv = 0;
    for (let i = haveSpecialSeason ? 1 : 0; i < runtime_seasons.length; i++) {
      totalRunTimeMediaTv += runtime_seasons[i];
    }

    if (allSeasonsSeen) {
      mediaData.seen = true;
      mediaData.seenComplete = true;
      mediaData.pending = false;
      mediaData.runtime_seen = totalRunTimeMediaTv;
      await MediaTvSeason.deleteMany({ mediaId });
    } else {
      mediaData.pending = true;
      mediaData.seen = false;
      mediaData.seenComplete = false;
      mediaData.runtime_seen = runtime_seen;
    }
    delete mediaData.runtime;
    delete mediaData.vote;
    const UpdateMediaTv = await MediaTv.findOneAndUpdate(
      {
        userId: req.user.id,
        mediaId,
      },
      mediaData,
      { new: true }
    );
    if (!UpdateMediaTv) {
      next(createError(404, "Media TV not Update"));
    }
    res.status(200).json(updateMedia);
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
