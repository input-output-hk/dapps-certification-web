import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from "store/store";
import { logout } from "store/slices/auth.slice";
import { AppBar as MuiAppBar, Toolbar, IconButton, Button, Menu, MenuItem, ListItemIcon } from "@mui/material";

import MenuIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';

import Avatar from 'components/Avatar';

import "../index.css";

const AppBar = () => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<HTMLElement|null>(null);
  const { walletAddress } = useAppSelector(state => state.walletConnection);
  const { profile } = useAppSelector(state => state.profile);

  const getProfileAddress = () => {
    return walletAddress ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}` : '...';
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
      <MuiAppBar position="sticky" elevation={0} className="top-0 bg-white shadow">
        <Toolbar className="justify-end">
          <Button className="normal-case mr-2 text-text" endIcon={<MenuIcon />} onClick={handleMenu}>
            {getProfileAddress()}
          </Button>
          <IconButton className="p-0" onClick={handleMenu}>
            <Avatar seed={profile!.address} />
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