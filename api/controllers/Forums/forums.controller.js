const createError = require("http-errors");
const Forum = require("../../models/Forum/forum.model");
const Follower = require("../../models/Forum/follower.model");

module.exports.create = async (req, res, next) => {
  try {
    const { title, shortDescription, description, tags } = req.body;
    console.log(req.body);
    const forum = await Forum.create({
      title,
      tags,
      shortDescription,
      description,
      author: req.user.id,
      imgForum: req.file
        ? req.file.path
        : "https://res.cloudinary.com/dznwlaen6/image/upload/v1698741021/nexreel/default/List_Media.webp",
    });
    if (!forum) {
      next(createError(404, "Forum not created"));
    }
    res.status(201).json(forum);
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const forum = await Forum.findById(req.params.id)
      .populate("followers")
      .populate("userCreate", "username");
    if (!forum) {
      next(createError(404, "Forum not found"));
    }
    res.json(forum);
  } catch (error) {
    next(error);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const forum = await Forum.find({}).populate("followers");
    if (!forum) {
      next(createError(404, "Forums not found"));
    }
    res.json(forum);
  } catch (error) {
    next(error);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      delete body.imgForum;
      body.imgForum = req.file.path;
    }
    const { title, shortDescription, description, tags, author, imgForum } =
      body;
    const forum = await req.forum.populate("followers");
    if (!forum) {
      next(createError(404, "Forum not found"));
    }
    const updateForum = await Forum.findByIdAndUpdate(
      forum.id,
      { title, shortDescription, description, tags, author, imgForum },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!updateForum) {
      next(createError(404, "Forum can't update"));
    }
    res.json(updateForum);
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const forum = await req.forum;

    if (!forum) {
      return next(createError(404, "Forum not found"));
    }
    const deletedForum = await Forum.findByIdAndDelete(forum.id);

    if (!deletedForum) {
      return next(createError(404, "Forum not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};

// - FOLLOWER

module.exports.following = async (req, res, next) => {
  try {
    const forum = await req.forum;
    const findForum = await Follower.findOne({
      userId: req.user.id,
      forumId: forum.id,
    });

    if (findForum) {
      return next(createError(404, "You are already following this forum"));
    }
    if (req.user.id === forum.author.toString()) {
      return next(createError(404, "You can't follow your own forum"));
    }
    const addForum = await Follower.create({
      userId: req.user.id,
      forumId: forum.id,
    });

    res.status(201).json(addForum);
  } catch (error) {
    next(error);
  }
};

module.exports.updateLike = async (req, res, next) => {
  try {
    const { like } = req.body;
    const forum = await req.forum;

    if (!forum) {
      next(createError(404, "Like Forum not found"));
    }
    const updateLikeForum = await Follower.findOneAndUpdate(
      { forumId: forum.id, userId: req.user.id },
      {
        like: like,
      }
    );
    if (updateLikeForum) {
      res.status(200).json(updateLikeForum);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.unFollowing = async (req, res, next) => {
  try {
    const forum = await req.forum;

    const deleteForum = await Follower.findOneAndDelete({
      userId: req.user.id,
      forumId: forum.id,
    });

    if (!deleteForum) {
      return next(createError(404, "Forum not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};
