import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BaseButton, DeleteConfirmModal } from '../base';
import Alert from './Alert';
import NewPlaylist from './Playlist/NewPlaylist';
import { PlaylistsList } from './Playlist/PlaylistsList';

const titleLinkClass =
  'flex justify-start text-xl tracking-wide text-purpleNR md:hover:text-gray-500 duration-300 uppercase';

const sectionGridClass = 'md:p-4 p-2 flex flex-col gap-1 md:mt-2';

const PlaylistSectionHeader = ({ title, to, count = 0, disabled = false }) => {
  const navigate = useNavigate();

  if (disabled) {
    return (
      <div className="flex justify-start text-xl text-grayNR duration-300 tracking-wide pl-4 uppercase">
        {title}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-gray-400 text-xl">
      <BaseButton
        variant="primary"
        onClick={() => navigate(to)}
        className={titleLinkClass}
      >
        <h1 className="md:pl-4 text-xl">{title}</h1>
      </BaseButton>
      <p className="pr-4">{count}</p>
    </div>
  );
};
const CreatePlaylistCard = ({ onCreate }) => {
  const [t] = useTranslation('translation');

  return (
    <div className="flex justify-end gap-1">
      <BaseButton
        onClick={onCreate}
        className="static w-full rounded-xl bg-cover p-0 mt-4 mb-2"
      >
        <h3 className="text-xl">+ {t('Playlist')}</h3>
      </BaseButton>
    </div>
  );
};
const ProfilePlaylistsSection = ({
  user,
  currentUserId = undefined,
  isOtherUser = false,
  playlistData = [],
  playlistsFollowData = [],
  createPlaylist = false,
  setCreatePlaylist,
  changeSeenPending = false,
  setChangeSeenPending,
  popSureDel = false,
  setPopSureDel,
  setAnswerDel,
  setIdDelete,
  errorDelete = false,
}) => {
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
  const hasPlaylists = playlistData.length > 0;
  const hasFollowedPlaylists = playlistsFollowData.length > 0;

  return (
    <>
      <DeleteConfirmModal
        visible={popSureDel}
        onConfirm={() => {
          setPopSureDel(false);
          setAnswerDel(true);
        }}
        onCancel={() => {
          setPopSureDel(false);
          setAnswerDel(false);
        }}
      />

      {errorDelete ? <Alert>{errorDelete}</Alert> : null}

      <div className="mt-4 bg-local rounded-xl backdrop-blur-3xl bg-[#2c3349]/80 py-4 flex flex-col">
        <PlaylistSectionHeader
          title={t('Playlists')}
          to={`/playlists/${user.id}`}
          count={playlistData.length}
          disabled={!hasPlaylists}
        />
        <div className={sectionGridClass}>
          {!isOtherUser && createPlaylist ? (
            <div className="">
              <NewPlaylist
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
                createPlaylist={createPlaylist}
                setCreatePlaylist={setCreatePlaylist}
                isAbsolute={false}
              />
            </div>
          ) : null}

          {playlistData.map((item) => (
            <div key={item.id}>
              <PlaylistsList
                info={item}
                isOtherUser={isOtherUser}
                userId={user.id}
                setPopSureDel={setPopSureDel}
                setIdDelete={setIdDelete}
                size="small"
              />
            </div>
          ))}

          {!isOtherUser && !createPlaylist ? (
            <CreatePlaylistCard onCreate={() => setCreatePlaylist(true)} />
          ) : null}

          {hasPlaylists && playlistData.length > 4 ? (
            <div className="flex justify-end">
              <BaseButton
                variant="primary"
                onClick={() => navigate(`/playlists/${user.id}`)}
                className="pr-2"
              >
                {t('See all')}
              </BaseButton>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 bg-local rounded-xl backdrop-blur-3xl bg-[#2c3349]/80 py-4 flex flex-col">
        <PlaylistSectionHeader
          title={t('Playlists Follow')}
          to={`/playlistsFollow/${user.id}`}
          count={playlistsFollowData.length}
          disabled={!hasFollowedPlaylists}
        />

        <div className={sectionGridClass}>
          {hasFollowedPlaylists ? (
            playlistsFollowData.map((item) => (
              <div key={item.id}>
                <PlaylistsList
                  info={item}
                  isOtherUser={String(item.author) !== String(currentUserId)}
                  userId={item.author}
                  setPopSureDel={setPopSureDel}
                  setIdDelete={setIdDelete}
                />
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic text-center">
              {isOtherUser
                ? t('Not follow any playlist')
                : t('Not follow playlists')}
            </div>
          )}

          {hasFollowedPlaylists && playlistsFollowData.length > 4 ? (
            <div className="flex justify-end">
              <BaseButton
                variant="primary"
                onClick={() => navigate(`/playlistsFollow/${user.id}`)}
                className="pr-2"
              >
                {t('See all')}
              </BaseButton>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};
export default ProfilePlaylistsSection;
