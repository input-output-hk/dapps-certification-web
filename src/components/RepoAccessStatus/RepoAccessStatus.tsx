/* eslint-disable jsx-a11y/alt-text */
import classNames from "classnames";
import { ACCESS_STATUS } from "./repoAccessStatus.config";

const RepoAccessStatus: React.FC<{
  status: string;
  statusText?: string;
  classes?: string;
  onClick:() => void
}> = ({ status, statusText = "", classes, onClick }) => {
  if (!status) {
    return null
  }
  
  const { color, className, ...imgProps } = ACCESS_STATUS[status];
  return (
    <label className={classNames("info flex", classes)} onClick={onClick}>
      <img style={{marginTop: "-4px"}} className={classNames("h-5 w-5 bg-white", className)} {...imgProps} />
      {statusText ? (
        <span style={{ color: color }} className="ml-2">
          {statusText}
        </span>
      ) : null}
    </label>
  );
};

export default RepoAccessStatus;