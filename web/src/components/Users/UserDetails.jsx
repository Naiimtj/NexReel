import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getInfoUser } from "../../../services/DB/services-db";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/auth-context";

const UserDetails = ({ data, isFollower }) => {
  const { user } = useAuthContext();
  const [dataUser, setDataUser] = useState({});
  useEffect(() => {
    if (isFollower) {
      getInfoUser(data.UserIDFollower)
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    } else {
      getInfoUser(data.UserIDFollowing)
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFollower]);
  return (
    <Link to={dataUser.id === user.id ? "/me" : `/users/${dataUser.id}`}>
      <div className="flex flex-col items-center cursor-pointer transition ease-in-out md:hover:scale-105 duration-300 text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500">
        <img
          className="h-9 w-9 object-cover rounded-full"
          src={dataUser.avatarURL}
          alt="Avatar"
        />
        {dataUser.username}
      </div>
    </Link>
  );
};

export default UserDetails;

UserDetails.defaultProps = {
  data: {},
  isFollower: false,
};

UserDetails.propTypes = {
  data: PropTypes.object,
  isFollower: PropTypes.bool,
};
