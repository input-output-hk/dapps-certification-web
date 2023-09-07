import classNames from "classnames";

import "./NavBar.scss";
import { Typography } from "@mui/material";
import { AuthMenu } from "./NavBar.config";
import { Link, useLocation } from "react-router-dom";
import { useId } from "react";

const NavBar = () => {
  const location = useLocation();
  const uuid = useId();

  return (
    <div
      className={classNames(
        "navbar"
      )}
    >
      <Typography
        variant="h6"
        sx={{
          px: 2,
          letterSpacing: 4,
          height: 80,
          lineHeight: "80px",
        }}
      >
        Certifyr.io
      </Typography>

      {AuthMenu.map((menu, index) => (
        <Link
          key={`${uuid}-${index}`}
          to={menu.path}
          className={classNames("navbar-link", {
            active: location.pathname === menu.path,
          })}
        >
          {menu.label}
        </Link>
      ))}
    </div>
  );
};

export default NavBar;