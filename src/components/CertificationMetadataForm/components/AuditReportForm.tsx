import React from "react";

import { Box, Typography, Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import Input from "compositions/InputGroup/components/Input";
import Container from "compositions/InputGroup/components/Container";
import { getReportField } from "../utils";

import type { FormState, UseFormRegister, UseFormGetFieldState, UseFormGetValues, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import type { ReportForm } from "../interface";

import "../index.css";

interface Props {
  formState: FormState<ReportForm>;
  register: UseFormRegister<ReportForm>;
  getFieldState: UseFormGetFieldState<ReportForm>;
  getValues: UseFormGetValues<ReportForm>;
  reportFields: FieldArrayWithId<ReportForm, "report", "id">[];
  appendReport: UseFieldArrayAppend<ReportForm, "report">;
  removeReport: UseFieldArrayRemove;
  standalone?: boolean;
}

const AuditReportForm = (props: Props) => {
  return (
    <Container standalone={props.standalone}>
      <Box className="flex flex-row pt-4">
        <Typography variant="subtitle1" className="text-main flex-1">
          Audit Report
        </Typography>
        <Button
          variant="outlined" size="small" className="button-outlined-main"
          startIcon={<AddIcon />} onClick={() => props.appendReport({ value: '' })}
        >
          Add URL
        </Button>
      </Box>
      {props.reportFields.map((field, index) => (
        <Box key={field.id} className="flex flex-row mt-4">
          <Input
            noGutter={true}
            field={getReportField(index)}
            formState={props.formState}
            register={props.register}
            getFieldState={props.getFieldState}
            getValues={props.getValues}
          />
          <Box className="ml-4 flex-0 pt-2">
            <IconButton
              color="error" className="border-solid border"
              onClick={() => props.removeReport(index)}
              disabled={index === 0}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Container>
  );
}

export default AuditReportForm;