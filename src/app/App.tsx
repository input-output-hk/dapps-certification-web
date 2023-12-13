import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { CircularProgress, Typography, Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/QuestionAnswer";
import CloseIcon from "@mui/icons-material/Close";
import StopCircleIcon from "@mui/icons-material/StopCircle";

import { useAppDispatch, useAppSelector } from "store/store";
import { setImpersonate } from "store/slices/profile.slice";
import { startListenWalletChanges, stopListenWalletChanges } from "store/slices/walletConnection.slice";
import ReconnectWallet from "components/ReconnectWallet/ReconnectWallet";
import { clearRun } from "store/slices/testing.slice";

const Session = lazy(() => import("../pages/session"));
const Landing = lazy(() => import("../pages/landing"));
const Home = lazy(() => import("../pages/home"));
const TestingHistory = lazy(() => import("../pages/testingHistory"));
const ReportUpload = lazy(() => import("../pages/reportUpload"))
const Profile = lazy(() => import("../pages/profile"))
const Certification = lazy(() => import("../pages/certification/Certification"));
const CertificationResult = lazy(() => import("../pages/certification/certification-result/CertificationResult"));
const SupportCommands = lazy(() => import("pages/support-commands"));
const SupportCommandDetails = lazy(() => import("pages/support-commands/details"));

const ComingSoon = () => (
  <Typography>Coming soon...</Typography>
);

const Support = () => (
  <Typography><p>Contact us on your dedicated Slack channel for support or questions.</p></Typography>
)

const CustomGPT = () => {
  const [show, setShow] = useState<boolean>(false);

  const handleShow = () => {
    document.getElementById('customgpt')!.className = show ? 'hidden' : '';
    setShow(!show);
  }

  return (
    <Fab
      color="secondary" onClick={handleShow}
      sx={{position: 'fixed', right: '16px', bottom: '16px', zIndex: 10000}}
    >
      {show ? <CloseIcon /> : <ChatIcon />}
    </Fab>
  );
};

const App = () => {
  const dispatch = useAppDispatch();

  const { impersonate, selectedUser, retainId } = useAppSelector(
    (state) => state.profile
  );
  const { wallet } = useAppSelector((state) => state.walletConnection);

  useEffect(() => {
    if (wallet) {
      dispatch(startListenWalletChanges({}));
    } else if (!wallet) {
      dispatch(stopListenWalletChanges());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  return (
    <>
      <Suspense fallback={<CircularProgress color="secondary" size={100} />}>
        <Routes>
          <Route path="/" element={<Session />}>
            <Route index element={<Landing />} />
            <Route path="home" element={<Home />} />
            <Route path="testing" element={<Certification />} />
            <Route path="history" element={<TestingHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="support" element={<Support />} />
            <Route path="documentation" element={<ComingSoon />} />
            <Route path="audit-report-upload" element={<ReportUpload />} />
            <Route path="/report/:uuid" element={<CertificationResult />} />
            <Route path="/support-commands" element={<SupportCommands />} />
            <Route path="/support-commands/:id" element={<SupportCommandDetails />} />
          </Route>
        </Routes>
      </Suspense>
      <CustomGPT />

      {/* Impersonate banner */}
      {impersonate ? (
        <div className="inline-flex justify-between fixed top-0 left-0 w-full bg-[#000000bd] z-[10000] p-2 text-slate-300 text-center font-bold">
          <span className="self-center">Impersonating: {selectedUser.fullName}</span>
          <span
            className="inline-flex items-center hover:cursor-pointer hover:underline"
            title="Stop Impersonating"
            onClick={async () => {
              const impersonatedProfile = retainId;
              await dispatch(setImpersonate({ status: false, id: null }));
              await dispatch(clearRun());
              window.location.pathname = `/support-commands/${impersonatedProfile}`;
            }}
          >
            <StopCircleIcon className="text-red-300" fontSize="large" />
          </span>
        </div>
      ) : null}
      
      <ReconnectWallet />
    </>
  );
};

export default App;
