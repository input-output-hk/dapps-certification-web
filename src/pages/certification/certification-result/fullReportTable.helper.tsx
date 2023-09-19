import PieChart from "components/charts/PieChart/PieChart";
import { CertificationTasks, filterTaskKeysBy, getCertificationTaskName, processTablesDataForChart, VisualizableDataKeys } from "../Certification.helper";



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

    resultKeys.forEach((key: string) => {
        const dataObj = resultData[key];
        if (dataObj) {
            const testStatus = dataObj.tag.toLowerCase()
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