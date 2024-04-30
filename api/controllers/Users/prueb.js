const mediasController = require('./medias');

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
    } = req.body;

    const userId = req.user.id;

    // Determine the values of seenData and pendingData based on the input conditions
    let seenData = false;
    let pendingData = false;

    if (seen && !pending) {
      seenData = true;
    } else {
      pendingData = true;
    }

    // If you vote you seen
    if (vote >= 0) {
      seenData = true;
    }

    const mediaExists = await MediaTvSeason.findOne({
      mediaId,
      userId,
      season: req.params.season,
    });

    if (mediaExists) {
      return next(createError(404, "Media Season already exists"));
    } else {
      const media = await Media.findOne({ mediaId, userId });
      if (!media) {
        // If the media does not exist, create it using medias.create function
        const mediaData = {
          mediaId,
          media_type,
          runtime,
          like,
          seen,
          seenComplete: seenData,
          pending: pendingData,
          vote,
          userId,
        };

        if (media_type === "tv") {
          mediaData.number_seasons = 1; // Assuming there is always at least one season
        }

        await mediasController.create({
          body: mediaData,
          user: { id: userId }, // You may need to adjust this if req.user is used in medias.create
        });
      }

      // Now the media should exist, proceed with creating the media TV season
      const seasonData = {
        userId,
        mediaId,
        media_type,
        season: req.params.season,
        seasonComplete: seenData,
        runtime,
        like,
        seen: seenData,
        pending: pendingData,
        vote,
      };

      const addMedia = await MediaTvSeason.create(seasonData);
      res.status(201).json(addMedia);
    }
  } catch (error) {
    next(error);
  }
};