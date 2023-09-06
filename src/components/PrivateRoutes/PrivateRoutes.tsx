import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useLocalStorage from "hooks/useLocalStorage";
import { LocalStorageKeys } from "constants/constants";

const PrivateRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn] = useLocalStorage(LocalStorageKeys.isLoggedIn, false);

  const [userDetails] = useLocalStorage(LocalStorageKeys.userDetails, null);

  useEffect(() => {
    const userDetailsLS: any = userDetails;
    if (isLoggedIn !== "true") {
      navigate("/"); // navigate to root link if unauthorized
    } else {
      // user profile details are empty --> prompt user to enter details
      if (!userDetailsLS || (!userDetailsLS.dapp?.owner || !userDetailsLS.dapp?.repo)) {
        navigate("/profile");
      } else {
        navigate(location.pathname); // User details are available. Redirect to intended path
      }
    }
    // eslint-disable-next-line
  }, [isLoggedIn, location.pathname]);

  return <>{isLoggedIn ? <Outlet /> : null}</>;
};

export default PrivateRoutes;