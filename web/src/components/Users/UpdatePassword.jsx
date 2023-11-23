import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../context/auth-context";
import { patchUser } from "../../../services/DB/services-db";
import { IoClose } from "react-icons/io5";
import { BsCheckLg, BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { useState } from "react";

const UpdatePassword = ({
  setModalPassword,
  setChangeSeenPending,
  changeSeenPending,
}) => {
  const [t] = useTranslation("translation");
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
  } = useForm({
    mode: "all",
    defaultValues: {
      password: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const { onLogin } = useAuthContext();
  const onSubmit = (data) => {
    patchUser(data)
      .then((userUpdate) => onLogin(userUpdate))
      .then(() => setChangeSeenPending(!changeSeenPending))
      .then(() => setModalPassword(false));
  };

  return (
    <div className="relative backdrop-blur-3xl bg-white/10 rounded-3xl grid sm:grid-cols-1 md:grid-cols-3 gap-1">
      <div className="text-gray-300 text-center md:col-start-2 rounded-md flex flex-col justify-center py-6 px-4 md:px-0">
        <div
          className="absolute my-2 mx-2 top-0 right-0 cursor-pointer"
          onClick={() => setModalPassword(false)}
        >
          <IoClose size={30} alt={t("Close")} />
        </div>
        <div className="flex justify-center">
          <div className="w-full text-gray-600 rounded-lg md:mt-0 sm:max-w-md xl:p-0">
            <div className="space-y-4 md:space-y-6 text-gray-600">
              <h1 className="text-white text-xl font-bold leading-tight tracking-tigh md:text-2xl">
                {t("Update Profile")}
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
                encType="multipart/form-data"
              >
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
  );
};

export default UpdatePassword;

UpdatePassword.defaultProps = {
  setModalPassword: () => {},
  setChangeSeenPending: () => {},
  changeSeenPending: false,
};

UpdatePassword.propTypes = {
  setModalPassword: PropTypes.func,
  setChangeSeenPending: PropTypes.func,
  changeSeenPending: PropTypes.bool,
};
