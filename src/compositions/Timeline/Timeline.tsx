import React from "react";

import TimelineItem from "./components/TimelineItem/TimelineItem";
import { useAppSelector } from "store/store";

import "./Timeline.css";

const Timeline = (props: any) => {
  const { statusConfig, unitTestSuccess, hasFailedTasks } = props;
  const { buildInfo } = useAppSelector((state) => state.runTime);

  return (
    <div className="statusTimeline" data-testid="statusTimeline">
      <ul className="statusTimelineUl">
        {statusConfig.map(
          (config: any, index: React.Key | null | undefined) => {
            if (buildInfo.runState === config.status) {
              config.runTimeTaken = buildInfo.runTime
            }
            return (
            <TimelineItem key={index} config={config} unitTestSuccess={unitTestSuccess} hasFailedTasks={hasFailedTasks}/>
            )
          }
        )}
      </ul>
    </div>
  );
};

export default Timeline;
