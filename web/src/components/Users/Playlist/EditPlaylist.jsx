import { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { patchPlaylist } from "../../../../services/DB/services-db";
import { IoClose } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { BsCheckLg } from "react-icons/bs";
import TagInput from "../../Forums/TagInput";

const EditPlaylist = ({
  changeSeenPending,
  setChangeSeenPending,
  setEditPlaylist,
  dataPlaylist,
}) => {
  const [t] = useTranslation("translation");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    setValue,
  } = useForm({
    mode: "all",
    defaultValues: {
      imgPlaylist: dataPlaylist.imgPlaylist,
      title: dataPlaylist.title,
      description: dataPlaylist.description,
      tags: dataPlaylist.tags && dataPlaylist.tags.map((tag) => tag),
    },
  });
  const [imgPlaylist, setImgPlaylist] = useState({});
  const [errorRegister, setErrorRegister] = useState(false);

  const onSubmit = async (data) => {
    if (imgPlaylist.length) {
      data.imgPlaylist = imgPlaylist;
    }
    try {
      const newPlaylist = await patchPlaylist(dataPlaylist.id, data);
      if (newPlaylist) {
        setChangeSeenPending(!changeSeenPending);
        setEditPlaylist(false);
      }
    } catch (error) {
      console.error("Sing Up Bad Request", error);
      setErrorRegister(error);
    }
  };

  return (
    <div className="absolute w-full h-full ">
      <div className="relative backdrop-blur-3xl bg-white/10 rounded-3xl grid sm:grid-cols-1 md:grid-cols-3 gap-1">
        <div className="text-gray-300 text-center md:col-start-2 rounded-md flex flex-col justify-center py-6 px-4 md:px-0">
          {/* // CLOSE BUTTON */}
          <div
            className="absolute my-2 mx-2 top-0 right-0 cursor-pointer"
            onClick={() => setEditPlaylist(false)}
          >
            <IoClose size={30} alt={t("Close")} />
          </div>
          {/* // . FORM */}
          <div className="flex justify-center">
            <div className="w-full text-gray-600 rounded-lg md:mt-0 sm:max-w-md xl:p-0">
              <div className="space-y-4 md:space-y-6 text-gray-600">
                <h1 className="text-white text-xl font-bold leading-tight tracking-tigh md:text-2xl">
                  {t("Edit Playlist")}
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
                  {/* IMAGE PLAYLIST */}
                  <div className="col-span-full">
                    <label
                      htmlFor="imgPlaylist"
                      className="block text-base font-medium leading-6 text-gray-200"
                    >
                      {t("Image Playlist")}
                    </label>
                    <div className="mt-2 flex flex-col justify-center rounded-lg border border-dashed border-white/50 p-3">
                      <div className="text-center">
                        <label
                          htmlFor="imgPlaylist"
                          className="relative cursor-pointer rounded-md font-semibold text-purpleNR hover:text-gray-500"
                        >
                          <CgProfile
                            className="mx-auto h-12 w-12"
                            aria-hidden="true"
                          />
                        </label>

                        <div className="mt-4 flex flex-col text-sm leading-6 text-gray-500">
                          <>
                            <label
                              htmlFor="imgPlaylist"
                              className="relative cursor-pointer rounded-md font-semibold text-purpleNR hover:text-gray-500"
                            >
                              <span>{t("Upload a file")}</span>
                              <input
                                type="file"
                                id="imgPlaylist"
                                name="imgPlaylist"
                                accept="image/png, image/jpeg"
                                className="hidden"
                                {...register("imgPlaylist")}
                                onChange={(e) => {
                                  const fileInput = e.target;
                                  if (fileInput.files.length > 0) {
                                    const fileName = fileInput.files[0].name;
                                    const fileLabelText =
                                      document.querySelector(
                                        ".file-label-text"
                                      );
                                    if (fileLabelText) {
                                      fileLabelText.textContent = fileName;
                                    }
                                    setImgPlaylist(e.target.files);
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">{t("or drag and drop")}</p>
                          </>
                          <span className="file-label-text text-purpleNR"></span>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                          {t("PNG, JPG up to 10MB")}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* TITLE */}
                  <div className="relative">
                    <label
                      htmlFor="title"
                      className="block mb-2 text-sm font-medium text-gray-200"
                    >
                      * {t("Title")}:
                    </label>
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-600 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5"
                      placeholder={t("Title")}
                      {...register("title", {
                        required: t("Title is required"),
                        minLength: {
                          value: 3,
                          message: t("Title must be at least 3 characters"),
                        },
                        maxLength: {
                          value: 40,
                          message: t(
                            "Title must not be longer than 40 characters"
                          ),
                        },
                      })}
                      id="title"
                    />
                    {errors.username ? (
                      <span className="text-red-600">
                        {t(errors.username.message)}
                      </span>
                    ) : dirtyFields.username ? (
                      <div className="text-green-600 absolute bottom-1 right-0">
                        <BsCheckLg size={30} alt={t("Valid")} />
                      </div>
                    ) : null}
                  </div>
                  {/* TAGS */}
                  <TagInput
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    dirtyFields={dirtyFields}
                    transl={t}
                    defaultTags={
                      dataPlaylist.tags && dataPlaylist.tags.map((tag) => tag)
                    }
                  />
                  {/* DESCRIPTION */}
                  <div className="relative">
                    <label
                      htmlFor="description"
                      className="block mb-2 text-sm font-medium text-gray-200"
                    >
                      {t("Description")}:
                    </label>
                    <textarea
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-600 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5"
                      placeholder={t("Description")}
                      {...register("description")}
                      id="description"
                    />
                    {errors.username ? (
                      <span className="text-red-600">
                        {t(errors.username.message)}
                      </span>
                    ) : dirtyFields.username ? (
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
                    } w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2 p-2 border-2 border-[#7B6EF6] hover:bg-[#494949] hover:border-[#494949] uppercase  transition-colors`}
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

export default EditPlaylist;

EditPlaylist.defaultProps = {
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  setEditPlaylist: () => {},
  dataPlaylist: {},
};

EditPlaylist.propTypes = {
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  setEditPlaylist: PropTypes.func,
  dataPlaylist: PropTypes.object,
};
