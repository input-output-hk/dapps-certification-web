import { render, screen } from "@testing-library/react";
import LogsViewEntry from "./LogsViewEntry";

describe("LogsViewEntry", () => {
  test("renders the time and log correctly", () => {
    const time = "12:00 PM";
    const log = "Sample log";

    render(
      <LogsViewEntry time={time} log={log} />
    );

    const timeElement = screen.getByText(time);
    const logElement = screen.getByText(log);

    expect(timeElement).toBeInTheDocument();
    expect(logElement).toBeInTheDocument();
  });
});