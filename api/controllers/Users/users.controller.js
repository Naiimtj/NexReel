const createError = require("http-errors");
const User = require("../../models/User/user.model");
const Follower = require("../../models/User/follower.model");
const PlaylistsFollowers = require("../../models/Playlist/follower.model");
const { DEFAULT_ROLE } = require("../../constants");
const Playlist = require("../../models/Playlist/playlist.model");

module.exports.create = async (req, res, next) => {
  const { email, password, username, region, favoritePhrase } = req.body;
  const users = await User.find({
    $or: [{ email }, { username }],
  });
  if (users.length > 0) {
    const error = {
      message: "Invalid user registration",
      errors: users.reduce((errors, user) => {
        if (user.email === email) {
          errors.email = "Email already exists";
        }
        if (user.username === username) {
          errors.username = "Username already exists";
        }
        return errors;
      }, {}),
    };
    next(createError(400, error));
  } else {
    const registerUser = await User.create({
      email,
      password,
      username,
      region,
      favoritePhrase,
      role: DEFAULT_ROLE,
      avatarURL: req.file
        ? req.file.path
        : "https://res.cloudinary.com/dznwlaen6/image/upload/v1699548563/nexreel/default/default.webp",
    });
    if (!registerUser) {
      return next(createError(404, "User not created"));
    }
    res.status(200).json(registerUser);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.id } },
      "avatarURL username favoritePhrase createdAt"
    )
      .populate("followers")
      .populate("following");
    if (!users) {
      return next(createError(404, "Users not found"));
    }

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

module.exports.search = async (req, res, next) => {
  try {
    const { username } = req.query;
    const usersFind = await User.find(
      { username: new RegExp(username, "i") },
      "avatarURL username"
    );
    if (!usersFind) {
      return next(createError(404, "Users not found"));
    }
    const users = usersFind.filter((user) => user.id !== req.user.id);
    if (!users) {
      return next(createError(404, "Users not found"));
    }
    res.status(200).json({ results: users });
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("medias")
      .populate({
        path: "playlists",
        populate: {
          path: "followersPlaylist",
        },
      })
      .populate("forums")
      .populate("followers")
      .populate("following");
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const userPlaylistsFollow = await PlaylistsFollowers.find({
      userId: req.user.id,
    });
    const playlistsDetails = [];
    for (const playlistFollow of userPlaylistsFollow) {
      try {
        const playlist = await Playlist.findById(playlistFollow.playlistId)
          .populate("followersPlaylist")
          .populate("user", "username");
        if (!playlist) {
          playlistsDetails.push({});
        } else {
          playlistsDetails.push(playlist);
        }
      } catch (error) {
        return next(error);
      }
    }
    user.playlistsFollow = playlistsDetails;

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports.detailUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("medias")
      .populate("playlists")
      .populate("followers")
      .populate("following");
    if (!user) {
      return next(createError(404, "User not found"));
    }
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports.update = async (req, res, next) => {
  const body = { ...req.body };
  if (req.file) {
    delete body.avatarURL;
    body.avatarURL = req.file.path;
  }
  try {
    const {
      email,
      password,
      username,
      region,
      favoritePhrase,
      avatarURL,
      genresLike,
      genresUnLike,
    } = body;

    let user = req.user;
    if (user) {
      user.email = email || user.email;
      user.password = password || user.password;
      user.username = username || user.username;
      user.region = region || user.region;
      user.favoritePhrase = favoritePhrase || user.favoritePhrase;
      user.avatarURL = avatarURL || user.avatarURL;
      user.genresLike = genresLike || user.genresLike;
      user.genresUnLike = genresUnLike || user.genresUnLike;
      user = await user.save();
      res.status(200).json(user);
    } else {
      next(createError(403, "This User was not created by you"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports.updateNotifications = async (req, res, next) => {
  try {
    const { notificationsRead } = req.body;
    let user = req.user;
    if (user) {
      user.notificationsRead = notificationsRead;
      user = await user.save();
      res.status(200).json(user);
    } else {
      next(createError(403, "This User was not created by you"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const deletedUser = await User.findByIdAndDelete(user.id);

    if (!deletedUser) {
      return next(createError(404, "User not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};

// - FOLLOWER

module.exports.following = async (req, res, next) => {
  const UserIDFollower = req.user.id;
  const UserIDFollowing = req.params.userId;
  try {
    const follower = await Follower.findOne({
      UserIDFollower,
      UserIDFollowing,
    });

    if (follower) {
      return next(createError(404, "You are already following this user"));
    }

    if (UserIDFollowing === UserIDFollower) {
      return next(createError(403, "You can't follow your own user"));
    } else {
      const following = await Follower.create({
        UserIDFollower,
        UserIDFollowing,
      });
      await User.findByIdAndUpdate(UserIDFollowing, {
        notificationsRead: true,
      });
      res.status(201).json(following);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.followingConfirm = async (req, res, next) => {
  const UserIDFollower = req.params.userId;
  const UserIDFollowing = req.user.id;
  try {
    const follower = await Follower.findOne({
      UserIDFollower,
      UserIDFollowing,
    });
    if (!follower) {
      return next(
        createError(404, "You don't have a follow-up request from this user")
      );
    }

    if (UserIDFollowing === UserIDFollower) {
      return next(createError(403, "You don't have a follow your own user"));
    }

    const updateFollowing = await Follower.findByIdAndUpdate(
      follower.id,
      {
        UserConfirm: true,
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!updateFollowing) {
      return next(createError(404, "Follow not found"));
    }

    res.status(200).json(updateFollowing);
  } catch (error) {
    next(error);
  }
};

module.exports.followingDetail = async (req, res, next) => {
  try {
    const isFollow = await Follower.findOne({
      UserIDFollower: req.user.id,
      UserIDFollowing: req.params.userId,
      UserConfirm: true,
    });
    if (!isFollow) {
      const user = await User.findById(
        { _id: req.params.userId },
        "-email"
      ).populate("playlists");
      if (!user) {
        return next(createError(404, "User not found"));
      }
      const isSendingFollow = await Follower.findOne({
        UserIDFollower: req.user.id,
        UserIDFollowing: req.params.userId,
      });

      if (isSendingFollow) {
        res.status(200).json({ user, isFollowing: true, isConfirm: false });
      } else {
        res.status(200).json({ user, isFollowing: false, isConfirm: false });
      }
    } else {
      const user = await User.findById({ _id: req.params.userId }, "-email")
        .populate("medias")
        .populate({
          path: "playlists",
          populate: {
            path: "followersPlaylist",
          },
        })
        .populate("followers")
        .populate("following");
      if (!user) {
        return next(createError(404, "User not found"));
      }
      res.status(200).json({ user, isFollowing: true, isConfirm: true });
    }
  } catch (error) {
    next(error);
  }
};

module.exports.unFollow = async (req, res, next) => {
  try {
    const follower = await Follower.findOne({
      UserIDFollower: req.user.id,
      UserIDFollowing: req.params.userId,
    });
    if (!follower) {
      return next(createError(404, "UnFollower not found"));
    }

    if (follower) {
      const unFollower = await Follower.findByIdAndDelete(follower.id);

      if (!unFollower) {
        return next(createError(404, "UnFollower not found"));
      }
      await User.findByIdAndUpdate(req.params.userId, {
        notificationsRead: false,
      });
      res.status(204).json({ result: true });
    } else {
      next(createError(403, "This Follow is not yours"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports.unFollowing = async (req, res, next) => {
  try {
    const follower = await Follower.findOne({
      UserIDFollower: req.params.userId,
      UserIDFollowing: req.user.id,
    });
    if (!follower) {
      return next(createError(404, "UnFollower not found"));
    }

    if (follower) {
      const unFollower = await Follower.findByIdAndDelete(follower.id);

      if (!unFollower) {
        return next(createError(404, "UnFollower not found"));
      }

      res.status(204).json({ result: true });
    } else {
      next(createError(403, "This Follow is not yours"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports.followers = async (req, res, next) => {
  try {
    const user = await Follower.find({ UserIDFollowing: req.user.id }).populate(
      "user",
      "username"
    );
    if (!user) {
      next(createError(404, "Followers User not found"));
    }
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ error: "unauthorized" });
    }
    user.checkPassword(req.body.password).then((match) => {
      if (match) {
        req.session.userId = user.id;
        res.status(200).json(user);
      } else {
        res.status(401).json({ error: "Incorrect email or password" });
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports.logout = (req, res, next) => {
  req.session.destroy();
  res.status(204).json({ result: true });
};
