import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  deleteMessage,
  getListMessages,
} from "../../../../services/DB/services-db";
import ForumReply from "./ForumReply";
import PopSureDeleteSmall from "../../PopUp/PopSureDeleteSmall";
import NewMessage from "./NewMessage";
import EditMessage from "./EditMessage";

const ForumChat = ({ id, isOtherUser, transl, userId }) => {
  const [change, setChange] = useState(false);
  const [editMessage, setEditMessage] = useState(false);
  const [messages, setMessages] = useState([]);
  // - GET ALL MESSAGES
  useEffect(() => {
    const ForumData = async () => {
      getListMessages(id).then((data) => {
        setMessages(data);
      });
    };
    ForumData();
  }, [id, editMessage, change]);
  // -DELETE MESSAGE
  const [answerDel, setAnswerDel] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [popSureDel, setPopSureDel] = useState(false);
  const [errorDelete, setErrorDelete] = useState(false);

  useEffect(() => {
    const deleteForumMessage = async () => {
      try {
        await deleteMessage(idDelete);
        setChange(!change);
        setAnswerDel(!answerDel);
        setIdDelete(null);
      } catch (error) {
        if (error) {
          const { message } = error.response?.data || {};
          setErrorDelete(message);
        }
      }
    };
    if (answerDel) {
      deleteForumMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerDel]);

  // - ADD MESSAGE
  const [createMessage, setCreateMessage] = useState(false);
  const [isSender, setIsSender] = useState(null);
  const [reply, setReply] = useState({});

  return (
    <>
      {errorDelete ? (
        <div className="text-red-600 bg-white/50 rounded-2xl text-center uppercase px-1 font-bold">
          {transl(errorDelete)}
        </div>
      ) : null}
      {/* // - ADD MESSAGE */}
      <div className="flex justify-end">
        <button
          className='w-[200px] text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2 p-1 border-2 border-[#7B6EF6] hover:bg-[#494949] hover:border-[#494949] uppercase  transition-colors'
          onClick={() => setCreateMessage(true)}
        >
          {transl("Add Message")}
        </button>
      </div>

      <div className="relative mt-4 text-black">
      {!isOtherUser && editMessage || isSender && editMessage ? (
        <div className="relative mb-10 object-cover backdrop-blur-md bg-white/40 rounded-lg h-full w-full z-50 px-5">
          <EditMessage setEditMessage={setEditMessage} reply={reply} setReply={setReply} setIsSender={setIsSender} />
        </div>
      ) : null}
        {/* // - POP DELETE */}
        {popSureDel ? (
          <div className="absolute object-cover backdrop-blur-md bg-transparent/40 rounded-lg h-full w-full z-50 grid justify-center align-middle">
            <PopSureDeleteSmall
              setPopSureDel={setPopSureDel}
              setAnswerDel={setAnswerDel}
            />
          </div>
        ) : null}
        {!createMessage && !editMessage
          ? messages &&
            messages.map((message) => (
              <ForumReply
                key={message.id}
                reply={message}
                isOtherUser={isOtherUser}
                transl={transl}
                setPopSureDel={setPopSureDel}
                setIdDelete={setIdDelete}
                userId={userId}
                editMessage={editMessage}
                setEditMessage={setEditMessage}
                setIsSender={setIsSender}
                setReply={setReply}
              />
            ))
          : null}
        {createMessage ? (
          <NewMessage
            change={change}
            setChange={setChange}
            setCreateMessage={setCreateMessage}
            forumId={id}
          />
        ) : null}
      </div>
    </>
  );
};

export default ForumChat;

ForumChat.defaultProps = {
  id: "",
  isOtherUser: true,
  transl: () => {},
  userId: "",
};

ForumChat.propTypes = {
  id: PropTypes.string,
  isOtherUser: PropTypes.bool,
  transl: PropTypes.func,
  userId: PropTypes.string,
};
