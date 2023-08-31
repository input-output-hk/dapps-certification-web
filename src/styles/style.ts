import { makeStyles } from 'tss-react/mui';

export const useTextStyles = makeStyles()((appTheme: any) => ({
  "text-blue": {
    color: appTheme.palette.blue.main,
  },
  "text-blue-light": {
    color: appTheme.palette.blue.light,
  },
  "text-blue-dark": {
    color: appTheme.palette.blue.dark,
  },
  "text-purple": {
    color: appTheme.palette.purple.main,
  },
  "text-purple-dark": {
    color: appTheme.palette.purple.dark,
  },
  "text-green": {
    color: appTheme.palette.green.main,
  },
  "text-gray": {
    color: appTheme.palette.gray.main,
  },
  "text-gray-light": {
    color: appTheme.palette.gray.light,
  },
  "text-gray-dark": {
    color: appTheme.palette.gray.dark,
  },
  "text-white": {
    color: appTheme.palette.white.main,
  },
  "text-black": {
    color: appTheme.palette.black.main,
  },
  "text-black-dark": {
    color: appTheme.palette.black.dark,
  },
}));

export const useBgStyles = makeStyles()((appTheme: any) => ({
  "bg-blue": {
    backgroundColor: appTheme.palette.blue.main,
  },
  "bg-blue-light": {
    backgroundColor: appTheme.palette.blue.light,
  },
  "bg-blue-dark": {
    backgroundColor: appTheme.palette.blue.dark,
  },
  "bg-purple": {
    backgroundColor: appTheme.palette.purple.main,
  },
  "bg-purple-dark": {
    backgroundColor: appTheme.palette.purple.dark,
  },
  "bg-green": {
    backgroundColor: appTheme.palette.green.main,
  },
  "bg-gray": {
    backgroundColor: appTheme.palette.gray.main,
  },
  "bg-gray-light": {
    backgroundColor: appTheme.palette.gray.light,
  },
  "bg-gray-dark": {
    backgroundColor: appTheme.palette.gray.dark,
  },
  "bg-white": {
    backgroundColor: appTheme.palette.white.main,
  },
  "bg-black": {
    backgroundColor: appTheme.palette.black.main,
  },
  "bg-black-dark": {
    backgroundColor: appTheme.palette.black.dark,
  },
}));

export const useIconStyles = makeStyles()((appTheme: any) => ({
  icon: {
    color: appTheme.palette.gray.dark,
    "&.active": {
      color: appTheme.palette.purple.main,
    },
  },
}));

export const useBoxShadowStyles = makeStyles()((appTheme: any) => ({
  "shadow-purple": {
    boxShadow: `0px -10px 20px 0px ${appTheme.palette.purple.dark}`,
  },
}));

export const useNavLinkStyles = makeStyles()((appTheme: any) => ({
  "navLink-light": {
    color: appTheme.palette.white.main,
    cursor: "pointer",
    position: "relative",
    "&:hover, &:active, &:focus": {
      backgroundColor: appTheme.palette.purple.dark,
      transition: "all ease 200ms",
      color: "inherit",
      textDecoration: "none",
    },
    "&.active": {
      backgroundColor: appTheme.palette.purple.dark,
    },
    "&.active::before": {
      content: '""',
      position: "absolute",
      display: "inline-block",
      width: "2px",
      height: "100%",
      left: 0,
      top: 0,
      borderRadius: "0 2px 2px 0",
      backgroundColor: appTheme.palette.purple.main,
    },
  },
}));