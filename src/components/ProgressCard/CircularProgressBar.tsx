import classNames from "classnames";

const CircularProgressBar = ({
  progress = 0,
  color = "stroke-pink-400",
}: {
  progress: number;
  color?: string;
}) => {
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-1 -1 34 34"
        className="progress-bar"
      >
        <circle
          cx="16"
          cy="16"
          r="15.9155"
          className={classNames("fill-none stroke-2 opacity-25", color)}
        ></circle>

        <circle
          cx="16"
          cy="16"
          r="15.9155"
          className={classNames("progress-bar-track fill-none stroke-2", color)}
          style={{ strokeDashoffset: 2 * Math.PI * 15.9155 * (1 - progress / 100) }}
        ></circle>
      </svg>

      <span className="absolute top-1/2 left-0 progress-text  w-full text-center text-2xl font-extrabold">
        {progress}%
      </span>
    </div>
  );
};

export default CircularProgressBar;