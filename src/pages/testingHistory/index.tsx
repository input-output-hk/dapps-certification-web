import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { useNavigate } from "react-router";

import { fetchData } from "api/api";

import { Container, Box, Button, IconButton, Typography, Snackbar, Alert, AlertTitle } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useConfirm } from "material-ui-confirm";
import { useAppDispatch } from "store/store";
import { deleteTestHistoryData } from "./slices/deleteTestHistory.slice";

import TableComponent from "components/Table/Table";
import { processFinishedJson } from "compositions/Timeline/components/TimelineItem/timeline.helper";
import { isAnyTaskFailure } from "pages/certification/Certification.helper";
import { Run } from 'components/CreateCertificate/CreateCertificate';
import { exportObjectToJsonFile } from "utils/utils";

import "./index.css";

interface ICampaignCertificate {
  runId: string;
  transactionId: string;
  createdAt: string;
}

interface IRunCertifications {
  [key: string]: ICampaignCertificate
}

interface IRunReportData {
  id: string;
  raw: any; // finished result JSON
}
interface IRunReport {
  [key: string]: IRunReportData
}

dayjs.extend(utc)
dayjs.extend(tz)

const TestHistory = () => {
  const [data, setData] = useState<Array<Run>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningSpinner, setRunningSpinner] = useState("");
  const [highlightLabelFor, setHighlightLabelFor] = useState("");
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [errorToast, setErrorToast] = useState<{display: boolean; statusText?: string; message?: string;}>({display: false});
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const certificationData: IRunCertifications = {};
  const reportData: IRunReport = {};
  const timeZone = dayjs.tz.guess()
  const navigate = useNavigate();

  useEffect(() => {
    fetchTableData();
  }, []);

  useEffect(() => {
    setSkipPageReset(false);
  }, [data]);

  const setCertificationData = (runId: string, response: ICampaignCertificate) => {
    certificationData[runId] = response;
  }

  const getCertificationData = (runId: string): ICampaignCertificate | null => {
    return certificationData[runId] ? certificationData[runId] : null
  }

  const setReportData = (runId: string, type: 'id' | 'raw', response: any) => {
    const data: any = { id: null, raw: null}
    data[type] = response;
    reportData[runId] = data;
  }

  const getReportData = (runId: string) => {
    return reportData[runId] ? reportData[runId] : null
  }

  const handleError = (error: any) => {
    if (error.response) {
      setErrorToast({display: true, statusText: error.response.statusText, message: error.response.data || undefined})
    } else {
      setErrorToast({display: true})
    }
    const timeout = setTimeout(() => { clearTimeout(timeout); setErrorToast({display: false}) }, 3000)
  }
  const updateMyData = (rowIndex: any, columnID: any, value: any) => {
    setSkipPageReset(true); // turn on flag to not reset the page
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnID]: value,
          };
        }
        return row;
      })
    );
  };

  const RunStatusCell = ({
    value,
    row,
    column: { id },
    updateMyData, // This is a custom function that we supplied to our table instance
  }: any) => {
    const { index, original } = row;
    const triggerApi = async (e: any) => {
      setRunningSpinner(original.runId)
      const res: any = await fetchData.get("/run/" + original.runId).catch(handleError);
      /** For mock */
      // const res = await fetchData.get("static/data/certifying.json")
      
      if (res) {
        setErrorToast({display: false})
        const status = res.data.status;
        const state = res.data.hasOwnProperty("state") ? res.data.state : "";
        let response: string = 'queued';
        // show failed if either states failed or unitTest/certTasks failed
        if (state === 'failed') {
          response = 'failed'
        } else {
          if (status === 'finished') {
            const isArrayResult = Array.isArray(res.data.result)
            const resultJson = isArrayResult ? res.data.result[0] : res.data.result;
            const isUnitTestSuccess = processFinishedJson(resultJson);
            const isComplete = isUnitTestSuccess && !isAnyTaskFailure(resultJson);
            response = isComplete ? 'succeeded' : 'failed';
          } else {
            // do nothing; retain response='queued'
          }
        } 
        setRunningSpinner(prevValue => {
          if (prevValue !== "") {
            // show a highlight over the label
            setHighlightLabelFor(prevValue)
            const timeout = setTimeout(() => { clearTimeout(timeout); setHighlightLabelFor("") }, 1500)
          }
          return ""
        })
        updateMyData(index, id, response);
      } else {
        setRunningSpinner("")
      }
    };
    const runId = original.runId; // get the run id
    if (value === "certified") {
      return <span>CERTIFIED</span>;
    } else if (value === "succeeded") {
      return <span>OK</span>;
    } else if (value === "failed") {
      return <span>FAILED</span>;
    } else if (value === "queued") {
      return (
        <>
          <span>RUNNING</span>
          <IconButton 
            size="small"
            className="text-main ml-1 mt-[-4px]"
            onClick={() => triggerApi(runId)}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
      </>
      );
    } else if (value === "aborted") {
      return <span>ABORTED</span>;
    } else if (value === "ready-for-certification") {
      return <span>READY FOR CERTIFICATION</span>;
    }
  };

  const openReport = (reportData: IRunReportData | null) => {
    if (reportData?.id) {
      const url = `ipfs://${reportData.id}/`
      window.open(url, "_blank");
    } else if (reportData?.raw) {
      exportObjectToJsonFile(reportData.raw, "Testing Report.json");      
    }
  }
  const viewReport = async (runId: string) => {
    const reportData: IRunReportData | null = getReportData(runId)
    if (!reportData) {
      fetchData.get("/run/" + runId + "/details").catch(handleError).then((response:any) => {
        setErrorToast({display: false})
        if (response.data.reportContentId && response.data.runStatus === "certified") {
          setReportData(runId, 'id', response.data.reportContentId)
          openReport(getReportData(runId))
        } else {
          // assuming campaign finished, but not certified; fetch report from result
          fetchData.get("/run/" + runId).catch(handleError).then((res:any) => {
            if (res.data.status === 'finished' && res.data.hasOwnProperty("result")) {
              const resultJson = Array.isArray(res.data.result) ? res.data.result[0] : res.data.result
              setReportData(runId, 'raw', resultJson)
              openReport(getReportData(runId))
            }
          })
        }
      })
    } else {
      openReport(reportData)
    }
  }

  const viewCertificate = async (runId: string) => {
    const certData = getCertificationData(runId)
    if (!certData) {
      const response: any = await fetchData.get("/run/" + runId + "/certificate").catch(handleError);
      /** For mock */
      // const response = await fetchData.get("static/data/certicate.json");
      if (response) {
        setErrorToast({display: false})
        setCertificationData(runId, response.data);
        openCertificate(response.data);
      }
    } else {
      openCertificate(certData);
    }
  };

  const openCertificate = (data: any) => {
    const { transactionId } = data;
    let url = `https://preprod.cardanoscan.io/transaction/${transactionId}`;
    window.open(url, "_blank");
  };

  const formatRepoUrl = (repoUrl: string) => {
    let pieces = repoUrl.split('github:')[1].split('/')
    return (pieces[0] + "/" + pieces[1]);
  }

  const columns = React.useMemo(() => [
    {
      Header: "Repo name",
      accessor: "repoUrl",
      Cell: (props: any) => (
        <span>{formatRepoUrl(props.row.original.repoUrl)}</span>
      )
    },
    {
      Header: "Checkout",
      accessor: "commitHash",
      disableSortBy: true,
      Cell: (props: any) => (
        <span className="max-w-[85px] text-ellipsis overflow-hidden whitespace-nowrap block" title={props.row.original.commitHash}>
          {props.row.original.commitHash}
        </span>
      )
    },
    {
      Header: "Commit date",
      accessor: "commitDate",
      columnVisible: false,
      Cell: (props: any) => (
        <span>
          {dayjs.utc(props.row.original.commitDate).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      Header: "Finished at",
      accessor: "finishedAt",
      columnVisible: false,
      Cell: (props: any) => (
        <span>
          {dayjs.utc(props.row.original.finishedAt).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      Header: "Synced at",
      accessor: "syncedAt",
      columnVisible: false,
      Cell: (props: any) => (
        <span>
          {dayjs.utc(props.row.original.syncedAt).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      Header: "Status",
      accessor: "runStatus",
      cellStyle: {
        display: 'flex'
      },
      Cell: RunStatusCell
    },
    {
      Header: "View results",
      disableSortBy: true,
      accessor: "viewReport",
      Cell: (props: any) => {
        const notCertified: boolean = props.row.original.runStatus === "succeeded" || props.row.original.runStatus === "ready-for-certification"
        if (notCertified || props.row.original.runStatus === "certified") {
          return (
            <Button
              variant="text"
              size="small"
              className="text-main"
              onClick={() => {
                navigate("/report/" + props.row.original.runId, {state: { repo: formatRepoUrl(props.row.original.repoUrl), commitHash: props.row.original.commitHash, certifiable: notCertified }});
              }}
            >
              Link
            </Button>
          );
            }
      },
    },
    {
      Header: "View certificate",
      disableSortBy: true,
      accessor: "viewCertificate",
      Cell: (props: any) => {
        if (props.row.original.runStatus === "certified") {
          return (
            <Button
              variant="text"
              size="small"
              className="text-main"
              onClick={() => {
                viewCertificate(props.row.original.runId);
              }}
            >
              Transaction
            </Button>
          );
        }
      },
    },
    {
      Header: "",
      disableSortBy: true,
      accessor: "delete",
      Cell: (props: any) => {
        if (props.row.original.runStatus !== "certified" && props.row.original.runStatus !== "ready-for-certification") {
          return (
            <IconButton 
              size="small"
              className="text-main"
              onClick={() => {
                onDelete(props.row.original.runId);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          );
        }
      },
    }
    ],
    []
  );

  const fetchTableData = async () => {
    const result = await fetchData.get("/run")
    setLoading(false);
    /** For mock */
    // const result = await fetchData.get("static/data/history.json");
    if (result.data.length) {
      setData(result.data);
    }
  };

  const onDelete = (runId: string) => {
    confirm({ title: "", description: "Are you sure want to remove this run campaign from logs!" })
      .then(async () => {
        await dispatch(deleteTestHistoryData({ url: "/run/" + runId + "?delete=true" }));
        fetchTableData()
      })
      .catch(() => { });
  };
  
  return (
    <Container className="pt-4" maxWidth={false}>
      <Typography variant="h5" className="font-medium text-main mb-6">
        Testing History
      </Typography>

      <Box>
        <TableComponent
          dataSet={data}
          columns={columns}
          showColViz={true} 
          updateMyData={updateMyData}
          skipPageReset={skipPageReset}
          loading={loading}
        />
      </Box>

      <Snackbar open={errorToast.display} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled">
          <AlertTitle>{errorToast.statusText}</AlertTitle>
          {errorToast.message || 'Something wrong occurred. Please try again.'}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TestHistory;