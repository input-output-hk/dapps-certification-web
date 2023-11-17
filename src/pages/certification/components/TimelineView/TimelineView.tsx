import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useConfirm } from "material-ui-confirm";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

import { deleteTestHistoryData } from "pages/testingHistory/slices/deleteTestHistory.slice";

import { useAppDispatch } from "store/store";
import { fetchData } from "api/api";
import { useDelayedApi } from "hooks/useDelayedApi";

import Timeline from "compositions/Timeline/Timeline";
import { TIMELINE_CONFIG } from "compositions/Timeline/timeline.config";
import { processFinishedJson, processTimeLineConfig } from "compositions/Timeline/components/TimelineItem/timeline.helper";
import {
  calculateCurrentProgress,
  calculateExpectedProgress,
  CertificationTasks,
  getProgressCardInfo,
  ICertificationTask,
  IFinishedTestingTaskDetails,
  isAnyTaskFailure,
  isTaskSuccess,
  ITestingProgress,
  PlanObj
} from "./../../Certification.helper";
import LogsView from "components/LogsView/LogsView";
import ProgressCard from "components/ProgressCard/ProgressCard";
import CreateCertificate from "components/CreateCertificate/CreateCertificate";
import DownloadResult from "../DownloadResult/DownloadResult";
import FileCoverageContainer from "../FileCoverageContainer";
import { clearPersistentStates } from "../AuditorRunTestForm/utils";
import StatusIcon from "components/StatusIcon/StatusIcon";


const TIMEOFFSET = 1000;
const PROGRESS_PASS = 100;
const PROGRESS_FAIL = -1;

const TimelineView: React.FC<{
  uuid: string;
  repo: string;
  commitHash: string;
  runEnded: (ended: boolean) => void;
  onAbort: () => void;
  triggerFormReset: () => void;
}> = ({ uuid, repo, commitHash, runEnded, onAbort, triggerFormReset }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const [runStatus, setRunStatus] = useState("");
  const [runState, setRunState] = useState("");
  const [refetchMin, setRefetchMin] = useState(5);
  const [coverageFile, setCoverageFile] = useState("");
  const [fetchRunStatus, setFetchRunStatus] = useState(false);
  const [apiFetching, setApiFetching] = useState(false);
  const [timelineConfig, setTimelineConfig] = useState(TIMELINE_CONFIG);
  const [resultData, setResultData] = useState<any>({});
  const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
  const [hasFailedTasks, setHasFailedTasks] = useState(false);
  const [plannedTestingTasks, setPlannedTestingTasks] = useState<PlanObj[]>([]);

  const abortTestRun = () => {
    confirm({ title: "", description: "Are sure you want to abort this run!" })
      .then(async () => {
        await dispatch(
          deleteTestHistoryData({ url: "/run/" + uuid + "?delete=true" })
        );
        onAbort();
      })
      .catch(() => {});
  };

  const viewFullReport = () => {
    navigate("/report/" + uuid, { state: { certifiable: true, repo: repo, commitHash: commitHash } });
  };

  const handleTestingTimelineDetails = (
    status: string,
    state: string,
    res: any
  ) => {
    if (status === "certifying" && state === "running") {
      const resPlan = res.data.plan;
      const resProgress = res.data.progress;
      if (!plannedTestingTasks.length && resPlan.length) {
        setPlannedTestingTasks(
          resPlan.map((item: { index: number; name: string }) => {
            const TaskConfig: ICertificationTask | undefined = CertificationTasks.find((task) => task.name === item.name)
            if (!TaskConfig) {
              return null;
            }
            return {
              key: TaskConfig.key,
              name: item.name,
              label: TaskConfig.label,
              discarded: 0,
              progress: 0,
            };
          })
        );
      } else if (plannedTestingTasks.length && resProgress) {
        setPlannedTestingTasks(
          plannedTestingTasks.map((item: PlanObj) => {
            const currentTask = resProgress["current-task"];
            if (currentTask && item.name === currentTask["name"]) {
              const currentProgressStats = resProgress["qc-progress"];
              item.discarded = currentProgressStats["discarded"];
              item.progress = currentProgressStats["expected"] ? Math.trunc(
                ((currentProgressStats["successes"] + currentProgressStats["failures"]) / 
                  // currentProgressStats["expected"]) * 100
                  (currentProgressStats["expected"] - currentProgressStats["discarded"])) * 100
              ) : "On Going";
            }
            const isInFinished = resProgress["finished-tasks"].find((task: IFinishedTestingTaskDetails) => task.task.name === item.name)
            if (isInFinished) {
              item.discarded = isInFinished["qc-result"].discarded
              item.progress = isInFinished.succeeded ? PROGRESS_PASS : PROGRESS_FAIL
            }
            return item
          })
        )
      }
    } else if (status === 'finished') {
      const isArrayResult = Array.isArray(res.data.result);
      const resultJson = isArrayResult
        ? res.data.result[0]
        : res.data.result;
      setPlannedTestingTasks(
        plannedTestingTasks.map((item: PlanObj) => {
          if (isTaskSuccess(resultJson[item.key], item.key)) {
            item.progress = PROGRESS_PASS
          } else {
            item.progress = PROGRESS_FAIL;
          }
          return {...item, ...getProgressCardInfo(resultJson[item.key], item)}
        })
      )
    }
  };

  const triggerFetchRunStatus = async () => {
    let config = timelineConfig;
    try {
      const res = await fetchData.get("/run/" + uuid);
      const status = res.data.status;
      const state = res.data.hasOwnProperty("state") ? res.data.state : "";
      setRunStatus(status);
      setRunState(state);
      setFetchRunStatus(state === "running" || state === "passed");
      config = processTimeLineConfig(config, state, status, res);
      handleTestingTimelineDetails(status, state, res);
      if (status === "finished") {
        const isArrayResult = Array.isArray(res.data.result);
        const resultJson = isArrayResult
          ? res.data.result[0]
          : res.data.result;
        if (isArrayResult) {
          setCoverageFile(res.data.result[1]);
        }
        setResultData(resultJson)
        runEnded(true)
        const unitTestResult = processFinishedJson(resultJson);
        setUnitTestSuccess(unitTestResult);
        setHasFailedTasks(isAnyTaskFailure(resultData))
        // navigate to result page
        clearPersistentStates();
        // navigate("/report/" + uuid, { state: { repoUrl: githubLink, certifiable: true } });
      }
      if (state === "failed" || status === "finished") {
        // setSubmitting(false);
        clearPersistentStates();
        setApiFetching(false);
      }
      setTimelineConfig(config);
    } catch (e) {
      // handleErrorScenario();
      console.error("Failed:", e);
      triggerFormReset();
    }
  };

  const processLatestTestingProgressFromLogs = (response: {status: any}) => {
    if (plannedTestingTasks && response.status) {
      const progress: ITestingProgress = response.status;

      plannedTestingTasks.map((task:PlanObj) => {
        const finishedTask = progress["finished-tasks"].find(entry => task.name === entry.task.name)
        if (finishedTask) {
          if (!task.expected) {
            task.expected = finishedTask["qc-result"].expected;
          }
          task.progress = finishedTask.succeeded ? PROGRESS_PASS : PROGRESS_FAIL;
        } else if (progress['current-task'].name === task.name) {
          if (!task.expected && progress['qc-progress'].hasOwnProperty('expected')) {
            task.expected = progress['qc-progress'].expected
          }
        }
        return task;
      })
    }
  }

  const getTaskProgress = (task: PlanObj, index: number) => {
    return (runStatus === "finished" && (plannedTestingTasks.length - 1 === index))
    ? (isTaskSuccess(resultData[task.key], task.key) ?
        <StatusIcon iconName={"status-check"} altText={"passed"} /> 
        : <StatusIcon iconName={"failed"} />
      ) 
    : (task.progress === PROGRESS_PASS ?
        <StatusIcon iconName={"status-check"} altText={"passed"} />
        : task.progress === PROGRESS_FAIL ? 
          <StatusIcon iconName={"failed"} />  
          : <span>{task.progress}{typeof task.progress === "number" ? "%" : ""}</span>
      )

  }

  useEffect(() => {
    if (uuid.length) {
      triggerFetchRunStatus();
    }
    // eslint-disable-next-line
  }, [uuid]);

  useEffect(() => {
    runStatus === "certifying" ? setRefetchMin(2) : setRefetchMin(5);
    if (
      runStatus === "certifying" ||
      runStatus === "building" ||
      runStatus === "preparing" ||
      runStatus === "queued" ||
      (runStatus === "finished" && runState === "running")
    ) {
      setApiFetching(true);
    } else {
      setApiFetching(false);
    }
  }, [runStatus, runState]);

  useDelayedApi(
    async () => {
      setFetchRunStatus(false); // to clear timeout until api response
      triggerFetchRunStatus();
    },
    refetchMin * TIMEOFFSET, // delay in milliseconds
    fetchRunStatus // set to false to stop polling
  );

  useEffect(() => {
    // Run on unmount
    return () => {
      setFetchRunStatus(false); // to stop polling for run status
    };
  }, []);

  if (uuid && !runStatus) {
    return <CircularProgress color="secondary" size={50} />;
  }

  return (
    <>
      <div className="timeline-view-container w-full">
        {uuid && (
          <>
            {apiFetching && (
              <Button
                type="button"
                variant="contained" size="large"
                onClick={abortTestRun}
                className="button py-3 px-14 my-10 block mx-auto w-[200px]"
              >
                Abort
              </Button>
            )}

            {runStatus === "finished" && (<>
              <Button
                type="button"
                variant="contained" size="large"
                onClick={viewFullReport}
                className="button py-3 px-14 my-10 block mx-auto"
              >
                Full Report
              </Button>
              <div className="flex justify-around mb-20 flex-wrap gap-[8px]">
                {(unitTestSuccess && !hasFailedTasks) && <CreateCertificate uuid={uuid} />}
                <DownloadResult resultData={resultData} />
              </div>
            </>)}

            <Timeline
              statusConfig={timelineConfig}
              unitTestSuccess={unitTestSuccess}
              hasFailedTasks={hasFailedTasks}
            />

            <LogsView
              runId={uuid}
              endPolling={runStatus === "finished" || runState === "failed"}
              open={runState === "failed"}
              latestTestingProgress={processLatestTestingProgressFromLogs}
            />

            {runStatus === "certifying" || runStatus === "finished" ? (
              <>
                <div className="flex justify-around flex-wrap gap-[8px]">
                  {runStatus === "finished" && (<>
                    <FileCoverageContainer
                      githubLink={repo || ""}
                      result={resultData}
                      coverageFile={coverageFile}
                    />
                    <ProgressCard 
                      title={"Property Based Testing"} 
                      currentValue={calculateCurrentProgress(plannedTestingTasks)} 
                      totalValue={calculateExpectedProgress(plannedTestingTasks)}
                    />
                  </>)}
                </div>

                <div id="testingProgressContainer" className="mt-20">
                  <table className="min-w-full text-left text-sm font-light">
                    <thead className="font-medium dark:border-neutral-500 bg-slate-table-head text-slate-table-headText font-medium">
                      <tr>
                        <th scope="col" className="p-2">
                          Property Name
                        </th>
                        <th scope="col" className="text-center p-2">
                          Discarded
                        </th>
                        <th scope="col" className="text-center p-2">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plannedTestingTasks.map((task: PlanObj, index: number) => {
                        return (
                          <tr
                            key={task.name}
                            className="dark:border-neutral-500"
                          >
                            <td className="whitespace-nowrap p-2">
                              {task.label}
                            </td>
                            <td className="text-center whitespace-nowrap p-2">
                              {task.discarded}
                            </td>
                            <td className="text-center whitespace-nowrap p-2">
                              {getTaskProgress(task, index)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

export default TimelineView;
