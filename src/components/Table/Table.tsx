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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import ColViz from "./components/ColViz/ColViz";
import { renderCharts } from "pages/certification/certification-result/fullReportTable.helper";

import "./Table.css";

const Row = (props: any) => {
  const {row, index, collapsible} = props
  const [open, setOpen] = useState(false);
  const onRowClick = () => {if (collapsible) { setOpen(!open); console.log('clicked')}}
  const rowClassNames = `${collapsible && 'clickable-row'} ${open && 'open'}`
  return (<>
    <TableRow {...row.getRowProps({
      onClick: onRowClick,
      className: rowClassNames,
      key: index
    })}>
        {row.cells.map((cell: any) => (
          <TableCell className="border-none" {...cell.getCellProps()}>
            {cell.render("Cell")}
          </TableCell>
        ))}
    </TableRow>
    {collapsible && <TableRow className="pull-down-row">
        <TableCell>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box className="flex justify-around flex-wrap">
              {renderCharts(row.original.dataObj)}
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
  rowProps = null
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
      initialState: { pageIndex: 0, pageSize: 5 } as any,
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
              className="absolute top-[-2.25em] right-0"
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
            className={`min-w-[650px] px-8 table ${collapsibleRows && 'collapsible'}`}
            {...getTableProps()}
          >
            <TableHead className="bg-tableHeader">
              {headerGroups.map((headerGroup: any) => (
                <TableRow {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column: any, index: number) => (
                    <TableCell
                      key={index}
                      className="text-tableHeaderText font-bold py-4 border-none"
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
                    <Row row={row} index={i} collapsible={collapsibleRows} />
                    // <TableRow {...row.getRowProps()}>
                    //   {row.cells.map((cell: any) => (
                    //     <TableCell className="border-none" {...cell.getCellProps()}>
                    //       {cell.render("Cell")}
                    //     </TableCell>
                    //   ))}
                    // </TableRow>
                  );
                })}
              </>
            </TableBody>
          </Table>
          {data.length === 0 && (
            <Typography className="text-center pt-4">
              No data found
            </Typography>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={showAllRows ? [{value: -1, label: "all"}] : [5, 10, 20]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={pageNo}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-root':{
              display: 'none !important'
            },
            '.MuiTablePagination-toolbar': {
              display: 'none !important'
            }

          }}
        />
      </Paper>
    </Box>
  );
};

export default TableComponent;