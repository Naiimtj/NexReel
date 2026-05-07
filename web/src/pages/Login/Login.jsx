import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BaseIcon } from '../../components/base';
import Singup from '../SingUp/Singup';
import { useAuthContext } from '../../context/auth-context';
import { getUser, login } from '../../../services/DB/services-db';
import Alert from '../../components/Users/Alert';
import PageTitle from '../../components/PageTitle';

const Login = () => {
  const [t] = useTranslation('translation');
  const { onLogin } = useAuthContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    defaultValues: { email: '', password: '' },
  });
  const [modalForm, setModalForm] = useState(false);
  const [errorLogin, setErrorLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (data) => {
    login(data)
      .then((response) => {
        if (!response) return setErrorLogin(true);
        setErrorLogin(false);
        getUser().then((info) => (info ? onLogin(info) : setErrorLogin(true)));
      })
      .catch(() => setErrorLogin(true));
  };

  const eyeIconMap = { true: 'eyeFill', false: 'eyeSlashFill' };

  if (modalForm) return <Singup setModalForm={setModalForm} />;

  return (
    <div className="text-gray-300 font-bold pt-8 h-full w-full p-2 md:p-4">
      <PageTitle title={t('Log In')} />
      <div className="flex justify-center">
        <div className="w-full text-gray-600 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8 text-gray-600">
            <h1 className="text-gray-400 text-xl font-bold leading-tight tracking-tigh md:text-2xl">
              {t('Sign in to your account')}
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(handleLogin)}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-600"
                >
                  {t('Your email')}
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-600 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="name@company.com"
                  {...register('email', {
                    required: t('Email is required'),
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: t('Invalid email address'),
                    },
                  })}
                />
                {errors.email && (
                  <Alert className="text-center">{errors.email.message}</Alert>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-200"
                >
                  {t('Password')}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative w-full">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="••••••••"
                      className="bg-gray-50 border border-gray-300 text-gray-600 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      {...register('password', {
                        required: t('Password is required'),
                        minLength: {
                          value: 8,
                          message: t('Password must be at least 8 characters'),
                        },
                      })}
                    />
                  </div>
                  <BaseIcon
                    icon={eyeIconMap[showPassword]}
                    size="md"
                    onClick={() => setShowPassword(!showPassword)}
                    tooltip={t('Toggle password visibility')}
                    className='hover:fill-purpleNR'
                  />
                </div>
                {errors.password && (
                  <span className="text-red-600">
                    {t(errors.password.message)}
                  </span>
                )}
              </div>
              {errorLogin && (
                <div className="my-2 text-red-600 font-bold rounded-md text-sm text-center">
                  {t('Oops! something in your credentials is not correct')}
                </div>
              )}
              <button
                type="submit"
                disabled={!isValid}
                className={`${isValid ? 'cursor-pointer' : 'cursor-not-allowed'} w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2 p-2 border-2 border-[#7B6EF6] hover:bg-[#494949] hover:border-[#494949] uppercase transition-colors`}
              >
                {t('Sign in')}
              </button>
            </form>
            <div className="text-sm font-light text-gray-500">
              {t('Don’t have an account yet?')}
              <button
                type="button"
                onClick={() => setModalForm(true)}
                className="font-medium ml-1 text-gray-400 underline hover:text-purpleNR"
              >
                {t('Sign up')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
