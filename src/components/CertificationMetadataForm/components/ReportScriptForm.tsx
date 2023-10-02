import React from "react";

import { Box, Grid, Paper, Typography, TextField, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import InputGroup from "compositions/InputGroup";
import Container from "compositions/InputGroup/components/Container";
import { getScriptFields, getScriptContractFields } from "../utils";

import type { FormState, UseFormRegister, UseFormGetFieldState, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import type { ReportForm } from "../interface";

import "../index.css";

interface Props {
  formState: FormState<ReportForm>;
  register: UseFormRegister<ReportForm>;
  getFieldState: UseFormGetFieldState<ReportForm>;
  scriptFields: FieldArrayWithId<ReportForm, "scripts", "id">[];
  appendScript: UseFieldArrayAppend<ReportForm, "scripts">;
  removeScript: UseFieldArrayRemove;
  standalone?: boolean;
}

interface InstanceProps {
  index: number;
  formState: FormState<ReportForm>;
  register: UseFormRegister<ReportForm>;
  getFieldState: UseFormGetFieldState<ReportForm>;
  onRemove: () => void;
}

const ReportScriptFormInstance = (props: InstanceProps) => {
  return (
    <Box className="p-4 mt-4 rounded-sm border-solid border-gray-inactive">
      <Box className="flex flex-row items-center">
        <Typography variant="subtitle2" className="text-main flex-1">
          DAPP Script (#{props.index+1})
        </Typography>
        {props.index > 0 && (
          <Button
            variant="outlined" size="small" color="error" className="normal-case"
            startIcon={<RemoveIcon />} onClick={props.onRemove}
          >
            Remove Script
          </Button>
        )}
      </Box>
      <Box className="mx-[-1em]">
        <InputGroup
          fields={getScriptFields(props.index)}
          formState={props.formState}
          register={props.register}
          getFieldState={props.getFieldState}
        />
      </Box>
      <Typography variant="subtitle2" className="text-main mt-2">
        SmartContract Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box className="mx-[-1em]">
            <InputGroup
              fields={getScriptContractFields(props.index).slice(0,4)}
              formState={props.formState}
              register={props.register}
              getFieldState={props.getFieldState}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box className="mx-[-1em]">
            <InputGroup
              fields={getScriptContractFields(props.index).slice(4,7)}
              formState={props.formState}
              register={props.register}
              getFieldState={props.getFieldState}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

const ReportScriptForm = (props: Props) => (
  <Container standalone={props.standalone}>
    <Typography variant="subtitle1" className="text-main pt-4">
      DAPP Scripts
    </Typography>
    {props.scriptFields.map((field, index) => (
      <ReportScriptFormInstance
        key={field.id}
        index={index}
        formState={props.formState}
        register={props.register}
        getFieldState={props.getFieldState}
        onRemove={() => props.removeScript(index)}
      />
    ))}
    <Box className="pt-4 text-right">
      <Button
        variant="outlined"
        size="small"
        className="button-outlined-main"
        startIcon={<AddIcon />}
        onClick={() => props.appendScript({
          scriptHash: '',
          contractAddress: '',
          smartContractInfo: {}
        })}
      >
        Add Script
      </Button>
    </Box>
  </Container>
);

export default ReportScriptForm;