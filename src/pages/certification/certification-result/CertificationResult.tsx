import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";

import { fetchData } from "api/api";
import { processFinishedJson } from "components/TimelineItem/timeline.helper";
import ResultContainer from "../components/ResultContainer";
import FileCoverageContainer from "../components/FileCoverageContainer";

import "../Certification.scss";
import Button from "components/Button/Button";
import CreateCertificate from "components/CreateCertificate/CreateCertificate";
import { exportObjectToJsonFile } from "../../../utils/utils";
import DownloadIcon from "assets/images/download.svg";
import Toast from "components/Toast/Toast";

const CertificationResult = () => {
  const param = useParams();
  const { state } = useLocation();
  const [coverageFile, setCoverageFile] = useState("");
  const [resultData, setResultData] = useState<any>({});
  const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
  const [errorToast, setErrorToast] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchData.get("/run/" + param.uuid);
        const status = res.data.status;
        if (status === "finished") {
          const isArrayResult = Array.isArray(res.data.result);
          const resultJson = isArrayResult
            ? res.data.result[0]
            : res.data.result;
          if (isArrayResult) {
            setCoverageFile(res.data.result[1]);
          }
          const unitTestResult = processFinishedJson(resultJson);
          setUnitTestSuccess(unitTestResult);
          setResultData(resultJson);
        }
      } catch (error) {
        handleErrorScenario();
        // error handling
      }
    })();
  }, [param.uuid]);

  const handleDownloadResultData = (resultData: any) => {
    exportObjectToJsonFile(resultData, "Testing Report.json");
  };

  const handleErrorScenario = useCallback(() => {
    // show an api error toast
    setErrorToast(true);
    const timeout = setTimeout(() => {
      clearTimeout(timeout)
      setErrorToast(false);
    }, 5000); // hide after 5 seconds
  },[])

  return (
    <>
      <header>
        <h3>Certification Result</h3>
        <div style={{ float: "right", marginLeft: "5px" }}>
          {Object.keys(resultData).length ? (
            <>
              <Button
                className="report-download"
                onClick={(_) => handleDownloadResultData(resultData)}
                buttonLabel="Download Report"
                iconUrl={DownloadIcon}
              />
              {state?.certifiable ? <CreateCertificate /> : null }
            </>
          ) : null}
        </div>
      </header>
      {unitTestSuccess === false && Object.keys(resultData).length ? (
        <>
          <ResultContainer
            unitTestSuccess={unitTestSuccess}
            result={resultData}
          />
        </>
      ) : null}

      {unitTestSuccess && Object.keys(resultData).length ? (
        <>
          <FileCoverageContainer
            githubLink={state?.repoUrl || ""}
            result={resultData}
            coverageFile={coverageFile}
          />
          <ResultContainer result={resultData} />
        </>
      ) : null}

      {errorToast ? <Toast /> : null}
    </>
  );
};

export default CertificationResult;
