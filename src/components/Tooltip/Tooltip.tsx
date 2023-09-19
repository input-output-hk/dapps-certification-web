import React from "react";
import Tooltip from "@mui/material/Tooltip";
import classNames from "classnames";

const ArrowTooltip: React.FC<{
  children?: any;
  title: string;
  tooltipWrapperStyle?: string;
  tooltipContentStyle?: string;
}> = ({ title, children, tooltipWrapperStyle, tooltipContentStyle }) => {
  return (
    <div
      className={classNames("absolute tooltip-wrapper", tooltipWrapperStyle)}
    >
      <Tooltip title={title} arrow placement="bottom-end">
        {/* Content on which tooltip appears */}
        <div
          className={classNames("tooltip-content pointer", tooltipContentStyle)}
        >
          {children}
        </div>
      </Tooltip>
    </div>
  );
};

export default ArrowTooltip;
