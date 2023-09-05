import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import Landing from "pages/landing/Landing";

const Header = () => {
  return (
    <>
      <li data-testid="support">
        <Link to="support">Support</Link>
      </li>
    </>
  );
};

describe("renders banners", () => {
  // it("renders banner when not in mainnet", () => {});
  // it("renders banner to ensure network is preprod", () => {});

  it("header links navigates to corresponding components successfully", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <Outlet />
              </>
            }
          >
            <Route path="/" element={<Landing />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Check whether Header is loaded correctly
    expect(screen.getByText(/Landing/i)).toBeInTheDocument();

    const landingPageLink = screen.getByText(/Landing/i);
    // Simulate route click
    fireEvent.click(landingPageLink);

    // Expect content of landing page to be in the DOM
    expect(screen.getByText(/Coming soon.../i)).toBeInTheDocument();
  });
});