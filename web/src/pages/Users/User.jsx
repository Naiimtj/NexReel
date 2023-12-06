import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDetailUser } from "../../../services/DB/services-db";
import Profile from "../../components/Users/Profile";
import Spinner from "../../utils/Spinner/Spinner";
import { useAuthContext } from "../../context/auth-context";

const User = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [dataUser, setDataUser] = useState({});
  const [changeOtherUser, setChangeOtherUser] = useState(false);
  useEffect(() => {
    if (id) {
      getDetailUser(id).then((d) => {
        setDataUser(d);
      });
    }
  }, [id, changeOtherUser]);

  return (
    <div className="mt-5">
      {!Object.keys(dataUser).length > 0 ? (
        <Spinner result />
      ) : (
        <Profile
          dataUser={dataUser}
          isOtherUser
          currentUser={user}
          changeOtherUser={changeOtherUser}
          setChangeOtherUser={setChangeOtherUser}
        />
      )}
    </div>
  );
};

export default User;
