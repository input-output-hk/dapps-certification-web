import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import "./App.scss";

import PrivateRoutes from "components/PrivateRoutes/PrivateRoutes";
import Loader from "components/Loader/Loader";

const Landing = lazy(() => import("../pages/landing/Landing"));
const Home = lazy(() => import("../pages/home/Home"));
const TestHistory = lazy(() => import("../pages/testHistory/TestHistory"));
const UserProfile = lazy(() => import("../pages/userProfile/UserProfile"));
const Subscription = lazy(() => import("../pages/subscription/Subscription"));
const SubscriptionContent = lazy(() => import("../pages/subscription/SubscriptionContent"));
const Payment = lazy(() => import("../pages/subscription/payment/Payment"));
const ReportUpload = lazy(() => import("../pages/auditing/reportUpload/ReportUpload"))
const SubscriptionHistory = lazy(() => import("../pages/subscription/history/SubscriptionHistory"));

const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route index element={<Landing />} />
        <Route path="/app" element={<PrivateRoutes />}>
          <Route index element={<Home />} />
          <Route path="subscription" element={<Subscription />}>
            <Route index element={<SubscriptionContent />} />  
            <Route path="payment" element={<Payment />} />
            <Route path="history" element={<SubscriptionHistory />} />
          </Route>
          <Route path="audit-report-upload" element={<ReportUpload />} />
          <Route path="history" element={<TestHistory />} />
          <Route path="profile/*" element={<UserProfile />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;