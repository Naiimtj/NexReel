/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";
import { getUser } from "../../services/DB/services-db";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  function onLogin(user) {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }

  function onLogout() {
    localStorage.removeItem("user");
    setUser(null);
  }


  function onReload() {
    getUser().then((infoUser) => {
      if (infoUser) {
        localStorage.setItem("user", JSON.stringify(infoUser));
      }
    });
  }

  const value = {
    user,
    onLogin,
    onLogout,
    onReload,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
