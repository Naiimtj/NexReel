const express = require("express");
const router = express.Router();
const upload = require("../config/multer.config");
// middlewares
const {
  auth,
  authMedia,
  authMediaTvSeason,
  authMediaTvEpisode,
  authPlaylist,
  authMessage,
  authForum,
} = require("../middlewares");
// controllers
const {
  users,
  medias,
  media,
  mediaTvSeason,
  mediaTvEpisode,
  playlists,
  messages,
  forums,
  plex
} = require("../controllers");
const Playlist = require("../models/Playlist/playlist.model");
const Forum = require("../models/Forum/forum.model");

router.get("/plex", auth.isAuthenticated, plex.list);
router.post("/plex", auth.isAuthenticated, plex.create);

// < USER
router.post("/login", users.login);
router.post("/logout", users.logout);
router.post("/register", upload.single("avatarURL"), users.create);
router.get("/users", auth.isAuthenticated, users.list);
router.get("/users/search", auth.isAuthenticated, users.search);
router.get("/users/me", auth.isAuthenticated, users.detail);
router.get("/users/:id", auth.isAuthenticated, users.detailUser);
router.patch("/users/me", auth.isAuthenticated, upload.single("avatarURL"), users.update);
router.patch("/users/me/notifications", auth.isAuthenticated, users.updateNotifications);
router.delete("/users/me", auth.isAuthenticated, users.delete);
// Followers User
router.get("/user/followers", auth.isAuthenticated, users.followers);
router.post("/users/:userId/follows", auth.isAuthenticated, users.following);
router.post("/users/:userId/follow", auth.isAuthenticated, users.followingConfirm);
router.get("/users/:userId/follow", auth.isAuthenticated, users.followingDetail);
router.delete("/users/:userId/follows", auth.isAuthenticated, users.unFollowing);
router.delete("/users/:userId/nofollow", auth.isAuthenticated, users.unFollow);

// < MEDIA
// - MEDIA
router.post("/medias", auth.isAuthenticated, medias.create);
router.get("/medias/:id", auth.isAuthenticated, medias.detail);
router.get("/medias", auth.isAuthenticated, medias.list);
router.patch("/medias/:id", auth.isAuthenticated, authMedia.exists, authMedia.isOwnerOrAdmin, medias.update);
router.delete("/medias/:id", auth.isAuthenticated, authMedia.exists, authMedia.isOwnerOrAdmin, medias.delete);

// - MEDIA TV SEASON
router.post("/mediasTvSeason/:mediaId", auth.isAuthenticated, mediaTvSeason.create);
router.get("/mediasTvSeason/:id", auth.isAuthenticated, mediaTvSeason.detail);
router.get("/mediasTvSeason", auth.isAuthenticated, mediaTvSeason.list);
router.patch("/mediasTvSeason/:id/:season", auth.isAuthenticated, authMediaTvSeason.exists, authMediaTvSeason.isOwnerOrAdmin, mediaTvSeason.update);
router.delete("/mediasTvSeason/:id", auth.isAuthenticated, authMediaTvSeason.exists, authMediaTvSeason.isOwnerOrAdmin, mediaTvSeason.delete);

// - MEDIA TV EPISODE
router.post("/mediasTvEpisode", auth.isAuthenticated, mediaTvEpisode.create);
router.get("/mediasTvEpisode/:id", auth.isAuthenticated, mediaTvEpisode.detail);
router.get("/mediasTvEpisode", auth.isAuthenticated, mediaTvEpisode.list);
router.patch("/mediasTvEpisode/:id", auth.isAuthenticated, authMediaTvEpisode.exists, authMediaTvEpisode.isOwnerOrAdmin, mediaTvEpisode.update);
router.delete("/mediasTvEpisode/:id", auth.isAuthenticated, authMediaTvEpisode.exists, authMediaTvEpisode.isOwnerOrAdmin, mediaTvEpisode.delete);

// < PLAYLIST
router.post("/playlists", auth.isAuthenticated, upload.single("imgPlaylist"), playlists.create);
router.get("/playlists", auth.isAuthenticated, playlists.list);
router.get("/playlists/me", auth.isAuthenticated, playlists.listUser);
router.get("/playlists/search", auth.isAuthenticated, playlists.search);
router.get("/playlists/:id", auth.isAuthenticated, authPlaylist.exists, playlists.detail);
router.patch("/playlists/:id", auth.isAuthenticated, authPlaylist.exists, authPlaylist.isOwnerOrAdmin, upload.single("imgPlaylist"), playlists.update);
router.delete("/playlists/:id", auth.isAuthenticated, authPlaylist.exists, authPlaylist.isOwnerOrAdmin, playlists.delete);
// Followers Playlist
router.post("/playlists/:id/follow", auth.isAuthenticated, authPlaylist.exists, playlists.following);
router.get("/playlists/:id/follow", auth.isAuthenticated, authPlaylist.exists, playlists.followingUser);
router.patch("/playlists/:id/follow", auth.isAuthenticated, authPlaylist.exists, playlists.updateLike);
router.delete("/playlists/:id/follow", auth.isAuthenticated, authPlaylist.exists, playlists.unFollowing);
// . Add MEDIA
router.post("/playlists/:id/media", auth.isAuthenticated, authPlaylist.exists, authPlaylist.isOwnerOrAdmin, media.create(Playlist, "playlist"))
router.delete("/playlists/:id/media", auth.isAuthenticated, authPlaylist.exists, authPlaylist.isOwnerOrAdmin, media.delete(Playlist, "playlist"));

// < FORUM
router.post("/forums", auth.isAuthenticated, upload.single("imgForum"), forums.create);
router.get("/forums", auth.isAuthenticated, forums.list);
router.get("/forums/:id", auth.isAuthenticated, authForum.exists, forums.detail);
router.patch( "/forums/:id", auth.isAuthenticated, authForum.exists, authForum.isOwnerOrAdmin, upload.single("imgForum"), forums.update);
router.delete("/forums/:id", auth.isAuthenticated, authForum.exists, authForum.isOwnerOrAdmin, forums.delete);
// Followers Forum
router.post("/forums/:id/follow", auth.isAuthenticated, authForum.exists, forums.following);
router.patch("/forums/:id/follow", auth.isAuthenticated, authForum.exists, forums.updateLike);
router.delete("/forums/:id/follow", auth.isAuthenticated, authForum.exists, forums.unFollowing);
// . Add MEDIA
router.post("/forums/:id/media", auth.isAuthenticated, authForum.exists, authForum.isOwnerOrAdmin, media.create(Forum, "forum"))
router.delete("/forums/:id/media", auth.isAuthenticated, authForum.exists, authForum.isOwnerOrAdmin, media.delete(Forum, "forum"));

// < MESSAGE
router.post("/forums/:forumId/messages", auth.isAuthenticated, messages.create({mode: 'forum'}));
router.post("/users/:userId/messages", auth.isAuthenticated, messages.create({mode: 'user'}));
router.get("/forums/:forumId/messages", auth.isAuthenticated, messages.list({mode: 'forum'}));
router.get("/forums/:forumId/messages/:id", auth.isAuthenticated, messages.detail({mode: 'forum'}));
router.get("/users/:userId/messages", auth.isAuthenticated, messages.list({mode: 'user'}));
router.get("/users/:userId/messages/:id", auth.isAuthenticated, authMessage.exists, messages.detail({mode: 'user'}));
router.patch("/messages/:id", auth.isAuthenticated, authMessage.exists, authMessage.isOwnerOrAdmin, messages.update);
router.delete("/messages/:id", auth.isAuthenticated, authMessage.exists, authMessage.isOwnerOrAdmin, messages.delete);

module.exports = router;
