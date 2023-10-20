import PieChart from "components/charts/PieChart/PieChart";
import { formatToTitleCase } from "utils/utils";
import { filterTaskKeysBy, getCertificationTaskName, processTablesDataForChart, taskKeys, VisualizableDataKeys } from "../Certification.helper";

const resultKeys = filterTaskKeysBy('object');
const unitTestKeys = filterTaskKeysBy('array'); 

export const processData = (resultData: any) => {
    // parse finished json into data readable by grid

    const tableData: {
        task: string;
        label: string;
        status: "success" | "failure";
        dataObj?: any; //the whole data object
    }[] = []

    taskKeys().forEach((key: string) => {
        const dataObj = resultData[key];
        if (dataObj && (Array.isArray(dataObj) ? dataObj.length > 0 : true)) {
            let testStatus = null;
            if (resultKeys.indexOf(key) !== -1) {
                testStatus = dataObj.tag.toLowerCase()
            } else if (unitTestKeys.indexOf(key) !== -1) {
                testStatus = dataObj.filter((item: any) => {
                    let testTag = ''
                    if (key === "_certRes_DLTests") {
                        testTag = item[1].tag
                    } else if (key === "_certRes_unitTestResults") {
                        testTag = item.resultOutcome.tag
                    }
                    return testTag && testTag === 'Failure'
                })?.length ? 'failure' : 'success'
            }
            tableData.push({
                task: key,
                label: getCertificationTaskName(key),
                status: testStatus,
                dataObj: dataObj
            })
        }
    })
    

    return tableData;
}

export const renderCharts = (data?: any) => {
    const dataSet = data;// || resultObj;
    if (!dataSet || !dataSet.hasOwnProperty('tables')) {
      return null
    }
    return Object.keys(dataSet.tables).map((key, idx) => {
        if (VisualizableDataKeys.indexOf(key) !== -1) {
            return (
            <div className="chart-wrapper" key={idx}>
                <PieChart
                    title={key}
                    is3D={true}
                    data={processTablesDataForChart(dataSet, key)}
                />
            </div>)
        } else {
            return null
        }
    })
}


const FailedTaskDetails = (dataObj: any) => {
    return (<div className="">
        <span className="font-neutral-900 text-red-title block mb-10"><i>{dataObj.reason}</i></span>
        <div className="whitespace-pre">
            <span>Failing TestCase(s):</span>
            {dataObj.failingTestCase.length && dataObj.failingTestCase.map((val: string, index: number) => {
                return <div key={index}>{index + 1}. {val}</div>
            })}

            <div className="mt-20 whitespace-pre"><p>{dataObj.output}</p></div>
        </div>
    </div>)
}

const SuccessTaskChart = (dataObj: any) => {
    return (<div className="task-details">
        <span className="font-neutral-900 block mb-10">
            <i>OK, passed {dataObj.numTests} tests</i>
            {dataObj.numDiscarded >= 0 ? <i>; {dataObj.numDiscarded} discarded</i> : null}
        </span>
        <div className="flex justify-start flex-wrap">
            {renderCharts(dataObj)}
        </div>
    </div>)
}

export const generateCollapsibleContent = (row: any) => {
    const {task: key, status, dataObj} = row

    if (resultKeys.indexOf(key) !== -1) {
        if (status === "failure") {
            return FailedTaskDetails(dataObj)
        } else if (status === "success") {
            return SuccessTaskChart(dataObj)
        }
    } else if (unitTestKeys.indexOf(key) !== -1) {
        if (key === "_certRes_unitTestResults") {
            if (status === "success") {
                return (<div className="task-details">
                    <span className="font-neutral-900 block mb-10"><i>OK, passed {dataObj.length}/{dataObj.length} tests</i></span>
                </div>)
            } else if (status === "failure") {
                return dataObj.map((entry: any, index: number) => {
                    if (typeof entry !== 'string' && entry.resultOutcome.tag === 'Failure') {
                        return (<div className="task-details bg-red-background border-red-background">
                            <span className="font-neutral-900 text-red-title block mb-10"><i>{entry.resultShortDescription}</i></span>
                            <div className="whitespace-pre">{entry.resultDescription}</div>
                        </div>)
                    }
                })
            }
        } 
        else if (key === "_certRes_DLTests") {
            return dataObj.map((entry: any, index: number) => {
                return (<div className={`task-details ${status === "failure" ? "bg-red-background border-red-background" : ""}`}>
                    {status === "success" && (<span className="font-neutral-900 block mb-10"><i>OK, passed {dataObj.length}/{dataObj.length} tests</i></span>)}
                    <div key={index}>
                        <label className={`font-neutral-900 ${status === "failure" ? "text-red-title block mb-10" : ""}`}>
                            Test: {formatToTitleCase(entry[0])}
                        </label>
                        {entry[1].tag.toLowerCase() === "success" ? SuccessTaskChart(entry[1]) : FailedTaskDetails(entry[1])}
                    </div>
                </div>)
            })
        }
    }
}