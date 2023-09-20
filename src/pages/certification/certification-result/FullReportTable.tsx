import React, { useMemo } from "react";
import { Box, Container } from "@mui/material";
import TableComponent from "components/Table/Table"
import { generateCollapsibleContent, processData } from "./fullReportTable.helper";

import './fullReportTable.css';

const columns = [
  {
    Header: "Property Name",
    accessor: "label",
  },
  {
    Header: "Status",
    accessor: "status",
    classes: "text-center w-[100px]",
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
]

const FullReportTable: React.FC<{
  data: { [x: string]: any },
}> = ({
  data,
}) => {

    const tableData = useMemo(() => processData(data), [data]);

    return (<>
      <Container className="pt-4" maxWidth="xl">

        <Box>
          <div id="fullReportTable">
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