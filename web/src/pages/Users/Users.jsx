import { useEffect, useState } from "react";
import { getUsers } from "../../../services/DB/services-db";
import Profile from "../../components/Users/Profile";
import Spinner from "../../utils/Spinner/Spinner";

const Users = () => {
  const [dataUser, setDataUser] = useState({});
  useEffect(() => {
    getUsers().then((d) => {
      setDataUser(d);
    });
  }, []);
  return (
    <div className="mt-5">
      {!Object.keys(dataUser).length > 0 ? (
        <Spinner result />
      ) : (
        <Profile dataUser={dataUser} isOtherUser />
      )}
    </div>
  );
};

export default Users;
