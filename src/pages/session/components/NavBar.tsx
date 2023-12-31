import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import { Box, AppBar, Toolbar, Typography, MenuList, MenuItem, ListItemIcon, ListItemText, Chip, Divider } from "@mui/material";

import HomeIcon from '@mui/icons-material/HomeOutlined';
import TestingIcon from '@mui/icons-material/BarChartOutlined';
import TestingHistoryIcon from '@mui/icons-material/HistoryOutlined';
import ReportUploadIcon from '@mui/icons-material/ReceiptOutlined';
import UserProfileIcon from '@mui/icons-material/PersonOutlined';
import SupportIcon from '@mui/icons-material/QuestionAnswerOutlined';
import DocumentationIcon from '@mui/icons-material/SupportOutlined';
import Support from "@mui/icons-material/KeyboardCommandKey";
import MetricsIcon from '@mui/icons-material/TimelineOutlined';

import { useAppSelector } from "store/store";

import "../index.css";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { role } = useAppSelector(state => state.session);
  const { runStatus, runState } = useAppSelector(state => state.testing);
  const { impersonate } = useAppSelector(state => state.profile);
  const { features } = useAppSelector((state) => state.auth);

  const getItemClassName = (pathname: string) => location.pathname !== pathname ? 'nav-bar-item' : 'nav-bar-item-active';
  const getIconClassName = (pathname: string) => location.pathname !== pathname ? 'nav-bar-icon' : 'nav-bar-icon-active';

  return (
    <Box className="flex-0 flex flex-col w-80 bg-slate-main shadow">
      <AppBar position="relative" elevation={0} className="bg-slate-mainDark shadow">
        <Toolbar>
          <Typography className="font-semibold tracking-[.1em] text-white">
            Testing Tool
          </Typography>
        </Toolbar>
      </AppBar>

      <MenuList>
        <MenuItem className={getItemClassName('/home')} onClick={() => navigate('/home')}>
          <ListItemIcon><HomeIcon className={getIconClassName('/home')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">Home</ListItemText>
        </MenuItem>

        <MenuItem className={getItemClassName('/testing')} onClick={() => navigate('/testing')}>
          <ListItemIcon><TestingIcon className={getIconClassName('/testing')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">
            Testing
            { runState === 'running' && <Chip label="Running" color="primary" size="small" className="float-right" /> }
            { runStatus === 'finished' && <Chip label="Finished" color="success" size="small" className="float-right" /> }
          </ListItemText>
        </MenuItem>

        <MenuItem className={getItemClassName('/history')} onClick={() => navigate('/history')}>
          <ListItemIcon><TestingHistoryIcon className={getIconClassName('/history')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">Testing History</ListItemText>
        </MenuItem>

        {features?.includes("l2-upload-report") ?
          <MenuItem className={getItemClassName('/audit-report-upload')} onClick={() => navigate('/audit-report-upload')}>
            <ListItemIcon><ReportUploadIcon className={getIconClassName('/audit-report-upload')} /></ListItemIcon>
            <ListItemText className="text-white font-medium">Auditor Report Upload</ListItemText>
          </MenuItem>
        : null}

        <MenuItem className={getItemClassName('/profile')} onClick={() => navigate('/profile')}>
          <ListItemIcon><UserProfileIcon className={getIconClassName('/profile')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">User Profile</ListItemText>
        </MenuItem>

        <MenuItem className={getItemClassName('/support')} onClick={() => navigate('/support')}>
          <ListItemIcon><SupportIcon className={getIconClassName('/support')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">Support</ListItemText>
        </MenuItem>

        <MenuItem className="nav-bar-item" onClick={() => window.open('https://rsoulatiohk.github.io/docs/intro', '_blank', 'noreferrer')}>
          <ListItemIcon><DocumentationIcon className="nav-bar-icon" /></ListItemIcon>
          <ListItemText className="text-white font-medium">Documentation</ListItemText>
        </MenuItem>

        {(role === "admin" || role === "support") && !impersonate ?
          <Divider className="border-slate-textLight" />
        : null}
            

        {role === 'admin' && !impersonate ? 
          (<MenuItem className={getItemClassName('/metrics')} onClick={() => navigate('/metrics')}>
            <ListItemIcon><MetricsIcon className={getIconClassName('/metrics')} /></ListItemIcon>
            <ListItemText className="text-white font-medium">Metrics</ListItemText>
          </MenuItem>)
        : null }

        {(role === "admin" || role === "support") && !impersonate ? 
          (<MenuItem
            className={getItemClassName("/support-commands")}
            onClick={() => navigate("/support-commands")}
          >
            <ListItemIcon>
              <Support className="nav-bar-icon" />
            </ListItemIcon>
            <ListItemText className="text-white font-medium">
              Support Commands
            </ListItemText>
          </MenuItem>)
        : null}

      </MenuList>
    </Box>
  );
}

export default NavBar;