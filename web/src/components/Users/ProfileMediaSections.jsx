import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Carousel from '../../utils/Carousel/Carousel';
import EmptySmall from '../MediaList/EmptySmall';
import { BaseButton } from '../base';
import MultiList from '../MediaList/MultiList';
import ViewsPending from './ViewsPending';
import { useMediaContext } from '../../context/media-context';
import { useTranslation } from 'react-i18next';

const sectionLinkClass =
  'flex tracking-wide text-purpleNR md:hover:text-gray-500 duration-300';

const MediaSectionHeader = ({ title, to, count }) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between text-xl text-gray-400 items-center">
      <BaseButton
        variant="primary"
        onClick={() => navigate(to)}
        className={sectionLinkClass}
      >
        <h1 className="md:pl-4 text-xl">{title}</h1>
      </BaseButton>
      <p>( {count} )</p>
    </div>
  );
};

MediaSectionHeader.propTypes = {
  title: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
  count: PropTypes.number,
};

MediaSectionHeader.defaultProps = {
  count: 0,
};

const MediaPreviewSection = ({
  title,
  to,
  items,
  withDivider,
  isOtherUser,
  mediasUser,
  changeSeenPending,
  setChangeSeenPending,
}) => {
  const count = items.length;
  const navigate = useNavigate();
  const [t] = useTranslation('translation');

  return (
    <div
      className={
        withDivider
          ? 'md:border-r-4 md:border-gray-900 w-full md:px-2'
          : 'w-full md:px-2'
      }
    >
      <MediaSectionHeader title={title} to={to} count={count} />

      {count > 0 ? (
        <div className="mt-2 flex flex-col gap-1 w-full">
          {items
            .slice(0, 2)
            .map((item) =>
              !isOtherUser ? (
                <ViewsPending key={item.mediaId || item.id} data={item} />
              ) : (
                <MultiList
                  key={item.mediaId}
                  info={item}
                  isUser
                  mediasUser={mediasUser}
                  changeSeenPending={changeSeenPending}
                  setChangeSeenPending={setChangeSeenPending}
                />
              ),
            )}

          {count > 2 ? (
            <div className="hidden xl:flex justify-end bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl">
              <BaseButton
                variant="primary"
                onClick={() => navigate(to)}
                className="h-full w-full"
              >
                <EmptySmall />
              </BaseButton>
            </div>
          ) : null}
        </div>
      ) : null}

      {count > 2 ? (
        <div className="flex justify-end mr-2 xl:hidden">
          <BaseButton variant="primary" onClick={() => navigate(to)}>
            {t('See all')}
          </BaseButton>
        </div>
      ) : null}
    </div>
  );
};

MediaPreviewSection.propTypes = {
  title: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  withDivider: PropTypes.bool,
  isOtherUser: PropTypes.bool,
  mediasUser: PropTypes.array,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
};

MediaPreviewSection.defaultProps = {
  items: [],
  withDivider: false,
  isOtherUser: false,
  mediasUser: [],
  changeSeenPending: false,
  setChangeSeenPending: () => {},
};

const ProfileMediaSections = ({
  userId,
  allMedias,
  pendingData,
  seenData,
  changeSeenPending,
  setChangeSeenPending,
  isOtherUser,
}) => {
  const { mediasUser } = useMediaContext();
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
  return (
    <div className="mt-4 border-t border-gray-800">
      {allMedias.length ? (
        <div className="text-gray-200 pt-4">
          <div className="text-gray-200 px-4 md:px-6">
            <Carousel
              title={t('All')}
              info={allMedias}
              isUser
              isSetChange={setChangeSeenPending}
              isChange={changeSeenPending}
              onTitleClick={() => navigate(`/all-medias/${userId}`)}
            />
          </div>
        </div>
      ) : null}

      <div className="bg-local rounded-xl backdrop-blur-3xl bg-[#2c3349]/80 py-4 flex flex-col md:flex-row w-full mt-4 px-2">
        <MediaPreviewSection
          title={t('PENDINGS')}
          to={`/pending/${userId}`}
          items={pendingData}
          withDivider
          isOtherUser={isOtherUser}
          mediasUser={mediasUser}
          changeSeenPending={changeSeenPending}
          setChangeSeenPending={setChangeSeenPending}
        />
        <MediaPreviewSection
          title={t('VIEWS')}
          to={`/view/${userId}`}
          items={seenData}
          isOtherUser={isOtherUser}
          mediasUser={mediasUser}
          changeSeenPending={changeSeenPending}
          setChangeSeenPending={setChangeSeenPending}
        />
      </div>
    </div>
  );
};

ProfileMediaSections.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  allMedias: PropTypes.arrayOf(PropTypes.object),
  pendingData: PropTypes.arrayOf(PropTypes.object),
  seenData: PropTypes.arrayOf(PropTypes.object),
  isOtherUser: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func.isRequired,
};

ProfileMediaSections.defaultProps = {
  allMedias: [],
  pendingData: [],
  seenData: [],
  changeSeenPending: false,
};

export default ProfileMediaSections;
