import { Button } from "@mui/material";
import { exportObjectToJsonFile } from "utils/utils";
import DownloadIcon from '@mui/icons-material/Download';

const DownloadResult = (resultData: any) => {

  const handleDownloadResultData = (resultData: any) => {
    exportObjectToJsonFile(resultData, "Testing Report.json");
  };

  return <Button
      className="button"
      onClick={(_) => handleDownloadResultData(resultData)}
      variant="contained" size="medium"
      startIcon={<DownloadIcon />}
    >
      Download Report
    </Button>
}
export default DownloadResult;