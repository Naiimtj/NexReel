const createError = require("http-errors");

module.exports.create = (Model, param) => {
  return async (req, res, next) => {
    const data = req[param];
    try {
      const { mediaId, media_type, runtime } = req.body;
      const media = await Model.findById(data.id);
      const mediaExists = media.medias.some(
        (media) => media.mediaId === mediaId
      );
      if (mediaExists) {
        next(createError(404, `Is in the ${param}`));
      } else {
        const createdAt = new Date().toISOString();
        media.medias.push({
          mediaId,
          media_type,
          runtime,
          createdAt,
        });
        const dataSave = await media.save();
        if (!dataSave) {
          next(createError(404, "Is not save"));
        }
        res.status(201).json(dataSave);
      }
    } catch (error) {
      next(error);
    }
  };
};

module.exports.delete = (Model, param) => {
  return async (req, res, next) => {
    const data = req[param];
    const { mediaIdDelete } = req.body;
    try {
      const findId = await Model.findById(data.id);
      const mediaExists = findId.medias.some(
        (media) => media.mediaId === mediaIdDelete
      );
      if (!mediaExists) {
        next(createError(404, "Media is not exist"));
      } else {
        const deleteMediaData = await Model.findByIdAndUpdate(
          data.id,
          {
            $pull: { medias: { mediaId: mediaIdDelete } },
          },
          { new: true }
        );
        res.status(201).json(deleteMediaData);
      }
    } catch (error) {
      next(error);
    }
  };
};
