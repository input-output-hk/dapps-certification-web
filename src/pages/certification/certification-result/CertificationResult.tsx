import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";

import { fetchData } from "api/api";

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

import { ellipsizeString } from "../../../utils/utils";
import "../Certification.scss";
import DownloadResult from "../components/DownloadResult/DownloadResult";
import ProgressCard from "components/ProgressCard/ProgressCard";
import FullReportTable from "./FullReportTable";
import { isAnyTaskFailure, isTaskSuccess, taskKeys } from "../Certification.helper";

const CertificationResult = () => {
  const param = useParams<{ uuid: string }>();
  const { state } = useLocation();
  const [coverageFile, setCoverageFile] = useState("");
  const [resultData, setResultData] = useState<any>({});
  const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
  const [errorToast, setErrorToast] = useState(false);
  const [timelineConfig, setTimelineConfig] = useState(TIMELINE_CONFIG);

  const propertyBasedTestProgressTotal = useRef<number>(0)
  const currentPropertyBasedTestProgress = useRef<number>(0)

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
          const resultTaskKeys = Object.keys(resultJson)
          const certificationTaskKeys = taskKeys();
          let resultTaskKeysLength = 0;
          resultTaskKeys.forEach((key: any) => {
            if (certificationTaskKeys.indexOf(key) !== -1 && resultJson[key]) {
              currentPropertyBasedTestProgress.current += isTaskSuccess(resultJson[key], key) ? 100 : 0
              resultTaskKeysLength++;
            }
          })
          propertyBasedTestProgressTotal.current = resultTaskKeysLength * 100
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
          <h2>
            {(state?.repo && state?.commitHash) ?
              state.repo + ": " + ellipsizeString(state.commitHash, 7, 3)
              : (param?.uuid ? "Result: " + ellipsizeString(param?.uuid, 5, 3) : "Result")}
          </h2>
        </div>

        <div className="header-section">
          <>
            {Object.keys(resultData).length ? (<>
              <div className="w-full flex items-stretch justify-end gap-x-4">
                <DownloadResult resultData={resultData} />
                {(unitTestSuccess && state?.certifiable && !isAnyTaskFailure(resultData)) ? <CreateCertificate uuid={param.uuid as string} /> : null}
              </div>
              <div className="flex items-center justify-evenly my-10">
                {unitTestSuccess && <FileCoverageContainer 
                  githubLink={state?.repoUrl || ""}
                  result={resultData}
                  coverageFile={coverageFile}
                />}
                <ProgressCard title={"Property Based Testing"} currentValue={currentPropertyBasedTestProgress.current} totalValue={propertyBasedTestProgressTotal.current} />

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

          <FullReportTable data={resultData} />
        </div>
        
      </div>
      {errorToast ? <Toast /> : null}
    </>
  );
};

export default CertificationResult;
