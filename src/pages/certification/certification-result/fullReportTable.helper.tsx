import PieChart from "components/charts/PieChart/PieChart";
import { CertificationTasks, filterTaskKeysBy, getCertificationTaskName, processTablesDataForChart, taskKeys, VisualizableDataKeys } from "../Certification.helper";



export const processData = (resultData: any) => {
    // parse finished json into data readable by grid

    const resultKeys = filterTaskKeysBy('object');
    const unitTestKeys = filterTaskKeysBy('array'); 

    const tableData: {
        task: string;
        label: string;
        status: "success" | "failure";
        dataObj?: any; //the whole data object
    }[] = []

    taskKeys().forEach((key: string) => {
        const dataObj = resultData[key];
        if (dataObj) {
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
    if (!dataSet.hasOwnProperty('tables')) {
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