const createError = require("http-errors");
const Media = require("../../models/User/media.model");
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
      number_of_episodes,
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
    // If you vote you seen
    if (vote >= 0 && seen) {
      seenData = true;
    } else if(vote >= 0){
      pendingData = true;
    }

    const mediaExists = await Media.findOne({ mediaId, userId });
    if (mediaExists) {
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
        number_of_episodes: number_of_episodes,
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
            number_seasons,
            number_of_episodes,
            seenComplete: seenData,
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
      return;
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

module.exports.update = async (req, res, next) => {
  try {
    const { like, seen, pending, vote } = req.body;
    const media = await req.media;
    if (!media) {
      next(createError(404, "Media not found"));
    }
    const mediaId = media.mediaId;
    const userId = req.user.id;

    let seenData = false;
    let pendingData = false;

    // Determine the values of seenData and pendingData based on the input conditions
    if (seen === undefined && pending === undefined) {
      seenData = media.seen;
      pendingData = media.pending;
    } else if (seen) {
      seenData = true;
    } else if(pending){
      pendingData = true;
    }

    // If have vote is seen
    if (vote >= 0) {
      seenData = true;
    }

    // Prepare data
    let mediaData = {
      seenComplete: seenData,
      like: like || media.like,
      seen: seenData,
      pending: pendingData,
      vote: vote || media.vote,
    };
    if (!seenData && !pendingData) {
      await module.exports.delete(req, res, next);
      return;
    }
    // Update new media
    const updateMedia = await Media.findOneAndUpdate({mediaId, userId}, mediaData, {
      new: true,
    });
    if (updateMedia) {
      // If media is TV and seen or pending, create or update TV seasons
      if (media.media_type === "tv") {
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
            media_type: media.media_type,
            season: seasonNumber,
            number_seasons: media.number_seasons,
            number_of_episodes: media.number_of_episodes,
            seenComplete: seenData,
            runtime: media.runtime,
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
