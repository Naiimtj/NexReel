import { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { BsCheckLg } from "react-icons/bs";
import { patchMessage } from "../../../../services/DB/services-db";

const EditMessage = ({ setEditMessage, reply, setReply, setIsSender }) => {
  const [t] = useTranslation("translation");
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
  } = useForm({
    mode: "all",
    defaultValues: {
      textMessage: reply.textMessage,
    },
  });

  const [errorRegister, setErrorRegister] = useState(false);

  const onSubmit = async (data) => {
    try {
      const newForm = await patchMessage(reply.id, data);
      if (newForm) {
        setEditMessage(false);
        setReply({});
        setIsSender(null);
      }
    } catch (error) {
      console.error("Sing Up Bad Request", error);
      setErrorRegister(error);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="rounded-3xl">
        <div className="text-center rounded-md flex flex-col justify-center py-6 px-4 md:px-0">
          {/* // CLOSE BUTTON */}
          <div
            className="absolute my-2 mx-2 top-0 right-0 cursor-pointer hover:text-purple-700"
            onClick={() => setEditMessage(false)}
          >
            <IoClose size={30} alt={t("Close")} />
          </div>
          {/* // . FORM */}
          <div className="flex justify-center">
            <div className="w-full text-gray-800 rounded-lg md:mt-0 sm:max-w-full xl:p-0">
              <div className="space-y-4 md:space-y-6 text-gray-800">
                <h1 className="text-xl font-bold leading-tight tracking-tigh md:text-2xl">
                  {t("Edit Message")}
                </h1>
                <form
                  className="space-y-4 md:space-y-6"
                  onSubmit={handleSubmit(onSubmit)}
                  encType="multipart/form-data"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                >
                  {/* MESSAGE */}
                  <div className="relative">
                    <label
                      htmlFor="textMessage"
                      className="block mb-2 text-sm font-medium text-gray-200"
                    >
                      {t("Message")}:
                    </label>
                    <textarea
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-800 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5"
                      placeholder={t("Message")}
                      {...register("textMessage", {
                        required: t("Message is required"),
                        minLength: {
                          value: 3,
                          message: t("Message must be at least 3 characters"),
                        },
                      })}
                      id="textMessage"
                    />
                    {errors.textMessage ? (
                      <span className="text-red-600">
                        {t(errors.textMessage.message)}
                      </span>
                    ) : dirtyFields.textMessage ? (
                      <div className="text-green-600 absolute bottom-1 right-0">
                        <BsCheckLg size={30} alt={t("Valid")} />
                      </div>
                    ) : null}
                  </div>
                  {errorRegister ? (
                    <div className="my-2 text-red-600 font-bold rounded-md text-sm text-center">
                      {t(
                        "¡Oops! Something has happened, we will check this error, we are sorry for the inconvenience"
                      )}
                    </div>
                  ) : null}
                  <button
                    type={isValid ? "submit" : "button"}
                    className={`${
                      isValid ? "cursor-pointer" : "cursor-not-allowed"
                    } w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2 p-2 border-2 border-[#494949] hover:bg-[#494949] hover:border-[#494949] uppercase  transition-colors duration-300`}
                  >
                    {t("Update")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMessage;

EditMessage.defaultProps = {
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  setEditMessage: () => {},
  reply: {},
  setIsSender: () => {},
  setReply: () => {},
};

EditMessage.propTypes = {
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  setEditMessage: PropTypes.func,
  reply: PropTypes.object,
  setIsSender: PropTypes.func,
  setReply: PropTypes.func,
};
