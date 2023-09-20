import React, { FC, useEffect, useState } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

interface Props {
  columns: any;
  updateColumnOptions: any,
  anchorEl: HTMLElement|null;
  onClose: () => void;
}

const ColViz: FC<Props> = ({ columns, updateColumnOptions, anchorEl, onClose }) => {
  const [columnDetails, setColumnDetails] = useState([]);

  useEffect(() => {
    const columnCopy = updateColumnDetails(columns);
    setColumnDetails(columnCopy);
  }, [columns]);

  useEffect(() => {
    updateColumnOptions(columnDetails);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnDetails]);

  const handleChange = (id: any) => {
    const updatedColumns = columnDetails.map((column: any) => {
      if (column.accessor === id) {
        return {...column, columnVisible: !column.columnVisible};
      }
      return column;
    });
    atLeastOneItemChecked(updatedColumns);
    // setColumnDetails(updatedColumns);
  };

  const atLeastOneItemChecked = (colArray: any) => {
    const find = colArray.filter((column: any) => column.Header.length && column.columnVisible === true);
    if (find.length === 1) {
      const updatedColumn = colArray.map((column: any) => {
        if (find[0].accessor === column.accessor) {
          column.checkBoxDisabled = true;
        }
        return column;
      });
      setColumnDetails(updatedColumn);
    } else {
      const updatedColumn = colArray.map((column: any) => {
        column.checkBoxDisabled = false;
        return column;
      });
      setColumnDetails(updatedColumn);
    }
  };

  const updateColumnDetails = (columnArray: any) => {
    const columnCopy = JSON.parse(JSON.stringify(columnArray));
    return columnCopy.map((column: any) => {
      const columnVisible = column.columnVisible === false ? false : true;
      return {
        ...column,
        columnVisible: columnVisible,
      };
    });
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={anchorEl !== null}
      onClose={onClose}
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
      {columnDetails.filter((column: any) => column.Header.length).map((column: any, index: any) => (
        <MenuItem 
          key={index} 
          disabled={column.checkBoxDisabled}
          onClick={() => !column.checkBoxDisabled ? handleChange(column.accessor) : null}>
          <ListItemIcon>
            <Checkbox checked={column.columnVisible} disabled={column.checkBoxDisabled} />
          </ListItemIcon>
          <ListItemText>{column.Header}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}

export default ColViz;