import React from "react";
import Signup from "../components/Signup";
import AppContextProvider from "../helper/AppContextProvider";

const SignupPage = () => {
  return (
    <AppContextProvider>
      <Signup />;
    </AppContextProvider>
  );
};

export default SignupPage;
