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
import { calculateCurrentProgress, calculateExpectedProgress, CertificationTasks, getProgressCardInfo, ICertificationTask, isAnyTaskFailure, PlanObj } from "../Certification.helper";

const CertificationResult = () => {
  const param = useParams<{ uuid: string }>();
  const { state } = useLocation();
  const [coverageFile, setCoverageFile] = useState("");
  const [resultData, setResultData] = useState<any>({});
  const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
  const [errorToast, setErrorToast] = useState(false);
  const [timelineConfig, setTimelineConfig] = useState(TIMELINE_CONFIG);

  const testTaskProgress = useRef<PlanObj[]>([])

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
          resultTaskKeys.forEach((key: any) => {
            
            const TaskConfig: ICertificationTask | undefined = CertificationTasks.find((task) => task.key === key)
            if (!TaskConfig || !resultJson[key]) {
              // do nothing
            } else {
              const taskEntry = {
                key: TaskConfig.key,
                name: TaskConfig.name,
                label: TaskConfig.label,
                discarded: 0,
                progress: 0
              }

              testTaskProgress.current.push({
                ...taskEntry,
                ...getProgressCardInfo(resultJson[key], taskEntry)
              })
            }
          })
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
                <ProgressCard
                  title={"Property Based Testing"}
                  currentValue={calculateCurrentProgress(testTaskProgress.current)}
                  totalValue={calculateExpectedProgress(testTaskProgress.current)}
                />
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
