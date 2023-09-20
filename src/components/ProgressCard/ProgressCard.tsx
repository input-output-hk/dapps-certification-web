import Tooltip from '@mui/material/Tooltip';
import { useMemo } from 'react';
import CircularProgressBar from "./CircularProgressBar";
import "./ProgressCard.scss";

const ProgressCard: React.FC<{
  title: string;
  currentValue: number;
  totalValue: number;
  displayText?: string;
  color?: string;
  tooltipText?: string
}> = ({ color = "stroke-green", currentValue, totalValue, displayText, title, tooltipText }) => {
  const progress = totalValue !== 0 ? Math.trunc((currentValue/totalValue) * 100) : 0;

  const Card = useMemo(() => {
    return (
      <div className="flex max-w-full  content-between shadow shadow-lg bg-white rounded-sm flex-col p-3 sm:flex-row w-fit">
        <div className="inline-flex flex-col justify-around">
          <h5 className="text-neutral truncate max-w-full">
            {title}
          </h5>
          {displayText ? 
            <span className="inline-block font-medium text-neutral-900 text-sm">{displayText}</span> 
            : 
            <span className="inline-block font-semibold text-2xl">
              {currentValue} / {totalValue}
            </span>
          }
        </div>
        <div className="mt-5 sm:mt-0 w-fit">
          <CircularProgressBar progress={progress} color={color} />
        </div>
      </div>
    );
  }, [title, displayText, currentValue, totalValue, progress, color])

  return (tooltipText ? 
    (<Tooltip title={tooltipText} arrow placement="top" style={{cursor: "help"}}>{Card}</Tooltip>)
  : Card )
  
};

export default ProgressCard;