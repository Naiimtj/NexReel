const createError = require("http-errors");
const Playlist = require("../../models/Playlist/playlist.model");
const PlaylistFollowers = require("../../models/Playlist/follower.model");

module.exports.create = async (req, res, next) => {
  try {
    const { title, description, medias, tags } = req.body;
    const playlist = await Playlist.create({
      title,
      description,
      tags,
      medias,
      author: req.user.id,
      imgPlaylist: req.file
        ? req.file.path
        : "https://res.cloudinary.com/dznwlaen6/image/upload/v1698741021/nexreel/default/List_Media.webp",
    });
    if (!playlist) {
      next(createError(404, "Playlist not created"));
    }
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.playlist.id)
      .populate("followersPlaylist")
      .populate("user", "username");
    if (!playlist) {
      next(createError(404, "Playlist not found"));
    }
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const playlist = await Playlist.find({}).populate("followersPlaylist");
    if (!playlist) {
      next(createError(404, "Playlist not found"));
    }
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

module.exports.search = async (req, res, next) => {
  try {
    const { title } = req.query;
    const playlistFind = await Playlist.find({
      $or: [
        { title: new RegExp(title, "i") },
        { tags: new RegExp(title, "i") },
      ],
    })
      .populate("followersPlaylist")
      .populate("user", "username");
    if (!playlistFind) {
      return next(createError(404, "Playlist not found"));
    }
    const playlists = playlistFind.filter(
      (playlist) => playlist.author !== req.user.id
    );
    if (!playlists) {
      return next(createError(404, "Playlist not found"));
    }
    res.status(200).json({ results: playlists });
  } catch (error) {
    next(error);
  }
};

module.exports.update = async (req, res, next) => {
  const body = { ...req.body };
  if (req.file) {
    delete body.imgPlaylist;
    body.imgPlaylist = req.file.path;
  }
  try {
    const { title, description, tags, medias, imgPlaylist } = body;
    let playlist = req.playlist;
    if (playlist) {
      playlist.title = title || playlist.title;
      playlist.description = description || playlist.description;
      playlist.tags = tags || playlist.tags;
      playlist.medias = medias || playlist.medias;
      playlist.imgPlaylist = imgPlaylist || playlist.imgPlaylist;
      playlist = await playlist.save();
      res.status(200).json(playlist);
    } else {
      next(createError(403, "This Playlist was not created by you"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const playlist = await req.playlist;

    if (!playlist) {
      return next(createError(404, "Playlist not found"));
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlist.id);

    if (!deletedPlaylist) {
      return next(createError(404, "Playlist not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};

// - FOLLOWER

module.exports.following = async (req, res, next) => {
  try {
    const playlist = await req.playlist;

    const findPlaylist = await PlaylistFollowers.findOne({
      userId: req.user.id,
      playlistId: playlist.id,
    });

    if (findPlaylist) {
      return next(createError(404, "You are already following this playlist"));
    }
    if (req.user.id === playlist.author.toString()) {
      return next(createError(404, "You can't follow your own forum"));
    }
    const addPlaylist = await PlaylistFollowers.create({
      userId: req.user.id,
      playlistId: playlist.id,
    });

    res.status(201).json(addPlaylist);
  } catch (error) {
    next(error);
  }
};

module.exports.followingUser = async (req, res, next) => {
  try {
    const playlistsFollowers = await Playlist.findById(req.params.id);
    if (!playlistsFollowers) {
      return next(createError(404, "Playlist does not exist"));
    }
    const playlistUser = await PlaylistFollowers.findOne({
      userId: req.user.id,
      playlistId: req.params.id,
    });
    // If user dont following this playlist, return empty
    if (!playlistUser) {
      return res.status(204).send();
    }
    res.status(200).json(playlistUser);
  } catch (error) {
    next(error);
  }
};

module.exports.updateLike = async (req, res, next) => {
  try {
    const { like } = req.body;
    const playlist = await req.playlist;

    if (!playlist) {
      next(createError(404, "Like Playlist not found"));
    }
    const updateLikePlaylist = await PlaylistFollowers.findOneAndUpdate(
      { playlistId: playlist.id, userId: req.user.id },
      {
        like: like,
      }
    );
    if (updateLikePlaylist) {
      res.status(200).json(updateLikePlaylist);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.unFollowing = async (req, res, next) => {
  try {
    const playlist = await req.playlist;

    const deletePlaylist = await PlaylistFollowers.findOneAndDelete({
      userId: req.user.id,
      playlistId: playlist.id,
    });

    if (!deletePlaylist) {
      return next(createError(404, "Playlist not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};
