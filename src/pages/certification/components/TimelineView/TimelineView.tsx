import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useConfirm } from "material-ui-confirm";

import { deleteTestHistoryData } from "pages/testHistory/slices/deleteTestHistory.slice";

import { useAppDispatch } from "store/store";
import { fetchData } from "api/api";
import { useDelayedApi } from "hooks/useDelayedApi";

import Timeline from "compositions/Timeline/Timeline";
import { TIMELINE_CONFIG } from "compositions/Timeline/timeline.config";
import { processTimeLineConfig } from "components/TimelineItem/timeline.helper";
import { CertificationTasks, isAnyTaskFailure } from "./../../Certification.helper";
import LogsView from "components/LogsView/LogsView";

const TIMEOFFSET = 1000;


interface PlanObj {
    name: string;
    label: string;
    discarded: number;
    progress: number;
}

const TimelineView: React.FC<{
    uuid: string;
    onAbort: () => void,
    triggerFormReset: () => void
}> = ({ uuid, onAbort, triggerFormReset }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const confirm = useConfirm();

    const [runStatus, setRunStatus] = useState("");
    const [runState, setRunState] = useState("");
    const [refetchMin, setRefetchMin] = useState(5);
    const [fetchRunStatus, setFetchRunStatus] = useState(false);
    const [apiFetching, setApiFetching] = useState(false);
    const [timelineConfig, setTimelineConfig] = useState(TIMELINE_CONFIG);
    const [resultData, setResultData] = useState<any>({});
    const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
    const [plannedTestingTasks, setPlannedTestingTasks] = useState<PlanObj[]>([])

    const abortTestRun = () => {
        confirm({ title: "", description: "Are sure you want to abort this run!" })
            .then(async () => {
                await dispatch(deleteTestHistoryData({ url: "/run/" + uuid + "?delete=true" }))
                onAbort()
            }).catch(() => { });
    }

    const viewFullReport = () => {
        navigate("/report/" + uuid, { state: { certifiable: true } });
    }

    const handleTestingTimelineDetails = (status: string, state: string, res: any) => {
        if (status === "certifying" && state === "running") {
            const resPlan = res.data.plan;
            const resProgress = res.data.progress;
            if (!plannedTestingTasks.length && resPlan.length) {
                setPlannedTestingTasks(resPlan.map((item: {index: number, name: string}) => {
                    return {
                        name: item.name,
                        label: CertificationTasks.find(task => task.name === item.name)?.label,
                        discarded: 0,
                        progress: 0
                    }
                }))
            } else if (plannedTestingTasks.length && resProgress) {
                // planned tasks are already defined
                setPlannedTestingTasks(plannedTestingTasks.map((item: PlanObj) => {
                    const currentTask = resProgress['current-task']
                    if (currentTask && item.name === currentTask['name']) {
                        const currentProgressStats = resProgress['qc-progress'];
                        item.discarded = currentProgressStats['discarded']
                        item.progress = Math.trunc(((currentProgressStats['successes'] + currentProgressStats['failures']) / currentProgressStats['expected']) * 100)
                    }
                    if (resProgress['finished-tasks'].length) {
                        resProgress['finished-tasks'].forEach((entry: any) => {
                            if (item.name === entry['task']['name'] && entry.succeeded) {
                                item.progress = 100
                            }
                        })
                    }
                    return item
                }))
            }
          }
    }

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
            handleTestingTimelineDetails(status, state, res)
            if (status === "finished") {
                // navigate to result page
                // clearPersistentStates();
                // navigate("/report/" + uuid, { state: { repoUrl: githubLink, certifiable: true } });
            }
            if (state === "failed" || status === "finished") {
                // setSubmitting(false);
                // clearPersistentStates();
                setApiFetching(false)
            }
            setTimelineConfig(config);

        } catch (e) {
            // handleErrorScenario();
            console.error('Failed:', e);
            triggerFormReset()
        }
    };


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
    }, [])

    return <>
        <div className="timeline-view-container" style={{ width: "50%" }}>
            {uuid ?
                <>
                    {apiFetching && <Button 
                        onClick={abortTestRun}>
                            Abort
                        </Button>}

                    {runStatus === "finished" ?
                        <Button onClick={viewFullReport}>
                            Full Report
                        </Button>
                    : null }

                    <Timeline
                        statusConfig={timelineConfig}
                        unitTestSuccess={unitTestSuccess}
                        hasFailedTasks={isAnyTaskFailure(resultData)}
                    />

                    <LogsView runId={uuid} endPolling={(runStatus === "finished" || runState === "failed")} open={runState === "failed"}/>

                    {runStatus === "certifying" ?
                        <>
                            <div id="testingProgressContainer">
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Property Name</TableCell>
                                                <TableCell align="center">Discarded</TableCell>
                                                <TableCell align="center">Progress</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {plannedTestingTasks.map((task: PlanObj) => {
                                                return <TableRow
                                                    key={task.name}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">{task.label}</TableCell>
                                                    <TableCell align="center">{task.discarded}</TableCell>
                                                    <TableCell align="center">
                                                        {task.progress === 100 ? 
                                                            <img className="image" src="/images/status-check.svg" alt="complete"/>
                                                            : <span>{task.progress}%</span>
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </>
                        : null}

                </>
                :
                <div style={{ textAlign: "center" }}><span>Fill the testing form</span></div>
            }
        </div>
    </>
}

export default TimelineView