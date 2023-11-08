import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { useNavigate } from "react-router";

import { Container, Box, Button, IconButton, Typography, Snackbar, Alert, AlertTitle } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useConfirm } from "material-ui-confirm";
import { useAppDispatch, useAppSelector } from "store/store";
import { fetchHistory, updateRowStatus, deleteTestHistoryData, fetchCertificate } from "store/slices/testingHistory.slice";

import TableComponent from "components/Table/Table";

import "./index.css";

dayjs.extend(utc);
dayjs.extend(tz);

const TestHistory = () => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const timeZone = dayjs.tz.guess();

  const { history, certificates, loading } = useAppSelector(state => state.testingHistory);
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [errorToast, setErrorToast] = useState<{display: boolean; statusText?: string; message?: string;}>({display: false});

  useEffect(() => {
    dispatch(fetchHistory({}));
  }, []);

  useEffect(() => {
    setSkipPageReset(false);
  }, [history]);

  const handleError = (error: any) => {
    if (error.response) {
      setErrorToast({display: true, statusText: error.response.statusText, message: error.response.data || undefined})
    } else {
      setErrorToast({display: true})
    }
    const timeout = setTimeout(() => { clearTimeout(timeout); setErrorToast({display: false}) }, 3000)
  }

  const RunStatusCell = ({ value, row, column: { id } }: any) => {
    const { index, original } = row;
    const triggerApi = async (e: any) => {
      setSkipPageReset(true);
      dispatch(updateRowStatus({ index, runId: original.runId }));
    };
    const runId = original.runId;
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

  const viewCertificate = async (runId: string) => {
    const certificate = certificates.get(runId);
    if (certificate) {
      openCertificate(certificate.transactionId);
    } else {
      await dispatch(fetchCertificate({ runId }));
      const certificate = certificates.get(runId);
      if (certificate) {
        openCertificate(certificate.transactionId);
      }
    }
  };

  const openCertificate = (transactionId: string) => {
    window.open(`https://preprod.cardanoscan.io/transaction/${transactionId}`, '_blank');
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
        const notCertified: boolean = props.row.original.runStatus === "succeeded" || props.row.original.runStatus === "ready-for-certification";
        if (notCertified || props.row.original.runStatus === "certified") {
          return (
            <Button
              variant="text"
              size="small"
              className="text-main"
              onClick={() => navigate(
                `/report/${props.row.original.runId}`,
                { state: {
                  repo: formatRepoUrl(props.row.original.repoUrl),
                  commitHash: props.row.original.commitHash,
                  certifiable: notCertified
                }}
              )}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onDelete = (runId: string) => {
    confirm({ title: '', description: 'Are you sure want to remove this run campaign from logs!' })
      .then(async () => {
        await dispatch(deleteTestHistoryData({ url: `/run/${runId}?delete=true` }));
        dispatch(fetchHistory({}));
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
          dataSet={history}
          columns={columns}
          showColViz={true}
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