import React, { useMemo, FC, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { usePagination, useTable, useSortBy } from "react-table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import GridViewIcon from '@mui/icons-material/GridView';
import Typography from "@mui/material/Typography";
import ColViz from "./components/ColViz/ColViz";

import "./Table.css";

const TableComponent: FC<any> = ({
  dataSet,
  columns,
  showColViz,
  updateMyData,
  skipPageReset,
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
            className="min-w-[650px] px-8"
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
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <img
                              className="sort-icon"
                              src="/images/descIcon.svg"
                              alt="descIcon"
                            />
                          ) : (
                            <img
                              className="sort-icon"
                              src="/images/ascIcon.svg"
                              alt="ascIcon"
                            />
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
                {page.map((row: any, i) => {
                  prepareRow(row);
                  return (
                    <TableRow {...row.getRowProps()}>
                      {row.cells.map((cell: any) => (
                        <TableCell className="border-none" {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </TableCell>
                      ))}
                    </TableRow>
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
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={pageNo}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default TableComponent;