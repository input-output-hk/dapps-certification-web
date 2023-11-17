import React, { useMemo, FC, useState } from "react";
import { usePagination, useTable, useSortBy } from "react-table";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import TablePagination from "@mui/material/TablePagination";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import GridViewIcon from '@mui/icons-material/GridView';
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ColViz from "./components/ColViz/ColViz";

import "./Table.css";

const Row = (props: any) => {
  const {row, rowProps, collapsible} = props
  const [open, setOpen] = useState(false);
  const onRowClick = () => {if (collapsible) { setOpen(!open); }}
  const rowClassNames = `${collapsible && 'clickable-row'} ${open && 'open'}`
  
  return (<>
    <TableRow {...row.getRowProps()} onClick={onRowClick} className={rowClassNames}>
        {collapsible && <TableCell className="border-none">
          <IconButton
            aria-label="expand row"
            size="small"
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>}
        {row.cells.map((cell: any) => (
          <TableCell className={`border-none ${cell.column.classes}`} {...cell.getCellProps()}>
            {cell.render("Cell")}
          </TableCell>
        ))}
    </TableRow>
    {collapsible && <TableRow className="pull-down-row">
        <TableCell className="border-none" colSpan={row.cells.length + 1}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box className="">
              {rowProps(row).collapsibleContent}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>}
  </>)
}

const TableComponent: FC<any> = ({
  dataSet,
  columns,
  showColViz,
  updateMyData,
  skipPageReset,
  showAllRows = false,
  collapsibleRows = false,
  rowProps = () => ({}),
  loading = false
}) => {
  const data = useMemo(() => dataSet, [dataSet]);
  const [pageNo, setPageNo] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<HTMLElement|null>(null);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setHiddenColumns,
    page,
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      // use the skipPageReset option to disable page resetting temporarily
      autoResetPage: !skipPageReset,
      // updateMyData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateMyData,
      initialState: showAllRows ? undefined : { pageIndex: 0, pageSize: 5 } as any,
    },
    useSortBy,
    usePagination
  );
  // ) as PaginationTableInstance<any>;

  const updateColumnOptions = (updatedColumnsList: any) => {
    const hideColumns = updatedColumnsList
      .filter((column: any) => column.columnVisible !== true)
      .map((item: any) => item.accessor);
    setHiddenColumns(hideColumns);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPageNo(newPage);
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPageSize(Number(event.target.value));
    setPageNo(0);
  };

  const handleShowColVizMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Paper className="relative shadow-md rounded-none" elevation={0}>
        {showColViz && (
          <>
            <IconButton
              className="absolute top-[-50px] right-[10px]"
              onClick={handleShowColVizMenu}
            >
              <GridViewIcon />
            </IconButton>
            <ColViz
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              updateColumnOptions={updateColumnOptions}
              columns={columns}
            />
          </>
        )}
        <TableContainer component={Box}>
          <Table
            size="small"
            className={`px-8 table ${collapsibleRows && 'collapsible'}`}
            {...getTableProps()}
          >
            <TableHead className="bg-tableHeader">
              {headerGroups.map((headerGroup: any, index) => (
                <TableRow {...headerGroup.getHeaderGroupProps()} key={index}>
                  {collapsibleRows && <TableCell className="border-none w-[50px]"></TableCell>}
                  {headerGroup.headers.map((column: any, index: number) => (
                    <TableCell
                      key={index}
                      className={`text-tableHeaderText font-bold py-4 border-none ${column.classes}`}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header").toUpperCase()}
                      <span className="ml-1 relative top-[4px]">
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <ArrowDownwardIcon fontSize="small" />
                          ) : (
                            <ArrowUpwardIcon fontSize="small" />
                          )
                        ) : (
                          ""
                        )}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              <>
                {page.map((row: any, i: number) => {
                  prepareRow(row);
                  return (
                    <Row key={i} row={row} rowProps={rowProps} collapsible={collapsibleRows} />
                  );
                })}
              </>
            </TableBody>
          </Table>
          {!loading && data.length === 0 && (
            <Typography className="text-center p-4">
              No data found
            </Typography>
          )}
          {loading && (
            <Box className="flex items-center justify-center p-8">
              <CircularProgress color="secondary" />
            </Box>
          )}
        </TableContainer>
        {!showAllRows && (
          <TablePagination
            rowsPerPageOptions={showAllRows ? [{label:"All", value: -1}] : [5, 10, 20]}
            component="div"
            count={data.length}
            rowsPerPage={showAllRows ? -1 : rowsPerPage}
            page={pageNo}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
};

export default TableComponent;