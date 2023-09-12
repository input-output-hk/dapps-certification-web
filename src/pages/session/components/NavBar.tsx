import React, { useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import { Box, AppBar, Toolbar, Typography, MenuList, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";

import HomeIcon from '@mui/icons-material/HomeOutlined';
import TestingIcon from '@mui/icons-material/BarChartOutlined';
import TestingHistoryIcon from '@mui/icons-material/HistoryOutlined';
import CertificationIcon from '@mui/icons-material/ReceiptOutlined';
import UserProfileIcon from '@mui/icons-material/PersonOutlined';
import SupportIcon from '@mui/icons-material/QuestionAnswerOutlined';
import DocumentationIcon from '@mui/icons-material/SupportOutlined';

import "../index.css";

export default () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getItemClassName = (pathname: string) => location.pathname !== pathname ? 'nav-bar-item' : 'nav-bar-item-active';
  const getIconClassName = (pathname: string) => location.pathname !== pathname ? 'nav-bar-icon' : 'nav-bar-icon-active';

  return (
    <Box className="flex-0 flex flex-col w-80 bg-main shadow">
      <AppBar position="relative" elevation={0} className="bg-mainDark shadow">
        <Toolbar>
          <Typography className="font-semibold tracking-[.1em]">
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
          <ListItemText className="text-white font-medium">Testing</ListItemText>
        </MenuItem>
        <MenuItem className={getItemClassName('/history')} onClick={() => navigate('/history')}>
          <ListItemIcon><TestingHistoryIcon className={getIconClassName('/history')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">Testing History</ListItemText>
        </MenuItem>
        <MenuItem className={getItemClassName('/certification')} onClick={() => navigate('/certification')}>
          <ListItemIcon><CertificationIcon className={getIconClassName('/certification')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">Certification</ListItemText>
        </MenuItem>
        <MenuItem className={getItemClassName('/profile')} onClick={() => navigate('/profile')}>
          <ListItemIcon><UserProfileIcon className={getIconClassName('/profile')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">User Profile</ListItemText>
        </MenuItem>
        <MenuItem className={getItemClassName('/support')} onClick={() => navigate('/support')}>
          <ListItemIcon><SupportIcon className={getIconClassName('/support')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">Support</ListItemText>
        </MenuItem>
        <MenuItem className={getItemClassName('/documentation')} onClick={() => navigate('/documentation')}>
          <ListItemIcon><DocumentationIcon className={getIconClassName('/documentation')} /></ListItemIcon>
          <ListItemText className="text-white font-medium">Documentation</ListItemText>
        </MenuItem>

        <Divider />
        <MenuItem className="nav-bar-item" onClick={() => navigate('/subscription')}>
          <ListItemText className="text-white font-medium">Subscription</ListItemText>
        </MenuItem>
        <MenuItem className="nav-bar-item" onClick={() => navigate('/subscription/payment')}>
          <ListItemText className="text-white font-medium">Subscription &gt; Payment</ListItemText>
        </MenuItem>
        <MenuItem className="nav-bar-item" onClick={() => navigate('/subscription/history')}>
          <ListItemText className="text-white font-medium">Subscription &gt; History</ListItemText>
        </MenuItem>
        <MenuItem className="nav-bar-item" onClick={() => navigate('/audit-report-upload')}>
          <ListItemText className="text-white font-medium">Report Upload</ListItemText>
        </MenuItem>
      </MenuList>
    </Box>
  );
}