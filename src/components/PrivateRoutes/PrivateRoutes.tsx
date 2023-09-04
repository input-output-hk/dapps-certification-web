import React, { useEffect, Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";

import useLocalStorage from "hooks/useLocalStorage";
import { useAppSelector } from "store/store";
import { LocalStorageKeys } from "constants/constants";

import Header from "components/Header/Header";
import NavBar from "components/NavBar/NavBar";
import Loader from "components/Loader/Loader";

const Banner = () => {
  const { network } = useAppSelector((state) => state.auth);
  const networkEnvVar: any = process.env.REACT_APP_WALLET_NETWORK

  return (<>
    {network !== null && network !== 1 ? 
      // always show Info if not in Mainnet
      <Alert severity="info" style={{marginBottom: '10px'}}>Your connected wallet is not in Mainnet.</Alert> : null}
      {/* if not in Mainnet and app-wallet not Mainnet (i.e. in Testnet), show Warning to connect to Preprod. */}
    {network !== null && network !== 1 && networkEnvVar !== '1' ? 
      <Alert severity="warning">Your wallet is connected to a Testnet which is expected while the tool is in Beta. Please ensure that you are connected to the <strong>Preprod</strong> network.</Alert> : null}
  </>)
}

const PageLayout = () => {

  // const networkNames:{[x:string]:string} = {
  //   '0': 'Testnet',
  //   '1': 'Mainnet'
  // }

  return (
    <div className="app">
      <NavBar />
      <div className="content">
        <Header />
        <section id="globalBanners">
          <Banner />
        </section>
        {/* Load page content here */}
        <section data-testid="contentWrapper" id="contentWrapper">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </section>
      </div>
    </div>
  );
};

const PrivateRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn] = useLocalStorage(
    LocalStorageKeys.isLoggedIn,
    localStorage.getItem(LocalStorageKeys.isLoggedIn)
  );

  const [userDetails] = useLocalStorage(
    LocalStorageKeys.userDetails,
    localStorage.getItem(LocalStorageKeys.userDetails)
      ? JSON.parse(localStorage.getItem(LocalStorageKeys.userDetails)!)
      : null
  );

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/"); // navigate to root link if unauthorized
    } else {
      // user profile details are empty --> prompt user to enter details
      if (!userDetails?.dapp?.owner || !userDetails?.dapp?.repo) {
        navigate("/profile");
      } else {
        navigate(location.pathname); // User details are available. Redirect to intended path
      }
    }
    // eslint-disable-next-line
  }, [isLoggedIn, location.pathname]);

  return <>{isLoggedIn ? <PageLayout /> : null}</>;
};

export default PrivateRoutes;