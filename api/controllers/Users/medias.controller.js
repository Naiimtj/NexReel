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
    const mediaData = {
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

    // Create new media
    const addMedia = await Media.create(mediaData);

    // If media is TV and seen or pending, create TV seasons
    if ((seenData || pendingData) && media_type === "tv") {
      const seasonPromises = [];

      // Create TV seasons based on the number of seasons provided
      for (let seasonNumber = 1; seasonNumber <= number_seasons; seasonNumber++) {
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
    const mediaId = media.id
    const updateMedia = await Media.findByIdAndUpdate(
      mediaId,
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
        const updateMediaTv = await MediaTvSeason.findOneAndDelete(
          mediaId,
          {
            like,
            seen,
            pending,
            vote,
          },
          { new: true }
        );
        if ((seenData || pendingData) && media_type === "tv") {
          const seasonPromises = [];
    
          // Create TV seasons based on the number of seasons provided
          for (let seasonNumber = 1; seasonNumber <= number_seasons; seasonNumber++) {
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
            seasonPromises.push(MediaTvSeason.delete(seasonData));
          }
    
          // Wait for all TV seasons to be created
          await Promise.all(seasonPromises);
        }
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
    const deletedMedia = await Media.findByIdAndDelete(media.id);

    if (!deletedMedia) {
      return next(createError(404, "Media not found"));
    }

    res.status(204).json({ result: true });
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
