import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";

import { fetchData } from "api/api";

import ResultContainer from "../components/ResultContainer";
import FileCoverageContainer from "../components/FileCoverageContainer";
import CreateCertificate from "components/CreateCertificate/CreateCertificate";
import Toast from "components/Toast/Toast";
import LogsView from "components/LogsView/LogsView";
import Loader from "components/Loader/Loader";
import { TIMELINE_CONFIG } from "compositions/Timeline/timeline.config";

import {
  processFinishedJson,
  processTimeLineConfig,
} from "components/TimelineItem/timeline.helper";
import { isAnyTaskFailure } from "../Certification.helper";
import { ellipsizeString } from "../../../utils/utils";
import "../Certification.scss";
import DownloadResult from "../components/DownloadResult/DownloadResult";
import ProgressCard from "components/ProgressCard/ProgressCard";
import FullReportTable from "./FullReportTable";

const CertificationResult = () => {
  const param = useParams<{ uuid: string }>();
  const { state } = useLocation();
  const [coverageFile, setCoverageFile] = useState("");
  const [resultData, setResultData] = useState<any>({});
  const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
  const [errorToast, setErrorToast] = useState(false);
  const [timelineConfig, setTimelineConfig] = useState(TIMELINE_CONFIG);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchData.get("/run/" + param.uuid);
        const runStatus = res.data.status;
        const runState = res.data.hasOwnProperty("state") ? res.data.state : "";
        setTimelineConfig(
          processTimeLineConfig(timelineConfig, runState, runStatus, res)
        );
        if (runStatus === "finished") {
          const isArrayResult = Array.isArray(res.data.result);
          const resultJson = isArrayResult
            ? res.data.result[0]
            : res.data.result;
          if (isArrayResult) {
            setCoverageFile(res.data.result[1]);
          }
          const unitTestResult = processFinishedJson(resultJson);
          setUnitTestSuccess(unitTestResult);
          setResultData(resultJson);
        }
      } catch (error) {
        handleErrorScenario();
        console.error('Failed:', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param.uuid]);

  const handleErrorScenario = useCallback(() => {
    // show an api error toast
    setErrorToast(true);
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      setErrorToast(false);
    }, 5000); // hide after 5 seconds
    setTimelineConfig(TIMELINE_CONFIG);
  }, []);


  // Show loader until data is fetched
  if (!resultData || !Object.keys(resultData).length) {
    return <Loader />
  }

  return (
    <>
      <div className="content-area">
        <div className="content-area-title-section pb-7">
          <span className="text-2xl text-neutral-700 font-medium">
            {(state?.repo && state?.commitHash) ?
              state.repo + ": " + ellipsizeString(state.commitHash, 7, 3)
              : (param?.uuid ? "Result: " + ellipsizeString(param?.uuid, 5, 3) : "Result")}
          </span>
        </div>

        <div className="header-section">
          <>
            {Object.keys(resultData).length ? (<>
              <div className="w-full flex items-stretch justify-end gap-x-4">
                <DownloadResult resultData={resultData} />
                {state?.certifiable ? <CreateCertificate uuid={param.uuid as string} /> : null}
              </div>
              <div className="flex items-center justify-evenly my-10">
                <ProgressCard title={"Code Coverage"} currentValue={50} totalValue={100} />
                <ProgressCard title={"Property Based Testing"} currentValue={100} totalValue={1000} />

              </div>
            </>) : null}
          </>
        </div>

        <div
          id="certificationWrapper"
          className="content-area-box shadow-lg bg-white px-5 py-4"
        >
          <LogsView
            runId={param.uuid as string}
            endPolling={true}
            open={false}
            oneTime={true}
          />

          <FullReportTable data={resultData}/>
        </div>
        
      </div>
      {errorToast ? <Toast /> : null}
    </>
  );
};

export default CertificationResult;
