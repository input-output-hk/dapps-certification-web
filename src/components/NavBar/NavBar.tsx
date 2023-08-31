import classNames from "classnames";
import { useBgStyles, useNavLinkStyles, useTextStyles } from "styles/style";

import "./NavBar.scss";
import { Typography } from "@mui/material";
import { AuthMenu } from "./NavBar.config";
import { Link, useLocation } from "react-router-dom";
import { useId } from "react";

const NavBar = () => {
  const location = useLocation();
  const uuid = useId();

  const bgColors = useBgStyles();
  const textColors = useTextStyles();
  const navLink = useNavLinkStyles();

  return (
    <div
      className={classNames(
        "navbar",
        bgColors["bg-gray"],
        textColors["text-white"]
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
        className={bgColors["bg-purple-dark"]}
      >
        Certifyr.io
      </Typography>

      {AuthMenu.map((menu, index) => (
        <Link
          key={`${uuid}-${index}`}
          to={menu.path}
          className={classNames("navbar-link", navLink["navLink-light"], {
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