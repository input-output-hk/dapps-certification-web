/* eslint-disable jsx-a11y/alt-text */
import classNames from "classnames";
import { ACCESS_STATUS } from "./repoAccessStatus.config";

const RepoAccessStatus: React.FC<{
  status: string;
  statusText?: string;
}> = ({ status, statusText }) => {
  const { color, className, ...imgProps } = ACCESS_STATUS[status];
  return (
    <label className="info flex">
      <img className={classNames("h-5 w-5", className)} {...imgProps} />
      {statusText ? (
        <span style={{ color: color }} className="ml-2">
          {statusText}
        </span>
      ) : null}
    </label>
  );
};

export default RepoAccessStatus;