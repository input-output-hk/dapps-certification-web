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
        {statusConfig.map((config: any, index: number) =>
          <TimelineItem key={index} config={config} unitTestSuccess={unitTestSuccess} hasFailedTasks={hasFailedTasks} buildInfo={buildInfo} />
        )}
      </ul>
    </div>
  );
};

export default Timeline;
