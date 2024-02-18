import React from "react";
import Login from "../components/Login";
import AppContextProvider from "../helper/AppContextProvider";

const LoginPage = () => {
  return (
    <AppContextProvider>
      <Login />;
    </AppContextProvider>
  );
};

export default LoginPage;
