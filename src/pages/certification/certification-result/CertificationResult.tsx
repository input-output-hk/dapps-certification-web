import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";

import { CircularProgress } from "@mui/material";
import FileCoverageContainer from "../components/FileCoverageContainer";
import CreateCertificate from "components/CreateCertificate/CreateCertificate";
import LogsView from "components/LogsView/LogsView";
import { TIMELINE_CONFIG } from "compositions/Timeline/timeline.config";

import {
  processFinishedJson,
  processTimeLineConfig,
} from "compositions/Timeline/components/TimelineItem/timeline.helper";

import { useAppDispatch } from "store/store";
import { ellipsizeString } from "../../../utils/utils";
import DownloadResult from "../components/DownloadResult/DownloadResult";
import ProgressCard from "components/ProgressCard/ProgressCard";
import FullReportTable from "./FullReportTable";
import { calculateCurrentProgress, calculateExpectedProgress, CertificationTasks, getProgressCardInfo, ICertificationTask, isAnyTaskFailure, PlanObj } from "../Certification.helper";
import { fetchCertificationResult } from "store/slices/certificationResult.slice";
import { showSnackbar } from "store/slices/snackbar.slice";

import "../Certification.css";

const CertificationResult = () => {
  const dispatch = useAppDispatch();
  const param = useParams<{ uuid: string }>();
  const { state } = useLocation();
  const [coverageFile, setCoverageFile] = useState("");
  const [resultData, setResultData] = useState<any>({});
  const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
  const [timelineConfig, setTimelineConfig] = useState(TIMELINE_CONFIG);

  const testTaskProgress = useRef<PlanObj[]>([])

  useEffect(() => {
    (async () => {
      try {
        const response: any = await dispatch(fetchCertificationResult({ uuid: param.uuid! }));
        const res = { data: response.payload };
        const runStatus = res.data.status;
        setTimelineConfig(
          processTimeLineConfig(res, timelineConfig)
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
    dispatch(showSnackbar({
      message: 'Something wrong occurred. Please try again.',
      severity: 'error', position: 'bottom'
    }));
    setTimelineConfig(TIMELINE_CONFIG);
  }, []);


  // Show loader until data is fetched
  if (!resultData || !Object.keys(resultData).length) {
    return <CircularProgress color="secondary" size={50} />;
  }

  return (
    <>
      <div className="content-area">
        <div className="content-area-title-section pb-7">
          <h2 className="break-all">
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

        <div className="content-area-box shadow-lg bg-white px-5 py-4">
          <LogsView
            runId={param.uuid as string}
            endPolling={true}
            open={false}
            oneTime={true}
          />

          <FullReportTable data={resultData} />
        </div>
        
      </div>
    </>
  );
};

export default CertificationResult;
