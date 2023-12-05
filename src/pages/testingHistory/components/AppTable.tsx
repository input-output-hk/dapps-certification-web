import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { useNavigate } from "react-router";

import { Typography, Paper, Button, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useConfirm } from "material-ui-confirm";
import { useAppDispatch } from "store/store";
import { getRowStatus, deleteTestHistoryData, fetchCertificate } from "store/slices/testingHistory.slice";

import TableComponent from "components/Table/Table";

import type { Run } from 'components/CreateCertificate/CreateCertificate';
import type { Certificate } from 'store/slices/testingHistory.slice';

import "../index.css";

dayjs.extend(utc);
dayjs.extend(tz);

interface Props {
  appName: string;
  history: Run[];
  certificates: Map<string, Certificate>;
  showAbort?: boolean;
  refreshData: () => void
}

const AppTable = (props: Props) => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const timeZone = dayjs.tz.guess();
  
  const [skipPageReset, setSkipPageReset] = useState(false);

  const RunStatusCell = ({ value, row, column: { id } }: any) => {
    const { original } = row;
    const triggerApi = async (e: any) => {
      setSkipPageReset(true);
      dispatch(getRowStatus({ runId: original.runId }));
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
    if (!props.certificates) {
      const response: any = await dispatch(fetchCertificate({ runId }));
      if (!response.error) {
        // TBD verification as transactions not yet done
        openCertificate(response.certificate.transactionId);
      }
      return;
    } 
    // if props.certificates
    const certificate = props.certificates.get(runId);
    if (certificate) {
      openCertificate(certificate.transactionId);
    } else {
      await dispatch(fetchCertificate({ runId }));
      const certificate = props.certificates.get(runId);
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
      Header: "Checkout",
      accessor: "commitHash",
      disableSortBy: true,
      Cell: (props: any) => (
        <span className="max-w-[140px] text-ellipsis overflow-hidden whitespace-nowrap block" title={props.row.original.commitHash}>
          {props.row.original.commitHash}
        </span>
      )
    },
    {
      Header: "Commit date",
      accessor: "commitDate",
      columnVisible: true,
      Cell: (props: any) => (
        <span>
          {dayjs.utc(props.row.original.commitDate).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      Header: "Finished at",
      accessor: "finishedAt",
      columnVisible: true,
      Cell: (props: any) => (
        <span>
          {dayjs.utc(props.row.original.finishedAt).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      Header: "Synced at",
      accessor: "syncedAt",
      columnVisible: true,
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
      Header: props.showAbort ? "Action" : "",
      disableSortBy: true,
      accessor: "delete",
      Cell: (cellProps: any) => {
        if (props.showAbort) {
          if (cellProps.row.original.runStatus === 'queued') {
            return (
              <Button
                variant="text"
                color="error"
                size="small"
                className="text-main"
                onClick={() => onDelete(cellProps.row.original.runId)}
              >
                KILL
              </Button>
            )
          }
        }
        else if (cellProps.row.original.runStatus !== "certified" && cellProps.row.original.runStatus !== "ready-for-certification") {
          return (
            <IconButton 
              size="small"
              className="text-main"
              onClick={() => {
                onDelete(cellProps.row.original.runId);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          );
        }
      },
    }],
    []
  );

  const onDelete = (runId: string) => {
    confirm({ title: '', description: props.showAbort ? 'Are you sure you want to abort this run campaign?' : 'Are you sure want to remove this run campaign from logs!' })
      .then(async () => {
        await dispatch(deleteTestHistoryData({ url: `/run/${runId}${props.showAbort ? '' : '?delete=true'}` }));
        props.refreshData()
      })
      .catch(() => { });
  };
  
  return (
    <Paper className="mb-4">
      <Typography
        variant="subtitle2"
        className="font-normal text-main text-lg p-4"
      >
        {props.appName}
      </Typography>
      <TableComponent
        dataSet={props.history}
        columns={columns}
        showColViz={true}
        skipPageReset={skipPageReset}
        loading={false}
      />
    </Paper>
  );
}

export default AppTable;