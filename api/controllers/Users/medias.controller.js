const createError = require("http-errors");
const Media = require("../../models/User/media.model");
const MediaTvFollowers = require("../../models/User/followerMediaTv.model");
const MediaTvSeason = require("../../models/User/mediaTvSeason.model");

module.exports.create = async (req, res, next) => {
  try {
    const {
      mediaId,
      media_type,
      runtime,
      like,
      seen,
      seenComplete,
      pending,
      vote,
      number_seasons,
    } = req.body;

    const userId = req.user.id;

    let seenData = false;
    let pendingData = false;

    // Determine the values of seenData and pendingData based on the input conditions
    if (seen && !pending) {
      seenData = true;
    } else if (seenComplete || vote >= 0) {
      seenData = true;
    } else {
      pendingData = true;
    }

    // Check if media already exists
    const mediaExists = await Media.findOne({ mediaId, userId });
    if (mediaExists) {
      // Return error if media already exists
      return next(createError(404, "Media already exists"));
    }

    // Prepare data for creating media
    let mediaData = {
      userId,
      mediaId,
      media_type,
      seenComplete: seenData,
      runtime,
      like,
      seen: seenData,
      pending: pendingData,
      vote,
    };
    // If media_type is "tv", add season_number to mediaData
    if (media_type === "tv") {
      mediaData = {
        ...mediaData,
        number_seasons: number_seasons,
      };
    }
    // Create new media
    const addMedia = await Media.create(mediaData);

    // If media is TV and seen or pending, create TV seasons
    if ((seenData || pendingData) && media_type === "tv") {
      const seasonPromises = [];

      // Create TV seasons based on the number of seasons provided
      for (
        let seasonNumber = 1;
        seasonNumber <= number_seasons;
        seasonNumber++
      ) {
        const mediaTvSeasonExists = await MediaTvSeason.findOne({
          mediaId,
          userId,
          season: seasonNumber,
        });
        if (!mediaTvSeasonExists) {
          const seasonData = {
            userId,
            mediaId,
            media_type,
            season: seasonNumber,
            seasonComplete: seenData,
            runtime,
            like,
            seen: seenData,
            pending: pendingData,
            vote,
          };
          seasonPromises.push(MediaTvSeason.create(seasonData));
        }
      }

      // Wait for all TV seasons to be created
      await Promise.all(seasonPromises);
    }

    // Send success response with the added media
    res.status(201).json(addMedia);
  } catch (error) {
    // Forward error to error handling middleware
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const media = await Media.findOne({
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
    const { like, seen, pending, vote } = req.body;
    const media = await req.media;
    if (!media) {
      next(createError(404, "Media not found"));
    }
    const Id = media.id;
    const userId = req.user.id;

    let seenData = false;
    let pendingData = false;

    // Determine the values of seenData and pendingData based on the input conditions
    if (!seen && !pending) {
      seenData = media.seen;
      pendingData = media.pending;
    } else if (seen && !pending) {
      seenData = true;
    } else if (vote >= 0) {
      seenData = true;
    } else {
      pendingData = true;
    }
    // Prepare data
    let mediaData = {
      seenComplete: seenData,
      like: like || media.like,
      seen: seenData,
      pending: pendingData,
      vote: vote || media.vote,
    };
    // Update new media
    const updateMedia = await Media.findByIdAndUpdate(Id, mediaData, {
      new: true,
    });

    // If media is TV and seen or pending, create or update TV seasons
    if ((seenData || pendingData) && media.media_type === "tv") {
      const seasonPromises = [];

      // Create or Update TV seasons based on the number of seasons provided
      for (
        let seasonNumber = 1;
        seasonNumber <= media.number_seasons;
        seasonNumber++
      ) {
        const mediaTvSeasonExists = await MediaTvSeason.findOne({
          mediaId: media.mediaId,
          userId,
          season: seasonNumber,
        });
        const seasonData = {
          userId,
          mediaId: media.mediaId,
          media_type: media.mediaId,
          season: seasonNumber,
          seasonComplete: seenData,
          runtime: media.mediaId,
          like: like || media.like,
          seen: seenData,
          pending: pendingData,
          vote: vote || media.vote,
        };
        if (!mediaTvSeasonExists) {
          seasonPromises.push(MediaTvSeason.create(seasonData));
        } else {
          seasonPromises.push(
            MediaTvSeason.findByIdAndUpdate(
              mediaTvSeasonExists.id,
              seasonData,
              {
                new: true,
              }
            )
          );
        }
      }

      // Wait for all TV seasons to be created or update
      await Promise.all(seasonPromises);
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
    const userId = req.user.id;
    const mediaId = media.mediaId;
    const deletedMedia = await Media.findOneAndDelete({ mediaId, userId });
    if (media.media_type === "tv") {
      // Delete all TV seasons associated with the TV media
      await MediaTvSeason.deleteMany({ mediaId });
    }

    if (!deletedMedia) {
      return next(createError(404, "Media not found"));
    }
    res.status(204).json({ message: "Media deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// - FOLLOWER

module.exports.following = async (req, res, next) => {
  try {
    const mediaTv = await req.params;
    const findMedia = await MediaTvFollowers.findOne({
      userId: req.user.id,
      mediaId: mediaTv.id,
    });

    if (findMedia) {
      return next(createError(404, "You are already following this Tv Show"));
    }
    const addMediaTv = await MediaTvFollowers.create({
      userId: req.user.id,
      mediaId: mediaTv.id,
    });
    // const { media_type, runtime, like, seen, pending, vote } =
    //   req.body;
    if (addMediaTv) {
      await module.exports.create(req, res, next);
      return;
    } else {
      res.status(200).json(updateMedia);
    }

    res.status(201).json(addMediaTv);
  } catch (error) {
    next(error);
  }
};

module.exports.followingMediaTv = async (req, res, next) => {
  try {
    const MediasTvUser = await MediaTvFollowers.findOne({
      userId: req.user.id,
      mediaId: req.params.id,
    });
    // If user dont following this Tv Shows, return empty
    if (!MediasTvUser) {
      return res.status(204).send();
    }
    res.status(200).json(MediasTvUser);
  } catch (error) {
    next(error);
  }
};

module.exports.unFollowing = async (req, res, next) => {
  try {
    const mediaTv = await req.params;

    const deletePlaylist = await MediaTvFollowers.findOneAndDelete({
      userId: req.user.id,
      mediaId: mediaTv.id,
    });

    if (!deletePlaylist) {
      return next(createError(404, "Tv Show not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};
