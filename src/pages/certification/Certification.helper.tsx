import { formatToTitleCase } from "utils/utils";

export interface ICertificationTask {
  label: string;
  key: string;
  type: string;
  name: string;
  runTimeTaken?: any;
}

export interface IFinishedTestingTaskDetails {
  "qc-result": {
    discarded: number; 
    expected: number; 
    failures: number;
    succeeded: number;
  },
  succeeded: boolean, 
  task: {
    name: string;
    index: number;
  }
}

export interface ITestingProgress {
  "current-task": {
    name: string;
    index: number;
  },
  "finished-tasks": Array<IFinishedTestingTaskDetails>,
  "progress-index": number,
  "qc-progress": {
    discarded: number; 
    failures: number; 
    succeeded: number;
    expected?: number;
  }
} 

export interface PlanObj {
  key: string;
  name: string;
  label: string;
  discarded: number;
  progress: number | 'On Going';
  expected?: number;
  completed?: number;
}

export const CertificationTasks: ICertificationTask[] = [{
  label: 'UnitTests',
  key: '_certRes_unitTestResults',
  type: 'array',
  name: 'unit-tests'
}, {
  label: 'StandardProperty',
  key: '_certRes_standardPropertyResult',
  type: 'object',
  name: 'standard-property'
}, {
  label: 'DoubleSatisfaction',
  key: '_certRes_doubleSatisfactionResult',
  type: 'object',
  name: 'double-satisfaction'
}, {
  label: 'NoLockedFunds',
  key: '_certRes_noLockedFundsResult',
  type: 'object',
  name: 'no-locked-funds'
}, {
  label: 'NoLockedFundsLight',
  key: '_certRes_noLockedFundsLightResult',
  type: 'object',
  name: 'no-locked-funds-light'
}, {
  label: 'CrashTolerance',
  key: '_certRes_standardCrashToleranceResult',
  type: 'object',
  name: 'crash-tolerance'
}, {
  label: 'Whitelist',
  key: '_certRes_whitelistResult',
  type: 'object',
  name: 'white-list'
}, {
  label: 'DLTests',
  key: '_certRes_DLTests',
  type: 'array',
  name: 'dl-tests'
}]

export const VisualizableDataKeys = ['Actions', 'Actions rejected by precondition', 'Bad refund attempts', 'ChainEvent type']

export const isAnyTaskFailure = (result: any) => {
  const resultKeys = filterTaskKeysBy('object')
  let flag = 0;
  if (Object.keys(result).length) {
    flag = resultKeys.filter((key) => result[key] && result[key].tag === "Failure").length
  }
  return flag ? true : false;
}

export const isTaskSuccess = (result: any, taskName: string) => {
  let failed = false;
  if (taskName === '_certRes_unitTestResults') {
    failed = result.filter((item: any) => (typeof item !== 'string' && item.resultOutcome.tag === 'Failure'))?.length ? true : false
  } else if (taskName === '_certRes_DLTests') {
    failed = result.filter((item: any) =>  item[1].tag === 'Failure')?.length ? true : false
  } else {
    failed = result.tag === "Failure"
  }
  return !failed
}

export const processTablesDataForChart = (resultObj: any, tableAttr: string) => {
  let totalCount = 0
  try {
    totalCount = parseInt(resultObj.output.split(tableAttr + ' (')[1].split(' in total):')[0])
  } catch(err) {
    // do nothing
  }

  const data = [[tableAttr, "Percentage"]]
  for (let key in resultObj.tables[tableAttr]) {
    data.push([formatToTitleCase(key), resultObj.tables[tableAttr][key]])
  }

  return {
    data: data,
    totalCount: totalCount
  }
}

export const getPlannedCertificationTaskCount = (plannedTasks: any[]) => {
  return plannedTasks.filter(item => item.name && typeof item.name === 'string').length
}

export interface Log {
  Time: string,
  Text: string,
  Source: string
}

export const filterTaskKeysBy = (type: string) => {
  return CertificationTasks.filter(item => item.type === type).map(item => item.key);
}

export const getCertificationTaskName = (key: string) => {
  const obj: {key: string, label: string} | any = CertificationTasks.find(item => item.key === key)
  return obj.label;
};

export const taskKeys = () => {
  return CertificationTasks.map(item => item.key)
}

export const parseTestCount = (resultText: string) => {
  if (resultText.indexOf("+++ OK, passed ") !== -1) {
    // has the num of tests ran
    return parseInt(resultText.split("+++ OK, passed ")[1].split(" tests")[0], 10)
  } else {
    return 1;
  }
}

export const calculateCurrentProgress = (plannedTasks: PlanObj[]) => {
  return plannedTasks.reduce((accumulator, task) => { 
    return accumulator + (task.completed || 0)
  }, 0)
}

export const calculateExpectedProgress = (plannedTasks: PlanObj[]) => {
  return plannedTasks.reduce((accumulator, task) => { 
    return accumulator + (task.expected || 0)
  }, 0)
}

const DEFAULT_TESTS_COUNT: number = 100;
// calculate the expected and completed to populate the Progress Card
export const getProgressCardInfo = (keyResult: any, currentTask: PlanObj) => {
  const item = {...currentTask}
  if (isTaskSuccess(keyResult, item.key)) {
    if (item.name === 'dl-tests') {
      keyResult.forEach((dlTest: any) => {
        item.expected = (item.expected || 0) + (dlTest[1].numTests - dlTest[1].numDiscarded)
      })
    } else if (item.name === 'unit-tests') {
      keyResult.forEach((unitTest: any) => {
        item.expected = (item.expected || 0) + parseTestCount(unitTest.resultDescription)
      })
    } else {
      item.expected = keyResult.numTests - keyResult.numDiscarded
    }
    item.completed = item.expected
  } else {
    if (!item.hasOwnProperty('expected')) {
      // expected not already calculated from 'finished-tasks'
      if (item.name === 'unit-tests') {
        keyResult.forEach((unitTest: any) => {
          if (unitTest.resultOutcome.tag === 'Failure') {
            item.expected = (item.expected || 0) + 1
            item.completed = 0
          } else if (unitTest.resultOutcome.tag === 'Success') {
            item.expected = (item.expected || 0) + parseTestCount(unitTest.resultDescription)
            item.completed = (item.completed || 0) + parseTestCount(unitTest.resultDescription)
          }
        })
      } else if (item.name === 'dl-tests') {
        keyResult.forEach((dlTest: any) => {
          if (dlTest[1].tag === 'Success') {
            item.expected = (item.expected || 0) + (dlTest[1].numTests - dlTest[1].numDiscarded)
            item.completed = (item.completed || 0) + (dlTest[1].numTests - dlTest[1].numDiscarded)
          } else if (dlTest[1].tag === 'Failure') {
            item.expected = (item.expected || 0) + DEFAULT_TESTS_COUNT
            item.completed = (item.completed || 0) + (dlTest[1].numTests || 0)
          }
        })
      } else {
        item.expected = DEFAULT_TESTS_COUNT
        item.completed = keyResult.numTests || 0
      }
    }
  }
  return item
}