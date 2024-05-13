const createError = require("http-errors");
const Media = require("../../models/User/media.model");
const MediaTv = require("../../models/User/mediaTv.model");
const MediaTvSeason = require("../../models/User/mediaTvSeason.model");
const mediasTvController = require("./mediasTvSeason.controller");

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
      seasonData.season = `${seasonNumber}`
      console.log("SEASON DATA", seasonData);
      seasonPromises.push(MediaTvSeason.create(seasonData));
    }
  }

  // Wait for all TV seasons to be created
  await Promise.all(seasonPromises);
}

module.exports.create = async (req, res, next) => {
  try {
    const {
      mediaId,
      media_type,
      runtime,
      like,
      seen,
      pending,
      vote,
      number_seasons,
      number_of_episodes,
      runtime_seasons,
      runtime_seen,
    } = req.body;

    const userId = req.user.id;

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

    const mediaExists = await Media.findOne({ mediaId, userId });
    const mediaTvExists = await MediaTv.findOne({ mediaId, userId });
    if (mediaExists || mediaTvExists) {
      return next(createError(404, "Media already exists"));
    }

    // Prepare data basic for creating media
    let mediaData = {
      userId,
      mediaId,
      media_type,
      runtime,
      like,
      seen: seenData,
      pending: pendingData,
      vote,
    };

    if (media_type === "tv") {
      // Update mediaData
      mediaData = {
        ...mediaData,
        number_seasons: number_seasons,
        number_of_episodes: number_of_episodes,
        runtime_seen,
        runtime_seasons,
      };
      console.log("mediaData", mediaData);

      // - Create Tv Seasons
      // Create basic Data for Season
      const seasonData = {
        userId,
        mediaId,
        media_type,
        number_seasons,
        number_of_episodes,
        seenComplete: seenData,
        like,
        seen: seenData,
        pending: pendingData,
        vote,
      };
      // If is pending create TV Seasons
      if (!seenData && pendingData) {
        createSeasons(seasonData, runtime_seasons);
      }
      const addMedia = await MediaTv.create(mediaData);
      // Send success response with the added media
      res.status(201).json(addMedia);
    } else {
      // Create new media
      const addMedia = await Media.create(mediaData);
      // Send success response with the added media
      res.status(201).json(addMedia);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    let media;
    if (req.params.mediaType === "tv") {
      media = await MediaTv.findOne({
        mediaId: req.params.id,
        userId: req.user.id,
      });
    } else {
      media = await Media.findOne({
        mediaId: req.params.id,
        userId: req.user.id,
      });
    }
    console.log(media);
    if (!media) {
      return next(createError(404, "Media not found"));
    }

    let populatedMedia = media.toObject(); // Convert in object
    if (media.media_type === "tv") {
      populatedMedia.seasons = await MediaTvSeason.find({
        mediaId: req.params.id,
        userId: req.user.id,
      });
    }

    res.status(200).json(populatedMedia);
  } catch (error) {
    next(error);
  }
};

module.exports.update = async (req, res, next, updateSeason) => {
  try {
    const {
      seen,
      like,
      pending,
      vote,
      runtime_seasons,
      runtime,
      repeat,
      runtime_seen,
    } = req.body;
    const userId = req.user.id;
    const media = await req.media;
    console.log("MEDIA---------", media);
    let data = {};
    // if (updateSeason && media.media_type === "tv") {
    //   data = { ...req.body };
    //   const media = await Media.findOne({ mediaId: req.body.mediaId, userId });
    //   data.mediaId = media.mediaId;
    //   data.seen = media.seen;
    //   data.pending = media.pending;
    //   data.like = media.like;
    //   data.vote = media.vote;
    //   data.media_type = media.media_type;
    //   data.number_seasons = media.number_seasons;
    //   data.number_of_episodes = media.number_of_episodes;
    //   data.runtime = media.runtime;
    //   data.runtime_seen = seen
    //     ? media.runtime_seen + runtime
    //     : media.runtime_seen - runtime;
    // } else {
    if (!media) {
      next(createError(404, "Media not found"));
    }
    data.mediaId = media.mediaId;
    data.seen = media.seen;
    data.pending = media.pending;
    data.like = media.like;
    data.vote = media.vote;
    data.media_type = media.media_type;
    if (media.media_type === "tv") {
      data.number_seasons = media.number_seasons;
      data.number_of_episodes = media.number_of_episodes;
      data.runtime_seen = media.runtime_seen || runtime_seen;
    }

    // }
    const mediaId = data.mediaId;

    let seenData = false;
    let pendingData = false;

    // Determine the values of seenData and pendingData based on the input conditions
    if (seen === undefined && pending === undefined) {
      seenData = data.seen;
      pendingData = data.pending;
    } else if (seen) {
      seenData = true;
    } else if (pending) {
      pendingData = true;
    }

    // If have vote is seen
    if (vote >= 0) {
      seenData = true;
    }

    // Prepare data
    let mediaData = {
      like: like,
      seen: seenData,
      pending: pendingData,
      repeat,
      vote: vote,
      // runtime_seen: data.runtime_seen,
    };
    if (!seenData && !pendingData) {
      await module.exports.delete(req, res, next);
      return;
    }
    console.log("mediaData---------", mediaData);
    // Update new media

    let updateMedia = await Media.findOneAndUpdate(
      { mediaId, userId },
      mediaData,
      {
        new: true,
      }
    );
    if (!updateMedia && data.media_type === "tv") {
      await MediaTv.findOneAndUpdate({ mediaId, userId }, mediaData, {
        new: true,
      });
    }
    // console.log(data);
    if (updateMedia) {
      // If media is TV and seen or pending, create or update TV seasons
      if (data.media_type === "tv" && !seenData && pendingData) {
        const seasonPromises = [];
        // Create or Update TV seasons based on the number of seasons provided
        for (
          let seasonNumber = 1;
          seasonNumber <= data.number_seasons;
          seasonNumber++
        ) {
          const mediaTvSeasonExists = await MediaTvSeason.findOne({
            mediaId: mediaId,
            userId,
            season: seasonNumber,
          });
          const seasonData = {
            userId,
            mediaId: mediaId,
            media_type: data.media_type,
            season: seasonNumber,
            number_seasons: data.number_seasons,
            number_of_episodes: data.number_of_episodes,
            runtime: runtime_seasons[seasonNumber],
            like: data.like,
            seen: updateSeason ? data.seen : seenData,
            pending: updateSeason ? data.pending : pendingData,
            vote: data.vote,
          };
          if (!mediaTvSeasonExists) {
            seasonPromises.push(MediaTvSeason.create(seasonData));
          } else {
            // seasonPromises.push(
            //   MediaTvSeason.findByIdAndUpdate(
            //     mediaTvSeasonExists.id,
            //     seasonData,
            //     {
            //       new: true,
            //     }
            //   )
            // );
          }
        }

        // Wait for all TV seasons to be created or update
        await Promise.all(seasonPromises);
      } else if (data.media_type === "tv" && seenData) {
        await MediaTvSeason.deleteMany({ mediaId });
      }
    }

    // Send success response with the added media
    res.status(201).json(updateMedia);
  } catch (error) {
    next(error);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const media = await Media.find({ userId: req.user.id });
    const mediaTv = await MediaTv.find({ userId: req.user.id });
    if (!media && !mediaTv) {
      next(createError(404, "Media not found"));
    }
    res.status(200).json(media.concat(mediaTv));
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
    const userId = req.user.id;
    const mediaId = media.mediaId;
    let deletedMedia;
    if (media.media_type === "tv") {
      deletedMedia = await MediaTv.findOneAndDelete({ mediaId, userId });
      // Delete all TV seasons associated with the TV media
      await MediaTvSeason.deleteMany({ mediaId });
    } else {
      deletedMedia = await Media.findOneAndDelete({ mediaId, userId });
    }

    if (!deletedMedia) {
      return next(createError(404, "Media not found"));
    }
    res.status(204).json({ message: "Media deleted successfully" });
  } catch (error) {
    next(error);
  }
};
