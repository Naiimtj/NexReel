import axios from 'axios';

const service = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_URL_DB,
});

service.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (
      error.response.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      localStorage.removeItem('user');
      window.location.assign('/login');
    } else {
      return Promise.reject(error);
    }
  },
);

const safe = async (label, fn, fallback = {}) => {
  try {
    return await fn();
  } catch (err) {
    console.error(`Error ${label}:`, err);
    return fallback;
  }
};

const buildPlaylistFormData = (data) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  for (const tag of data.tags) {
    const trimmed = tag.trim();
    if (trimmed) formData.append('tags[]', trimmed);
  }
  if (
    data.imgPlaylist &&
    (typeof data.imgPlaylist === 'object' || data.imgPlaylist[0])
  ) {
    formData.append('imgPlaylist', data.imgPlaylist[0]);
  }
  return formData;
};

const buildForumFormData = (data) => {
  const formData = new FormData();
  formData.append('title', data.title);
  for (const tag of data.tags) {
    const trimmed = tag.trim();
    if (trimmed) formData.append('tags[]', trimmed);
  }
  formData.append('shortDescription', data.shortDescription);
  formData.append('description', data.description);
  if (data.author !== undefined) formData.append('author', data.author);
  if (
    data.imgForum &&
    (typeof data.imgForum === 'object' || data.imgForum[0])
  ) {
    formData.append('imgForum', data.imgForum[0]);
  }
  return formData;
};

// < AUTH
export const login = (data) => service.post('login', data);

export const logoutDB = () => safe('Log Out', () => service.post('logout'));

export const postRegister = (data) => {
  const formData = new FormData();
  formData.append('username', data.username);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('region', data.region);
  if (data.avatarURL) formData.append('avatarURL', data.avatarURL[0]);
  return service.post('register', formData);
};

// < PLEX
export const getPlexData = () =>
  safe('plex summary', () => service.get('plex'));

export const getPlexMovies = (q) =>
  safe(
    'fetching plex movies',
    () => service.get('plex/movies', { params: q ? { q } : {} }),
    [],
  );

export const getPlexTv = (q) =>
  safe(
    'fetching plex TV shows',
    () => service.get('plex/tv', { params: q ? { q } : {} }),
    [],
  );

// < USER
export const getSearchUsers = (searchValue) =>
  safe('Search User', () =>
    service.get(`users/search?username=${searchValue}`),
  );

export const getUser = () =>
  safe('profile', () => service.get('users/me'), null);

export const getInfoUser = (id) =>
  safe('profile', () => service.get(`users/${id}`));

export const getUsers = () => safe('all users', () => service.get('users'));

export const patchUser = (data) => {
  const formData = new FormData();
  if (data.username !== undefined) formData.append('username', data.username);
  if (data.email !== undefined) formData.append('email', data.email);
  if (data.region !== undefined) formData.append('region', data.region);
  if (data.favoritePhrase !== undefined)
    formData.append('favoritePhrase', data.favoritePhrase);
  if (data.password) formData.append('password', data.password);
  if (data.avatarURL !== undefined && typeof data.avatarURL === 'object') {
    formData.append('avatarURL', data.avatarURL[0]);
  }
  return service.patch('users/me', formData);
};

export const patchNotifications = (data) =>
  service.patch('users/me/notifications', data);

export const deleteUser = () =>
  safe('Delete user', () => service.delete('users/me'));

// FOLLOW USER
export const getDetailUser = (id) =>
  safe('profile', () => service.get(`users/${id}/follow`));

export const getFollowersUser = async () => {
  try {
    return await service.get('user/followers');
  } catch (err) {
    console.error('Error profile:', err);
    localStorage.removeItem('user');
    return [];
  }
};

export const postConfirmFollow = (id) =>
  safe('Confirm Follow', () => service.post(`users/${id}/follow`));

export const postFollow = (id) =>
  safe('Post Follow', () => service.post(`users/${id}/follows`));

export const deleteFollower = (id) =>
  safe('Delete user', () => service.delete(`users/${id}/follows`));

export const UnFollow = (id) =>
  safe('Delete user', () => service.delete(`users/${id}/nofollow`));

// < PLAYLISTS
export const getSearchPlaylists = (searchValue) =>
  safe('Search Playlists', () =>
    service.get(`playlists/search?title=${searchValue}`),
  );

export const postPlaylist = (data) =>
  service.post('playlists', buildPlaylistFormData(data));

export const getListPlaylist = () =>
  safe('profile', () => service.get('playlists'));

export const getUserListPlaylist = () =>
  safe('playlist', () => service.get('playlists/me'), []);

export const getDetailPlaylist = (id) =>
  safe('profile', () => service.get(`playlists/${id}`));

export const patchPlaylist = (id, data) =>
  service.patch(`playlists/${id}`, buildPlaylistFormData(data));

export const deletePlaylist = (id) =>
  safe('Delete user', () => service.delete(`playlists/${id}`));

// MEDIAS PLAYLIST
export const postPlaylistMedia = (id, data) =>
  service.post(`playlists/${id}/media`, data);

export const deletePlaylistMedia = (id, data) =>
  service.delete(`playlists/${id}/media`, { data });

// FOLLOW PLAYLISTS
export const postFollowPlaylist = (id) =>
  safe('Post Follow', () => service.post(`playlists/${id}/follow`));

export const getFollowPlaylistDetail = (id) =>
  safe('Follow Playlist', () => service.get(`playlists/${id}/follow`));

export const patchFollowPlaylist = (id, data) =>
  safe('update Follow Playlist', () =>
    service.patch(`playlists/${id}/follow`, data),
  );

export const deleteFollowPlaylist = (id) =>
  safe('Delete user', () => service.delete(`playlists/${id}/follow`));

// < MEDIAS
export const postMedia = (mediaType, data) =>
  safe('Post Media', () => service.post(`medias/${mediaType}`, data));

export const getAllMedia = async () => {
  const response = await service.get('medias');
  return response || {};
};

export const getDetailMedia = async (id, mediaType) => {
  const response = await service.get(`medias/${mediaType}/${id}`);
  return response || {};
};

export const patchMedia = (id, mediaType, data) =>
  safe('update media user', () =>
    service.patch(`medias/${mediaType}/${id}`, data),
  );

export const deleteMedia = (id) =>
  safe('Delete Media', () => service.delete(`medias/${id}`));

// < SEASONS
export const postSeasons = (mediaId, data) =>
  safe('Post Season', () => service.post(`seasons/${mediaId}`, data));

export const getAllSeasons = async (mediaId) => {
  const response = await service.get(`seasons/${mediaId}`);
  return response || {};
};

export const getDetailSeasons = async (mediaId, season) => {
  const response = await service.get(`seasons/${mediaId}/${season}`);
  return response || {};
};

export const patchSeasons = (mediaId, season, data) =>
  safe('update media user', () =>
    service.patch(`seasons/${mediaId}/${season}`, data),
  );

// < EPISODES
export const postEpisode = (mediaId, season, episode, data) =>
  safe('Post Episode', () =>
    service.post(`episodes/${mediaId}/${season}/${episode}`, data),
  );

export const getDetailEpisode = async (mediaId, season, episode) => {
  const response = await service.get(
    `episodes/${mediaId}/${season}/${episode}`,
  );
  return response || {};
};

export const getEpisodesForSeason = async (mediaId, season) => {
  const response = await service.get(`episodes/${mediaId}/${season}`);
  return response || [];
};

export const patchEpisode = (mediaId, season, episode, data) =>
  safe('update episode', () =>
    service.patch(`episodes/${mediaId}/${season}/${episode}`, data),
  );

export const deleteEpisode = (mediaId, season, episode) =>
  safe('Delete Episode', () =>
    service.delete(`episodes/${mediaId}/${season}/${episode}`),
  );

// < FORUMS
export const postForum = (data) =>
  service.post('forums', buildForumFormData(data));

export const getDetailForum = async (id) => {
  const response = await service.get(`forums/${id}`);
  return response || {};
};

export const getListForum = () => safe('profile', () => service.get('forums'));

export const patchForum = (id, data) =>
  service.patch(`forums/${id}`, buildForumFormData(data));

export const deleteForum = (id) =>
  safe('Delete Forum', () => service.delete(`forums/${id}`));

// MEDIAS FORUM
export const postForumsMedia = (id, data) =>
  service.post(`forums/${id}/media`, data);

export const deleteForumsMedia = (id, data) =>
  service.delete(`forums/${id}/media`, { data });

// FOLLOW FORUMS
export const postFollowForum = (id) =>
  safe('Post Follow', () => service.post(`forums/${id}/follow`));

export const patchFollowForum = (id, data) =>
  safe('update Follow Forum', () => service.patch(`forums/${id}/follow`, data));

export const deleteFollowForum = (id) =>
  safe('Delete user', () => service.delete(`forums/${id}/follow`));

// < MESSAGES
export const patchMessage = (id, data) =>
  safe('update Follow Forum', () => service.patch(`messages/${id}`, data));

export const deleteMessage = (id) =>
  safe('Delete user', () => service.delete(`messages/${id}`));

export const postMessageForum = (forumId, data) =>
  service.post(`forums/${forumId}/messages`, data);

export const getListMessages = (forumId) =>
  service.get(`forums/${forumId}/messages`);
