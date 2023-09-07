import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";

import { fetchData } from "api/api";
import { useLogs } from "hooks/useLogs";

import ResultContainer from "../components/ResultContainer";
import FileCoverageContainer from "../components/FileCoverageContainer";
import Button from "components/Button/Button";
import CreateCertificate from "components/CreateCertificate/CreateCertificate";
import Toast from "components/Toast/Toast";
import LogsView from "components/LogsView/LogsView";
import Loader from "components/Loader/Loader";
import Timeline from "compositions/Timeline/Timeline";
import { TIMELINE_CONFIG } from "compositions/Timeline/timeline.config";

import {
  processFinishedJson,
  processTimeLineConfig,
} from "components/TimelineItem/timeline.helper";
import { isAnyTaskFailure } from "../Certification.helper";
import { exportObjectToJsonFile } from "../../../utils/utils";
import DownloadIcon from "assets/images/download.svg";
import "../Certification.scss";

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

  const handleDownloadResultData = (resultData: any) => {
    exportObjectToJsonFile(resultData, "Testing Report.json");
  };

  const handleErrorScenario = useCallback(() => {
    // show an api error toast
    setErrorToast(true);
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      setErrorToast(false);
    }, 5000); // hide after 5 seconds
    setTimelineConfig(TIMELINE_CONFIG);
  }, []);

  // const { logInfo } = useLogs(
  //   param.uuid as string,
  //   true,
  //   false,
  //   handleErrorScenario
  // );
  
  // Show loader until data is fetched
  if (!resultData || !Object.keys(resultData).length) {
    return <Loader />
  }

  return (
    <>
      <div className="flex col common-bottom">
        <header>
          <h3>Test Result</h3>
          <div style={{ float: "right", marginLeft: "5px" }}>
            {Object.keys(resultData).length ? (
              <>
                <Button
                  className="report-download"
                  onClick={(_) => handleDownloadResultData(resultData)}
                  buttonLabel="Download Report"
                  iconUrl={DownloadIcon}
                />
                {state?.certifiable ? <CreateCertificate uuid={param.uuid as string} /> : null}
              </>
            ) : null}
          </div>
        </header>
        <div style={{ marginTop: "-20px" }}>
          <Timeline
            statusConfig={timelineConfig}
            unitTestSuccess={unitTestSuccess}
            hasFailedTasks={isAnyTaskFailure(resultData)}
          />
        </div>
        {/* To show 'View Logs' always  */}
        <LogsView runId={param.uuid as string} oneTime={true} />
      </div>
      {unitTestSuccess === false && Object.keys(resultData).length ? (
        <>
          <ResultContainer
            unitTestSuccess={unitTestSuccess}
            result={resultData}
          />
        </>
      ) : null}

      {unitTestSuccess && Object.keys(resultData).length ? (
        <>
          <FileCoverageContainer
            githubLink={state?.repoUrl || ""}
            result={resultData}
            coverageFile={coverageFile}
          />
          <ResultContainer result={resultData} />
        </>
      ) : null}

      {errorToast ? <Toast /> : null}
    </>
  );
};

export default CertificationResult;
