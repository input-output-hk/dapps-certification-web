import { Box, Container, Typography } from "@mui/material";
import TableComponent from "components/Table/Table"
import Toast from "components/Toast/Toast"
import React, { useEffect, useState } from "react";
import { processData } from "./fullReportTable.helper";

const FullReportTable = (data: any) => {

    const tableData = processData(data)

    const columns = React.useMemo(() => [
        {
          Header: "Property Name",
          accessor: "property",
        },
        {
          Header: "Successes",
          accessor: "count",
          disableSortBy: true,
          
        },
        // {
        //   Header: "Failures",
        //   accessor: "count",
        //   disableSortBy: true,
          
        // },
        // {
        //   Header: "Discarded",
        //   accessor: "count",
        //   disableSortBy: true,
          
        // },
        {
          Header: "Status",
          accessor: "status",
          disableSortBy: true,
          
        }
    ],
    [])

    return (<>
    <Container className="pt-4 w-full block">

      <Box>
      <div id="fullReportTable" className="w-full block">
        <span>Properties</span>
        <TableComponent dataSet={tableData} columns={columns} showColViz={true} showAllRows={true}/>
      </div>
      {/* {(errorToast && errorToast.display) ? (
        ((errorToast.message && errorToast.statusText) ? 
        <Toast message={errorToast.message} title={errorToast.statusText}/> :
        <Toast />))
      : null} */}
    </Box></Container></>)
}

export default FullReportTable;