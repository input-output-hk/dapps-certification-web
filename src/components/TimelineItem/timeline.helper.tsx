import { CertificationTasks, getPlannedCertificationTaskCount } from "pages/certification/Certification.helper";

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
  config: any[],
  state: any,
  status: string,
  res: { data: { progress: { [x: string]: string | any[] }; plan: any } }
) => {
  return config.map((item, index) => {
    if (item.status === status) {
      const currentState =
        status === "finished" ? "passed" : state || "running";
      let returnObj: any = { ...item, state: currentState };
      // if (
      //   status === "certifying" &&
      //   currentState === "running" &&
      //   res.data.progress &&
      //   res.data.plan
      // ) {
      //   const plannedTasksCount = getPlannedCertificationTaskCount(res.data.plan);
      //   if (plannedTasksCount > 0) {
      //     returnObj["progress"] = Math.trunc((res.data.progress["finished-tasks"].length / plannedTasksCount) * 100);
      //   } else {
      //     returnObj["progress"] = 0;
      //   }
      // }
      return returnObj;
    }
    // Set the previously executed states as passed
    return setManyStatus(index, config, item, status, "passed");
  });
}