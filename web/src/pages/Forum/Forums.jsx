import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../components/Forums/AppContainer';
import Header from '../../components/Forums/Header';
import Main from '../../components/Forums/Main';
import { deleteForum, getListForum } from '../../../services/DB/services-db';
import { DeleteConfirmModal } from '../../components/base';
import { NoImageMore } from '../../assets/image';
import NewForum from '../../components/Forums/NewForum';
import PageTitle from '../../components/PageTitle';

const Forums = () => {
  const [t] = useTranslation('translation');
  const [posts, setPosts] = useState([]);
  const [change, setChange] = useState(false);
  const [createForum, setCreateForum] = useState(false);
  const [answerDel, setAnswerDel] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [popSureDel, setPopSureDel] = useState(false);
  const [errorDelete, setErrorDelete] = useState(false);

  useEffect(() => {
    getListForum().then(setPosts);
  }, [change]);

  useEffect(() => {
    if (!answerDel) return;
    deleteForum(idDelete)
      .then(() => {
        setIdDelete(null);
        setPopSureDel(false);
        setAnswerDel(false);
        setChange((c) => !c);
      })
      .catch((error) => {
        const message = error?.response?.data?.message;
        if (message) setErrorDelete(message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerDel]);

  useEffect(() => {
    if (!errorDelete) return undefined;
    const timerId = window.setTimeout(() => setErrorDelete(false), 3000);
    return () => clearTimeout(timerId);
  }, [errorDelete]);

  return (
    <AppContainer>
      <PageTitle title={t('Chatting')} />
      <Header />
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
      <div className="flex justify-end gap-1">
        {!createForum && (
          <button
            type="button"
            className="static text-gray-200 hover:text-purpleNR rounded-xl bg-cover w-full mb-2 mt-4"
            onClick={() => setCreateForum(true)}
          >
            <div className="grid grid-cols-5 justify-between gap-x-6 py-2 static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
              <div className="col-span-2 flex min-w-0 gap-x-4">
                <div className="h-full">
                  <div className="transition ease-in-out md:hover:scale-105 duration-300">
                    <img
                      className="static object-cover cursor-pointer rounded-xl w-[150px] h-[84px]"
                      src={NoImageMore}
                      alt={t('New Forum')}
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-auto mt-4 px-2">
                  <div className="flex font-semibold text-sm md:text-base cursor-pointer">
                    <h3 className="pl-4 text-xl">{t('Add Forum')}</h3>
                  </div>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
      {createForum ? (
        <NewForum
          change={change}
          setChange={setChange}
          setCreateForum={setCreateForum}
          isAbsolute
        />
      ) : (
        <>
          <h1 className="text-grayNR">{t('Last Talks')}</h1>
          <div className="flex flex-col">
            <Main
              posts={posts}
              setPopSureDel={setPopSureDel}
              setIdDelete={setIdDelete}
              change={change}
              setChange={setChange}
            />
          </div>
        </>
      )}
    </AppContainer>
  );
};

export default Forums;
