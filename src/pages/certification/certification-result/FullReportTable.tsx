import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import TableComponent from "components/Table/Table"
import Toast from "components/Toast/Toast"
import { processData, renderCharts } from "./fullReportTable.helper";

const FullReportTable: React.FC<{
  data: { [x: string]: any },
  unitTestSuccess?: boolean
}> = ({
  data,
  unitTestSuccess = true
}) => {

    const tableData = processData(data)

    const columns = React.useMemo(() => [
      {
        Header: "Property Name",
        accessor: "label",
      },
      {
        Header: "Status",
        accessor: "status",
        align: "center",
        disableSortBy: true,
        Cell: (props: any) => {
          if (props.row.original.status === 'success') {
            return <img
              className="image"
              src="/images/passed.svg"
              alt="success"
            />
          } else if (props.row.original.status === 'failure') {
            return <img
              className="image"
              src="/images/failed.svg"
              alt="failure"
            />
          } else { return null; }
        }
      }
    ],
      [])

    return (<>
      <Container className="pt-4 w-full block">

        <Box>
          <div id="fullReportTable" className="w-full block">
            <span className="block my-5">Properties</span>
            <TableComponent
              dataSet={tableData}
              columns={columns}
              showColViz={true}
              showAllRows={true}
              collapsibleRows={true}
              // rowProps={(row: any) => ({
              //   collapsibleContent: (
              //     renderCharts(row.values.dataObj)
              //   )
              // })}
            />
          </div>
          {/* {(errorToast && errorToast.display) ? (
        ((errorToast.message && errorToast.statusText) ? 
        <Toast message={errorToast.message} title={errorToast.statusText}/> :
        <Toast />))
      : null} */}
        </Box></Container></>)
  }

export default FullReportTable;