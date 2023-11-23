import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../context/auth-context";
import { login, postRegister } from "../../../services/DB/services-db";
import { IoClose } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { BsCheckLg, BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { useState } from "react";

const Signup = ({ setModalForm }) => {
  const [t] = useTranslation("translation");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, dirtyFields },
  } = useForm({
    mode: "all",
    defaultValues: {
      avatarURL: null,
      username: "",
      email: "",
      password: "",
      region: "ES",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorRegister, setErrorRegister] = useState(false);
  const { onLogin } = useAuthContext();
  const [avatar, setAvatar] = useState({});
  const onSubmit = async (data) => {
    if (avatar.length) {
      data.avatarURL = avatar;
    }
    data.avatarURL = avatar;
    try {
      const user = await postRegister(data);
      if (user) {
        const userLoging = await login(data);
        onLogin(userLoging);
      }
    } catch (error) {
      const { errors } = error.response?.data || {};
      if (errors) {
        Object.keys(errors).forEach((err) =>
          setError(err, {
            type: "manual",
            message: errors[err],
          })
        );
      } else {
        console.error("Sing Up Bad Request", error);
        setErrorRegister(error);
      }
    }
  };

  return (
    <div className="relative backdrop-blur-3xl bg-white/10 rounded-3xl grid sm:grid-cols-1 md:grid-cols-3 gap-1">
      <div className="text-gray-300 text-center md:col-start-2 rounded-md flex flex-col justify-center py-6 px-4 md:px-0">
        <div
          className="absolute my-2 mx-2 top-0 right-0 cursor-pointer"
          onClick={() => setModalForm(false)}
        >
          <IoClose size={30} alt={t("Close")} />
        </div>
        <div className="flex justify-center">
          <div className="w-full text-gray-600 rounded-lg md:mt-0 sm:max-w-md xl:p-0">
            <div className="space-y-4 md:space-y-6 text-gray-600">
              <h1 className="text-white text-xl font-bold leading-tight tracking-tigh md:text-2xl">
                {t("Sign Up")}
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
                encType="multipart/form-data"
              >
                {/* AVATAR */}
                <div className="col-span-full">
                  <label
                    htmlFor="avatarURL"
                    className="block text-base font-medium leading-6 text-gray-200"
                  >
                    Avatar
                  </label>
                  <div className="mt-2 flex flex-col justify-center rounded-lg border border-dashed border-white/50 p-3">
                    <div className="text-center">
                      <label
                        htmlFor="avatarURL"
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
                            htmlFor="avatarURL"
                            className="relative cursor-pointer rounded-md font-semibold text-purpleNR hover:text-gray-500"
                          >
                            <span>{t("Upload a file")}</span>
                            <input
                              type="file"
                              id="avatarURL"
                              name="avatarURL"
                              accept="image/png, image/jpeg"
                              className="hidden"
                              {...register("avatarURL")}
                              onChange={(e) => {
                                const fileInput = e.target;
                                if (fileInput.files.length > 0) {
                                  const fileName = fileInput.files[0].name;
                                  const fileLabelText =
                                    document.querySelector(".file-label-text");
                                  if (fileLabelText) {
                                    fileLabelText.textContent = fileName;
                                  }
                                  setAvatar(e.target.files);
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
                {/* USERNAME */}
                <div className="relative">
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-200"
                  >
                    * {t("UserName")}:
                  </label>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-600 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5"
                    placeholder={t("UserName")}
                    {...register("username", {
                      required: t("Username is required"),
                      pattern: {
                        value: /^[A-Za-z0-9]+$/,
                        message: t("Invalid username"),
                      },
                      minLength: {
                        value: 3,
                        message: t("UserName must be at least 3 characters"),
                      },
                    })}
                    id="username"
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
                {/* EMAIL */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-200"
                  >
                    * {t("Email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-600 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="name@company.com"
                    {...register("email", {
                      required: t("Email is required"),
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: t("Invalid email address"),
                      },
                    })}
                  />
                  {errors.email ? (
                    <span className="text-red-600">
                      {t(errors.email.message)}
                    </span>
                  ) : dirtyFields.email ? (
                    <div className="text-green-600 absolute bottom-1 right-0">
                      <BsCheckLg size={30} alt={t("Valid")} />
                    </div>
                  ) : null}
                </div>
                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-200"
                  >
                    {t("Password")}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        className="bg-gray-50 border border-gray-300 text-gray-600 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        {...register("password", {
                          required: t("Password is required"),
                          minLength: {
                            value: 8,
                            message: t(
                              "Password must be at least 8 characters"
                            ),
                          },
                        })}
                      />
                      {dirtyFields.password ? (
                        <div className="text-green-600 absolute bottom-1.5 right-0.5">
                          <BsCheckLg size={30} alt={t("Valid")} />
                        </div>
                      ) : null}
                    </div>

                    {!showPassword ? (
                      <div
                        className="cursor-pointer text-grayNR md:hover:text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <BsFillEyeSlashFill className="h-14 w-14 md:h-6 md:w-6" />
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer text-grayNR md:hover:text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <BsFillEyeFill className="h-14 w-14 md:h-6 md:w-6" />
                      </div>
                    )}
                  </div>

                  {errors.password ? (
                    <span className="text-red-600">
                      {t(errors.password.message)}
                    </span>
                  ) : null}
                </div>
                {/* Nationality select */}
                <div className="relative sm:col-span-3">
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium leading-6 text-gray-200"
                  >
                    {t("Language")}
                  </label>
                  <div className="mt-2">
                    <select
                      id="region"
                      name="region"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm sm:text-sm sm:leading-6"
                      {...register("region", {
                        required: t("Language is required"),
                      })}
                    >
                      <option value="ES">{t("Spanish")}</option>
                      <option value="EN">{t("English")}</option>
                      <option value="DE">{t("German")}</option>
                      <option value="FR">{t("French")}</option>
                    </select>
                  </div>
                  {errors.region ? (
                    <span className="text-red-600">
                      {t(errors.region.message)}
                    </span>
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
                  {t("Sign up")}
                </button>
              </form>
              {/* Login */}
              <div className="text-sm font-light text-gray-500">
                {t("You have an account?")}
                <button
                  onClick={() => setModalForm(false)}
                  className="font-medium ml-1 text-gray-400 underline"
                >
                  {t("Log In")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

Signup.defaultProps = {
  setModalForm: () => {},
};

Signup.propTypes = {
  setModalForm: PropTypes.func,
};
