import { MdModeEditOutline } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { BaseIcon } from '../../base';

const ForumReply = ({
  reply = {},
  isOtherUser = true,
  setPopSureDel = () => {},
  setIdDelete = () => {},
  transl = () => {},
  userId = '',
  editMessage = true,
  setEditMessage = () => {},
  setIsSender = () => {},
  setReply = () => {},
}) => {
  const handleDeleteMessage = () => {
    setPopSureDel(true);
    setIdDelete(reply.id);
  };

  const isSender = userId === reply.sender;

  const handleEditMessage = () => {
    setEditMessage(true);
    setIsSender(isSender);
    setReply(reply);
  };
  return (
    <div className="flex flex-col bg-local backdrop-blur-md bg-white/60 rounded-xl h-full p-2 mb-2">
      {!editMessage ? (
        <>
          <div className="flex justify-between text-sm">
            <div>
              <div className="flex gap-2">
                <p>{`${transl('Create by')}:`}</p>
                <Link
                  to={!isSender ? `/users/${reply.userSender[0].id}` : '/me'}
                  className="capitalize text-purple-950 hover:text-gray-600 transition duration-300"
                >
                  {reply && reply.userSender && reply.userSender[0].username}
                </Link>
              </div>
              {!reply.edited ? (
                <p className="italic text-xs">{transl('Edited')}</p>
              ) : null}
            </div>
            <div className="flex gap-2 items-center">
              {/* // DELETE MESSAGE */}
              {!isOtherUser || isSender ? (
                <>
                  {!isOtherUser || isSender ? (
                    <BaseIcon
                      icon="trash"
                      size="x-small"
                      color="currentColor"
                      onClick={handleDeleteMessage}
                      aria-label={transl('Delete Forum Icon')}
                      className="z-50 text-red-700 md:hover:text-gray-500 duration-200"
                      tooltip={transl('Delete')}
                    />
                  ) : null}
                  {/* // FOLLOW & UNFOLLOW or NUM FOLLOWERS / EDIT Forum */}
                  <div className="mr-4">
                    {isSender ? (
                      <MdModeEditOutline
                        size={20}
                        alt={transl('Edit Forum Icon')}
                        className="text-gray-200 md:hover:text-gray-500 duration-200 cursor-pointer"
                        onClick={handleEditMessage}
                      />
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <div className="ml-2">{reply.textMessage}</div>
        </>
      ) : null}
      {/* {!isOtherUser && editMessage || isSender && editMessage ? (
        <div className="mb-10">
          <EditMessage setEditMessage={setEditMessage} reply={reply} />
        </div>
      ) : null} */}
    </div>
  );
};

export default ForumReply;
