import React, { useMemo } from "react";
import { Box, Container } from "@mui/material";
import TableComponent from "components/Table/Table"
import { generateCollapsibleContent, processData } from "./fullReportTable.helper";

import './fullReportTable.css';
import StatusIcon from "components/StatusIcon/StatusIcon";

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
        return <StatusIcon iconName={"passed"} altText={"success"} />
      } else if (props.row.original.status === 'failure') {
        return <StatusIcon iconName={"failed"} />
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
      <Container className="pt-4" maxWidth={false}>

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