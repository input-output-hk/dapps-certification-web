import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";

const Session = lazy(() => import("../pages/session"));
const Landing = lazy(() => import("../pages/landing"));
const Certification = lazy(() => import("../pages/certification/Certification"));
const TestHistory = lazy(() => import("../pages/testHistory/TestHistory"));
const UserProfile = lazy(() => import("../pages/userProfile/UserProfile"));
const Subscription = lazy(() => import("../pages/subscription/Subscription"));
const SubscriptionContent = lazy(() => import("../pages/subscription/SubscriptionContent"));
const SubscriptionHistory = lazy(() => import("../pages/subscription/history/SubscriptionHistory"));
const Payment = lazy(() => import("../pages/subscription/payment/Payment"));
const ReportUpload = lazy(() => import("../pages/auditing/reportUpload/ReportUpload"));

const ComingSoon = () => (
  <Box className="p-8">
    <Typography>Coming soon...</Typography>
  </Box>
);

const App = () => {
  return (
    <Suspense fallback={<CircularProgress color="secondary" size={100} />}>
      <Routes>
        <Route path="/" element={<Session />}>
          <Route index element={<Landing />} />
          <Route path="home" element={<ComingSoon />} />
          <Route path="testing" element={<ComingSoon />} />
          <Route path="history" element={<TestHistory />} />
          <Route path="certification" element={<Certification />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="support" element={<ComingSoon />} />
          <Route path="documentation" element={<ComingSoon />} />

          <Route path="subscription" element={<Subscription />}>
            <Route index element={<SubscriptionContent />} />  
            <Route path="payment" element={<Payment />} />
            <Route path="history" element={<SubscriptionHistory />} />
          </Route>
          <Route path="audit-report-upload" element={<ReportUpload />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;