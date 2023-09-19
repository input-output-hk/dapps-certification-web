import { useEffect, useState } from "react";
import Tooltip from '@mui/material/Tooltip';
import CircularProgressBar from "./CircularProgressBar";
import "./ProgressCard.scss";

const ProgressCard: React.FC<{
  title: string;
  currentValue: number;
  totalValue: number;
  color?: string;
  tooltipText?: string
}> = ({ color = "stroke-green", currentValue, totalValue, title, tooltipText }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(Math.trunc((currentValue/totalValue) * 100))
  }, [currentValue, totalValue])

  const card = () => {
    return (
      <div className="flex max-w-full  content-between shadow shadow-lg bg-white rounded-sm flex-col p-3 sm:flex-row w-fit">
        <div className="inline-flex flex-col justify-around">
          <h5 className="text-neutral truncate max-w-full">
            {title}
          </h5>
          <span className="inline-block font-semibold text-2xl">
            {currentValue} / {totalValue}
          </span>
        </div>
        <div className="mt-5 sm:mt-0 w-fit">
          <CircularProgressBar progress={progress} color={color} />
        </div>
      </div>
    );
  }

  return (tooltipText ? 
    (<Tooltip title={tooltipText} arrow placement="top" style={{cursor: "help"}}>{card()}</Tooltip>)
  : card() )
  
};

export default ProgressCard;