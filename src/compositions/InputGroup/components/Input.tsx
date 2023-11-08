import React from "react";

import { TextField, MenuItem, InputAdornment, Tooltip } from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";

import { FieldType } from '../interface';

import type { InputProps } from '../interface';

import "../index.css";

const Input = (props: InputProps) => (
  <TextField
    fullWidth
    type="text"
    variant="outlined"
    className={props.noGutter ? undefined : 'mt-4'}
    disabled={props.disabled}
    label={`${props.field.label}${props.field.required ? ' *' : ''}`}
    placeholder={props.field.placeholder}
    select={props.field.type === FieldType.Dropdown}
    multiline={props.field.textArea}
    rows={props.field.textArea ? 4 : undefined}
    error={props.getFieldState(props.field.name, props.formState).error !== undefined}
    helperText={props.getFieldState(props.field.name, props.formState).error?.message}
    { ...props.register(props.field.name, { required: props.field.required }) }
    onBlur={props.onBlur ? props.onBlur : props.register(props.field.name, { required: props.field.required }).onBlur}
    InputProps={{
      endAdornment: props.field.tooltip ? (
        <InputAdornment position="end" className="relative w-[24px] h-[24px]">
          <Tooltip title={props.field.tooltip} placement="left" arrow>
            <div className="absolute w-full h-full top-0 left-0 cursor-default"/>
          </Tooltip>
          <InfoIcon />
        </InputAdornment>
      ) : undefined,
    }}
  >
    {(props.field.options || []).map(option =>
      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
    )}
  </TextField>
);

export default Input;