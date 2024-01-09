import {
  CertificationTasks,
  getProgressCardInfo,
  ICertificationTask,
  IFinishedTestingTaskDetails,
  isTaskSuccess,
  PlanObj
} from "pages/certification/Certification.helper";

const PROGRESS_PASS = 100;
const PROGRESS_FAIL = -1;

export const setManyStatus = (
  index: number,
  config: any[],
  currentConfig: any,
  status: any,
  updatedState: string
) =>
  index < config.map((val: { status: any }) => val.status).indexOf(status)
    ? {
        ...currentConfig,
        state:
          currentConfig.state === "running" || currentConfig.state === "outline" // update only running status to updated status to avoid failure being overwritten
            ? updatedState
            : currentConfig.state,
      }
    : currentConfig;


export const indexOfExecutingProcess = (config: any[], state: string): number =>
  config.map((val: { state: any }) => val.state).indexOf(state) - 1;


export const processFinishedJson = (result: { [x: string]: any }): boolean => {
  const filterKeys = (type: string) => {
    return CertificationTasks.filter(item => item.type === type).map(item => item.key);
  }

  const unitTestKeys = filterKeys('array');

  let unitTestFailures = 0, filteredData: any = [];
  unitTestKeys.forEach(key => {
    const CertTaskRef = CertificationTasks.find(item => item.key === key);
    const filtered = result[key].filter((item: any) => {
      // item.tag === 'failure'
      if (key === '_certRes_DLTests' && item[1].tag === 'Failure') {
        return CertTaskRef
      } else if (key === '_certRes_unitTestResults' && typeof item !== 'string' && item.resultOutcome.tag === 'Failure') {
        return CertTaskRef
      }
      return false;
    })
    filteredData.push(...filtered)
  })
  unitTestFailures += filteredData.length ? 1 : 0
  return unitTestFailures ? false : true
};

export const processTimeLineConfig = (
  res: { data: { progress: { [x: string]: string | any[] }; plan: any; status: string; state?: string; } },
  config: any[],
) => {
  const status = res.data.status;
  const state = res.data.hasOwnProperty('state') ? res.data.state : '';
  return config.map((item, index) => {
    if (item.status === status) {
      const currentState =
        status === "finished" ? "passed" : state || "running";
      let returnObj: any = { ...item, state: currentState };
      return returnObj;
    }
    // Set the previously executed states as passed
    return setManyStatus(index, config, item, status, "passed");
  });
}

export const getPlannedTestingTasks = (res: any, _plannedTestingTasks: PlanObj[], isCustomizedTestingMode: boolean): PlanObj[] => {
  const plannedTestingTasks = JSON.parse(JSON.stringify(_plannedTestingTasks));
  const status = res.data.status;
  const state = res.data.hasOwnProperty('state') ? res.data.state : '';
  if (status === "certifying" && state === "running") {
    const resPlan = res.data.plan;
    const resProgress = res.data.progress;
    if (!plannedTestingTasks.length && resPlan.length) {
      return (
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
      return (
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
    return (
      plannedTestingTasks.map((item: PlanObj) => {
        if (isTaskSuccess(resultJson[item.key], item.key)) {
          item.progress = PROGRESS_PASS
        } else {
          item.progress = PROGRESS_FAIL;
        }
        return {...item, ...getProgressCardInfo(resultJson[item.key], item, isCustomizedTestingMode)}
      })
    )
  }
  return [];
}