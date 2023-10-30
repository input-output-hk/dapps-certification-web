import React, { FC, memo } from "react";

import "./LogsView.css";

const LogsViewEntry: FC<{time: any, log: string}> = ({ time, log }) => {
    return (
        <>
            <div className="log">
                <span className="log-time">{time}</span><span>{log}</span>
            </div>
        </>
    )
};

export default memo(LogsViewEntry);