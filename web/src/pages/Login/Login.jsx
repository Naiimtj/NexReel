import Singup from "../SingUp/Singup";
import { useState } from "react";
import { useAuthContext } from "../../context/auth-context";
// import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getUser, login } from "../../../services/DB/services-db";
import Alert from "../../components/Users/Alert";
import { useTranslation } from "react-i18next";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";

const Login = () => {
  const [t] = useTranslation("translation");
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [modalForm, setModalForm] = useState(false);
  const [errorLogin, setErrorLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { onLogin } = useAuthContext();

  function handleLogin(data) {
    login(data)
      .then((response) => {
        if (response) {
          setErrorLogin(false);
          getUser().then((infoUser) => {
            if (infoUser) {
              onLogin(infoUser);
            }
          });
        }
        setErrorLogin(true);
      })
      .catch(() => setErrorLogin(true));
  }
  document.title = `${t("Log In")}`;

  return (
    <>
      <div className="text-gray-300 font-bold pt-8 h-full w-full p-2 md:p-4">
        {modalForm ? <Singup setModalForm={setModalForm} /> : null}
        {!modalForm ? (
          <div className="flex justify-center">
            <div className="w-full text-gray-600 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8 text-gray-600">
                <h1 className="text-gray-400 text-xl font-bold leading-tight tracking-tigh md:text-2xl">
                  {t("Sign in to your account")}
                </h1>
                <form
                  className="space-y-4 md:space-y-6"
                  onSubmit={handleSubmit(handleLogin)}
                >
                  {/* // EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-600"
                    >
                      {t("Your email")}
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
                      <Alert className="text-center">
                        {errors.email.message}
                      </Alert>
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
                  <div className="flex items-center justify-between">
                    {/* // REMEMBER */}
                    {/* <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="remember"
                          aria-describedby="remember"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="remember" className="text-gray-500">
                          {t("Remember me?")}
                        </label>
                      </div>
                    </div> */}
                    {/* <a
                    href="#"
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    t('Forgot password?')
                  </a> */}
                  </div>
                  {errorLogin ? (
                    <div className="my-2 text-red-600 font-bold rounded-md text-sm text-center">
                      {t("Oops! something in your credentials is not correct")}
                    </div>
                  ) : null}
                  <button
                    type={isValid ? "submit" : ""}
                    className={`${
                      isValid ? "cursor-pointer" : "cursor-not-allowed"
                    } w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2 p-2 border-2 border-[#7B6EF6] hover:bg-[#494949] hover:border-[#494949] uppercase  transition-colors`}
                  >
                    {t("Sign in")}
                  </button>
                </form>
                <div className="text-sm font-light text-gray-500">
                  {t("Don’t have an account yet?")}
                  <button
                    onClick={() => setModalForm(true)}
                    className="font-medium ml-1 text-gray-400 underline hover:text-purpleNR"
                  >
                    {t("Sign up")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Login;
