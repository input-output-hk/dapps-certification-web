import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from "store/store";
import { logout } from "store/slices/auth.slice";
import { LocalStorageKeys } from "constants/constants";
import { AppBar as MuiAppBar, Toolbar, Avatar, IconButton, Button, Menu, MenuItem, ListItemIcon } from "@mui/material";

import MenuIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';

import "../index.css";

const AppBar = () => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<HTMLElement|null>(null);

  const getProfileAddress = () => {
    const address = localStorage.getItem(LocalStorageKeys.address);
    return address ? `${address.slice(0,4)}...${address.slice(-4)}` : '...';
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <MuiAppBar position="absolute" elevation={0} className="bg-white shadow">
        <Toolbar className="justify-end">
          <Button className="normal-case mr-2 text-text" endIcon={<MenuIcon />} onClick={handleMenu}>
            {getProfileAddress()}
          </Button>
          <IconButton className="p-0" onClick={handleMenu}>
            <Avatar className="text-text" />
          </IconButton>
        </Toolbar>
      </MuiAppBar>

      <Menu
        anchorEl={anchorEl} open={anchorEl !== null}
        onClose={handleClose} onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}

export default AppBar;