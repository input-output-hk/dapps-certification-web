import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";

const Session = lazy(() => import("../pages/session"));
const Landing = lazy(() => import("../pages/landing"));
const Certification = lazy(() => import("../pages/certification/Certification"));
const TestHistory = lazy(() => import("../pages/testHistory/TestHistory"));
const ReportUpload = lazy(() => import("../pages/auditing/reportUpload/ReportUpload"));

const ComingSoon = () => (
  <Typography>Coming soon...</Typography>
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
          <Route path="profile" element={<ComingSoon />} />
          <Route path="support" element={<ComingSoon />} />
          <Route path="documentation" element={<ComingSoon />} />
          <Route path="audit-report-upload" element={<ReportUpload />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;