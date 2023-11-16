import React from "react";

import TimelineItem from "./components/TimelineItem/TimelineItem";
import { useAppSelector } from "store/store";

import "./Timeline.css";

const Timeline = (props: any) => {
  const { statusConfig, unitTestSuccess, hasFailedTasks } = props;

  return (
    <div className="statusTimeline" data-testid="statusTimeline">
      <ul className="statusTimelineUl">
        {statusConfig.map((config: any, index: number) =>
          <TimelineItem key={index} config={config} unitTestSuccess={unitTestSuccess} hasFailedTasks={hasFailedTasks}/>
        )}
      </ul>
    </div>
  );
};

export default Timeline;
