import React, { FC, useState, useEffect, useRef } from "react";

import { useLogs } from 'hooks/useLogs';

import "./LogsView.css";
import LogsViewEntry from "./LogsViewEntry";

const LogsView: FC<{
  runId: string;
  endPolling?: boolean;
  oneTime?: boolean;
  open?: boolean;
  latestTestingProgress?: (progress: any) => any;
}> = ({
  runId,
  endPolling = false,
  oneTime = false,
  open = false,
  latestTestingProgress,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const logContentRef = useRef<HTMLDivElement>(null);
  const lastLog = useRef<any>(null);

  const showLogView = () => {
    setShowLogs(true);
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      bottomRef.current?.scrollTo({ behavior: "smooth" }); // scroll to bottom
    }, 2);
  };

  const hideLogView = () => {
    setShowLogs(false);
  };

  const { logInfo: logs } = useLogs(runId, oneTime || endPolling, !oneTime);

  useEffect(() => {
    if (endPolling && latestTestingProgress) {
      lastLog.current = logs[logs.length - 2]
      if (lastLog.current?.Source.indexOf('run-certify') !== -1) {
        // is 2nd last entry in logs when Source has run-certify
        if (lastLog.current) {
          latestTestingProgress(JSON.parse(lastLog.current.Text));
        }
      }
    }
    bottomRef.current?.scrollTo({ behavior: "smooth" }); // scroll to bottom
  }, [logs, endPolling, latestTestingProgress]);

  useEffect(() => {
    open && showLogView();
  }, [open]);

  return (
    <>
      <div className="logContainer w-full">
        <span
          className={`viewLogsBtn link ${showLogs ? "hidden" : ""}`}
          onClick={showLogView}
        >
          View logs
        </span>
        <section
          className={`log-information ${showLogs ? "" : "hidden"}`}
          data-testid="log-information"
        >
          <div className="log-header">
            <h5 className="h5">Logs</h5>
            <span className="minimize-btn text-right" onClick={hideLogView}>
              <i>-</i>
            </span>
          </div>
          <div className="log-content" ref={logContentRef}>
            {logs.map((item: any, index: number) => { 
              let logData = "";
              try {
                const data = JSON.parse(item.Text);
                const attr = data[Object.keys(data)[0]];
                if (attr?.fields?.hasOwnProperty("launch-config")) {
                  logData = attr["fields"]["launch-config"];
                }
                if (attr?.fields?.hasOwnProperty("chunk-data")) {
                  logData = attr["fields"]["chunk-data"];
                }
              } catch (e) {
                // do nothing
                if (typeof item.Text == "string" && item.Text.length) {
                  logData = item.Text;
                }
              }
              logData = !logData.length ? item.Text : logData;
              return logData.length ? (
                <LogsViewEntry key={index} time={item.Time} log={logData} />
              ) : null;
            })}
            <div className="empty-element" ref={bottomRef}></div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LogsView;
