import { Grid } from "@mui/material";
import classNames from "classnames";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const Card = (props: any) => {
  return (
    <Grid
      item
      className={classNames(
        "relative p-0 inline-flex w-full lg:w-[49%] shadow-md  mb-3 bg-white",
        {
          "lg:mr-3": (props?.index + 1) % 2 !== 0,
        },
        props.class
      )}
      key={props.id}
    >
      <div className="absolute top-4 right-4 inline-flex text-gray-secondary icons !top-[6px]">
        {props.showEdit ? (
          <EditIcon
            className="mr-4 hover:text-gray-600 cursor-pointer"
            onClick={(_) => props.onEdit()}
            titleAccess="Edit User Details"
          />
        ) : null}

        {props.showDelete ? (
          <DeleteIcon
            className=" hover:text-gray-600 cursor-pointer"
            onClick={(_) => props.onDelete()}
            titleAccess="Delete User"
          />
        ) : null}
      </div>

      {props.children}
    </Grid>
  );
};