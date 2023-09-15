import Button from "components/Button/Button";
import { exportObjectToJsonFile } from "utils/utils";
import DownloadIcon from "assets/images/download.svg";


const DownloadResult = (resultData: any) => {

  const handleDownloadResultData = (resultData: any) => {
    exportObjectToJsonFile(resultData, "Testing Report.json");
  };

    return <Button
        className="report-download bg-secondary hover:bg-blue rounded-3"
        onClick={(_) => handleDownloadResultData(resultData)}
        buttonLabel="Download Report"
        iconUrl={DownloadIcon}
    />
}
export default DownloadResult;