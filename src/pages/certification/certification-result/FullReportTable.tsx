import React, { useMemo } from "react";
import { Box, Container } from "@mui/material";
import TableComponent from "components/Table/Table"
import { generateCollapsibleContent, processData } from "./fullReportTable.helper";

import './fullReportTable.css';

const FullReportTable: React.FC<{
  data: { [x: string]: any },
}> = ({
  data,
}) => {

    const tableData = processData(data)

    const columns = useMemo(() => [
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
              rowProps={(row: any) => ({
                collapsibleContent: (
                  generateCollapsibleContent(row.original)
                )
              })}
            />
          </div>
        </Box>
      </Container>
    </>)
}

export default FullReportTable;