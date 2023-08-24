import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";

import { fetchData } from "api/api";
import { useAppDispatch } from "store/store";
import { useLogs } from "hooks/useLogs";

import { setUuid } from "../slices/certification.slice";

import ResultContainer from "../components/ResultContainer";
import FileCoverageContainer from "../components/FileCoverageContainer";
import Button from "components/Button/Button";
import CreateCertificate from "components/CreateCertificate/CreateCertificate";
import Toast from "components/Toast/Toast";
import InformationTable from "components/InformationTable/InformationTable";
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
  const param = useParams();
  const { state } = useLocation();
  const dispatch = useAppDispatch();
  const [coverageFile, setCoverageFile] = useState("");
  const [resultData, setResultData] = useState<any>({});
  const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
  const [errorToast, setErrorToast] = useState(false);
  const [timelineConfig, setTimelineConfig] = useState(TIMELINE_CONFIG);

  // set uuid from param into certification.slice
  useEffect(() => {
    dispatch(setUuid(param.uuid));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchData.get("/run/" + param.uuid);
        const status = res.data.status;
        const state = res.data.hasOwnProperty("state") ? res.data.state : "";
        setTimelineConfig(
          processTimeLineConfig(timelineConfig, state, status, res)
        );
        if (status === "finished") {
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
        // error handling
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
    setErrorToast(true);
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      setErrorToast(false);
    }, 5000); // hide after 5 seconds
    setTimelineConfig(TIMELINE_CONFIG);
  }, []);

  const { logInfo } = useLogs(param.uuid as string, true, handleErrorScenario);

  // Show loader until data is fetched
  if (!resultData || !Object.keys(resultData).length) {
    return <Loader />
  }

  return (
    <>
      <div className="flex col common-bottom">
        <header>
          <h3>Certification Result</h3>
          <div style={{ float: "right", marginLeft: "5px" }}>
            {Object.keys(resultData).length ? (
              <>
                <Button
                  className="report-download"
                  onClick={(_) => handleDownloadResultData(resultData)}
                  buttonLabel="Download Report"
                  iconUrl={DownloadIcon}
                />
                {state?.certifiable ? <CreateCertificate /> : null}
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
        <InformationTable logs={logInfo} />
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
