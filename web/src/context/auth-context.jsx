/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";

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

  const [reLoad, setReLoad] = useState(false);

  function onReload() {
    console.log("RELOAD");
    setReLoad(!reLoad);
  }

  const value = {
    user,
    onLogin,
    onLogout,
    onReload,
    reLoad,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
