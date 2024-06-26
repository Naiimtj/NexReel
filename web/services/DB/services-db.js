import axios from "axios";

const service = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_URL_DB,
});

service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (
      error.response.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("user");
      window.location.assign("/login");
    } else {
      return Promise.reject(error);
    }
  }
);

// . POST
// Log In
export async function login(data) {
  return service.post("/login", data);
}
// . POST
// Log Out
export async function logoutDB() {
  const url = "/logout";
  try {
    const response = await service.post(url);
    return response;
  } catch (err) {
    console.error("Error Log Out:", err);
    return {};
  }
}
// . POST
// Register
export async function postRegister(data) {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("region", data.region);

  if (data.avatarURL) {
    formData.append("avatarURL", data.avatarURL[0]);
  }
  const response = await service.post("/register", formData);
  return response;
}

// < PLEX
// - GET LIST ALL DATA
// List of all data of plex
export async function getPlexAllData() {
  try {
    const response = await service.get("/plex");
    return response[0];
  } catch (err) {
    console.error("Error all plex data:", err);
    return {};
  }
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// < USER
//.SEARCH USER
export async function getSearchUsers(searchValue) {
  try {
    const response = await service.get(`/users/search?username=${searchValue}`);
    return response;
  } catch (err) {
    console.error("Error Search User:", err);
    return {};
  }
}
// - GET
// User Profile
export async function getUser() {
  try {
    const response = await service.get("/users/me");
    return response;
  } catch (err) {
    console.error("Error profile:", err);
    return {};
  }
}
// - GET
// Info User
export async function getInfoUser(id) {
  try {
    const response = await service.get(`/users/${id}`);
    return response;
  } catch (err) {
    console.error("Error profile:", err);
    return {};
  }
}
// - GET
// All Users
export async function getUsers() {
  try {
    const response = await service.get("/users");
    return response;
  } catch (err) {
    console.error("Error all users:", err);
    return {};
  }
}
// * PATCH
// Update user
export async function patchUser(data) {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("email", data.email);
  formData.append("region", data.region);
  formData.append("favoritePhrase", data.favoritePhrase);
  if (typeof data.avatarURL === "object") {
    formData.append("avatarURL", data.avatarURL[0]);
  }
  const response = await service.patch("users/me", formData);
  return response;
}
// * PATCH
// Update Notification Read
export async function patchNotifications(data) {
  const response = await service.patch("/users/me/notifications", data);
  return response;
}
// ! DELETE
// delete
export async function deleteUser() {
  const url = "/users/me";
  try {
    const response = await service.delete(url);
    return response;
  } catch (err) {
    console.error("Error Delete user:", err);
    return {};
  }
}
// --------- FOLLOW USER
// - GET
// Detail User
export async function getDetailUser(id) {
  const url = `/users/${id}/follow`;
  try {
    const response = await service.get(url);
    return response;
  } catch (err) {
    console.error("Error profile:", err);
    return {};
  }
}
// - GET
// Followers User
export async function getFollowersUser() {
  try {
    const response = await service.get("/user/followers");
    return response;
  } catch (err) {
    console.error("Error profile:", err);
    localStorage.removeItem("user");
    return {};
  }
}
// . POST
// Confirm Following
export async function postConfirmFollow(id) {
  const url = `/users/${id}/follow`;
  try {
    const response = await service.post(url);
    return response;
  } catch (err) {
    console.error("Error Confirm Follow:", err);
    return {};
  }
}
// . POST
// Following
export async function postFollow(id) {
  const url = `/users/${id}/follows`;
  try {
    const response = await service.post(url);
    return response;
  } catch (err) {
    console.error("Error Post Follow:", err);
    return {};
  }
}
// ! DELETE
// Delete Follower
export async function deleteFollower(id) {
  const url = `/users/${id}/follows`;
  try {
    const response = await service.delete(url);
    return response;
  } catch (err) {
    console.error("Error Delete user:", err);
    return {};
  }
}
// ! DELETE
// Delete Follow
export async function UnFollow(id) {
  const url = `/users/${id}/nofollow`;
  try {
    const response = await service.delete(url);
    return response;
  } catch (err) {
    console.error("Error Delete user:", err);
    return {};
  }
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// < PLAYLISTS
//.SEARCH PLAYLISTS
export async function getSearchPlaylists(searchValue) {
  try {
    const response = await service.get(
      `/playlists/search?title=${searchValue}`
    );
    return response;
  } catch (err) {
    console.error("Error Search Playlists:", err);
    return {};
  }
}
// . POST
// New Playlist
export async function postPlaylist(data) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  for (const tag of data.tags) {
    const trimmedTag = tag.trim();
    if (trimmedTag) {
      formData.append("tags[]", trimmedTag);
    }
  }

  if (data.imgPlaylist) {
    formData.append("imgPlaylist", data.imgPlaylist[0]);
  }
  const response = await service.post("/playlists", formData);
  return response;
}
// - GET
// List Playlist
export async function getListPlaylist() {
  const url = `/playlists`;
  try {
    const response = await service.get(url);
    return response;
  } catch (err) {
    console.error("Error profile:", err);
    return {};
  }
}
// - GET
// List Playlist for current user
export async function getUserListPlaylist() {
  const url = `/playlists/me`;
  try {
    const response = await service.get(url);
    return response;
  } catch (err) {
    console.error("Error playlist:", err);
    return {};
  }
}
// - GET
// Detail Playlist
export async function getDetailPlaylist(id) {
  const url = `/playlists/${id}`;
  try {
    const response = await service.get(url);
    return response;
  } catch (err) {
    console.error("Error profile:", err);
    return {};
  }
}
// * PATCH
// Update Playlist
export async function patchPlaylist(id, data) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  for (const tag of data.tags) {
    const trimmedTag = tag.trim();
    if (trimmedTag) {
      formData.append("tags[]", trimmedTag);
    }
  }

  if (typeof data.imgPlaylist === "object") {
    formData.append("imgPlaylist", data.imgPlaylist[0]);
  }
  const response = await service.patch(`/playlists/${id}`, formData);
  return response;
}
// ! DELETE
// delete
export async function deletePlaylist(id) {
  const url = `/playlists/${id}`;
  try {
    const response = await service.delete(url);
    return response;
  } catch (err) {
    console.error("Error Delete user:", err);
    return {};
  }
}
// ------- MEDIAS PLAYLIST
// . POST MEDIA
// New Media
export async function postPlaylistMedia(id, data) {
  const response = await service.post(`/playlists/${id}/media`, data);
  return response;
}
// ! DELETE MEDIA
// Delete One Media
export async function deletePlaylistMedia(id, data) {
  const response = await service.delete(`playlists/${id}/media`, { data });
  return response;
}
// ------------ FOLLOW PLAYLISTS
// . POST
// Following
export async function postFollowPlaylist(id) {
  const url = `/playlists/${id}/follow`;
  try {
    const response = await service.post(url);
    return response;
  } catch (err) {
    console.error("Error Post Follow:", err);
    return {};
  }
}
// - GET
// Following Details
export async function getFollowPlaylistDetail(id) {
  const url = `/playlists/${id}/follow`;
  try {
    const response = await service.get(url);
    return response;
  } catch (err) {
    return {};
  }
}
// * PATCH
// Update Following Playlist
export async function patchFollowPlaylist(id, data) {
  try {
    const response = await service.patch(`/playlists/${id}/follow`, data);
    return response;
  } catch (err) {
    console.error("Error update Follow Playlist:", err);
    return {};
  }
}
// ! DELETE
// delete
export async function deleteFollowPlaylist(id) {
  const url = `/playlists/${id}/follow`;
  try {
    const response = await service.delete(url);
    return response;
  } catch (err) {
    console.error("Error Delete user:", err);
    return {};
  }
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// < MEDIAS
// . POST
// Add Media
export async function postMedia(mediaType, data) {
  try {
    const response = await service.post(`/medias/${mediaType}`, data);
    return response;
  } catch (err) {
    console.error("Error Post Media:", err);
    return {};
  }
}
// - GET
// All Medias
export async function getAllMedia() {
  const response = await service.get("/medias");
  if (response) {
    return response;
  }
  return {};
}
// - GET
// Detail Medias
export async function getDetailMedia(id, mediaType) {
  const response = await service.get(`/medias/${mediaType}/${id}`);
  if (response) {
    return response;
  }
  return {};
}
// * PATCH
// Update Medias
export async function patchMedia(id, mediaType, data) {
  try {
    const response = await service.patch(`/medias/${mediaType}/${id}`, data);
    return response;
  } catch (err) {
    console.error("Error update media user:", err);
    return {};
  }
}
// ! DELETE
// Delete Media
export async function deleteMedia(id) {
  const url = `/medias/${id}`;
  try {
    const response = await service.delete(url);
    return response;
  } catch (err) {
    console.error("Error Delete Media:", err);
    return {};
  }
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// < SEASONS
// . POST
// Add Media
export async function postSeasons(mediaId, data) {
  try {
    const response = await service.post(`/seasons/${mediaId}`, data);
    return response;
  } catch (err) {
    console.error("Error Post Season:", err);
    return {};
  }
}
// - GET
// All Medias
export async function getAllSeasons(mediaId) {
  const response = await service.get(`/seasons/${mediaId}`);
  if (response) {
    return response;
  }
  return {};
}
// - GET
// Detail Medias
export async function getDetailSeasons(mediaId, season) {
  const response = await service.get(`/seasons/${mediaId}/${season}`);
  if (response) {
    return response;
  }
  return {};
}
// * PATCH
// Update Medias
export async function patchSeasons(mediaId, season, data) {
  try {
    const response = await service.patch(`/seasons/${mediaId}/${season}`, data);
    return response;
  } catch (err) {
    console.error("Error update media user:", err);
    return {};
  }
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// < FORUMS
// . POST
// Add Forum
export async function postForum(data) {
  const formData = new FormData();
  formData.append("title", data.title);
  for (const tag of data.tags) {
    const trimmedTag = tag.trim();
    if (trimmedTag) {
      formData.append("tags[]", trimmedTag);
    }
  }
  formData.append("shortDescription", data.shortDescription);
  formData.append("description", data.description);
  if (data.imgForum) {
    formData.append("imgForum", data.imgForum[0]);
  }
  const response = await service.post("/forums", formData);
  return response;
}
// - GET
// Detail Forums
export async function getDetailForum(id) {
  const url = `/forums/${id}`;
  const response = await service.get(url);
  if (response) {
    return response;
  }
  return {};
}
// - GET
// List Forum
export async function getListForum() {
  try {
    const response = await service.get("/forums");
    return response;
  } catch (err) {
    console.error("Error profile:", err);
    return {};
  }
}
// * PATCH
// Update Forums
export async function patchForum(id, data) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("shortDescription", data.shortDescription);
  formData.append("description", data.description);
  for (const tag of data.tags) {
    const trimmedTag = tag.trim();
    if (trimmedTag) {
      formData.append("tags[]", trimmedTag);
    }
  }
  formData.append("author", data.author);

  if (typeof data.imgForum === "object") {
    formData.append("imgForum", data.imgForum[0]);
  }
  const response = await service.patch(`/forums/${id}`, formData);
  return response;
}
// ! DELETE
// Delete Forum
export async function deleteForum(id) {
  try {
    const response = await service.delete(`/forums/${id}`);
    return response;
  } catch (err) {
    console.error("Error Delete Forum:", err);
    return {};
  }
}
// // MEDIAS
// . POST MEDIA
// New Media
export async function postForumsMedia(id, data) {
  const response = await service.post(`/forums/${id}/media`, data);
  return response;
}
// ! DELETE MEDIA
// Delete One Media
export async function deleteForumsMedia(id, data) {
  const response = await service.delete(`forums/${id}/media`, { data });
  return response;
}
// ------------- FOLLOW FORUMS
// . POST
// Following
export async function postFollowForum(id) {
  const url = `/forums/${id}/follow`;
  try {
    const response = await service.post(url);
    return response;
  } catch (err) {
    console.error("Error Post Follow:", err);
    return {};
  }
}
// * PATCH
// Update Following
export async function patchFollowForum(id, data) {
  try {
    const response = await service.patch(`/forums/${id}/follow`, data);
    return response;
  } catch (err) {
    console.error("Error update Follow Forum:", err);
    return {};
  }
}
// ! DELETE
// delete
export async function deleteFollowForum(id) {
  const url = `/forums/${id}/follow`;
  try {
    const response = await service.delete(url);
    return response;
  } catch (err) {
    console.error("Error Delete user:", err);
    return {};
  }
}

// < MESSAGES
// * PATCH
// Update Message
export async function patchMessage(id, data) {
  try {
    const response = await service.patch(`/messages/${id}`, data);
    return response;
  } catch (err) {
    console.error("Error update Follow Forum:", err);
    return {};
  }
}
// ! DELETE
// Delete Message
export async function deleteMessage(id) {
  try {
    const response = await service.delete(`messages/${id}`);
    return response;
  } catch (err) {
    console.error("Error Delete user:", err);
    return {};
  }
}
// . POST
// Message Forum
export async function postMessageForum(forumId, data) {
  // const formData = new FormData();
  // formData.append("textMessage", data.textMessage);
  // console.log(data);
  const response = await service.post(`/forums/${forumId}/messages`, data);
  return response;
}
// - GET
// List Forum Messages
export async function getListMessages(forumId) {
  const response = await service.get(`/forums/${forumId}/messages`);
  return response;
}
