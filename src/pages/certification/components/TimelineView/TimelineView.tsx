import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useConfirm } from "material-ui-confirm";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

import { fetchRunStatus, clearRun } from "store/slices/testing.slice";
import { deleteTestHistoryData } from "store/slices/testingHistory.slice";

import { useAppDispatch, useAppSelector } from "store/store";
import { useDelayedApi } from "hooks/useDelayedApi";
import Timeline from "compositions/Timeline/Timeline";

import { calculateCurrentProgress, calculateExpectedProgress, isTaskSuccess, ITestingProgress, PlanObj } from "./../../Certification.helper";

import LogsView from "components/LogsView/LogsView";
import ProgressCard from "components/ProgressCard/ProgressCard";
import CreateCertificate from "components/CreateCertificate/CreateCertificate";
import StatusIcon from "components/StatusIcon/StatusIcon";
import DownloadResult from "../DownloadResult/DownloadResult";
import FileCoverageContainer from "../FileCoverageContainer";

interface Props {
  onAbort: () => void;
}

const TIMEOFFSET = 1000;
const PROGRESS_PASS = 100;
const PROGRESS_FAIL = -1;

const TimelineView: React.FC<Props> = ({ onAbort }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const [running, setRunning] = useState<boolean>(false);
  const {
    form,
    uuid,
    timelineConfig,
    plannedTestingTasks,
    runStatus,
    runState,
    coverageFile,
    resultData,
    unitTestSuccess,
    hasFailedTasks,
    fetching,
    refetchMin,
    shouldFetchRunStatus,
    isCustomizedTestingMode
  } = useAppSelector(state => state.testing);

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
    navigate("/report/" + uuid, { state: { certifiable: true, repo: form?.repoUrl, commitHash: form?.commitHash } });
    dispatch(clearRun())
  };

  const processLatestTestingProgressFromLogs = (response: {status: any}) => {
    if (plannedTestingTasks && response.status) {
      const progress: ITestingProgress = response.status;

      plannedTestingTasks.map((_task:PlanObj) => {
        const task = JSON.parse(JSON.stringify(_task));
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
    if (uuid !== null) {
      dispatch(fetchRunStatus({}));
    }
  }, [uuid]);

  useDelayedApi(
    async () => {
      setRunning(true); // to clear timeout until api response
      await dispatch(fetchRunStatus({}));
      setRunning(false);
    },
    refetchMin * TIMEOFFSET, // delay in milliseconds
    shouldFetchRunStatus && !running // set to false to stop polling
  );

  if (uuid && !runStatus) {
    return (
      <div className="w-full text-center text-xl text-neutral-300 font-medium pt-48">
        <CircularProgress color="secondary" size={50} />
      </div>
    );
  }

  return (
    <>
      <div className="timeline-view-container w-full">
        {uuid && (
          <>
            {fetching && (
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
                {(!isCustomizedTestingMode && unitTestSuccess && !hasFailedTasks) ? <CreateCertificate uuid={uuid} /> : null}
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
                      githubLink={form!.repoUrl!}
                      result={resultData}
                      coverageFile={coverageFile}
                    />
                    {(!plannedTestingTasks || !plannedTestingTasks.length) ? null : (
                      <ProgressCard 
                        title={"Property Based Testing"} 
                        currentValue={calculateCurrentProgress(plannedTestingTasks)} 
                        totalValue={calculateExpectedProgress(plannedTestingTasks)}
                      />
                    )} 
                  </>)}
                </div>
                {(!plannedTestingTasks || !plannedTestingTasks.length) ? null : (  
                  <div id="testingProgressContainer" className="mt-20">
                    <table className="min-w-full text-left text-sm font-light">
                      <thead className="font-medium dark:border-neutral-500 bg-slate-table-head text-slate-table-headText">
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
                )}
              </>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

export default TimelineView;
